import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingHeart, faListCheck } from "@fortawesome/free-solid-svg-icons";
import type { Requisicao } from "../../../../types";

interface PlantarHeaderProps {
    modoVerificacao: boolean;
    podeEditar: boolean;
    requisicao: Requisicao | null;
    onAbrirMinhasRequisicoes: () => void;
    onNovaRequisicao: () => void;
}

export const PlantarHeader = ({
    modoVerificacao,
    podeEditar,
    requisicao,
    onAbrirMinhasRequisicoes,
    onNovaRequisicao,
}: PlantarHeaderProps) => {
    return (
        <div className="solicitacaoHeader d-flex flex-column">
            <div className="reqHeadButtons flex-row justify-content-end gap-2 w-100">
                <button
                    type="button"
                    className="btnEnviar"
                    onClick={onAbrirMinhasRequisicoes}
                >
                    <FontAwesomeIcon icon={faListCheck} />
                    {" "}Minhas requisições
                </button>

                {modoVerificacao && (
                    <button
                        type="button"
                        className="btnEnviar"
                        onClick={onNovaRequisicao}
                        style={{ marginBottom: "10px" }}
                    >
                        Nova requisição
                    </button>
                )}
            </div>

            <div className="d-flex flex-row justify-content-between align-items-center w-100">
                <div>
                    <h2>
                        {modoVerificacao
                            ? `Verificar Requisição - ${requisicao?.nomeBeneficiario || ""}`
                            : "Nova Requisição de Plantio"}
                    </h2>
                    <p>
                        {modoVerificacao
                            ? podeEditar
                                ? "Confira os dados da requisição e faça as alterações necessárias."
                                : "Obs: Não é possível alterar os dados desta requisição."
                            : "Preencha os dados abaixo para solicitar o plantio de uma árvore."}
                    </p>
                </div>
                <div className="plantarHeaderIcon">
                    <FontAwesomeIcon icon={faHandHoldingHeart} />
                </div>
            </div>

            {requisicao?.status === "RECUSADO" && (
                <div className="alert alert-danger mt-3 w-100" role="alert">
                    Esta requisição foi recusada, faça as alterações necessárias.
                    <br />
                    <strong> Motivo</strong>: {requisicao.observacaoStatus || "Não informado."}
                </div>
            )}
        </div>
    );
};
