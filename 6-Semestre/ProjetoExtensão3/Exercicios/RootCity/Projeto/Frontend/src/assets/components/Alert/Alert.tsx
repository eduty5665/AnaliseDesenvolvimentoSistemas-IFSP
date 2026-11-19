import type { FC } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "./Alert.css";

export type AlertType = "success" | "danger" | "warning" | "info";

interface AlertProps {
  message: string;
  type?: AlertType;
  onClose: () => void;
}

const icones: Record<AlertType, IconDefinition> = {
  success: faCircleCheck,
  danger: faCircleXmark,
  warning: faTriangleExclamation,
  info: faCircleInfo,
};

const Alert: FC<AlertProps> = ({
  message,
  type = "success",
  onClose,
}) => {
  return createPortal(
    <div className="alert-popup-overlay">
      <div
        className={`alert-popup alert-popup-${type}`}
        role="alert"
        aria-atomic="true"
      >
        <FontAwesomeIcon
          icon={icones[type]}
          className="alert-popup-type-icon"
          aria-hidden="true"
        />

        <div className="alert-popup-message">{message}</div>

        <button
          type="button"
          className="alert-popup-close"
          aria-label="Fechar alerta"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Alert;