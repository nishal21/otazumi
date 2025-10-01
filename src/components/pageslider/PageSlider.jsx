import { faAngleDoubleLeft, faAngleDoubleRight, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function PageSlider({ page, totalPages, handlePageChange, start = false, style }) {
    const renderPageNumbers = () => {
        const pages = [];
        if (totalPages === 1) return null;
        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (page === 1) {
                pages.push(1, 2, 3);
            } else if (page === 2) {
                pages.push(1, 2, 3, 4);
            } else if (page === totalPages) {
                pages.push(totalPages - 2, totalPages - 1, totalPages);
            } else if (page === totalPages - 1) {
                pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(page - 2, page - 1, page, page + 1, page + 2);
            }
        }
        return pages.map((p) => (
            <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-9 h-9 mx-1 flex justify-center items-center rounded-lg text-sm font-medium transition-all duration-300 ${
                    page === p 
                    ? 'bg-zinc-100 text-zinc-900 cursor-default' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
            >
                {p}
            </button>
        ));
    };

    return (
        <div 
            className={`w-full flex ${start ? "justify-start" : "justify-center"} items-center overflow-hidden`} 
            style={style}
        >
            <div className="flex justify-center items-center w-fit">
                {page > 1 && totalPages > 2 && (
                    <button
                        onClick={() => handlePageChange(1)}
                        className="w-9 h-9 mx-1 flex justify-center items-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-xs" />
                    </button>
                )}
                {page > 1 && (
                    <button
                        onClick={() => { if (page > 0) handlePageChange(page - 1) }}
                        className="w-9 h-9 mx-1 flex justify-center items-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    </button>
                )}
                {renderPageNumbers()}
                {page < totalPages && (
                    <button
                        onClick={() => { if (page < totalPages) handlePageChange(page + 1) }}
                        className="w-9 h-9 mx-1 flex justify-center items-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                    </button>
                )}
                {page < totalPages && totalPages > 2 && (
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        className="w-9 h-9 mx-1 flex justify-center items-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faAngleDoubleRight} className="text-xs" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default PageSlider;