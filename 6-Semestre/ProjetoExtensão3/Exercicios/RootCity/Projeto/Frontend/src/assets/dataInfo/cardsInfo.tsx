import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDroplet,
  faBolt,
  faSeedling,
  faWind
} from '@fortawesome/free-solid-svg-icons'

export const cardsInfo = [
  {
    icon: <FontAwesomeIcon icon={faDroplet} />,
    number: '01',
    title: 'Água',
    text: 'As árvores desempenham um papel importante na retenção de parte da água da chuva e na redução do escoamento superficial. Esse processo ajuda a minimizar os impactos de chuvas intensas nas cidades.'
  },
  {
    icon: <FontAwesomeIcon icon={faSeedling} />,
    number: '02',
    title: 'Biodiversidade',
    text: 'A arborização tem o potencial de tornar as cidades mais amigáveis ao disponibilizar recursos que auxiliam no restabelecimento da fauna na matriz urbana.'
  },
  {
    icon: <FontAwesomeIcon icon={faBolt} />,
    number: '03',
    title: 'Energia Limpa',
    text: 'O sombreamento e o processo de transpiração das árvores ajudam a reduzir a temperatura e o efeito de ilha de calor urbano. A sombra proporcionada pelas ruas arborizadas pode reduzir a demanda e a necessidade de ar-condicionado em edifícios.'
  },
  {
    icon: <FontAwesomeIcon icon={faWind} />,
    number: '04',
    title: 'Ar Puro',
    text: 'As árvores urbanas são aliadas na luta contra a poluição, atuando na absorção de poluentes como monóxido de carbono e dióxido de enxofre. Quando bem planejada, a arborização ajuda a melhorar a qualidade do ar nas cidades.'
  }
]