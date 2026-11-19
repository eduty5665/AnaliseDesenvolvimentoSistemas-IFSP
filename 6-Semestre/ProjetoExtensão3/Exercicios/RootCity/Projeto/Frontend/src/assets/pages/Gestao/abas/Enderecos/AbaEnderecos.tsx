import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import './AbaEnderecos.css';

import ModalForm from "../../../../components/ModalForm/ModalForm";
import { listarCidades } from "../../../../../services/cidadeService";
import { type Cidade, type Endereco } from "../../../../../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../../contexts/AuthContext";
import { queryKeys } from "../../../../../services/queryKeys";
import { alterarStatusEndereco, atualizarEndereco, atualizarEnderecoCidade, criarEndereco, criarEnderecoCidade, listarEndereco, listarEnderecoCidade } from "../../../../../services/enderecoService";
import { formatarCep } from "../../../../../utils/formatadores";
import { SkeletonTable } from "../../../../components/Skeletons/SkeletonTable";
import { useAlert } from "../../../../components/hooks/useAlert";
import Alert from "../../../../components/Alert/Alert";

export function AbaEnderecos() {

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

    // 3. BUSCA DE ENDERECOS VIA REACT QUERY (Reativo: busca troca sozinha ao mudar a cidade!)
    const { data: enderecos = [], isLoading: carregandoEnderecos } = useQuery<Endereco[]>({
        queryKey: isGlobal && cidadeAtivaId
            ? queryKeys.enderecos.porCidade(cidadeAtivaId)
            : queryKeys.enderecos.todos,
        queryFn: () => {
            if (isGlobal && cidadeAtivaId) {
                return listarEnderecoCidade(cidadeAtivaId);
            }
            return listarEndereco();
        },
        enabled: !isGlobal || !!cidadeAtivaId,
    });

    const [modalAberto, setModalAberto] = useState(false);

    // Armazena o ID do endereço que está sendo editado (null = modo Adicionar)
    const [enderecoEmEdicaoId, setEnderecoEmEdicaoId] = useState<string | null>(null);

    // Campos do formulário
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [bairro, setBairro] = useState("");
    const [cep, setCep] = useState("");
    const [pontoReferencia, setPontoReferencia] = useState("");

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
        setEnderecoEmEdicaoId(null);
        setRua("");
        setNumero("");
        setBairro("");
        setCep("");
        setPontoReferencia("");
        setModalAberto(true);
    };

    // Função auxiliar para abrir o modal no modo Editar (passando o ID)
    const abrirModalEditar = (id: string) => {
        const enderecoAlvo = enderecos.find(item => item.id === id);
        if (!enderecoAlvo) return;

        setEnderecoEmEdicaoId(id);
        setRua(enderecoAlvo.rua || "");
        setNumero(enderecoAlvo.numero || "");
        setBairro(enderecoAlvo.bairro || "");
        setCep(enderecoAlvo.cep || "");
        setPontoReferencia(enderecoAlvo.pontoReferencia || "");
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setEnderecoEmEdicaoId(null);
    };

    // 3. LÓGICA DE FILTRAGEM REATIVA
    const enderecosFiltrados = useMemo(() => {
        return enderecos.map(item => ({
            ...item,
            // Normaliza garantindo que nunca serão undefined/null para a busca
            rua: item.rua || "",
            numero: item.numero || "",
            bairro: item.bairro || "",
            cep: item.cep || "",
            pontoReferencia: item.pontoReferencia || "",

        })).filter((item) => {
            const termo = busca.toLowerCase();
            return (
                item.rua.toLowerCase().includes(termo) ||
                item.numero.toLowerCase().includes(termo) ||
                item.bairro.toLowerCase().includes(termo) ||
                item.cep.toLowerCase().includes(termo) ||
                item.pontoReferencia.toLowerCase().includes(termo)
            );
        });
    }, [enderecos, busca]);

    const { alert, showAlert, closeAlert } = useAlert();

    // Manipulador unificado de salvamento (Adição ou Edição)
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rua || !numero || !bairro) {
            showAlert("Por favor, preencha todos os campos obrigatórios.", "warning");
            return;
        }

        try {
            if (enderecoEmEdicaoId !== null) {
                // MODO EDIÇÃO
                isGlobal
                    ? await atualizarEnderecoCidade(enderecoEmEdicaoId, cidadeAtivaId, rua, numero, bairro, cep, pontoReferencia)
                    : await atualizarEndereco(enderecoEmEdicaoId, rua, numero, bairro, cep, pontoReferencia)
                showAlert("Edereço atualizado com sucesso!", "success");
            } else {
                // MODO CRIAÇÃO
                isGlobal
                    ? await criarEnderecoCidade(cidadeAtivaId, rua, numero, bairro, cep, pontoReferencia)
                    : await criarEndereco(rua, numero, bairro, cep, pontoReferencia)

                showAlert("Edereço cadastrado com sucesso!", "success");
            }

            // Invalida o cache do React Query 
            queryClient.invalidateQueries({ queryKey: queryKeys.enderecos.todos });
            if (cidadeAtivaId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.enderecos.porCidade(cidadeFiltro) });
            }

            fecharModal();
        } catch (error: any) {
            showAlert(`Erro ao salvar: ${error.message}`, "danger");
        }
    };

    const handleAlterarStatus = async function (id: string) {
        if (!id) {
            showAlert('ID inválido', 'warning');
        }

        try {
            await alterarStatusEndereco(id);

            // Invalida o cache do React Query 
            queryClient.invalidateQueries({ queryKey: queryKeys.enderecos.todos });
        } catch (error) {
            showAlert(`Erro ao alterar status do endereço`, 'danger');
        }
    }

    return (
        <div className="abaArvoresConteudo">
            {alert && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    onClose={closeAlert}
                />
            )}

            {/* BARRA VISUAL DE FILTROS */}
            <div className="barraFiltros">
                <input
                    type="text"
                    placeholder="Buscar por rua, número, bairro, cep ou ponto de referência"
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
                {carregandoEnderecos ? (
                    <SkeletonTable linhas={4} />

                ) : (
                    <table className="table tableRequisicao">
                        <thead>
                            <tr>
                                <th scope="col">Rua</th>
                                <th scope="col">Número</th>
                                <th scope="col">Bairro</th>
                                <th scope="col">Cep</th>
                                <th scope="col">Ponto Referência</th>
                                <th scope="col" className="text-center">Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {enderecosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="mensagemVazio">
                                        Nenhum resultado encontrado com os filtros atuais.
                                    </td>
                                </tr>
                            ) : (
                                enderecosFiltrados.map((item) => (
                                    <tr key={item.id}>

                                        <td>{item.rua}</td>
                                        <td>{item.numero}</td>
                                        <td>{item.bairro}</td>
                                        <td>{item.cep}</td>
                                        <td>{item.pontoReferencia}</td>

                                        <td className="text-center">
                                            {item.ativo ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-light btnStatusCidade"
                                                    onClick={() => handleAlterarStatus(item.id)}
                                                >
                                                    Desativar
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btnGestaoGlobal btnAtivar btnStatusCidade"
                                                    onClick={() => handleAlterarStatus(item.id)}
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
                    enderecoEmEdicaoId !== null
                        ? "Editar Endereço"
                        : "Adicionar Novo Endereço"
                }
                ariaLabelledBy="tituloModalCidade"
            >
                <div className="modalFormBody">
                    <form
                        onSubmit={handleSubmitForm}
                        className="formSection"
                    >
                        {/* Logradouro */}
                        <div className="row">
                            <div className="col-12 inputGroup mb-3">
                                <label htmlFor="rua">Rua*</label>
                                <input
                                    id="rua"
                                    type="text"
                                    placeholder="Ex: Rua Brasil"
                                    value={rua}
                                    onChange={(e) => setRua(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Número e bairro */}
                        <div className="row">
                            <div className="col-md-4 inputGroup mb-3">
                                <label htmlFor="numero">Número*</label>
                                <input
                                    id="numero"
                                    type="text"
                                    placeholder="Ex: 30"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-8 inputGroup mb-3">
                                <label htmlFor="bairro">Bairro*</label>
                                <input
                                    id="bairro"
                                    type="text"
                                    placeholder="Ex: Centro"
                                    value={bairro}
                                    onChange={(e) => setBairro(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* CEP e ponto de referência */}
                        <div className="row">
                            <div className="col-md-4 inputGroup mb-3">
                                <label htmlFor="cep">CEP</label>
                                <input
                                    id="cep"
                                    type="text"
                                    placeholder="Ex: 15800-000"
                                    value={formatarCep(cep)}
                                    onChange={(e) => setCep(e.target.value)}
                                />
                            </div>

                            <div className="col-md-8 inputGroup mb-3">
                                <label htmlFor="pontoReferencia">
                                    Ponto de referência
                                </label>
                                <input
                                    id="pontoReferencia"
                                    type="text"
                                    placeholder="Ex: Próximo à praça central"
                                    value={pontoReferencia}
                                    onChange={(e) =>
                                        setPontoReferencia(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="d-flex justify-content-end gap-2 mt-3">
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

                                {enderecoEmEdicaoId !== null
                                    ? "Salvar Alterações"
                                    : "Adicionar Endereço"}
                            </button>
                        </div>
                    </form>
                </div>
            </ModalForm>
        </div>
    );
}