import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg'

/** Garrafa ilustrada na cor da categoria (mesmo desenho da loja web). */
export function Garrafa({ cor, categoria, altura = 140 }: { cor: string; categoria: string; altura?: number }) {
  const espumante = categoria === 'Espumante'
  const claro = categoria === 'Branco' || categoria === 'Rosé'
  return (
    <Svg width={altura * 0.4} height={altura} viewBox="0 0 120 300">
      <Rect x={47} y={8} width={26} height={espumante ? 62 : 46} rx={5} fill={espumante ? '#c9a227' : '#5a1427'} />
      <Path d="M50 50 h20 v40 c0 18 28 30 28 62 v126 a14 14 0 0 1 -14 14 h-48 a14 14 0 0 1 -14 -14 v-126 c0 -32 28 -44 28 -62 z" fill={claro ? '#c9d8b4' : '#2d3b28'} />
      <Path d="M24 160 h72 v118 a10 10 0 0 1 -10 10 h-52 a10 10 0 0 1 -10 -10 z" fill={cor} opacity={claro ? 0.6 : 0.45} />
      <Rect x={26} y={176} width={68} height={74} rx={4} fill="#fffaf0" />
      <Rect x={26} y={176} width={68} height={6} fill={cor} />
      <SvgText x={60} y={210} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#3d0f1e">VINO</SvgText>
      <SvgText x={60} y={228} textAnchor="middle" fontSize={8} fill="#6b6166">{categoria.toUpperCase()}</SvgText>
      <Path d="M34 150 c-4 30 -4 90 0 126" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} fill="none" />
    </Svg>
  )
}
