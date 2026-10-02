import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Menu, ShoppingBag, Smartphone, User, Wine, X } from 'lucide-react'
import { useCarrinho } from '../estado/carrinho'
import { useSessao } from '../estado/sessao'

export function LayoutLoja() {
  const { quantidadeTotal } = useCarrinho()
  const { cliente } = useSessao()
  const [menu, setMenu] = useState(false)
  const local = useLocation()
  useEffect(() => {
    setMenu(false)
    window.scrollTo({ top: 0 })
  }, [local.pathname])

  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-vinho-100 hover:text-white'}`

  return (
    <div className="flex min-h-screen flex-col">
      <PortaoIdade />
      <header className="sticky top-0 z-30 border-b border-white/5 bg-vinho-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <img src="/favicon.svg" alt="" className="h-9 w-9" />
            <span className="titulo text-2xl font-bold">Vino Bebidas</span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex">
            <NavLink to="/vinhos" className={link}>Vinhos</NavLink>
            <NavLink to="/vinhos?destaques=true" className={() => link({ isActive: false })}>Seleção do sommelier</NavLink>
            <NavLink to="/app" className={link}>App</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to={cliente ? '/conta' : '/entrar'} className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-vinho-100 hover:text-white sm:flex">
              <User size={18} /> {cliente ? cliente.nome.split(' ')[0] : 'Entrar'}
            </Link>
            <Link to="/carrinho" className="relative flex items-center gap-2 rounded-full bg-ouro-500 px-4 py-2 text-sm font-semibold text-vinho-900 hover:bg-ouro-400" aria-label="Carrinho">
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Carrinho</span>
              {quantidadeTotal > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-vinho-800 px-1 text-xs text-white">{quantidadeTotal}</span>
              )}
            </Link>
            <button className="rounded-full p-2 text-white md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden">
            <NavLink to="/vinhos" className={link}>Vinhos</NavLink>
            <NavLink to="/app" className={link}>Baixar o app</NavLink>
            <NavLink to={cliente ? '/conta' : '/entrar'} className={link}>{cliente ? 'Minha conta' : 'Entrar / criar conta'}</NavLink>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 bg-vinho-950 text-vinho-200">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <Wine size={20} className="text-ouro-400" />
              <span className="titulo text-2xl font-bold">Vino Bebidas</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-vinho-200/80">
              Vinhos especiais selecionados por sommeliers. Compre ou reserve online e receba em casa ou retire em uma das nossas lojas em Catanduva.
            </p>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold text-white">Lojas</p>
            <p>Loja Centro · Rua Brasil, 1200</p>
            <p>Loja Shopping · Av. São Domingos, 3000</p>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold text-white">Leve no bolso</p>
            <Link to="/app" className="inline-flex items-center gap-2 text-ouro-300 hover:text-ouro-400"><Smartphone size={16} /> Catálogo no celular</Link>
            <p className="mt-2"><Link to="/admin" className="text-vinho-300 hover:text-white">Área administrativa</Link></p>
          </div>
        </div>
        <div className="border-t border-white/5 py-5 text-center text-xs text-vinho-300/70">
          Venda proibida para menores de 18 anos. Aprecie com moderação. · Projeto acadêmico IFSP Catanduva
        </div>
      </footer>
    </div>
  )
}

function PortaoIdade() {
  const [ok, setOk] = useState(() => {
    try {
      return localStorage.getItem('vino.maioridade') === 'sim'
    } catch {
      return false
    }
  })
  const [recusou, setRecusou] = useState(false)
  if (ok) return null
  const confirmar = () => {
    try {
      localStorage.setItem('vino.maioridade', 'sim')
    } catch {
      /* ignora */
    }
    setOk(true)
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-vinho-950/85 p-4 backdrop-blur-sm">
      <div className="surgir w-full max-w-md rounded-3xl bg-papel p-8 text-center shadow-2xl">
        <Wine className="mx-auto text-vinho-600" size={40} />
        <h2 className="titulo mt-3 text-3xl font-bold text-vinho-800">Bem-vindo à Vino</h2>
        {recusou ? (
          <p className="mt-4 text-tinta-2">Desculpe, o acesso é permitido apenas para maiores de 18 anos.</p>
        ) : (
          <>
            <p className="mt-3 text-tinta-2">Este site vende bebidas alcoólicas. Você tem 18 anos ou mais?</p>
            <div className="mt-6 flex justify-center gap-3">
              <button className="btn-contorno" onClick={() => setRecusou(true)}>Não</button>
              <button className="btn-primario" onClick={confirmar} autoFocus>Sim, tenho 18+</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
