import "./Skeleton.css";

interface SkeletonCardProps {
    quantidade?: number;
}

export function SkeletonCard({ quantidade = 6 }: SkeletonCardProps) {
    return (
        <>
            {Array.from({ length: quantidade }).map((_, index) => (
                <article key={index} className="skeletonCard">
                    <div className="skeletonBox skeletonImagem" />
                    <div className="skeletonContent">
                        <div className="skeletonBox skeletonTitulo" />
                        <div className="skeletonBox skeletonTextoLongo" />
                        <div className="skeletonBox skeletonTextoCurto" />
                        <div className="skeletonBotoes">
                            <div className="skeletonBox skeletonBotao" />
                            <div className="skeletonBox skeletonBotao" />
                        </div>
                    </div>
                </article>
            ))}
        </>
    );
}