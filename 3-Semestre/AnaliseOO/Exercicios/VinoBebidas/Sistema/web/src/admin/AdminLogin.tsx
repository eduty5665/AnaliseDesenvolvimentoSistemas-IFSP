import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { BarChart3 } from 'lucide-react'
import { api } from '../api/cliente'
import type { Sessao } from '../api/tipos'
import { PERFIS_PAINEL, useSessao } from '../estado/sessao'

export function AdminLogin() {
  const { admin, entrar } = useSessao()
  const navegar = useNavigate()
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (admin && PERFIS_PAINEL.includes(admin.perfil ?? '')) return <Navigate to="/admin" replace />

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const s = await api<Sessao>('/api/auth/funcionarios/login', { metodo: 'POST', corpo: { login, senha } })
      if (!PERFIS_PAINEL.includes(s.perfil ?? '')) {
        setErro('Seu perfil não tem acesso ao painel. Use o ERP para as rotinas do dia a dia.')
        return
      }
      entrar('admin', s)
      navegar('/admin', { replace: true })
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_10%,#7b1e3a,#3d0f1e_45%,#17050b)] p-4">
      <form onSubmit={enviar} className="surgir w-full max-w-sm rounded-3xl bg-papel p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-vinho-700 text-white"><BarChart3 /></div>
          <h1 className="titulo mt-3 text-3xl font-bold text-vinho-800">Painel Vino</h1>
          <p className="text-sm text-tinta-2">Indicadores e projeções em tempo real</p>
        </div>
        <label className="mt-6 block"><span className="rotulo">Login ou CPF</span><input className="campo" value={login} onChange={(e) => setLogin(e.target.value)} autoFocus required /></label>
        <label className="mt-4 block"><span className="rotulo">Senha</span><input className="campo" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required /></label>
        {erro && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
        <button className="btn-primario mt-6 w-full py-3" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        <p className="mt-4 text-center text-xs text-tinta-2">Demo: <code>admin</code>, <code>gerente</code> ou <code>financeiro</code> · senha <code>Vino@123</code></p>
      </form>
    </div>
  )
}
