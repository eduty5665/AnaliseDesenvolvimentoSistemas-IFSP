import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { SolutionItem } from "../components/CardSolution/CardSolution";
import { faBarsStaggered, faFileLines, faListCheck, faUsers } from "@fortawesome/free-solid-svg-icons";

export const solucao: SolutionItem[] = [
    {
      id: "catalogo",
      icon: <FontAwesomeIcon icon={faBarsStaggered} />,
      title: "Explorar Catálogo",
      content: "Acesse nosso catálogo e descubra os tipos de árvores disponíveis, suas características e qual espécie mais se adapta à sua calçada."
    },
    {
      id: "requisicao",
      icon: <FontAwesomeIcon icon={faFileLines} />,
      title: "Fazer Requisição",
      content: "Peça sua muda ao viveiro municipal de forma 100% digital, iniciando o processo para deixar sua rua mais verde."
    },
    {
      id: "status",
      icon: <FontAwesomeIcon icon={faListCheck} />,
      title: "Acompanhar Pedido",
      content: "Acompanhe em tempo real as etapas: Pendente, Em análise, Agendado, Aguardando retirada e Concluído."
    },
    {
      id: "comunidade",
      icon: <FontAwesomeIcon icon={faUsers} />,
      title: "Postar no Blog",
      content: "Árvore plantada? Tire uma foto e poste no nosso blog! Mostre o resultado e inspire seus vizinhos."
    }
  ];