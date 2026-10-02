import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Smartphone, WifiOff } from 'lucide-react'
import { api } from '../api/cliente'

type InfoApp = { urlDownload?: string | null; versao: string; empresa: string }

/** Página do QR code: clientes, consultores e vendedores baixam o app de catálogo. */
export function BaixarApp() {
  const info = useQuery({ queryKey: ['app-info'], queryFn: () => api<InfoApp>('/api/app/info') })
  const url = info.data?.urlDownload || null
  const catalogoWeb = `${window.location.origin}/vinhos`

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold tracking-widest text-vinho-500 uppercase">App Vino Catálogo</p>
          <h1 className="titulo mt-2 text-5xl leading-tight font-bold text-vinho-800">Toda a adega no seu celular</h1>
          <p className="mt-4 text-lg text-tinta-2">
            Consulte vinhos, preços, ficha técnica, harmonização e disponibilidade em tempo real. Ideal para clientes e para nossos consultores durante o atendimento.
          </p>
          <ul className="mt-6 space-y-2 text-tinta">
            <li>✓ Catálogo sempre atualizado com o estoque das lojas</li>
            <li>✓ Busca por uva, país, faixa de preço</li>
            <li>✓ Compartilhe um vinho com o cliente pelo WhatsApp</li>
          </ul>
          <p className="mt-6 text-sm text-tinta-2">Android: aponte a câmera para o QR code e instale o APK. iPhone: use o link de distribuição informado pela loja.</p>
        </div>
        <div className="cartao grid place-items-center p-10 text-center">
          {url ? (
            <>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-vinho-100"><QRCodeSVG value={url} size={220} fgColor="#3d0f1e" level="M" /></div>
              <p className="mt-4 font-semibold">Escaneie para baixar · v{info.data?.versao}</p>
              <a href={url} className="btn-primario mt-4"><Smartphone size={18} /> Baixar direto</a>
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-vinho-100"><QRCodeSVG value={catalogoWeb} size={220} fgColor="#3d0f1e" level="M" /></div>
              <p className="mt-4 flex items-center gap-2 font-semibold"><WifiOff size={16} /> Link do app ainda não publicado</p>
              <p className="mt-1 max-w-xs text-sm text-tinta-2">
                Enquanto isso, este QR abre o catálogo web no celular. Após gerar o APK (<code>eas build</code>), informe o link em <code>AppMobile:UrlDownload</code> no appsettings da API.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
