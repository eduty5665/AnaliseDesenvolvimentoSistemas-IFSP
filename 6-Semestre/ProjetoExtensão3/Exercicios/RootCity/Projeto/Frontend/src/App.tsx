import './App.css'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import imgLogo from './assets/media/imgLogo.webp'
import { Footer } from './assets/components/Footer/Footer'
import { Menu } from './assets/components/Menu/Menu'
import { AuthProvider } from './contexts/AuthContext'
import { RotaProtegida } from './assets/components/RotaProtegida/RotaProtegida'
import { LoadingProvider } from './contexts/LoadingContext'
import { LoadingOverlay } from './assets/components/LoadingOverlay/LoadingOverlay'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PageSkeleton } from './assets/components/Skeletons/PageSkeleton'

// Carregamento sob demanda das páginas
const HomePage = lazy(() =>
  import('./assets/pages/HomePage/HomePage').then(m => ({
    default: m.HomePage
  }))
)

const Login = lazy(() =>
  import('./assets/pages/Login/Login').then(m => ({
    default: m.Login
  }))
)

const BlogPage = lazy(() =>
  import('./assets/pages/BlogPage/BlogPage').then(m => ({
    default: m.BlogPage
  }))
)

const Plantar = lazy(() =>
  import('./assets/pages/Plantar/Plantar').then(m => ({
    default: m.Plantar
  }))
)

const Gestao = lazy(() =>
  import('./assets/pages/Gestao/Gestao').then(m => ({
    default: m.Gestao
  }))
)

function ScrollToHash() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [hash, pathname])

  return null
}

interface PageProps {
  title: string
  description: string
}

function Page({ title, description }: PageProps) {
  return (
    <main className="internalPage">
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, //5 minutos frescos - quanto tempo posso confiar nos dados sem precisar perguntar ao servidor
      gcTime: 1000 * 60 * 30,   //Usuário sai da página - quanto tempo info fica salva na memória cache
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LoadingProvider>
            <div className="appLayout">
              <ScrollToHash />
              <LoadingOverlay />
              <Menu />
              <main className="appMainContent">
                <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/plantar" element={<Plantar />} />
                  <Route
                    path="/gestao"
                    element={
                      <RotaProtegida>
                        <Gestao />
                      </RotaProtegida>
                    }
                  />
                  <Route path="*" element={<Page title="Página não encontrada" description="O endereço acessado não existe." />} />
                </Routes>
                </Suspense>
              </main>
              <Footer>
                <div className="imgLogo"><img src={imgLogo} alt="Logo Cidade Raiz" /></div>
              </Footer>
            </div>
          </LoadingProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
