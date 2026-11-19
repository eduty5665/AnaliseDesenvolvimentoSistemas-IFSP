import { useState, useMemo, useEffect } from "react";
import './AbaConfig.css';
import { ativarCidade, atualizarCidade, cadastrarCidade, desativarCidade, listarCidades } from "../../../../../services/cidadeService";
import { estados } from "../../../../dataInfo/estados";
import ModalForm from "../../../../components/ModalForm/ModalForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../../../services/queryKeys";
import { useAuth } from "../../../../../contexts/AuthContext";
import { SkeletonTable } from "../../../../components/Skeletons/SkeletonTable";
import { useAlert } from "../../../../components/hooks/useAlert";
import Alert from "../../../../components/Alert/Alert";

interface CidadeConfig {
    id: string;
    nome: string;
    uf: string;
    ativa: boolean;
    permiteEntrega: boolean;
    _count?: {
        arvores?: number;
        requisicoes?: number;
        usuarios?: number;
    };
}

export function AbaConfig() {

    const queryClient = useQueryClient();
    const { usuario } = useAuth(); //Pega contexto fazer nova req na API
    const isGlobal = usuario?.role === 'GLOBAL';

    // 1. ESTADOS DE DADOS E CONTROLE DO MODAL
    const [modalAberto, setModalAberto] = useState(false);

    // Armazena o ID da cidade que está sendo editada (null = modo Adicionar)
    const [cidadeEmEdicaoId, setCidadeEmEdicaoId] = useState<string | null>(null);

    // Campos do formulário
    const [nome, setNome] = useState("");
    const [uf, setUf] = useState("");
    const [permiteEntrega, setPermiteEntrega] = useState(false);

    const { data: cidades = [], isFetching: carregandoCidades } = useQuery<CidadeConfig[]>({
        queryKey: queryKeys.cidades.todas,
        queryFn: listarCidades,
        enabled: isGlobal, // Só executa se for admin Global
    })

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
        setCidadeEmEdicaoId(null);
        setNome("");
        setUf("");
        setPermiteEntrega(false);
        setModalAberto(true);
    };

    // Função auxiliar para abrir o modal no modo Editar (passando o ID)
    const abrirModalEditar = (id: string) => {
        const cidadeAlvo = cidades.find(item => item.id === id);
        if (!cidadeAlvo) return;

        setCidadeEmEdicaoId(id);
        setNome(cidadeAlvo.nome || "");
        setUf(cidadeAlvo.uf);
        setPermiteEntrega(cidadeAlvo.permiteEntrega);
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setCidadeEmEdicaoId(null);
    };

    // 2. ESTADOS DOS FILTROS
    const [busca, setBusca] = useState("");

    // 3. LÓGICA DE FILTRAGEM REATIVA COM useMemo
    const cidadesFiltradas = useMemo(() => {
        return cidades.filter((item) => {
            // Regra 1: Filtro de texto (busca por nome do cidadão, árvore ou bairro)
            const termo = busca.toLowerCase();
            const bateTexto =
                item.nome.toLowerCase().includes(termo) ||
                item.uf.toLowerCase().includes(termo);

            return bateTexto
        });
    }, [cidades, busca]);

    console.log(cidades);

    const { alert, showAlert, closeAlert } = useAlert();

    // Manipulador unificado de salvamento (Adição ou Edição)
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nome || !uf) {
            showAlert("Por favor, preencha todos os campos obrigatórios.", 'warning');
            return;
        }

        try {

            if (cidadeEmEdicaoId !== null) {
                // MODO EDIÇÃO
                await atualizarCidade(cidadeEmEdicaoId, nome, uf, permiteEntrega);
                showAlert("Cidade atualizada com sucesso!", "success");
            } else {
                // MODO CRIAÇÃO
                await cadastrarCidade(
                    nome,
                    uf,
                    permiteEntrega
                );

                showAlert("Cidade cadastrada com sucesso!", "success");
            }

            queryClient.invalidateQueries({ queryKey: queryKeys.cidades.todas });
            fecharModal();
        } catch (error: any) {
            showAlert(`Erro ao salvar: ${error.message}`, "danger");
        }

    };

    const handleAtivar = async (id: string) => {
        if (!id) {
            showAlert('ID inválido', "warning");
        }

        try {
            await ativarCidade(id);
            showAlert("Cidade ativada com sucesso", "success");
            queryClient.invalidateQueries({ queryKey: queryKeys.cidades.todas });
        } catch (error) {
            showAlert(`Erro ao ativar cidade: ${error}`, "danger");
        }
    }

    const handleDesativar = async (id: string) => {
        if (!id) {
            showAlert("ID inválido", "warning");
            return;
        }

        try {
            // Certifique-se de importar e usar a função correta do seu service, ex: desativarCidade(id)
            await desativarCidade(id);
            showAlert("Cidade desativada com sucesso!", "success");
            queryClient.invalidateQueries({ queryKey: queryKeys.cidades.todas });
        } catch (error: any) {
            showAlert(`Erro ao desativar cidade: ${error.message || error}`, 'danger');
        }
    };

    return (
        <div className="abaRequisicaoConteudo">
            {alert && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    onClose={closeAlert}
                />
            )}
            {/* BARRA VISUAL DE FILTROS */}
            <div className="barraFiltros">
                {/* Input de Busca Textual */}
                <input
                    type="text"
                    placeholder="Buscar por nome da cidade ou UF..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />

                <button className="btnGestaoGlobal" onClick={abrirModalAdicionar}>Adicionar Cidade</button>

            </div>

            {/* RENDERIZAÇÃO DA TABELA FILTRADA */}
            <div className="listaResultado">
                {carregandoCidades ? (
                    <SkeletonTable linhas={4} />
                ) : (
                    <table className="table tableRequisicao">
                        <thead>
                            <tr>
                                <th scope="col">Nome Cidade</th>
                                <th scope="col">UF</th>
                                <th scope="col">N° árvores</th>
                                <th scope="col">N° requisições</th>
                                <th scope="col">N° usuários</th>
                                <th scope="col">Permite entrega</th>
                                <th scope="col" className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cidadesFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="mensagemVazio">
                                        Nenhum resultado encontrado com os filtros atuais.
                                    </td>
                                </tr>
                            ) : (
                                cidadesFiltradas.map((item) => (
                                    <tr key={item.id}>
                                        <td><strong>{item.nome}</strong></td>
                                        <td>{item.uf}</td>
                                        <td>{item._count?.arvores ?? 0}</td>
                                        <td>{item._count?.requisicoes ?? 0}</td>
                                        <td>{item._count?.usuarios ?? 0}</td>
                                        <td>{item.permiteEntrega ? 'Sim' : 'Não'}</td>
                                        <td className="text-center">
                                            {item.ativa ? (
                                                <button type="button" className="btn btn-light btnStatusCidade" onClick={() => handleDesativar(item.id)}>
                                                    Desativar
                                                </button>
                                            ) : (

                                                <button type="button" className="btnGestaoGlobal btnAtivar btnStatusCidade" onClick={() => handleAtivar(item.id)}>
                                                    Ativar
                                                </button>
                                            )}
                                            <button
                                                className="btnGestaoGlobal btn-light m-1"
                                                onClick={() => abrirModalEditar(item.id)}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            {/* MODAL HÍBRIDO (ADICIONAR / EDITAR) */}
            <ModalForm
                aberto={modalAberto}
                fechar={fecharModal}
                titulo={
                    cidadeEmEdicaoId !== null
                        ? "Editar Cidade"
                        : "Adicionar Nova Cidade"
                }
                ariaLabelledBy="tituloModalCidade"
            >
                <div className="modalFormBody">
                    <form
                        onSubmit={handleSubmitForm}
                        className="formSection"
                    >
                        <div className="inputGroup mb-3">
                            <label htmlFor="nomeCidade">
                                Nome da Cidade *
                            </label>

                            <input
                                id="nomeCidade"
                                type="text"
                                placeholder="Ex: Catanduva"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </div>

                        <div className="inputGroup mb-3">
                            <label htmlFor="estado">
                                UF *
                            </label>

                            <select
                                name="estado"
                                id="estado"
                                value={uf}
                                onChange={(e) => setUf(e.target.value)}
                                required
                            >
                                <option value="">
                                    Selecione
                                </option>

                                {estados.map((estado) => (
                                    <option
                                        key={estado.sigla}
                                        value={estado.sigla}
                                    >
                                        {estado.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="inputGroup mb-3">
                            <label className="checkboxEntrega">
                                <input
                                    type="checkbox"
                                    checked={permiteEntrega}
                                    onChange={(e) => setPermiteEntrega(e.target.checked)}
                                />
                                <span>Permitir entrega nesta cidade</span>
                            </label>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={fecharModal}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="btnGestaoGlobal btn-success"
                            >

                                {cidadeEmEdicaoId !== null
                                    ? "Salvar Alterações"
                                    : "Adicionar Cidade"}
                            </button>
                        </div>
                    </form>
                </div>
            </ModalForm>

        </div>

    );
}