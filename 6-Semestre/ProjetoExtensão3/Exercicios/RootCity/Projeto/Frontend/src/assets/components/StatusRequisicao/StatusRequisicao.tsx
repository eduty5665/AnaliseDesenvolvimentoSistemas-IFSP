import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Publicacao, Requisicao, StatusRequisicao as Status } from "../../../types";
import {
    faCalendarCheck,
    faCamera,
    faCheck,
    faClock,
    faLeaf,
    faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import "./StatusRequisicao.css";
import { useEffect, useState } from "react";
import { salvarFotoPlantio } from "../../../services/requisicaoService";
import ModalPublicarBlog from "../ModalPublicarBlog/ModalPublicarBlog";
import { useNavigate } from "react-router-dom";
import Alert from "../Alert/Alert";
import { useAlert } from "../hooks/useAlert";

interface StatusRequisicaoProps {
    requisicao: Requisicao | null;
    publicacao: Publicacao | null;
    onFotoPlantioSalva?: (requisicao: Requisicao) => void;
}

type EtapaStatus = "concluida" | "atual" | "pendente" | "recusada";

export const StatusRequisicao = ({
    requisicao,
    publicacao,
    onFotoPlantioSalva,
}: StatusRequisicaoProps) => {

    const status: Status = requisicao?.status ?? "SOLICITADO";
    const id = requisicao?.id;

    const [fotoPlantio, setFotoPlantio] = useState<File | null>(null);
    const [fotoPlantioUrl, setFotoPlantioUrl] = useState<string | null>(null);

    const { alert, showAlert, closeAlert } = useAlert();

    const navigate = useNavigate();

    useEffect(() => {
        setFotoPlantioUrl(requisicao?.fotoPlantioUrl ?? null);
    }, [requisicao]);

    const possuiPubli = !!publicacao?.id;

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setFotoPlantio(file);
        }
    };

    const abrirArquivoNovaGuia = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    /*
     * Define o estado visual de cada etapa
     * baseado no status atual da requisição.
     */
    const getEtapaStatus = (etapa: string): EtapaStatus => {

        /*
         * Fluxo de RECUSADO
         */
        if (status === "RECUSADO") {

            if (etapa === "solicitado") {
                return "concluida";
            }

            if (etapa === "aprovado") {
                return "recusada";
            }

            return "pendente";
        }

        /*
         * Fluxo normal
         */

        const fluxo: Record<Status, number> = {
            SOLICITADO: 0,
            APROVADO: 1,
            AGUARDANDO_RETIRADA: 2,
            AGENDADO_PLANTIO: 2,
            CONCLUIDO: 3,
            RECUSADO: 1,
        };

        const etapas: Record<string, number> = {
            solicitado: 0,
            aprovado: 1,
            atendimento: 2,
            concluido: 3,
        };

        const indiceAtual = fluxo[status];
        const indiceEtapa = etapas[etapa];

        if (indiceAtual === undefined || indiceEtapa === undefined) {
            return "pendente";
        }

        if (indiceEtapa <= indiceAtual && status === "CONCLUIDO") {
            return "concluida";
        }

        if (indiceEtapa < indiceAtual) {
            return "concluida";
        }

        if (indiceEtapa === indiceAtual) {
            return "atual";
        }

        return "pendente";
    };

    /*
     * Define o ícone da etapa.
     */
    const getIcon = (
        etapa: string,
        icon: any
    ) => {

        const etapaStatus = getEtapaStatus(etapa);

        if (etapaStatus === "concluida") {
            return faCheck;
        }

        if (etapaStatus === "recusada") {
            return faClock;
        }

        return icon;
    };

    /*
     * Texto amigável do status.
     */
    const statusLabel: Record<Status, string> = {
        SOLICITADO: "Solicitado",
        APROVADO: "Aprovado",
        RECUSADO: "Recusado",
        AGUARDANDO_RETIRADA: "Aguardando retirada",
        AGENDADO_PLANTIO: "Agendado para plantio",
        CONCLUIDO: "Concluído",
    };

    /*
     * A etapa de atendimento depende do tipo escolhido.
     */
    const etapaAtendimento =
        requisicao?.tipoAtendimento === "RETIRADA_LOCAL"
            ? "Retirada local"
            : "Agendado para plantio";

    const iconeAtendimento =
        requisicao?.tipoAtendimento === "RETIRADA_LOCAL"
            ? faLocationDot
            : faCalendarCheck;

    const handleSalvarFoto = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!id || !fotoPlantio) {
            return;
        }

        const formData = new FormData();

        formData.append("fotoPlantio", fotoPlantio);

        if (!id || !fotoPlantio) {
            return;
        }

        try {
            const resposta = await salvarFotoPlantio(id, formData);

            showAlert("Foto salva com sucesso!", 'success');

            setFotoPlantioUrl(resposta.fotoPlantioUrl);
            setFotoPlantio(null);
            onFotoPlantioSalva?.(resposta);
        } catch (error) {
            showAlert("Erro ao salvar foto!", 'danger');
        }
    };

    const [modalAberto, setModalAberto] = useState(false);
    const [requisicaoSelecionada, setRequisicaoSelecionada] = useState<Requisicao | null>(null);
    const API_URL = import.meta.env.VITE_API_URL;

    const abrirModalRequisicao = (requisicao: Requisicao) => {
        setRequisicaoSelecionada(requisicao);
        setModalAberto(true);
    };

    const fecharModalRequisicao = () => {
        setModalAberto(false);
        setRequisicaoSelecionada(null);
    };

    return (
        <>
            {alert && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    onClose={closeAlert}
                />
            )}

            <div className="statusHeader">

                <div>
                    <h2>
                        Acompanhe sua requisição
                    </h2>

                    {id && (
                        <p>
                            Código: #{id.substring(0, 8).toUpperCase()}
                        </p>
                    )}
                </div>

                <span
                    className={`statusBadge status-${status.toLowerCase()}`}
                >
                    {statusLabel[status]}
                </span>

            </div>

            <div className="timeline">

                {/* SOLICITADO */}

                <div
                    className={`timelineItem ${getEtapaStatus("solicitado")}`}
                >

                    <div className="timelineIcon">
                        <FontAwesomeIcon
                            icon={getIcon("solicitado", faClock)}
                        />
                    </div>

                    <div className="timelineContent">

                        <h3>
                            Solicitado
                        </h3>

                        <p>
                            Sua requisição foi recebida com sucesso.
                        </p>

                    </div>

                </div>


                {/* APROVADO / RECUSADO */}

                <div
                    className={`timelineItem ${getEtapaStatus("aprovado")}`}
                >

                    <div className="timelineIcon">

                        <FontAwesomeIcon
                            icon={
                                status === "RECUSADO"
                                    ? faClock
                                    : getIcon("aprovado", faClock)
                            }
                        />

                    </div>

                    <div className="timelineContent">

                        <h3>
                            {status === "RECUSADO"
                                ? "Recusado"
                                : "Aprovado"
                            }
                        </h3>

                        <p>
                            {status === "RECUSADO"
                                ? "Sua requisição foi recusada."
                                : "Sua requisição foi aprovada."
                            }
                        </p>

                    </div>

                </div>


                {/* ATENDIMENTO */}

                {requisicao && (
                    <div
                        className={`timelineItem ${getEtapaStatus("atendimento")}`}
                    >

                        <div className="timelineIcon">

                            <FontAwesomeIcon
                                icon={iconeAtendimento}
                            />

                        </div>

                        <div className="timelineContent">

                            <h3>
                                {etapaAtendimento}
                            </h3>

                            <p>
                                {requisicao.tipoAtendimento === "RETIRADA_LOCAL" ? (
                                    <>
                                        Sua requisição está aguardando retirada.
                                        <br />
                                        Local: {requisicao.endereco?.rua}, n° {requisicao.endereco?.numero}, {requisicao.endereco?.bairro}
                                    </>
                                ) : requisicao.dataInicial && requisicao.dataFinal ? (
                                    <>
                                        Seu plantio será realizado no período de{" "}
                                        {new Date(requisicao.dataInicial).toLocaleDateString("pt-BR", {
                                            timeZone: "UTC"
                                        })}{" "}
                                        a{" "}
                                        {new Date(requisicao.dataFinal).toLocaleDateString("pt-BR", {
                                            timeZone: "UTC"
                                        })}
                                    </>
                                ) : (
                                    "Aguardando definição do período de plantio."
                                )}
                            </p>

                        </div>

                    </div>
                )}


                {/* CONCLUÍDO */}

                <div
                    className={`timelineItem ${getEtapaStatus("concluido")}`}
                >

                    <div className="timelineIcon">

                        <FontAwesomeIcon
                            icon={faLeaf}
                        />

                    </div>

                    <div className="timelineContent">

                        <h3>
                            Concluído
                        </h3>

                        <p>
                            Plantio realizado com sucesso!
                        </p>

                        <span>
                            A foto será disponibilizada aqui.
                        </span>

                    </div>

                </div>

            </div>


            {/* BOX DE CONCLUSÃO */}

            <div className="conclusaoBox">

                <div>

                    <strong>
                        Após a conclusão
                    </strong>

                    <p>
                        Uma foto da árvore poderá ser adicionada aqui após o
                        plantio. Caso você tenha optado por retirar e plantar
                        por conta própria, você mesmo poderá inserir a imagem.
                    </p>

                </div>

                {requisicao && requisicao.status !== "CONCLUIDO" && (
                    <div className="conclusaoIcon">

                        <FontAwesomeIcon
                            icon={faCamera}
                        />

                    </div>
                )}


            </div>
            {requisicao && requisicao.status === "CONCLUIDO" && (
                <div className="photoUpload mt-2 d-flex flex-column">

                    {!possuiPubli && (

                        <label
                            htmlFor="fotoPlantio"
                            className="addPhoto"
                        >
                            <div className="cameraIcon">
                                <FontAwesomeIcon
                                    icon={faCamera}
                                />
                            </div>

                            <strong>
                                {fotoPlantio ? (
                                    <>
                                        Foto adicionada com sucesso{" "}
                                        <FontAwesomeIcon
                                            className="successIcon"
                                            icon={faCheck}
                                        />
                                    </>
                                ) : (
                                    "Adicionar foto do plantio"
                                )}
                            </strong>

                            <span>
                                {fotoPlantioUrl
                                    ? "Clique para alterar a imagem"
                                    : "Clique para adicionar uma imagem"}
                            </span>

                            <input
                                id="fotoPlantio"
                                name="fotoPlantio"
                                type="file"
                                accept="image/*"
                                onChange={handleFotoChange}
                            />
                        </label>
                    )}


                    {fotoPlantio && (
                        <div className="photoPreview">

                            <img
                                src={URL.createObjectURL(
                                    fotoPlantio
                                )}
                                alt="Preview da foto do plantio"
                            />

                        </div>
                    )}

                    {(fotoPlantioUrl && !fotoPlantio) && (
                        <div
                            className="photoPreview"
                            onClick={() =>
                                abrirArquivoNovaGuia(fotoPlantioUrl)
                            }
                            style={{ cursor: "pointer" }}
                            title="Clique para abrir a foto em uma nova guia"
                        >
                            <img
                                src={fotoPlantioUrl}
                                alt="Foto do plantio"
                            />
                        </div>
                    )}

                    {possuiPubli && (
                        <button
                            type="button"
                            className="btnEnviar mt-1"
                            onClick={() => navigate('/blog')}
                        >
                            Ver publicação
                        </button>
                    )}

                    {(fotoPlantio && !possuiPubli) && (
                        <button
                            type="button"
                            className="btnEnviar mt-1"
                            onClick={(e) => handleSalvarFoto(e)}
                        >
                            Salvar
                        </button>
                    )}

                    {(fotoPlantioUrl && !fotoPlantio && !possuiPubli) && (
                        <button
                            type="button"
                            className="btnEnviar mt-1"
                            onClick={() => abrirModalRequisicao(requisicao)}
                        >
                            Publicar no Blog
                        </button>
                    )}
                </div>
            )}
            <div className="abaPostarBlog">

                <ModalPublicarBlog
                    aberto={modalAberto}
                    fechar={fecharModalRequisicao}
                    requisicao={requisicaoSelecionada}
                    baseUrl={API_URL}
                />

            </div>
        </>
    );
};
