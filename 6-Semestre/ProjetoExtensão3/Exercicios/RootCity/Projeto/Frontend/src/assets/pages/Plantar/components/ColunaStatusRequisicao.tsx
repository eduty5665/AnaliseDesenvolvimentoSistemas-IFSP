import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import type { Publicacao, Requisicao } from "../../../../types";
import { StatusRequisicao } from "../../../components/StatusRequisicao/StatusRequisicao";

interface ColunaStatusRequisicaoProps {
    modoVerificacao: boolean;
    requisicao: Requisicao | null;
    publicacao: Publicacao | null;
    onAbrirMinhasRequisicoes: () => void;
    onNovaRequisicao: () => void;
    onFotoPlantioSalva: (requisicaoAtualizada: Requisicao) => void;
}

export const ColunaStatusRequisicao = ({
    modoVerificacao,
    requisicao,
    publicacao,
    onAbrirMinhasRequisicoes,
    onNovaRequisicao,
    onFotoPlantioSalva,
}: ColunaStatusRequisicaoProps) => {
    return (
        <div className="statusColumn">
            <div className="reqStatusButtons flex-row justify-content-end gap-2 w-100">
                <button
                    type="button"
                    className="btnEnviar mb-1"
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

            <div className="statusCard">
                <StatusRequisicao
                    requisicao={requisicao}
                    onFotoPlantioSalva={onFotoPlantioSalva}
                    publicacao={publicacao}
                />
            </div>
        </div>
    );
};
