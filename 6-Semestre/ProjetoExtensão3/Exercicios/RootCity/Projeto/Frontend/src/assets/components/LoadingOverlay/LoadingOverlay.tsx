import { useLoading } from "../../../contexts/LoadingContext";
import { createPortal } from "react-dom";
import "./LoadingOverlay.css";

export function LoadingOverlay() {
    const { carregando } = useLoading();

    if (!carregando) {
        return null;
    }

    return createPortal(
        <div className="loadingOverlay">
            <div className="loadingBox">
                <div className="spinner"></div>
                <span>Carregando...</span>
            </div>
        </div>,
        document.body
    );
}
