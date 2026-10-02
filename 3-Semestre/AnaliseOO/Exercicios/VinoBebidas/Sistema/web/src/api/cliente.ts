import type { Sessao } from './tipos'

/** Base da API. Vazio = mesma origem (proxy do Vite em dev, wwwroot da API em produção). */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export class ErroApi extends Error {
  status: number
  constructor(mensagem: string, status: number) {
    super(mensagem)
    this.status = status
  }
}

const CHAVES = { cliente: 'vino.sessao.cliente', admin: 'vino.sessao.admin' } as const
export type TipoArea = keyof typeof CHAVES

export function lerSessao(area: TipoArea): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVES[area])
    if (!bruto) return null
    const s = JSON.parse(bruto) as Sessao
    return new Date(s.expiraEm) > new Date() ? s : null
  } catch {
    return null
  }
}

export function gravarSessao(area: TipoArea, s: Sessao | null) {
  try {
    if (s) localStorage.setItem(CHAVES[area], JSON.stringify(s))
    else localStorage.removeItem(CHAVES[area])
  } catch {
    /* navegação privada: segue só em memória */
  }
}

type Opcoes = { metodo?: string; corpo?: unknown; area?: TipoArea; sinal?: AbortSignal }

export async function api<T>(caminho: string, { metodo = 'GET', corpo, area, sinal }: Opcoes = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (corpo !== undefined) headers['Content-Type'] = 'application/json'
  const sessao = area ? lerSessao(area) : null
  if (sessao) headers.Authorization = `Bearer ${sessao.token}`
  if (area === 'admin') headers['X-Origem'] = 'painel'

  let resp: Response
  try {
    resp = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal: sinal,
    })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new ErroApi('Não foi possível conectar ao servidor. Verifique se a API está rodando.', 0)
  }

  if (!resp.ok) {
    let mensagem = `Erro ${resp.status}`
    try {
      const j = await resp.json()
      if (j?.mensagem) mensagem = j.mensagem
    } catch {
      if (resp.status === 401) mensagem = 'Sessão expirada. Entre novamente.'
      if (resp.status === 403) mensagem = 'Seu perfil não tem acesso a esta área.'
    }
    if (resp.status === 401 && area) gravarSessao(area, null)
    throw new ErroApi(mensagem, resp.status)
  }
  if (resp.status === 204) return undefined as T
  return (await resp.json()) as T
}
