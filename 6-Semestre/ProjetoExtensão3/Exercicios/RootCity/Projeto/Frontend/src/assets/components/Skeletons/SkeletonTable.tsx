import "./Skeleton.css";

interface SkeletonTableProps {
    linhas?: number;
}

export function SkeletonTable({ linhas = 5 }: SkeletonTableProps) {
    return (
        <div className="skeletonTableContainer p-1">
            {Array.from({ length: linhas }).map((_, index) => (
                <div key={index} className="skeletonBox skeletonTableRow" />
            ))}
        </div>
    );
}