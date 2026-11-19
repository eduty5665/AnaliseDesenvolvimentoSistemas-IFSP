import { useState, useMemo } from "react";
import './AbaRequisicao.css';
import type { Cidade, Endereco, Requisicao } from "../../../../../types";
import { listarRequisicoes, listarRequisicoesCidade } from "../../../../../services/requisicaoService";
import { listarCidades, listarCidadesUsuario } from "../../../../../services/cidadeService";
import ModalRequisicao from "../../../../components/ModalRequisicao/ModalRequisicao";
import { useAuth } from "../../../../../contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../../../services/queryKeys";
import { SkeletonTable } from "../../../../components/Skeletons/SkeletonTable";
import { listarEndereco, listarEnderecoCidade } from "../../../../../services/enderecoService";

export function AbaRequisicoes() {

    // ESTADOS DOS FILTROS
    const [busca, setBusca] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("TODOS");
    const [cidadeFiltro, setCidadeFiltro] = useState("");

    const { usuario } = useAuth();
    const isGlobal = usuario?.role === 'GLOBAL';

    const { data: cidades = [] } = useQuery<Cidade[]>({
        queryKey: isGlobal ? queryKeys.cidades.todas : queryKeys.cidades.porUsuario,
        queryFn: () => {
            if (isGlobal) {
                return listarCidades();
            }

            return listarCidadesUsuario();
        },
        enabled: isGlobal, // Só executa se for admin Global
    })

    // Se for global e não escolheu cidade ainda, pega a primeira cidade da lista
    const cidadeAtivaId = isGlobal ? (cidadeFiltro || cidades[0]?.id || "") : "";

    //Traz endereços ativos
    const { data: enderecos = [] } = useQuery<Endereco[]>({
        queryKey: isGlobal ? queryKeys.enderecos.porCidade(cidadeAtivaId) : queryKeys.enderecos.todos,
        queryFn: () => {
            if (isGlobal) {
                return listarEnderecoCidade(cidadeAtivaId);
            }

            return listarEndereco();
        },
        enabled: !isGlobal || !!cidadeAtivaId,

    })

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const hoje = new Date();

    const umMesAtras = new Date();
    umMesAtras.setMonth(hoje.getMonth() - 1);

    const [dataInicio, setDataInicio] = useState(formatDate(umMesAtras));
    const [dataFim, setDataFim] = useState(formatDate(hoje));

    const queryClient = useQueryClient();

    const atualizarRequisicoes = async () => {
        await queryClient.invalidateQueries({
            queryKey: isGlobal && cidadeAtivaId
                ? queryKeys.requisicoes.porCidade(
                    cidadeAtivaId,
                    dataInicio,
                    dataFim
                )
                : queryKeys.requisicoes.todas(
                    dataInicio,
                    dataFim
                ),
        });
    };

    const { data: requisicoes = [], isFetching: carregandoRequisicoes } = useQuery<Requisicao[]>({
        queryKey: isGlobal && cidadeAtivaId
            ? queryKeys.requisicoes.porCidade(cidadeAtivaId, dataInicio, dataFim)
            : queryKeys.requisicoes.todas(dataInicio, dataFim),
        queryFn: () => {
            if (isGlobal && cidadeAtivaId) {
                return listarRequisicoesCidade(cidadeAtivaId, dataInicio, dataFim);
            }
            return listarRequisicoes(dataInicio, dataFim);
        },
        staleTime: 2 * 60 * 1000,
        gcTime: 4 * 60 * 1000,
    })

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

    // 3. LÓGICA DE FILTRAGEM REATIVA COM useMemo
    const requisicoesFiltradas = useMemo(() => {
        return requisicoes.filter((item) => {
            const termo = busca.toLowerCase();

            const bateTexto =
                (item.nomeBeneficiario ?? "").toLowerCase().includes(termo) ||
                (item.arvore?.nomePopular ?? "").toLowerCase().includes(termo) ||
                (item.bairro ?? "").toLowerCase().includes(termo) ||
                (item.tipoAtendimento ?? "").toLowerCase().includes(termo);

            const bateStatus =
                statusFiltro === "TODOS" ||
                item.status === statusFiltro;

            return bateTexto && bateStatus;
        });
    }, [requisicoes, busca, statusFiltro]);

    return (
        <div className="abaRequisicaoConteudo">
            {/* BARRA VISUAL DE FILTROS */}
            <div className="barraFiltros d-flex justify-content-between">

                <div className="d-flex flex-column datas">
                    <span>Data inicial</span>
                    <input className="dataInicial " type="date" value={dataInicio} onChange={(e) => {
                        const novaData = e.target.value;
                        setDataInicio(novaData);
                    }} />
                </div>

                <div className="d-flex flex-column">
                    <span>Data final</span>
                    <input className="dataFinal " type="date" value={dataFim} onChange={(e) => {
                        const novaData = e.target.value;
                        setDataFim(novaData);
                    }} />
                </div>

                {/* Select de Status */}
                <select
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
                >
                    <option value="TODOS">Todos os Status</option>
                    <option value="SOLICITADO">Solicitados</option>
                    <option value="APROVADO">Aprovados</option>
                    <option value="RECUSADO">Recusados</option>
                    <option value="CONCLUIDO">Concluídos</option>
                    <option value="AGENDADO_PLANTIO">Plantio Agendado</option>
                    <option value="AGUARDANDO_RETIRADA">Aguardando Retirada</option>
                </select>

                {usuario?.role === 'GLOBAL' && (
                    <select
                        value={cidadeFiltro}
                        onChange={(e) => setCidadeFiltro(e.target.value)}
                    >
                        {cidades.map((item) => (
                            <option key={item.id} value={item.id}>{item.nome}</option>
                        ))}
                    </select>
                )}

                <input
                    type="text"
                    placeholder="Buscar por cidadão, árvore, bairro ou tipo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />

                {/* Botão para limpar filtros (caso algum esteja ativo) */}
                {(busca || statusFiltro !== "TODOS") && (
                    <button
                        type="button"
                        className="btnLimparFiltros"
                        onClick={() => {
                            setBusca("");
                            setStatusFiltro("TODOS");
                        }}
                    >
                        Limpar Filtros
                    </button>
                )}
            </div>

            {/* RENDERIZAÇÃO DA TABELA FILTRADA */}
            <div className="listaResultado">
                {carregandoRequisicoes ? (
                    <SkeletonTable linhas={4} />

                ) : (
                    <table className="table tableRequisicao">
                        <thead>
                            <tr>
                                <th scope="col">Data</th>
                                <th scope="col">Nome cidadão</th>
                                <th scope="col">Árvore</th>
                                <th scope="col">Cidade</th>
                                <th scope="col">Bairro</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Status</th>
                                <th scope="col" className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requisicoesFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="mensagemVazio">
                                        Nenhum resultado encontrado com os filtros atuais.
                                    </td>
                                </tr>
                            ) : (
                                requisicoesFiltradas.map((item) => (
                                    <tr key={item.id}>
                                        <td>{new Date(item?.criadoEm).toLocaleDateString("pt-BR", {
                                            timeZone: "UTC"
                                        })}</td>
                                        <td><strong>{item.nomeBeneficiario}</strong></td>
                                        <td>{item?.arvore?.nomePopular}</td>
                                        <td>{item?.cidadeEndereco}</td>
                                        <td>{item.bairro}</td>
                                        <td><span className="tipoTag">{item.tipoAtendimento}</span></td>
                                        <td><span className={`statusTag ${item.status.toLowerCase()}`}>{item.status}</span></td>
                                        <td className="text-center">
                                            <button type="button" className="btnVerificar" onClick={() => abrirModalRequisicao(item)}>
                                                Verificar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="abaRequisicaoConteudo">

                <ModalRequisicao
                    aberto={modalAberto}
                    fechar={fecharModalRequisicao}
                    requisicao={requisicaoSelecionada}
                    enderecos={enderecos}
                    baseUrl={API_URL}
                    onAtualizado={atualizarRequisicoes}
                />

            </div>
        </div>

    );
}