
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faSeedling,
  faTree,
  faCity,
  faArrowAltCircleRight,
} from "@fortawesome/free-solid-svg-icons";

import { HeaderVideo } from "../../components/HeaderVideo/HeaderVideo";
import { SectionContent } from "../../components/SectionContent/SectionContent";
import { cardsInfo } from "../../dataInfo/cardsInfo";
import { CardInfo } from "../../components/CardInfo/CardInfo";
import { CardSolution } from "../../components/CardSolution/CardSolution";
import { solucao } from "../../dataInfo/solucao";

import treeVideo from "../../media/tree_video.webm";
import notebook from "../../media/notebook.webp";

import "./HomePage.css";

export function HomePage() {
  return (
    <main className="homePage">
      <HeaderVideo
        src={treeVideo}
        title="Cidade Raiz"
        icon={
          <FontAwesomeIcon
            icon={faLeaf}
            style={{ color: "#739d1e" }}
          />
        }
      />

      {/* Objetivo */}
      <section id="nossoObjetivo" className="homeSection">
        <div className="sectionHeading">
          <span className="sectionEyebrow">
            <FontAwesomeIcon icon={faSeedling} />
            <span>Nosso propósito</span>
          </span>

          <h2>Nosso objetivo</h2>

          <p>
            Mais verde nas cidades, mais qualidade de vida para todos.
            Conectamos pessoas e iniciativas para cultivar um futuro
            mais sustentável.
          </p>

          <span className="headingDecoration" aria-hidden="true">
            <FontAwesomeIcon icon={faLeaf} />
          </span>
        </div>

        <SectionContent className="homeContent">
          {cardsInfo.map((card) => (
            <CardInfo key={card.number} {...card} />
          ))}
        </SectionContent>
      </section>

      {/* Sistema */}
      <section className="systemSection">
        <div className="systemWrapper">
          <div className="systemVisual">
            <span className="floatingLeaf leafOne" aria-hidden="true">
              <FontAwesomeIcon icon={faLeaf} />
            </span>

            <span className="floatingLeaf leafTwo" aria-hidden="true">
              <FontAwesomeIcon icon={faSeedling} />
            </span>

            <div className="notebook">
              <img
                src={notebook}
                alt="Notebook representando a plataforma Cidade Raiz"
                loading="lazy"
              />
            </div>

            <div className="systemTag">
              <span className="statusDot" />
              Tecnologia a favor da natureza
            </div>
          </div>

          <div className="systemText">
            <span className="sectionEyebrow">
              <FontAwesomeIcon icon={faCity} />
              <span>Conheça a plataforma</span>
            </span>

            <h2>
              A tecnologia também pode
              <span> fazer florescer.</span>
            </h2>

            <p>
              O Cidade Raiz é uma plataforma que conecta moradores e
              Prefeitura para tornar o processo de plantio de árvores
              urbanas mais simples, acessível e transparente.
            </p>

            <p>
              Por meio do sistema, o cidadão pode conhecer as espécies
              disponíveis, solicitar uma muda, acompanhar o andamento
              do plantio e participar de um ranking de sustentabilidade.
              Assim, tecnologia e participação comunitária se unem para
              transformar nossas cidades em lugares mais verdes.
            </p>

            <div className="systemBenefits">
              <div className="systemBenefit">
                <span className="benefitIcon">
                  <FontAwesomeIcon icon={faSeedling} />
                </span>
                <div>
                  <strong>Plante</strong>
                  <span>Solicite sua muda</span>
                </div>
              </div>

              <div className="systemBenefit">
                <span className="benefitIcon">
                  <FontAwesomeIcon icon={faTree} />
                </span>
                <div>
                  <strong>Acompanhe</strong>
                  <span>Veja o progresso</span>
                </div>
              </div>

              <div className="systemBenefit">
                <span className="benefitIcon">
                  <FontAwesomeIcon icon={faLeaf} />
                </span>
                <div>
                  <strong>Transforme</strong>
                  <span>Faça parte da mudança</span>
                </div>
              </div>
            </div>

            <a href="/plantar" className="systemLink">
              Veja as espécies disponíveis
              <FontAwesomeIcon icon={faArrowAltCircleRight} />
            </a>
          </div>
        </div>
      </section>

      {/* Solução */}
      <section id="nossaSolucao" className="homeSection solutionSection">
        <div className="sectionHeading">
          <span className="sectionEyebrow">
            <FontAwesomeIcon icon={faLeaf} />
            <span>Do planejamento à ação</span>
          </span>

          <h2>Nossa solução</h2>

          <p>
            Descubra como pequenas ações podem gerar grandes mudanças
            na paisagem urbana.
          </p>
        </div>

        <SectionContent className="homeContent solutionContent">
          <CardSolution solutions={solucao} />
        </SectionContent>
      </section>

      <div className="homeClosing" aria-hidden="true">
        <FontAwesomeIcon icon={faLeaf} />
        <span>Cultivando hoje as cidades de amanhã.</span>
        <FontAwesomeIcon icon={faLeaf} />
      </div>
    </main>
  );
}