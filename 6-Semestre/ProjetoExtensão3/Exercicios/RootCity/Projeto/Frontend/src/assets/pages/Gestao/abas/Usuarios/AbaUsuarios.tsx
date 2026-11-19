import { useEffect, useMemo, useState } from "react";
import ModalForm from "../../../../components/ModalForm/ModalForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { listarCidades, listarCidadesUsuario } from "../../../../../services/cidadeService";
import { type Role, type Cidade, type Usuario } from "../../../../../types";
import { ativarUsuario, atualizarUsuario, desativarUsuario, listarRoles, listarUsuarios, listarUsuariosCidade } from "../../../../../services/usuarioService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../../contexts/AuthContext";
import { queryKeys } from "../../../../../services/queryKeys";
import { SkeletonTable } from "../../../../components/Skeletons/SkeletonTable";
import { useAlert } from "../../../../components/hooks/useAlert";
import Alert from "../../../../components/Alert/Alert";

export function AbaUsuarios() {

    const queryClient = useQueryClient();
    const { usuario } = useAuth(); //Pega contexto fazer nova req na API

    const isGlobal = usuario?.role === 'GLOBAL';

    const [cidadeFiltro, setCidadeFiltro] = useState("N");
    const [roleFiltro, setRoleFiltro] = useState<Role>("FUNCIONARIO");

    // 1. ESTADOS DE DADOS E CONTROLE DO MODAL
    const [modalAberto, setModalAberto] = useState(false);

    // Armazena o ID do usuário que está sendo editada (null = modo Adicionar)
    const [usuarioEmEdicaoId, setUsuarioEmEdicaoId] = useState<string | null>(null);

    const { data: cidades = [] } = useQuery<Cidade[]>({
        queryKey: isGlobal ? queryKeys.cidades.todas : queryKeys.cidades.porUsuario,
        queryFn: () => {
            if (isGlobal) {
                return listarCidades();
            }

            return listarCidadesUsuario();
        },
    })

    const { data: roles = [] } = useQuery<Role[]>({
        queryKey: queryKeys.usuarios.roles,
        queryFn: listarRoles,
    })

    // Se for global e não escolheu cidade ainda, pega a primeira cidade da lista
    const cidadeAtivaId = isGlobal ? (cidadeFiltro || cidades[0]?.id || "") : "";

    const { data: usuarios = [], isFetching: carregandoUsuarios } = useQuery<Usuario[]>({
        queryKey: isGlobal && cidadeAtivaId
            ? queryKeys.usuarios.porCidade(cidadeFiltro, roleFiltro)
            : queryKeys.usuarios.todos,
        queryFn: () => {
            if (isGlobal && cidadeAtivaId) {
                return listarUsuariosCidade(cidadeFiltro, roleFiltro);
            }
            return listarUsuarios();
        },
    });

    // Campos do formulário
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [tipo, setTipo] = useState<Role | undefined>(undefined);
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
        setUsuarioEmEdicaoId(null);
        setNome("");
        setEmail("");
        setTipo(undefined);
        setTelefone("");
        setCidadeId("");

        if (usuario?.role === 'ADMIN_LOCAL') {
            setCidadeId(usuario.cidadeId || '');
        }
        setModalAberto(true);
    };

    // Função auxiliar para abrir o modal no modo Editar (passando o ID)
    const abrirModalEditar = (id: string) => {
        const usuarioAlvo = usuarios.find(item => item.id === id);
        if (!usuarioAlvo) return;

        setUsuarioEmEdicaoId(id);
        setNome(usuarioAlvo.nome || "");
        setEmail(usuarioAlvo.email || "");
        setTipo(usuarioAlvo.role || undefined);
        setTelefone(usuarioAlvo.telefone || "");
        setCidadeId(usuarioAlvo.cidadeId || usuarioAlvo.cidade?.id || "");
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setUsuarioEmEdicaoId(null);
    };

    // 2. ESTADOS DOS FILTROS
    const [busca, setBusca] = useState("");

    // 3. LÓGICA DE FILTRAGEM REATIVA COM useMemo
    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter((item) => {
            // Regra 1: Filtro de texto (busca por nome do cidadão, árvore ou bairro)
            const termo = busca.toLowerCase();
            const bateTexto =
                item.nome.toLowerCase().includes(termo) ||
                item.email.toLowerCase().includes(termo) ||
                (item.telefone ?? '').toLowerCase().includes(termo);

            return bateTexto
        });
    }, [usuarios, busca]);

    const { alert, showAlert, closeAlert } = useAlert();

    // Manipulador unificado de salvamento (Adição ou Edição)
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nome || !email || !tipo) {
            showAlert("Por favor, preencha todos os campos obrigatórios.", 'warning');
            return;
        }

        try {

            if (usuarioEmEdicaoId !== null) {
                // MODO EDIÇÃO
                await atualizarUsuario(usuarioEmEdicaoId, nome, email, tipo, telefone, cidadeId);
                showAlert("Usuário atualizado com sucesso!", 'success');
            } else {
                // MODO CRIAÇÃO - Futura implementação, em razão da limitação de email do supabase 
                //await cadastrarCidade(nome,uf);
            }

            // Invalida o cache do React Query 
            queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.todos });
            if (cidadeAtivaId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.porCidade(cidadeFiltro, roleFiltro) });
            }

            fecharModal();
        } catch (error: any) {
            showAlert(`Erro ao salvar: ${error.message}`, 'danger');
        }

    };

    const handleAtivar = async (id: string) => {
        if (!id) {
            showAlert('ID inválido', 'warning');
        }

        try {
            await ativarUsuario(id);

            // Invalida o cache do React Query 
            queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.todos });
        } catch (error) {
            showAlert(`Erro ao ativar usuário: ${error}`, 'danger');
        }
    }

    const handleDesativar = async (id: string) => {
        if (!id) {
            showAlert("ID inválido", 'warning');
            return;
        }

        try {
            await desativarUsuario(id);

            // Invalida o cache do React Query 
            queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.todos });
        } catch (error: any) {
            showAlert(`Erro ao desativar usuário: ${error.message || error}`, 'danger');
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
                    placeholder="Buscar por nome, email ou telefone"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />

                {usuario?.role === 'GLOBAL' && (
                    <select
                        value={cidadeFiltro}
                        onChange={(e) => setCidadeFiltro(e.target.value)}
                    >
                        <option value="N">Nenhuma</option>
                        {cidades.map((item) => (
                            <option key={item.id} value={item.id}>{item.nome}</option>
                        ))}
                    </select>
                )}

                {usuario?.role === 'GLOBAL' && (
                    <select
                        value={roleFiltro}
                        onChange={(e) => setRoleFiltro(e.target.value as Role)}
                    >
                        {roles.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                )}

                <button className="btnGestaoGlobal" onClick={abrirModalAdicionar}>Adicionar Usuário</button>

            </div>

            {/* RENDERIZAÇÃO DA TABELA FILTRADA */}
            <div className="listaResultado">
                {carregandoUsuarios ? (
                    <SkeletonTable linhas={4} />

                ) : (
                    <table className="table tableRequisicao">
                        <thead>
                            <tr>
                                <th scope="col">Nome Usuário</th>
                                <th scope="col">Email</th>
                                <th scope="col">Telefone</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Cidade</th>
                                <th scope="col" className="text-center">Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {usuariosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="mensagemVazio">
                                        Nenhum resultado encontrado com os filtros atuais.
                                    </td>
                                </tr>
                            ) : (
                                usuariosFiltrados.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            {usuario?.id === item.id && (
                                                <FontAwesomeIcon icon={faUserAlt} />
                                            )}
                                            <strong>{item.nome}</strong>
                                        </td>

                                        <td>{item.email}</td>
                                        <td>{item.telefone}</td>
                                        <td>{item.role}</td>
                                        <td>{item.cidade?.nome}</td>

                                        <td className="text-center">
                                            {item.ativo ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-light btnStatusCidade"
                                                    onClick={() => handleDesativar(item.id)}
                                                >
                                                    Desativar
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btnGestaoGlobal btnAtivar btnStatusCidade"
                                                    onClick={() => handleAtivar(item.id)}
                                                >
                                                    Ativar
                                                </button>
                                            )}

                                            <button
                                                type="button"
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
                    usuarioEmEdicaoId !== null
                        ? "Editar Usuário"
                        : "Adicionar Novo Usuário"
                }
                ariaLabelledBy="tituloModalCidade"
            >
                <div className="modalFormBody">
                    <form
                        onSubmit={handleSubmitForm}
                        className="formSection"
                    >
                        <div className="inputGroup mb-3">
                            <label htmlFor="nome">
                                Nome do Usuário*
                            </label>

                            <input
                                id="nome"
                                type="text"
                                placeholder="Ex: João"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </div>

                        <div className="inputGroup mb-3">
                            <label htmlFor="email">
                                Email*
                            </label>

                            <input
                                id="email"
                                type="text"
                                placeholder="Ex: joao@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="inputGroup mb-3">
                            <label htmlFor="telefone">
                                Telefone*
                            </label>

                            <input
                                id="telefone"
                                type="text"
                                placeholder="Ex: (11) 1111111-1111"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                            />
                        </div>

                        <div className="inputGroup mb-3">
                            <label htmlFor="tipo">
                                Tipo*
                            </label>

                            <select
                                name="tipo"
                                id="tipo"
                                value={tipo}
                                onChange={(e) => {
                                    const valor = e.target.value;

                                    setTipo(valor === '' ? undefined : valor as Role)
                                }}
                                required
                            >
                                <option value="">
                                    Selecione
                                </option>

                                {roles.map((role) => (
                                    <option
                                        key={role}
                                        value={role}
                                    >
                                        {role}
                                    </option>
                                ))}
                            </select>
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
                                disabled={usuario?.role === "ADMIN_LOCAL"}
                                className={usuario?.role === "ADMIN_LOCAL" ? "bg-light" : ""}

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
                                <FontAwesomeIcon icon={faCheck} />

                                {usuarioEmEdicaoId !== null
                                    ? "Salvar Alterações"
                                    : "Adicionar Usuario"}
                            </button>
                        </div>
                    </form>
                </div>
            </ModalForm>

        </div>

    );
}