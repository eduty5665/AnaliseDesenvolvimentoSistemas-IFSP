import ModalForm from "../ModalForm/ModalForm";
import type { Endereco, Requisicao, StatusRequisicao } from "../../../types";

import "./ModalRequisicao.css";
import { useEffect, useState } from "react";
import { agendarPlantio, aguardarRetirada, alterarStatus, buscarUrlComprovante, recusarRequisicao } from "../../../services/requisicaoService";
import { formatarData, formatarDataAgendamento, formatarStatus, formatarTelefone, formatarTipoAtendimento } from "../../../utils/formatadores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SkeletonTable } from "../Skeletons/SkeletonTable";

import { useAlert } from "../hooks/useAlert";
import Alert from "../Alert/Alert";

interface ModalRequisicaoProps {
    aberto: boolean;
    fechar: () => void;
    requisicao: Requisicao | null;
    enderecos: Endereco[] | null;
    baseUrl: string;
    onAtualizado: () => Promise<void>;
}

export default function ModalRequisicao({
    aberto,
    fechar,
    enderecos,
    requisicao,
    onAtualizado
}: ModalRequisicaoProps) {

    const requisicaoId = requisicao?.id;
    const queryClient = useQueryClient();

    const {
        data: comprovanteResidencia,
        isLoading: carregandoComprovante,
        isError: erroComprovante,
        refetch: renovarComprovante,
    } = useQuery<string>({
        queryKey: ["comprovante-residencia", requisicaoId],
        queryFn: () => {
            if (!requisicaoId) {
                throw new Error("Requisição não selecionada");
            }

            return buscarUrlComprovante(requisicaoId);
        },
        enabled: aberto && !!requisicaoId,
        staleTime: 0,
        refetchInterval: aberto ? 4 * 60 * 1000 : false,
        refetchIntervalInBackground: false,
    });

    const [status, setStatus] = useState<StatusRequisicao>(
        requisicao?.status ?? "SOLICITADO"
    );
    const [obsStatus, setObsStatus] = useState("");
    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");

    const [endereco, setEndereco] = useState(enderecos?.[0]?.id ?? '');

    useEffect(() => {
        if (!requisicao) return;

        setStatus(requisicao.status);
        setObsStatus("");
        setDataInicial("");
        setDataFinal("");
    }, [requisicao]);

    const { alert, showAlert, closeAlert } = useAlert();
    
    if (!requisicao) {
        return null;
    }

    const fotoLocal = requisicao.fotoLocalUrl ?? null;


    const handleChangeStatus = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!requisicao) return;

        if (
            !status || (!obsStatus && status === 'RECUSADO') ||
            ((!dataInicial || !dataFinal) && status === 'AGENDADO_PLANTIO')
        ) {
            showAlert("Por favor, preencha todos os campos obrigatórios.", "warning");
            return;
        }

        try {

            if (status === 'RECUSADO') {
                await recusarRequisicao(requisicao.id, obsStatus);
                await onAtualizado();
                fechar();
                return;
            }

            if (status === 'AGENDADO_PLANTIO') {
                await agendarPlantio(requisicao.id, new Date(`${dataInicial}`), new Date(`${dataFinal}`));
                await onAtualizado();
                fechar();
                return;
            }

            if (status === 'AGUARDANDO_RETIRADA') {
                await aguardarRetirada(requisicao.id, endereco);
                await onAtualizado();
                fechar();
                return;
            }

            await alterarStatus(requisicao.id, status);
            await onAtualizado();
            queryClient.invalidateQueries({ queryKey: ['relatorios'] });
            fechar();

        } catch (error: any) {
            showAlert(`Erro ao salvar: ${error.message}`, 'danger');
        }
    }

    return (
        <ModalForm
            aberto={aberto}
            fechar={fechar}
            titulo="Detalhes da requisição"
            descricao={`Requisição #${requisicao.id.substring(0, 8)}`}
        >
            {alert && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    onClose={closeAlert}
                />
            )}
            
            <div className="modalRequisicao">
                <form className="formSection" onSubmit={handleChangeStatus}>

                    {/* RESUMO */}
                    <section className="secaoRequisicao">
                        <h3>Resumo da requisição</h3>

                        <div className="controlesStatus">
                            <div className="select">
                                <label htmlFor="requisicaoStatus">
                                    Alterar situação
                                </label>

                                <select
                                    name="requisicaoStatus"
                                    id="requisicaoStatus"
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value as StatusRequisicao)
                                    }
                                >
                                    <option value="SOLICITADO">Solicitado</option>
                                    <option value="APROVADO">Aprovado</option>
                                    <option value="RECUSADO">Recusado</option>

                                    {requisicao.tipoAtendimento === "RETIRADA_LOCAL" && (
                                        <option value="AGUARDANDO_RETIRADA">
                                            Aguardando retirada
                                        </option>
                                    )}

                                    {requisicao.tipoAtendimento === "PLANTIO_AGENDADO" && (
                                        <option value="AGENDADO_PLANTIO">
                                            Plantio agendado
                                        </option>
                                    )}

                                    <option value="CONCLUIDO">Concluído</option>
                                </select>
                            </div>

                            {status !== requisicao.status && (
                                <>
                                    {status === "RECUSADO" && (
                                        <div className="campoStatus">
                                            <label htmlFor="obsStatus">
                                                Motivo da recusa
                                            </label>

                                            <input
                                                id="obsStatus"
                                                type="text"
                                                value={obsStatus}
                                                placeholder="Informe o motivo da recusa"
                                                required
                                                onChange={(e) => setObsStatus(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {status === "AGUARDANDO_RETIRADA" && (
                                        <div className="campoStatus">
                                            <label htmlFor="endereco">
                                                Endereço
                                            </label>

                                            <select
                                                name="requisicaoStatus"
                                                id="requisicaoStatus"
                                                value={endereco}
                                                onChange={(e) =>
                                                    setEndereco(e.target.value)
                                                }
                                            >
                                                {enderecos?.map((item) => (
                                                    <option value={item.id}>{`${item.rua}, ${item.bairro}, ${item.numero}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {status === "AGENDADO_PLANTIO" && (
                                        <>
                                            <div className="campoStatus">
                                                <label htmlFor="dataInicial">
                                                    Data inicial estimada
                                                </label>

                                                <input
                                                    id="dataInicial"
                                                    type="date"
                                                    value={dataInicial}
                                                    required
                                                    onChange={(e) =>
                                                        setDataInicial(e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="campoStatus">
                                                <label htmlFor="dataFinal">
                                                    Data final estimada
                                                </label>

                                                <input
                                                    id="dataFinal"
                                                    type="date"
                                                    value={dataFinal}
                                                    min={dataInicial || undefined}
                                                    required
                                                    onChange={(e) =>
                                                        setDataFinal(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}

                                    <button type="submit" className="btnRequisicao btnSalvar">
                                        Salvar alterações
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="gridInformacoes">

                            <div className="informacao">
                                <span>Beneficiário</span>
                                <strong>
                                    {requisicao.nomeBeneficiario ||
                                        "Não informado"}
                                </strong>
                            </div>

                            <div className="informacao">
                                <span>Telefone</span>
                                <strong>
                                    {formatarTelefone(
                                        requisicao.telefoneBeneficiario
                                    )}
                                </strong>
                            </div>

                            <div className="informacao">
                                <span>Árvore</span>
                                <strong>
                                    {requisicao.arvore?.nomePopular ||
                                        "Não informado"}
                                </strong>
                            </div>

                            <div className="informacao">
                                <span>Tipo de atendimento</span>
                                <strong>
                                    {formatarTipoAtendimento(
                                        requisicao.tipoAtendimento
                                    )}
                                </strong>
                            </div>

                            <div className="informacao">
                                <span>Status</span>

                                <span
                                    className={`statusModal status-${requisicao.status.toLowerCase()}`}
                                >
                                    {formatarStatus(requisicao.status)}
                                </span>
                            </div>

                            <div className="informacao">
                                <span>Data da solicitação</span>
                                <strong>
                                    {formatarData(requisicao.criadoEm)}
                                </strong>
                            </div>

                            {requisicao.status === 'AGENDADO_PLANTIO' ?
                                <>

                                    <div className="informacao">
                                        <span>Data inicial (estimada)</span>
                                        <strong>
                                            {formatarDataAgendamento(requisicao.dataInicial)}
                                        </strong>
                                    </div>

                                    <div className="informacao">
                                        <span>Data final (estimada)</span>
                                        <strong>
                                            {formatarDataAgendamento(requisicao.dataFinal)}
                                        </strong>
                                    </div>
                                </>
                                : ''
                            }

                            {requisicao.status === 'RECUSADO' ?
                                <>

                                    <div className="informacao">
                                        <span>Motivo recusado</span>
                                        <strong>
                                            {requisicao.observacaoStatus}
                                        </strong>
                                    </div>

                                </>
                                : ''
                            }

                            {(requisicao.tipoAtendimento === 'RETIRADA_LOCAL' && requisicao?.enderecoId !== null) ?
                                <>

                                    <div className="informacao">
                                        <span>Endereço para retirada</span>
                                        <strong>
                                            {`${requisicao?.endereco?.rua}, n° ${requisicao?.endereco?.numero}, ${requisicao?.endereco?.bairro}`}
                                        </strong>
                                    </div>

                                </>
                                : ''
                            }

                        </div>
                    </section>
                </form>

                {/* ENDEREÇO */}
                <section className="secaoRequisicao">
                    <h3>Local da solicitação</h3>

                    <div className="enderecoRequisicao">
                        <strong>
                            {requisicao.rua}, {requisicao.numero}
                        </strong>

                        <span>
                            {requisicao.bairro} -{" "}
                            {requisicao.cidadeEndereco} /{" "}
                            {requisicao.estado}
                        </span>

                        <span>
                            CEP: {requisicao.cep}
                        </span>

                        {requisicao.pontoReferencia && (
                            <span>
                                <strong>Ponto de referência:</strong>{" "}
                                {requisicao.pontoReferencia}
                            </span>
                        )}
                    </div>
                </section>

                {/* DOCUMENTOS E FOTOS */}
                <section className="secaoRequisicao">
                    <h3>Documentos e fotos</h3>

                    <div className="documentosRequisicao">

                        {/* FOTO DO LOCAL */}
                        <div className="documentoCard">
                            <h4>Foto do local</h4>

                            {fotoLocal ? (
                                <a
                                    href={fotoLocal}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={fotoLocal}
                                        alt="Foto do local da solicitação"
                                        className="fotoRequisicao"
                                    />
                                </a>
                            ) : (
                                <div className="arquivoIndisponivel">
                                    Foto não disponível
                                </div>
                            )}
                        </div>

                        {/* COMPROVANTE */}
                        <div className="documentoCard">
                            <h4>Comprovante de residência</h4>

                            {carregandoComprovante ? (
                                <SkeletonTable linhas={4} />
                            ) : erroComprovante ? (
                                <div className="arquivoIndisponivel">
                                    <p>Não foi possível carregar o comprovante.</p>

                                    <button
                                        type="button"
                                        className="btnRequisicao"
                                        onClick={() => renovarComprovante()}
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            ) : comprovanteResidencia ? (
                                <div className="comprovanteContainer">
                                    <div className="iconeDocumento">
                                        PDF
                                    </div>

                                    <a
                                        href={comprovanteResidencia}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btnRequisicao"
                                    >
                                        Visualizar comprovante
                                    </a>
                                </div>
                            ) : (
                                <div className="arquivoIndisponivel">
                                    Comprovante não disponível
                                </div>
                            )}
                        </div>

                    </div>
                </section>

            </div>
        </ModalForm>
    );
}
