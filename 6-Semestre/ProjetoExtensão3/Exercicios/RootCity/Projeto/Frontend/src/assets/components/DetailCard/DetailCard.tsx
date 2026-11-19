import './DetailCard.css';

interface DetailCardProps {
    cardImg: string,
    title: string,
    description: string,
    className?: string
}

export const DetailCard = ({ cardImg, title, description, className }: DetailCardProps) => {
    const stylePerfilImg: React.CSSProperties = {
        backgroundImage: `url(${cardImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '50px',
        height: '50px',
    };

    return (
        <>
            <div className={`detailCard ${className || ''}`}>
                <div className='cardImg' style={stylePerfilImg} />
                <div className="details">
                    <p className='m-0'>{title}</p>
                    <span className='m-0'>{description}</span>
                </div>
            </div>
        </>
    )
}