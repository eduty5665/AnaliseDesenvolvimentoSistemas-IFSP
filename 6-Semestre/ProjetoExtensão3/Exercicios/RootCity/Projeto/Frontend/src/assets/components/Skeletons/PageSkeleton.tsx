import "./Skeleton.css";

export function PageSkeleton() {
    return (
        <div
            className="paginaSkeletonContainer"
            role="status"
            aria-label="Carregando página"
        >
            <span className="visually-hidden">Carregando página...</span>
            <div className="paginaSkeletonHeader" aria-hidden="true">
                <div className="paginaSkeletonBlock paginaSkeletonIcon" />
                <div className="paginaSkeletonHeading">
                    <div className="paginaSkeletonBlock paginaSkeletonTitle" />
                    <div className="paginaSkeletonBlock paginaSkeletonSubtitle" />
                </div>
            </div>
            <div className="paginaSkeletonAbas" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                    <div
                        key={index}
                        className={`paginaSkeletonBlock paginaSkeletonTab paginaSkeletonTab${index + 1}`}
                    />
                ))}
            </div>
            <div className="paginaSkeletonConteudo" aria-hidden="true">
                <div className="paginaSkeletonBlock paginaSkeletonSectionTitle" />
                <div className="paginaSkeletonBlock paginaSkeletonSectionSubtitle" />
                <div className="paginaSkeletonRows">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={index}
                            className="paginaSkeletonBlock paginaSkeletonRow"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
