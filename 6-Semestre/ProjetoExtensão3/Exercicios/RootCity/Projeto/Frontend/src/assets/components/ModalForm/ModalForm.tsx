import { type ReactNode, type MouseEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import "./ModalForm.css";

interface ModalProps {
    aberto: boolean;
    fechar: () => void;
    titulo: string;
    descricao?: string;
    children: ReactNode;
    ariaLabelledBy?: string;
}

export default function ModalForm({
    aberto,
    fechar,
    titulo,
    descricao,
    children,
    ariaLabelledBy = "tituloModal",
}: ModalProps) {
    if (!aberto) {
        return null;
    }

    const handleOverlayMouseDown = (
        event: MouseEvent<HTMLDivElement>
    ) => {
        if (event.target === event.currentTarget) {
            fechar();
        }
    };

    return (
        <div
            className="modalFormOverlay"
            onMouseDown={handleOverlayMouseDown}
        >
            <div
                className="modalFormContent"
                role="dialog"
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
            >
                <header className="modalHeader">
                    <div className="modalHeaderContent">
                        <h2 id={ariaLabelledBy}>
                            {titulo}
                        </h2>

                        {descricao && (
                            <p>
                                {descricao}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        className="btnFecharModal"
                        onClick={fechar}
                        aria-label="Fechar modal"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </header>

                <div className="modalBody">
                    {children}
                </div>
            </div>
        </div>
    );
}