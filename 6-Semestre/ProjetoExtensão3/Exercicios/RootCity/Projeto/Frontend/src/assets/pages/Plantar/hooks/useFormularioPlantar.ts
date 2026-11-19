import { useState, useEffect, useMemo, useCallback } from "react";
import type { Publicacao, Requisicao } from "../../../../types";
import { usePlantarQueries } from "./usePlantarQueries";
import { useAlert } from "../../../components/hooks/useAlert";
import { buscarCep } from "../../../../services/viaCepService";
import { formatarCep, formatarTelefone } from "../../../../utils/formatadores";
import { verificarPublicacao } from "../../../../services/blogService";

export function useFormularioPlantar() {
    const { alert, showAlert, closeAlert } = useAlert();

    // Arquivos
    const [fotoLocal, setFotoLocal] = useState<File | null>(null);
    const [comprovante, setComprovante] = useState<File | null>(null);
    const [fotoLocalUrl, setFotoLocalUrl] = useState<string | null>(null);
    const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(null);

    // Seleções
    const [cidadeSelecionada, setCidadeSelecionada] = useState<string>("");
    const [arvoreSelecionada, setArvoreSelecionada] = useState<string | null>(null);
    const [tipoAtendimento, setTipoAtendimento] = useState<string>("");

    // Dados pessoais
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");

    // Endereço
    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [bairro, setBairro] = useState("");
    const [numero, setNumero] = useState("");
    const [pontoReferencia, setPontoReferencia] = useState("");
    const [estadoSelecionado, setEstadoSelecionado] = useState("");
    const [cepConsultado, setCepConsultado] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false);

    // Modais
    const [modalArvoresAberto, setModalArvoresAberto] = useState(false);
    const [modalRequisicoesAberto, setModalRequisicoesAberto] = useState(false);

    // Modo Verificação / Edição
    const [requisicaoSelecionada, setRequisicaoSelecionada] = useState<Requisicao | null>(null);
    const [publicacao, setPublicacao] = useState<Publicacao | null>(null);

    // Queries e mutations
    const {
        cidades,
        arvores,
        cadastrarMutation,
        atualizarMutation,
        invalidarMinhasRequisicoes,
        queryClient,
    } = usePlantarQueries(cidadeSelecionada);

    const modoVerificacao = requisicaoSelecionada !== null;

    const podeEditar = useMemo(() => {
        if (!modoVerificacao) return true;
        return (
            requisicaoSelecionada?.status === "SOLICITADO" ||
            requisicaoSelecionada?.status === "RECUSADO"
        );
    }, [modoVerificacao, requisicaoSelecionada?.status]);

    const cidadeEscolhida = useMemo(() => {
        return cidades.find((c) => c.id === cidadeSelecionada);
    }, [cidades, cidadeSelecionada]);

    const arvoreEscolhida = useMemo(() => {
        return arvores.find((a) => a.id === arvoreSelecionada);
    }, [arvores, arvoreSelecionada]);

    const permiteEntrega = cidadeEscolhida?.permiteEntrega === true;

    // Inicialização da primeira cidade
    useEffect(() => {
        if (!cidadeSelecionada && cidades.length > 0) {
            const primeira = cidades[0];
            setCidadeSelecionada(primeira.id);
            if (!primeira.permiteEntrega) {
                setTipoAtendimento("RETIRADA_LOCAL");
            }
        }
    }, [cidades, cidadeSelecionada]);

    // Forçar RETIRADA_LOCAL se cidade não permitir entrega
    useEffect(() => {
        if (!cidadeSelecionada || !cidadeEscolhida) return;
        if (!permiteEntrega) {
            setTipoAtendimento("RETIRADA_LOCAL");
        }
    }, [cidadeSelecionada, permiteEntrega, cidadeEscolhida]);

    // Manipuladores de arquivos
    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoLocal(file);
        }
    };

    const handleComprovanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setComprovante(file);
        }
    };

    const handleRemoverComprovante = () => {
        setComprovante(null);
    };

    // Mudança de cidade
    const handleCidadeChange = (novaCidadeId: string) => {
        setCidadeSelecionada(novaCidadeId);
        setArvoreSelecionada(null);

        const cidade = cidades.find((item) => item.id === novaCidadeId);
        if (!cidade?.permiteEntrega) {
            setTipoAtendimento("RETIRADA_LOCAL");
        }

        if (!novaCidadeId) {
            setTipoAtendimento("");
        }
    };

    // Seleção de árvore
    const selecionarArvore = (id: string) => {
        if (modoVerificacao && !podeEditar) return;

        const arvore = arvores.find((item) => item.id === id);
        if (!arvore || arvore.quantidade <= 0) return;

        setArvoreSelecionada(id);
        setModalArvoresAberto(false);
    };

    // Manipulação de CEP
    const handleCepChange = (valor: string) => {
        setCep(formatarCep(valor));
        setCepConsultado(false);
        setRua("");
        setBairro("");
        setNumero("");
        setEstadoSelecionado("");
    };

    const handleBuscarCep = async () => {
        const cepLimpo = cep.replace(/\D/g, "");

        if (cepLimpo.length !== 8) {
            showAlert("Informe um CEP válido.", "warning");
            return;
        }

        setBuscandoCep(true);
        setCepConsultado(false);

        try {
            const dados = await buscarCep(cepLimpo);

            const normalizar = (texto: string) =>
                texto
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .trim()
                    .toLowerCase();

            if (
                cidadeEscolhida &&
                normalizar(cidadeEscolhida.nome) !== normalizar(dados.localidade)
            ) {
                showAlert(
                    `O CEP pertence a ${dados.localidade}/${dados.uf}, não a ${cidadeEscolhida.nome}.`,
                    "warning"
                );
                return;
            }

            if (!dados.bairro) {
                showAlert(
                    "O ViaCEP não retornou um bairro para esse CEP.",
                    "warning"
                );
                return;
            }

            setRua(dados.logradouro ?? "");
            setBairro(dados.bairro);
            setEstadoSelecionado(dados.uf);
            setCepConsultado(true);
        } catch (error) {
            showAlert(
                error instanceof Error ? error.message : "Erro ao buscar o CEP.",
                "danger"
            );
        } finally {
            setBuscandoCep(false);
        }
    };

    // Seleção de requisição existente
    const selecionarRequisicao = async (requisicao: Requisicao) => {
        try {
            setRequisicaoSelecionada(requisicao);

            setCep(formatarCep(requisicao.cep ?? ""));
            setRua(requisicao.rua ?? "");
            setNumero(requisicao.numero ?? "");
            setBairro(requisicao.bairro ?? "");
            setPontoReferencia(requisicao.pontoReferencia ?? "");

            setNome(requisicao.nomeBeneficiario ?? "");
            setTelefone(formatarTelefone(requisicao.telefoneBeneficiario ?? ""));
            setEmail(requisicao?.emailBeneficiario ?? "");

            setCepConsultado((requisicao.cep ?? "").replace(/\D/g, "").length === 8);

            const novaCidadeId = requisicao.cidade?.id ?? requisicao.cidadeId ?? "";
            setCidadeSelecionada(novaCidadeId);

            const novoArvoreId = requisicao.arvore?.id ?? requisicao.arvoreId ?? null;
            setArvoreSelecionada(novoArvoreId);

            setEstadoSelecionado(requisicao.estado ?? "");
            setTipoAtendimento(requisicao.tipoAtendimento);

            setFotoLocalUrl(requisicao.fotoLocalUrl ?? null);
            setFotoLocal(null);

            setComprovanteUrl(requisicao.comprovanteResidenciaUrl ?? null);
            setComprovante(null);

            const publicacaoExistente = await verificarPublicacao(requisicao.id);
            setPublicacao(publicacaoExistente);

            setModalRequisicoesAberto(false);
        } catch (error) {
            console.error("Erro ao carregar requisição:", error);
            showAlert("Não foi possível carregar os arquivos da requisição.", "danger");
        }
    };

    // Resetar para nova requisição
    const novaRequisicao = useCallback(() => {
        setRequisicaoSelecionada(null);
        setPublicacao(null);

        setCep("");
        setRua("");
        setBairro("");
        setNumero("");
        setPontoReferencia("");
        setNome("");
        setTelefone("");
        setEmail("");

        setCepConsultado(false);
        setBuscandoCep(false);
        setEstadoSelecionado("");

        setFotoLocal(null);
        setComprovante(null);
        setFotoLocalUrl(null);
        setComprovanteUrl(null);

        setArvoreSelecionada(null);

        if (cidades.length > 0) {
            setCidadeSelecionada(cidades[0].id);
        }
    }, [cidades]);

    // Submissão
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (modoVerificacao && !podeEditar) {
            showAlert("Esta requisição não pode mais ser alterada.", "warning");
            return;
        }

        if (!cidadeSelecionada) {
            showAlert("Por favor, selecione uma cidade.", "warning");
            return;
        }

        if (!arvoreSelecionada) {
            showAlert("Por favor, escolha uma árvore antes de enviar a requisição.", "warning");
            setModalArvoresAberto(true);
            return;
        }

        if (!modoVerificacao && !fotoLocal) {
            showAlert("Por favor, adicione a foto do local para plantio.", "warning");
            return;
        }

        if (!modoVerificacao && !comprovante) {
            showAlert("Por favor, adicione um comprovante de residência.", "warning");
            return;
        }

        const formData = new FormData(e.currentTarget);

        try {
            if (!modoVerificacao) {
                await cadastrarMutation.mutateAsync(formData);
                showAlert("Requisição enviada com sucesso!", "success");
            } else {
                await atualizarMutation.mutateAsync({
                    id: requisicaoSelecionada!.id,
                    formData,
                });
                showAlert("Requisição atualizada com sucesso!", "success");
            }

            novaRequisicao();
            await invalidarMinhasRequisicoes();
        } catch (error: any) {
            showAlert(
                `Erro ao ${modoVerificacao ? "atualizar" : "cadastrar"} requisição: ${error.message || error}`,
                "danger"
            );
        }
    };

    // Atualização de foto do plantio vinda do componente StatusRequisicao
    const handleFotoPlantioSalva = (requisicaoAtualizada: Requisicao) => {
        setRequisicaoSelecionada(requisicaoAtualizada);
        queryClient.setQueryData<Requisicao[]>(
            ["requisicoes", "minhas"],
            (requisicoesAtuais = []) =>
                requisicoesAtuais.map((req) =>
                    req.id === requisicaoAtualizada.id ? requisicaoAtualizada : req
                )
        );
    };

    const abrirArquivoNovaGuia = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const obterNomeArquivoComprovante = (url: string): string => {
        try {
            const urlObj = new URL(url);
            const caminho = urlObj.pathname;
            const nomeArquivo = caminho.split("/").pop();
            if (nomeArquivo) return nomeArquivo;
        } catch {
            // Ignora erro e usa padrão
        }
        return "comprovante-residencia.pdf";
    };

    return {
        // Alerta
        alert,
        showAlert,
        closeAlert,

        // Modos e Permissões
        modoVerificacao,
        podeEditar,
        salvando: cadastrarMutation.isPending || atualizarMutation.isPending,

        // Entidades
        cidades,
        cidadeSelecionada,
        cidadeEscolhida,
        arvores,
        arvoreSelecionada,
        arvoreEscolhida,
        permiteEntrega,
        tipoAtendimento,
        setTipoAtendimento,

        // Campos do formulário
        nome,
        setNome,
        email,
        setEmail,
        telefone,
        setTelefone,
        cep,
        handleCepChange,
        rua,
        setRua,
        numero,
        setNumero,
        bairro,
        setBairro,
        pontoReferencia,
        setPontoReferencia,
        estadoSelecionado,
        cepConsultado,
        buscandoCep,

        // Arquivos
        fotoLocal,
        comprovante,
        fotoLocalUrl,
        comprovanteUrl,
        handleFotoChange,
        handleComprovanteChange,
        handleRemoverComprovante,

        // Modais
        modalArvoresAberto,
        setModalArvoresAberto,
        modalRequisicoesAberto,
        setModalRequisicoesAberto,

        // Requisição ativa e publicação
        requisicaoSelecionada,
        publicacao,

        // Ações
        handleCidadeChange,
        selecionarArvore,
        handleBuscarCep,
        selecionarRequisicao,
        novaRequisicao,
        handleSubmit,
        handleFotoPlantioSalva,
        abrirArquivoNovaGuia,
        obterNomeArquivoComprovante,
    };
}
