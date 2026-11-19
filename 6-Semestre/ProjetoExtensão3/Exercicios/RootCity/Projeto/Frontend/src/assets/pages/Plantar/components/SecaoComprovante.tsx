import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines, faTrash } from "@fortawesome/free-solid-svg-icons";

interface SecaoComprovanteProps {
    comprovante: File | null;
    comprovanteUrl: string | null;
    onComprovanteChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoverComprovante: () => void;
    onAbrirArquivo: (url: string) => void;
    obterNomeArquivo: (url: string) => string;
    desabilitado: boolean;
}

export const SecaoComprovante = ({
    comprovante,
    comprovanteUrl,
    onComprovanteChange,
    onRemoverComprovante,
    onAbrirArquivo,
    obterNomeArquivo,
    desabilitado,
}: SecaoComprovanteProps) => {
    return (
        <div className="formSection">
            <div className="sectionTitle">
                <span>4.</span>
                <h3>Comprovante de residência</h3>
            </div>

            <p className="sectionDescription">
                Anexe um comprovante de residência atualizado.
            </p>

            <label htmlFor="comprovante" className="comprovanteUpload">
                <strong>Selecionar comprovante</strong>
                <span>(PDF, JPG ou PNG)</span>

                <input
                    id="comprovante"
                    name="comprovante"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={onComprovanteChange}
                    disabled={desabilitado}
                />
            </label>

            {comprovante && (
                <div className="fileUploaded">
                    <div className="fileIcon">
                        <FontAwesomeIcon icon={faFileLines} />
                    </div>

                    <div className="fileInfo">
                        <strong>{comprovante.name}</strong>
                        <span>
                            {(comprovante.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </div>

                    <button
                        type="button"
                        className="deleteFile"
                        onClick={onRemoverComprovante}
                        title="Remover arquivo"
                        disabled={desabilitado}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            )}

            {comprovanteUrl && !comprovante && (
                <div
                    className="fileUploaded"
                    onClick={() => onAbrirArquivo(comprovanteUrl)}
                    style={{ cursor: "pointer" }}
                    title="Clique para abrir o comprovante em uma nova guia"
                >
                    <div className="fileIcon">
                        <FontAwesomeIcon icon={faFileLines} />
                    </div>

                    <div className="fileInfo">
                        <strong>{obterNomeArquivo(comprovanteUrl)}</strong>
                        <span>Clique para visualizar</span>
                    </div>
                </div>
            )}
        </div>
    );
};
