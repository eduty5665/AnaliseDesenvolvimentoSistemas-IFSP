interface SecaoEnderecoProps {
    cidadeNome: string;
    cep: string;
    onCepChange: (valor: string) => void;
    onBuscarCep: () => void;
    buscandoCep: boolean;
    cepConsultado: boolean;
    rua: string;
    onRuaChange: (valor: string) => void;
    numero: string;
    onNumeroChange: (valor: string) => void;
    bairro: string;
    estado: string;
    pontoReferencia: string;
    onPontoReferenciaChange: (valor: string) => void;
    desabilitado: boolean;
}

export const SecaoEndereco = ({
    cidadeNome,
    cep,
    onCepChange,
    onBuscarCep,
    buscandoCep,
    cepConsultado,
    rua,
    onRuaChange,
    numero,
    onNumeroChange,
    bairro,
    estado,
    pontoReferencia,
    onPontoReferenciaChange,
    desabilitado,
}: SecaoEnderecoProps) => {
    return (
        <div className="formSection">
            <div className="sectionTitle">
                <span>3.</span>
                <h3>Endereço do local</h3>
            </div>

            <p className="sectionDescription">
                Informe o endereço onde o plantio será realizado.
            </p>

            <div className="row g-3">
                {/* CIDADE */}
                <div className="col-md-5">
                    <div className="inputGroup">
                        <label htmlFor="cidadeEndereco">Cidade *</label>

                        <input
                            id="cidadeEndereco"
                            name="cidadeEndereco"
                            type="text"
                            value={cidadeNome}
                            readOnly
                        />
                    </div>
                </div>

                {/* CEP */}
                <div className="col-md-7">
                    <div className="inputGroup">
                        <label htmlFor="cep">CEP *</label>

                        <div className="cepInputGroup">
                            <input
                                id="cep"
                                name="cep"
                                type="text"
                                inputMode="numeric"
                                placeholder="00000-000"
                                maxLength={9}
                                value={cep}
                                onChange={(e) => onCepChange(e.target.value)}
                                required
                                disabled={desabilitado}
                            />

                            <button
                                type="button"
                                className="btnBuscarCep"
                                onClick={onBuscarCep}
                                disabled={
                                    buscandoCep ||
                                    cep.replace(/\D/g, "").length !== 8 ||
                                    desabilitado
                                }
                            >
                                {buscandoCep ? "Buscando..." : "Buscar CEP"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* CAMPOS EXIBIDOS APÓS A CONSULTA DO CEP */}
                {cepConsultado && (
                    <>
                        {/* RUA */}
                        <div className="col-md-8">
                            <div className="inputGroup">
                                <label htmlFor="rua">Rua / Avenida *</label>

                                <input
                                    id="rua"
                                    name="rua"
                                    type="text"
                                    value={rua}
                                    onChange={(e) => onRuaChange(e.target.value)}
                                    placeholder="Digite a rua"
                                    required
                                    disabled={desabilitado}
                                />
                            </div>
                        </div>

                        {/* NÚMERO */}
                        <div className="col-md-4">
                            <div className="inputGroup">
                                <label htmlFor="numero">Número *</label>

                                <input
                                    id="numero"
                                    name="numero"
                                    type="text"
                                    value={numero}
                                    onChange={(e) => onNumeroChange(e.target.value)}
                                    placeholder="Nº"
                                    required
                                    disabled={desabilitado}
                                />
                            </div>
                        </div>

                        {/* BAIRRO */}
                        <div className="col-md-8">
                            <div className="inputGroup">
                                <label htmlFor="bairro">Bairro *</label>

                                <input
                                    id="bairro"
                                    name="bairro"
                                    type="text"
                                    value={bairro}
                                    readOnly
                                    required
                                />
                            </div>
                        </div>

                        {/* ESTADO */}
                        <div className="col-md-4">
                            <div className="inputGroup">
                                <label htmlFor="estado">Estado *</label>

                                <input
                                    id="estado"
                                    name="estado"
                                    type="text"
                                    value={estado}
                                    readOnly
                                    required
                                />
                            </div>
                        </div>

                        {/* PONTO DE REFERÊNCIA */}
                        <div className="col-12">
                            <div className="inputGroup">
                                <label htmlFor="pontoReferencia">
                                    Ponto de referência (opcional)
                                </label>

                                <input
                                    id="pontoReferencia"
                                    name="pontoReferencia"
                                    type="text"
                                    value={pontoReferencia}
                                    onChange={(e) =>
                                        onPontoReferenciaChange(e.target.value)
                                    }
                                    placeholder="Ex: próximo ao ponto de ônibus..."
                                    disabled={desabilitado}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
