import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import './AbaArvores.css';

import { atualizarArvore, cadastrarArvore, excluirArvore, listarArvores, listarArvoresCidade } from "../../../../../services/arvoreService";
import ModalForm from "../../../../components/ModalForm/ModalForm";
import { listarCidades } from "../../../../../services/cidadeService";
import { type Arvore, type Cidade } from "../../../../../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../../contexts/AuthContext";
import { queryKeys } from "../../../../../services/queryKeys";
import { SkeletonCard } from "../../../../components/Skeletons/SkeletonCard";
import { useAlert } from "../../../../components/hooks/useAlert";
import Alert from "../../../../components/Alert/Alert";

export function AbaArvores() {

    const queryClient = useQueryClient();
    const { usuario } = useAuth(); //Pega contexto fazer nova req na API

    const isGlobal = usuario?.role === 'GLOBAL';

    // 1. ESTADOS DOS FILTROS
    const [busca, setBusca] = useState("");
    const [cidadeFiltro, setCidadeFiltro] = useState("");

    // 2. BUSCA DE CIDADES (Apenas se for usuário GLOBAL) VIA REACT QUERY
    const { data: cidades = [] } = useQuery<Cidade[]>({
        queryKey: queryKeys.cidades.todas,
        queryFn: listarCidades,
        enabled: isGlobal, // Só executa se for admin Global
    })

    // Se for global e não escolheu cidade ainda, pega a primeira cidade da lista
    const cidadeAtivaId = isGlobal ? (cidadeFiltro || cidades[0]?.id || "") : "";

    // 3. BUSCA DE ÁRVORES VIA REACT QUERY (Reativo: busca troca sozinha ao mudar a cidade!)
    const { data: arvores = [], isLoading: carregandoArvores } = useQuery<Arvore[]>({
        queryKey: isGlobal && cidadeAtivaId
            ? queryKeys.arvores.porCidade(cidadeAtivaId)
            : queryKeys.arvores.todas,
        queryFn: () => {
            if (isGlobal && cidadeAtivaId) {
                return listarArvoresCidade(cidadeAtivaId);
            }
            return listarArvores();
        },
        enabled: !isGlobal || !!cidadeAtivaId,
    });

    const [modalAberto, setModalAberto] = useState(false);

    // Armazena o ID da árvore que está sendo editada (null = modo Adicionar)
    const [arvoreEmEdicaoId, setArvoreEmEdicaoId] = useState<string | null>(null);

    // Campos do formulário
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [imagem, setImagem] = useState<File | null>(null);
    const [cidadeId, setCidadeId] = useState("");

    // Efeitos para controle do modal (mesmo padrão do seu código)
    useEffect(() => {
        document.body.classList.toggle("modalAberto", modalAberto);
        return () => document.body.classList.remove("modalAberto");
    }, [modalAberto]);

    useEffect(() => {
        if (!modalAberto) return;
        const fechar = (e: KeyboardEvent) => e.key === "Escape" && fecharModal();
        document.addEventListener("keydown", fechar);
        return () => document.removeEventListener("keydown", fechar);
    }, [modalAberto]);

    // Função auxiliar para abrir o modal no modo Adicionar
    const abrirModalAdicionar = () => {
        setArvoreEmEdicaoId(null);
        setNome("");
        setDescricao("");
        setQuantidade("");
        setCidadeId("");
        setImagem(null);
        setModalAberto(true);
    };

    // Função auxiliar para abrir o modal no modo Editar (passando o ID)
    const abrirModalEditar = (id: string) => {
        const arvoreAlvo = arvores.find(item => item.id === id);
        if (!arvoreAlvo) return;

        setArvoreEmEdicaoId(id);
        setNome(arvoreAlvo.nomePopular || "");
        setDescricao(arvoreAlvo.descricao || "");
        setQuantidade(arvoreAlvo.quantidade.toString());
        setCidadeId(arvoreAlvo.cidadeId || "");
        setImagem(null); // Caso queira permitir alterar a imagem depois
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setArvoreEmEdicaoId(null);
    };

    // 3. LÓGICA DE FILTRAGEM REATIVA
    const arvoresFiltradas = useMemo(() => {
        return arvores.map(item => ({
            ...item,
            // Normaliza garantindo que nunca serão undefined/null para a busca
            nomePopular: item.nomePopular || "",
            descricao: item.descricao || ""
        })).filter((item) => {
            const termo = busca.toLowerCase();
            return (
                item.nomePopular.toLowerCase().includes(termo) ||
                item.descricao.toLowerCase().includes(termo)
            );
        });
    }, [arvores, busca]);

    const { alert, showAlert, closeAlert } = useAlert();

    // Manipulador unificado de salvamento (Adição ou Edição)
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nome || !descricao || !quantidade) {
            showAlert("Por favor, preencha todos os campos obrigatórios.", 'warning');
            return;
        }

        try {
            const formData = new FormData();
            formData.append("nome", nome);
            formData.append("descricao", descricao);
            formData.append("quantidade", quantidade);
            if (cidadeId) formData.append("cidadeId", cidadeId);

            if (imagem) {
                formData.append("imagem", imagem); // Nova imagem opcional
            }

            if (arvoreEmEdicaoId !== null) {
                // MODO EDIÇÃO
                await atualizarArvore(arvoreEmEdicaoId, formData);
                showAlert("Árvore atualizada com sucesso!", 'success');
            } else {
                // MODO CRIAÇÃO
                await cadastrarArvore(formData);
                showAlert("Árvore cadastrada com sucesso!", "success");
            }

            // Invalida o cache do React Query (ele recarrega a lista sozinho!)
            queryClient.invalidateQueries({ queryKey: queryKeys.arvores.todas });
            if (cidadeId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.arvores.porCidade(cidadeId) });
            }

            fecharModal();
        } catch (error: any) {
            showAlert(`Erro ao salvar: ${error.message}`, "danger");
        }
    };

    const handleExcluir = async (id: string) => {

        const confirm = window.confirm("Tem certeza que deseja excluir esta árvore?");
        if (!confirm) return;

        try {
            await excluirArvore(id);
            showAlert("Árvore excluída com sucesso!", "success");

            // Invalida o cache do React Query para recarregar a lista
            queryClient.invalidateQueries({ queryKey: queryKeys.arvores.todas });
            if (cidadeAtivaId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.arvores.porCidade(cidadeAtivaId) });
            }

        } catch (error) {
            showAlert('Não foi possível realizar a exclusão', 'danger');
        }
    }

    return (
        <div className="abaArvoresConteudo">
            {/* BARRA VISUAL DE FILTROS */}
            {alert && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    onClose={closeAlert}
                />
            )}
            <div className="barraFiltros">
                <input
                    type="text"
                    placeholder="Buscar por nome ou descrição"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />

                {isGlobal && (
                    <select
                        value={cidadeFiltro}
                        onChange={(e) => setCidadeFiltro(e.target.value)}
                    >
                        {cidades.map((item) => (
                            <option key={item.id} value={item.id}>{item.nome}</option>
                        ))}
                    </select>
                )}

                {busca && (
                    <button
                        type="button"
                        className="btnLimparFiltros"
                        onClick={() => setBusca("")}
                    >
                        Limpar Filtros
                    </button>
                )}

                <button
                    type="button"
                    className="btnGestaoGlobal btn-light"
                    onClick={abrirModalAdicionar}
                >
                    Adicionar
                </button>

            </div>

            {/* RENDERIZAÇÃO DA TABELA FILTRADA */}
            <div className="listaResultado">
                <div className="arvoresContainer">
                    <div className="arvoresGrid">

                        {carregandoArvores ? (
                            /* Enquanto carrega, mostra 6 cards pulsantes */
                            <SkeletonCard quantidade={6} />
                        ) : arvoresFiltradas.length === 0 ? (
                            <p className="p-3 text-muted">Nenhuma árvore encontrada.</p>
                        ) : (
                            arvoresFiltradas.map(arvore => {
                                const disponivel = arvore.quantidade > 0;

                                return (
                                    <article key={arvore.id} className="arvoreCard">
                                        <div className="arvoreImagem">
                                            <img src={arvore.imagemUrl || ""} alt={arvore.nomePopular} />
                                        </div>

                                        <div className="arvoreCardContent">
                                            <div className="arvoreCardTitle">
                                                <h3>{arvore.nomePopular}</h3>
                                                <span className={disponivel ? "disponivel" : "indisponivel"}>
                                                    {disponivel ? `${arvore.quantidade} disponíveis` : "0 disponíveis"}
                                                </span>
                                            </div>

                                            <p>{arvore.descricao}</p>

                                            {/* Passamos o ID da árvore para o botão de editar */}
                                            <button
                                                className="btnGestaoGlobal btn-light m-1"
                                                onClick={() => abrirModalEditar(arvore.id)}
                                            >
                                                Editar
                                            </button>
                                            <button className="btnGestaoGlobal btn-light" onClick={() => handleExcluir(arvore.id)}>Excluir</button>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL HÍBRIDO (ADICIONAR / EDITAR) */}
            <ModalForm
                aberto={modalAberto}
                fechar={fecharModal}
                titulo={
                    arvoreEmEdicaoId !== null
                        ? "Editar Árvore"
                        : "Adicionar Nova Árvore"
                }
            >
                <form
                    onSubmit={handleSubmitForm}
                    className="formSection"
                >
                    <div className="inputGroup mb-3">
                        <label htmlFor="nomeArvore">
                            Nome da Árvore *
                        </label>

                        <input
                            id="nomeArvore"
                            type="text"
                            placeholder="Ex: Ipê Amarelo"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>

                    <div className="inputGroup mb-3">
                        <label htmlFor="descricaoArvore">
                            Descrição *
                        </label>

                        <textarea
                            id="descricaoArvore"
                            placeholder="Digite uma breve descrição..."
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            required
                        />
                    </div>

                    <div className="inputGroup mb-3">
                        <label htmlFor="qtdArvore">
                            Quantidade Disponível *
                        </label>

                        <input
                            id="qtdArvore"
                            type="number"
                            placeholder="Ex: 10"
                            value={quantidade}
                            onChange={(e) => setQuantidade(e.target.value)}
                            required
                        />
                    </div>

                    <div className="inputGroup mb-3">
                        <label htmlFor="cidade">
                            Cidade*
                        </label>

                        <select
                            name="cidade"
                            id="cidade"
                            value={cidadeId}
                            onChange={(e) => setCidadeId(e.target.value)}
                        >
                            <option value="">
                                Selecione
                            </option>

                            {cidades.map((cidade) => (
                                <option
                                    key={cidade.id}
                                    value={cidade.id}
                                >
                                    {cidade.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="inputGroup mb-3">
                        <label htmlFor="fotoArvore">
                            Foto da Árvore{" "}
                            {arvoreEmEdicaoId !== null &&
                                "(Opcional alterar)"}
                        </label>

                        <input
                            id="fotoArvore"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const arquivo = e.target.files?.[0];

                                if (arquivo) {
                                    setImagem(arquivo);
                                }
                            }}
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                            type="button"
                            className="btnPagination btn-secondary"
                            onClick={fecharModal}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btnPagination btn-success"
                        >
                            <FontAwesomeIcon icon={faCheck} />

                            {arvoreEmEdicaoId !== null
                                ? "Salvar Alterações"
                                : "Adicionar Árvore"}
                        </button>
                    </div>
                </form>
            </ModalForm>
        </div>
    );
}