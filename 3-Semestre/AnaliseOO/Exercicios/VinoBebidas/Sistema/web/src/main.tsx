import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import { CarrinhoProvider } from './estado/carrinho'
import { SessaoProvider } from './estado/sessao'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessaoProvider>
        <CarrinhoProvider>
          <App />
        </CarrinhoProvider>
      </SessaoProvider>
    </QueryClientProvider>
  </StrictMode>,
)
