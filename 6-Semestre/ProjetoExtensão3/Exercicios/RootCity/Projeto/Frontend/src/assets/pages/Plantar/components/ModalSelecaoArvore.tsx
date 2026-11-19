import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { Arvore } from "../../../../types";

interface ModalSelecaoArvoreProps {
    aberto: boolean;
    arvores: Arvore[];
    arvoreSelecionadaId: string | null;
    onSelecionar: (id: string) => void;
    onFechar: () => void;
    desabilitado: boolean;
}

export const ModalSelecaoArvore = ({
    aberto,
    arvores,
    arvoreSelecionadaId,
    onSelecionar,
    onFechar,
    desabilitado,
}: ModalSelecaoArvoreProps) => {
    useEffect(() => {
        if (!aberto) return;

        document.body.classList.add("modalAberto");

        const fecharAoPressionarEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onFechar();
            }
        };

        document.addEventListener("keydown", fecharAoPressionarEsc);

        return () => {
            document.body.classList.remove("modalAberto");
            document.removeEventListener("keydown", fecharAoPressionarEsc);
        };
    }, [aberto, onFechar]);

    if (!aberto) return null;

    return (
        <div
            className="arvoresModalOverlay"
            onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
        >
            <div
                className="arvoresModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tituloModalArvores"
            >
                <div className="arvoresModalHeader">
                    <div>
                        <h2 id="tituloModalArvores">Árvores disponíveis</h2>
                        <p>Escolha a espécie que deseja para o seu plantio.</p>
                    </div>

                    <button
                        type="button"
                        className="btnFecharModal"
                        onClick={onFechar}
                        aria-label="Fechar modal"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="arvoresModalBody">
                    <div className="arvoresGrid">
                        {arvores.map((arvore) => {
                            const selecionada = arvoreSelecionadaId === arvore.id;
                            const disponivel = arvore.quantidade > 0;

                            return (
                                <article
                                    key={arvore.id}
                                    className={`arvoreCard ${
                                        selecionada ? "selected" : ""
                                    } ${!disponivel ? "indisponivelCard" : ""}`}
                                    onClick={() =>
                                        disponivel && onSelecionar(arvore.id)
                                    }
                                >
                                    <div className="arvoreImagem">
                                        <img
                                            src={arvore.imagemUrl || ""}
                                            alt={arvore.nomePopular}
                                        />
                                    </div>

                                    <div className="arvoreCardContent">
                                        <div className="arvoreCardTitle">
                                            <h3>{arvore.nomePopular}</h3>
                                            <span
                                                className={
                                                    disponivel
                                                        ? "disponivel"
                                                        : "indisponivel"
                                                }
                                            >
                                                {disponivel
                                                    ? `${arvore.quantidade} disponíveis`
                                                    : "Indisponível"}
                                            </span>
                                        </div>

                                        <p>{arvore.descricao}</p>

                                        <button
                                            type="button"
                                            disabled={!disponivel || desabilitado}
                                            className="btnEscolherArvore"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelecionar(arvore.id);
                                            }}
                                        >
                                            {selecionada ? (
                                                <>
                                                    <FontAwesomeIcon icon={faCheck} />{" "}
                                                    Árvore selecionada
                                                </>
                                            ) : disponivel ? (
                                                "Escolher esta árvore"
                                            ) : (
                                                "Indisponível"
                                            )}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
