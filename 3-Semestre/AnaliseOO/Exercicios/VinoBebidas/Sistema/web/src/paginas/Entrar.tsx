import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { api } from '../api/cliente'
import type { Sessao } from '../api/tipos'
import { useSessao } from '../estado/sessao'

export function Entrar() {
  const [params] = useSearchParams()
  const volta = params.get('volta') ?? '/conta'
  const { cliente, entrar } = useSessao()
  const navegar = useNavigate()
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [form, setForm] = useState({ nome: '', email: '', senha: '', dataNascimento: '', telefone: '', cpf: '', aceitaMarketing: false })
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (cliente) return <Navigate to={volta} replace />

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const s =
        modo === 'entrar'
          ? await api<Sessao>('/api/auth/clientes/login', { metodo: 'POST', corpo: { email: form.email, senha: form.senha } })
          : await api<Sessao>('/api/auth/clientes/registrar', {
              metodo: 'POST',
              corpo: {
                nome: form.nome,
                email: form.email,
                senha: form.senha,
                dataNascimento: form.dataNascimento,
                telefone: form.telefone || null,
                cpf: form.cpf || null,
                aceitaMarketing: form.aceitaMarketing,
              },
            })
      entrar('cliente', s)
      navegar(volta, { replace: true })
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  const campo = (k: keyof typeof form) => ({
    value: form[k] as string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }),
  })

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="cartao p-8">
        <div className="mb-6 flex rounded-full bg-vinho-50 p-1">
          {(['entrar', 'criar'] as const).map((m) => (
            <button key={m} onClick={() => { setModo(m); setErro(null) }}
              className={`flex-1 rounded-full py-2 text-sm font-semibold ${modo === m ? 'bg-white text-vinho-700 shadow-sm' : 'text-tinta-2'}`}>
              {m === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>
        <h1 className="titulo text-3xl font-bold text-vinho-800">{modo === 'entrar' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
        <form className="mt-6 space-y-4" onSubmit={enviar}>
          {modo === 'criar' && (
            <label className="block"><span className="rotulo">Nome completo</span><input className="campo" required {...campo('nome')} /></label>
          )}
          <label className="block"><span className="rotulo">E-mail</span><input className="campo" type="email" required autoComplete="email" {...campo('email')} /></label>
          <label className="block"><span className="rotulo">Senha</span><input className="campo" type="password" required minLength={6} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} {...campo('senha')} /></label>
          {modo === 'criar' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="rotulo">Nascimento</span><input className="campo" type="date" required {...campo('dataNascimento')} /></label>
                <label className="block"><span className="rotulo">Telefone</span><input className="campo" {...campo('telefone')} /></label>
              </div>
              <label className="block"><span className="rotulo">CPF (opcional)</span><input className="campo" inputMode="numeric" {...campo('cpf')} /></label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-vinho-600" checked={form.aceitaMarketing} onChange={(e) => setForm({ ...form, aceitaMarketing: e.target.checked })} />
                Quero receber novidades e ofertas
              </label>
              <p className="text-xs text-tinta-2">Venda de bebidas alcoólicas somente para maiores de 18 anos.</p>
            </>
          )}
          {erro && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
          <button className="btn-primario w-full py-3" disabled={enviando}>{enviando ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}</button>
        </form>
        {modo === 'entrar' && <p className="mt-5 text-center text-xs text-tinta-2">Demonstração: <code>cliente@vinobebidas.com.br</code> / <code>Vino@123</code></p>}
      </div>
    </div>
  )
}
