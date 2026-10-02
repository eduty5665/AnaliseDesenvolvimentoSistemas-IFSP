/** Ilustração de garrafa gerada a partir da categoria (evita depender de fotos externas). */
type Props = { cor: string; categoria: string; className?: string; rotulo?: string }

export function Garrafa({ cor, categoria, className = '', rotulo }: Props) {
  const espumante = categoria === 'Espumante'
  const branco = categoria === 'Branco' || categoria === 'Rosé'
  const vidro = branco ? '#c9d8b4' : '#243320'
  const liquido = cor
  const id = `g${Math.abs(hash(cor + categoria + (rotulo ?? '')))}`
  return (
    <svg viewBox="0 0 120 300" className={className} role="img" aria-label={`Garrafa de ${categoria}`}>
      <defs>
        <linearGradient id={`${id}v`} x1="0" x2="1">
          <stop offset="0" stopColor={vidro} stopOpacity=".95" />
          <stop offset=".45" stopColor={vidro} stopOpacity=".7" />
          <stop offset=".55" stopColor="#ffffff" stopOpacity=".35" />
          <stop offset="1" stopColor={vidro} stopOpacity=".95" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={liquido} stopOpacity=".75" />
          <stop offset="1" stopColor={liquido} />
        </linearGradient>
      </defs>
      {/* cápsula */}
      <rect x="47" y="8" width="26" height={espumante ? 62 : 46} rx="5" fill={espumante ? '#c9a227' : '#5a1427'} />
      {/* gargalo + corpo */}
      <path d="M50 50 h20 v40 c0 18 28 30 28 62 v126 a14 14 0 0 1 -14 14 h-48 a14 14 0 0 1 -14 -14 v-126 c0 -32 28 -44 28 -62 z" fill={`url(#${id}v)`} />
      {/* vinho visto pelo vidro */}
      <path d="M24 160 h72 v118 a10 10 0 0 1 -10 10 h-52 a10 10 0 0 1 -10 -10 z" fill={`url(#${id}l)`} opacity={branco ? 0.55 : 0.35} />
      {/* rótulo */}
      <rect x="26" y="176" width="68" height="74" rx="4" fill="#fffaf0" />
      <rect x="26" y="176" width="68" height="6" fill={liquido} />
      <text x="60" y="206" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="15" fontWeight="700" fill="#3d0f1e">VINO</text>
      <text x="60" y="222" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7" letterSpacing="1.5" fill="#6b6166">{categoria.toUpperCase()}</text>
      <line x1="40" x2="80" y1="232" y2="232" stroke="#c9a227" strokeWidth="1" />
      {/* brilho */}
      <path d="M34 150 c-4 30 -4 90 0 126" stroke="#fff" strokeOpacity=".35" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}
