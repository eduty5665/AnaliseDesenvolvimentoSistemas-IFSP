import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import { SectionContent } from "../../components/SectionContent/SectionContent";
import Alert from "../../components/Alert/Alert";
import ModalRequisicaoPlantar from "../../components/ModalRequisicaoPlantar/ModalRequisicaoPlantar";
import { useAuth } from "../../../contexts/AuthContext";
import { useFormularioPlantar } from "./hooks/useFormularioPlantar";

import { PlantarHeader } from "./components/PlantarHeader";
import { SecaoFotoEArvore } from "./components/SecaoFotoEArvore";
import { SecaoBeneficiario } from "./components/SecaoBeneficiario";
import { SecaoEndereco } from "./components/SecaoEndereco";
import { SecaoComprovante } from "./components/SecaoComprovante";
import { ModalSelecaoArvore } from "./components/ModalSelecaoArvore";
import { ColunaStatusRequisicao } from "./components/ColunaStatusRequisicao";

import "./Plantar.css";
import { useNavigate } from "react-router-dom";

export const Plantar = () => {
    const { usuario } = useAuth();
    const form = useFormularioPlantar();
    const navigate = useNavigate();

    if (!usuario) {
        navigate("/login", {
            state: {
                message: "Você precisa fazer login ou criar uma conta para acessar esta página.",
                type: "warning"
            }
        });
        return null;
    }

    const textoBotaoSubmit = form.salvando
        ? " Enviando..."
        : form.modoVerificacao
            ? form.requisicaoSelecionada?.status === "RECUSADO"
                ? " Reenviar requisição"
                : " Atualizar requisição"
            : " Enviar requisição";

    return (
        <SectionContent className="sectionPlantar">
            <div className="container-fluid">
                <form className="plantarLayout" onSubmit={form.handleSubmit}>
                    <div className="solicitacaoCard">
                        {form.alert && (
                            <Alert
                                message={form.alert.message}
                                type={form.alert.type}
                                onClose={form.closeAlert}
                            />
                        )}

                        <PlantarHeader
                            modoVerificacao={form.modoVerificacao}
                            podeEditar={form.podeEditar}
                            requisicao={form.requisicaoSelecionada}
                            onAbrirMinhasRequisicoes={() =>
                                form.setModalRequisicoesAberto(true)
                            }
                            onNovaRequisicao={form.novaRequisicao}
                        />

                        <SecaoFotoEArvore
                            fotoLocal={form.fotoLocal}
                            fotoLocalUrl={form.fotoLocalUrl}
                            onFotoChange={form.handleFotoChange}
                            onAbrirArquivo={form.abrirArquivoNovaGuia}
                            arvoreEscolhida={form.arvoreEscolhida}
                            arvoreSelecionadaId={form.arvoreSelecionada}
                            onAbrirModalArvores={() =>
                                form.setModalArvoresAberto(true)
                            }
                            cidades={form.cidades}
                            cidadeId={form.cidadeSelecionada}
                            onCidadeChange={form.handleCidadeChange}
                            desabilitado={
                                form.modoVerificacao && !form.podeEditar
                            }
                            usuarioId={usuario?.id}
                            requisicaoId={form.requisicaoSelecionada?.id}
                        />

                        <SecaoBeneficiario
                            nome={form.nome}
                            onNomeChange={form.setNome}
                            email={form.email}
                            onEmailChange={form.setEmail}
                            telefone={form.telefone}
                            onTelefoneChange={form.setTelefone}
                            permiteEntrega={form.permiteEntrega}
                            tipoAtendimento={form.tipoAtendimento}
                            onTipoAtendimentoChange={form.setTipoAtendimento}
                            desabilitado={
                                form.modoVerificacao && !form.podeEditar
                            }
                        />

                        <SecaoEndereco
                            cidadeNome={
                                form.cidadeEscolhida?.nome ??
                                form.requisicaoSelecionada?.cidade?.nome ??
                                ""
                            }
                            cep={form.cep}
                            onCepChange={form.handleCepChange}
                            onBuscarCep={form.handleBuscarCep}
                            buscandoCep={form.buscandoCep}
                            cepConsultado={form.cepConsultado}
                            rua={form.rua}
                            onRuaChange={form.setRua}
                            numero={form.numero}
                            onNumeroChange={form.setNumero}
                            bairro={form.bairro}
                            estado={form.estadoSelecionado}
                            pontoReferencia={form.pontoReferencia}
                            onPontoReferenciaChange={form.setPontoReferencia}
                            desabilitado={
                                form.modoVerificacao && !form.podeEditar
                            }
                        />

                        <SecaoComprovante
                            comprovante={form.comprovante}
                            comprovanteUrl={form.comprovanteUrl}
                            onComprovanteChange={form.handleComprovanteChange}
                            onRemoverComprovante={form.handleRemoverComprovante}
                            onAbrirArquivo={form.abrirArquivoNovaGuia}
                            obterNomeArquivo={form.obterNomeArquivoComprovante}
                            desabilitado={
                                form.modoVerificacao && !form.podeEditar
                            }
                        />

                        <button
                            type="submit"
                            className="btnEnviar"
                            disabled={
                                (form.modoVerificacao && !form.podeEditar) ||
                                form.salvando
                            }
                            hidden={!form.podeEditar}
                        >
                            <FontAwesomeIcon
                                icon={
                                    form.modoVerificacao
                                        ? faCheck
                                        : faPaperPlane
                                }
                            />
                            {textoBotaoSubmit}
                        </button>
                    </div>

                    <ColunaStatusRequisicao
                        modoVerificacao={form.modoVerificacao}
                        requisicao={form.requisicaoSelecionada}
                        publicacao={form.publicacao}
                        onAbrirMinhasRequisicoes={() =>
                            form.setModalRequisicoesAberto(true)
                        }
                        onNovaRequisicao={form.novaRequisicao}
                        onFotoPlantioSalva={form.handleFotoPlantioSalva}
                    />
                </form>
            </div>

            <ModalSelecaoArvore
                aberto={form.modalArvoresAberto}
                arvores={form.arvores}
                arvoreSelecionadaId={form.arvoreSelecionada}
                onSelecionar={form.selecionarArvore}
                onFechar={() => form.setModalArvoresAberto(false)}
                desabilitado={form.modoVerificacao && !form.podeEditar}
            />

            <ModalRequisicaoPlantar
                aberto={form.modalRequisicoesAberto}
                fechar={() => form.setModalRequisicoesAberto(false)}
                onSelecionar={form.selecionarRequisicao}
            />
        </SectionContent>
    );
};
