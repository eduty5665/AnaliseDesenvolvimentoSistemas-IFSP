import type { FC } from "react";
import "./ModalConfirm.css";

interface ModalConfirmProps {
  isOpen: boolean;
  titulo?: string;
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ModalConfirm: FC<ModalConfirmProps> = ({
  isOpen,
  titulo = "Confirmação",
  mensagem,
  onConfirmar,
  onCancelar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={onCancelar}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <h3>{titulo}</h3>
        <p>{mensagem}</p>

        <div className="modalBotoes">
          <button
            type="button"
            className="btnModalCancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          
          <button
            type="button"
            className="btnModalConfirmar"
            onClick={onConfirmar}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};