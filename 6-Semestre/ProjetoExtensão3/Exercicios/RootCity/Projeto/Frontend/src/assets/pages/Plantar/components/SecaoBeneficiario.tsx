import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { formatarTelefone } from "../../../../utils/formatadores";

interface SecaoBeneficiarioProps {
    nome: string;
    onNomeChange: (valor: string) => void;
    email: string;
    onEmailChange: (valor: string) => void;
    telefone: string;
    onTelefoneChange: (valor: string) => void;
    permiteEntrega: boolean;
    tipoAtendimento: string;
    onTipoAtendimentoChange: (valor: string) => void;
    desabilitado: boolean;
}

export const SecaoBeneficiario = ({
    nome,
    onNomeChange,
    email,
    onEmailChange,
    telefone,
    onTelefoneChange,
    permiteEntrega,
    tipoAtendimento,
    onTipoAtendimentoChange,
    desabilitado,
}: SecaoBeneficiarioProps) => {

    return (
        <div className="formSection">
            <div className="sectionTitle mb-1">
                <span>2.</span>
                <h3>Informações pessoais</h3>
            </div>

            <p className="sectionDescription">
                <strong>Atenção</strong>: Caso esteja realizando esta requisição em nome de outra pessoa, informe os dados do beneficiário para que ele possa receber as atualizações sobre o andamento da solicitação.
            </p>

            <div className="row g-3 mt-2">
                <div className={"col-md-12"}>
                    <div className="inputGroup">
                        <label htmlFor="nomeBeneficiario">
                            Nome {"Beneficiário"}
                        </label>

                        <input
                            id="nomeBeneficiario"
                            name="nomeBeneficiario"
                            type="text"
                            placeholder="Ex: João da Silva"
                            value={nome}
                            onChange={(e) => onNomeChange(e.target.value)}
                            required
                            disabled={desabilitado}
                        />
                    </div>
                </div>

               
                    <div className="col-md-6">
                        <div className="inputGroup">
                            <label htmlFor="emailBeneficiario">
                                Email Beneficiário
                            </label>

                            <input
                                id="emailBeneficiario"
                                name="emailBeneficiario"
                                type="text"
                                placeholder="Ex: teste@gmail.com"
                                value={email}
                                disabled={desabilitado}
                                onChange={(e) => onEmailChange(e.target.value)}
                            />
                        </div>
                    </div>
           

                <div className={"col-md-6" }>
                    <div className="inputGroup">
                        <label htmlFor="telefoneBeneficiario">
                            Telefone {"Beneficiário"}
                        </label>

                        <input
                            id="telefoneBeneficiario"
                            name="telefoneBeneficiario"
                            type="text"
                            placeholder="(11) 11111-1111"
                            required
                            disabled={desabilitado}
                            value={telefone}
                            onChange={(e) =>
                                onTelefoneChange(formatarTelefone(e.target.value))
                            }
                        />
                    </div>
                </div>

                {permiteEntrega && (
                    <div className="col-md-12">
                        <div className="inputGroup">
                            <label>
                                Deseja retirar no local ou agendar o plantio?
                            </label>

                            <div className="tipoSolicitacao">
                                <label className="tipoSolicitacaoTitulo">
                                    Como deseja receber a árvore?
                                </label>

                                <div className="tipoSolicitacaoOpcoes">
                                    <label
                                        htmlFor="retirar"
                                        className={`tipoSolicitacaoCard ${tipoAtendimento === "RETIRADA_LOCAL"
                                                ? "selecionado"
                                                : ""
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            id="retirar"
                                            name="tipoAtendimento"
                                            value="RETIRADA_LOCAL"
                                            checked={
                                                tipoAtendimento === "RETIRADA_LOCAL"
                                            }
                                            onChange={(e) =>
                                                onTipoAtendimentoChange(
                                                    e.target.value
                                                )
                                            }
                                            disabled={desabilitado}
                                        />

                                        <span className="tipoSolicitacaoTexto">
                                            <strong>Retirar no local</strong>
                                            <small>
                                                Você retira a muda no local indicado.
                                            </small>
                                        </span>

                                        <span className="tipoSolicitacaoCheck">
                                            <FontAwesomeIcon icon={faCheck} />
                                        </span>
                                    </label>

                                    <label
                                        htmlFor="agendar"
                                        className={`tipoSolicitacaoCard ${tipoAtendimento === "PLANTIO_AGENDADO"
                                                ? "selecionado"
                                                : ""
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            id="agendar"
                                            name="tipoAtendimento"
                                            value="PLANTIO_AGENDADO"
                                            checked={
                                                tipoAtendimento === "PLANTIO_AGENDADO"
                                            }
                                            onChange={(e) =>
                                                onTipoAtendimentoChange(
                                                    e.target.value
                                                )
                                            }
                                            disabled={desabilitado}
                                        />

                                        <span className="tipoSolicitacaoTexto">
                                            <strong>Agendar plantio</strong>
                                            <small>
                                                Nossa equipe realiza o plantio mediante agendamento.
                                            </small>
                                        </span>

                                        <span className="tipoSolicitacaoCheck">
                                            <FontAwesomeIcon icon={faCheck} />
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!permiteEntrega && (
                    <input
                        type="hidden"
                        name="tipoAtendimento"
                        value="RETIRADA_LOCAL"
                    />
                )}
            </div>
        </div>
    );
};
