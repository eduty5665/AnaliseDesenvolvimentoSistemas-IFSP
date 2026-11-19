
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { ReactNode } from "react";

import "./CardSolution.css";

export interface SolutionItem {
  id: string;
  title: string;
  icon?: ReactNode;
  content: string;
}

interface CardSolutionProps {
  solutions: SolutionItem[];
}

export function CardSolution({ solutions }: CardSolutionProps) {
  const [activeId, setActiveId] = useState<string>(
    solutions[0]?.id ?? ""
  );

  const activeSolution = solutions.find(
    (solution) => solution.id === activeId
  );

  if (solutions.length === 0) {
    return null;
  }

  return (
    <div className="solutionsContainer">
      <div
        className="solutionsNavigation"
        role="tablist"
        aria-label="Conheça nossas soluções"
      >
        {solutions.map((solution, index) => {
          const isActive = solution.id === activeId;

          return (
            <button
              key={solution.id}
              id={`solution-tab-${solution.id}`}
              type="button"
              role="tab"
              className={`solutionTab ${isActive ? "active" : ""}`}
              aria-selected={isActive}
              aria-controls={`solution-panel-${solution.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(solution.id)}
              onKeyDown={(event) => {
                if (
                  event.key === "ArrowRight" ||
                  event.key === "ArrowLeft"
                ) {
                  event.preventDefault();

                  const currentIndex = solutions.findIndex(
                    (item) => item.id === activeId
                  );

                  const direction =
                    event.key === "ArrowRight" ? 1 : -1;

                  const nextIndex =
                    (currentIndex + direction + solutions.length) %
                    solutions.length;

                  setActiveId(solutions[nextIndex].id);

                  document
                    .getElementById(
                      `solution-tab-${solutions[nextIndex].id}`
                    )
                    ?.focus();
                }
              }}
              title={solution.title}
            >
              <span className="solutionTabIcon">
                {solution.icon}
              </span>

              <span className="solutionTabText">
                <small>ETAPA {String(index + 1).padStart(2, "0")}</small>
                <strong>{solution.title}</strong>
              </span>
            </button>
          );
        })}
      </div>

      {activeSolution && (
        <div
          key={activeSolution.id}
          id={`solution-panel-${activeSolution.id}`}
          className="solutionPanel"
          role="tabpanel"
          aria-labelledby={`solution-tab-${activeSolution.id}`}
          tabIndex={0}
        >
          <div className="solutionPanelIcon">
            {activeSolution.icon}
          </div>

          <div className="solutionPanelContent">
            <span className="solutionPanelEyebrow">
              Nossa solução em ação
            </span>

            <h3>{activeSolution.title}</h3>

            <p>{activeSolution.content}</p>

            <div className="solutionPanelFooter">
              <span>
                <span className="solutionStatusDot" />
                Cultivando um futuro sustentável
              </span>

              <span className="solutionArrow" aria-hidden="true">
                <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
