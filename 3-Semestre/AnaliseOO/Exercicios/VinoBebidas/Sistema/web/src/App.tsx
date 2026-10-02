import { BrowserRouter, Route, Routes } from 'react-router'
import { LayoutLoja } from './componentes/LayoutLoja'
import { Inicio } from './paginas/Inicio'
import { Catalogo } from './paginas/Catalogo'
import { Produto } from './paginas/Produto'
import { Carrinho } from './paginas/Carrinho'
import { Entrar } from './paginas/Entrar'
import { Conta } from './paginas/Conta'
import { BaixarApp } from './paginas/BaixarApp'
import { AdminLogin } from './admin/AdminLogin'
import { Painel } from './admin/Painel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutLoja />}>
          <Route index element={<Inicio />} />
          <Route path="vinhos" element={<Catalogo />} />
          <Route path="vinhos/:id" element={<Produto />} />
          <Route path="carrinho" element={<Carrinho />} />
          <Route path="entrar" element={<Entrar />} />
          <Route path="conta" element={<Conta />} />
          <Route path="app" element={<BaixarApp />} />
          <Route path="*" element={<div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="titulo text-4xl font-bold text-vinho-800">Página não encontrada</h1></div>} />
        </Route>
        <Route path="admin/entrar" element={<AdminLogin />} />
        <Route path="admin" element={<Painel />} />
      </Routes>
    </BrowserRouter>
  )
}
