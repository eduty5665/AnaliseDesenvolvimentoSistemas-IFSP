import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './Pagination.css';

function Pagination() {
    return (
        <div className="d-flex align-items-center gap-4 pagination">
            <button
                type="button"
                className="btnPagination flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                aria-label="Página anterior"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <span className="text-sm font-medium text-gray-700">
                Página 1
            </span>

            <button
                type="button"
                className="btnPagination flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                aria-label="Próxima página"
            >
                <FontAwesomeIcon icon={faArrowRight} />
            </button>
        </div>
    );
}

export default Pagination;
