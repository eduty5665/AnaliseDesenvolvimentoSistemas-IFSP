import ModalForm from "../ModalForm/ModalForm";
import type { Requisicao } from "../../../types";

import "./ModalPublicarBlog.css";
import "../../pages/Plantar/Plantar.css"
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { publicar } from "../../../services/blogService";
import { useAlert } from "../hooks/useAlert";
import Alert from "../Alert/Alert";
import { useQueryClient } from "@tanstack/react-query";

interface ModalBlogProps {
    aberto: boolean;
    fechar: () => void;
    requisicao: Requisicao | null;
    baseUrl: string;
}

export default function ModalPublicarBlog({
    aberto,
    fechar,
    requisicao,
}: ModalBlogProps) {
    
    const { alert, showAlert, closeAlert } = useAlert();

    if (!requisicao) {
        return null;
    }

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');


    const fotoPlantio = requisicao.fotoPlantioUrl ?? null;
    const tituloRef = useRef<HTMLInputElement>(null);
    const descricaoRef = useRef<HTMLTextAreaElement>(null);

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const handlePublicarFoto = async () => {
        if (!tituloRef.current?.reportValidity()) {
            return;
        }

        if (!descricaoRef.current?.reportValidity()) {
            return;
        }
        try {

            const res = await publicar(requisicao.id, titulo, descricao);

            await queryClient.invalidateQueries({
                queryKey: ['publicacoes', 'feed'],
            });
            
            showAlert(`${res}`, 'success');

            navigate("/blog");
        } catch (error) {
            showAlert(`${error}`, 'danger');
        }
    }

    return (
        <ModalForm
            aberto={aberto}
            fechar={fechar}
            titulo="Publicar no Blog"
            descricao={`Beneficiário - ${requisicao.nomeBeneficiario}`}
        >
            <div className="modalPublicacao">

                {alert && (
                    <Alert
                        message={alert.message}
                        type={alert.type}
                        onClose={closeAlert}
                    />
                )}

                {/* RESUMO */}
                <section className="secaoPublicacao">

                    <h3 className="tituloSecaoPublicacao">
                        Defina as informações da publicação
                    </h3>

                    <div className="gridPublicacao">

                        {/* INFORMAÇÕES */}
                        <div className="informacoesPublicacao">

                            <div className="campoPublicacao">
                                <label htmlFor="titulo">
                                    Título
                                </label>

                                <input
                                    ref={tituloRef}
                                    id="titulo"
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="campoPublicacao">
                                <label htmlFor="descricao">
                                    Descrição
                                </label>

                                <textarea
                                    ref={descricaoRef}
                                    id="descricao"
                                    name="descricao"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="campoPublicacao">
                                <button type="button" className="btnEnviar" onClick={handlePublicarFoto}>
                                    Enviar
                                </button>
                            </div>

                        </div>

                        {/* FOTO */}
                        <div className="areaFotoPublicacao">

                            <div className="cardFotoPublicacao">

                                <h4 className="tituloFotoPublicacao">
                                    Foto do local
                                </h4>

                                {fotoPlantio ? (
                                    <a
                                        href={fotoPlantio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="linkFotoPublicacao"
                                    >
                                        <img
                                            src={fotoPlantio}
                                            alt="Foto do plantio"
                                            className="fotoPublicacao"
                                        />
                                    </a>
                                ) : (
                                    <div className="fotoIndisponivel">
                                        Foto não disponível
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                </section>

            </div>
        </ModalForm>
    );
}
