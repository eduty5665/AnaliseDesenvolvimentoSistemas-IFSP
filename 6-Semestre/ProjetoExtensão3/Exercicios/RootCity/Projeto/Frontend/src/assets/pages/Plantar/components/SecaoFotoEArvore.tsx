import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck, faLeaf } from "@fortawesome/free-solid-svg-icons";
import type { Arvore, Cidade } from "../../../../types";
import { useFilePreview } from "../hooks/useFilePreview";

interface SecaoFotoEArvoreProps {
    fotoLocal: File | null;
    fotoLocalUrl: string | null;
    onFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAbrirArquivo: (url: string) => void;
    arvoreEscolhida?: Arvore | null;
    arvoreSelecionadaId: string | null;
    onAbrirModalArvores: () => void;
    cidades: Cidade[];
    cidadeId: string;
    onCidadeChange: (cidadeId: string) => void;
    desabilitado: boolean;
    usuarioId?: string;
    requisicaoId?: string;
}

export const SecaoFotoEArvore = ({
    fotoLocal,
    fotoLocalUrl,
    onFotoChange,
    onAbrirArquivo,
    arvoreEscolhida,
    arvoreSelecionadaId,
    onAbrirModalArvores,
    cidades,
    cidadeId,
    onCidadeChange,
    desabilitado,
    usuarioId,
    requisicaoId,
}: SecaoFotoEArvoreProps) => {
    const previewFoto = useFilePreview(fotoLocal, fotoLocalUrl);

    return (
        <div className="formSection">
            <div className="sectionTitle">
                <span>1.</span>
                <h3>Foto do local</h3>
            </div>

            <p className="sectionDescription">
                Envie uma foto do local onde deseja o plantio.
            </p>

            <div className="photoUpload">
                <label htmlFor="fotoLocal" className="addPhoto">
                    <div className="cameraIcon">
                        <FontAwesomeIcon icon={faCamera} />
                    </div>

                    <strong>
                        {fotoLocal ? (
                            <>
                                Foto adicionada com sucesso{" "}
                                <FontAwesomeIcon
                                    className="successIcon"
                                    icon={faCheck}
                                />
                            </>
                        ) : (
                            "Adicionar foto do local"
                        )}
                    </strong>

                    <span>
                        {fotoLocal
                            ? "Clique para alterar a imagem"
                            : "Clique para adicionar uma imagem"}
                    </span>

                    <input
                        id="fotoLocal"
                        name="fotoLocal"
                        type="file"
                        accept="image/*"
                        onChange={onFotoChange}
                        disabled={desabilitado}
                    />
                </label>

                {previewFoto && (
                    <div
                        className="photoPreview"
                        onClick={() => onAbrirArquivo(previewFoto)}
                        style={{ cursor: "pointer" }}
                        title="Clique para abrir a foto em uma nova guia"
                    >
                        <img src={previewFoto} alt="Foto do local" />
                    </div>
                )}
            </div>

            <div className="arvoresOption">
                <div className="arvoresOptionInfo">
                    <div className="arvoresOptionIcon">
                        <FontAwesomeIcon icon={faLeaf} />
                    </div>

                    <div>
                        <strong>Escolha a árvore para o plantio</strong>
                        <span>
                            Consulte as espécies disponíveis e escolha a que deseja plantar.
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="btnSelecionarArvore"
                    onClick={onAbrirModalArvores}
                    disabled={desabilitado}
                >
                    {arvoreEscolhida
                        ? `Árvore: ${arvoreEscolhida.nomePopular}`
                        : "Ver árvores disponíveis"}
                </button>
            </div>

            {arvoreEscolhida && (
                <div className="arvoreSelecionada">
                    <div className="arvoreSelecionadaImagem">
                        <img
                            src={arvoreEscolhida.imagemUrl || ""}
                            alt={arvoreEscolhida.nomePopular}
                        />
                    </div>

                    <div className="arvoreSelecionadaInfo">
                        <span>Árvore selecionada</span>
                        <strong>{arvoreEscolhida.nomePopular}</strong>
                        <p>{arvoreEscolhida.descricao}</p>
                        <small>{arvoreEscolhida.quantidade} disponíveis</small>
                    </div>

                    <button
                        type="button"
                        className="btnAlterarArvore"
                        onClick={onAbrirModalArvores}
                        disabled={desabilitado}
                    >
                        Alterar
                    </button>
                </div>
            )}

            <input
                type="hidden"
                name="criadoPorId"
                value={usuarioId ?? ""}
            />

            <input
                type="hidden"
                name="requisicaoId"
                value={requisicaoId ?? ""}
            />

            <input
                type="hidden"
                name="arvoreId"
                value={arvoreSelecionadaId ?? ""}
            />

            <div className="col-md-12 mt-2">
                <div className="inputGroup">
                    <label htmlFor="cidadeId">
                        Árvore selecionada com base na cidade *
                    </label>

                    <select
                        id="cidadeId"
                        name="cidadeId"
                        value={cidadeId}
                        onChange={(e) => onCidadeChange(e.target.value)}
                        required
                        disabled={desabilitado}
                    >
                        <option value="" disabled>
                            Selecione a cidade
                        </option>

                        {cidades.map((cidade) => (
                            <option key={cidade.id} value={cidade.id}>
                                {cidade.nome}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
