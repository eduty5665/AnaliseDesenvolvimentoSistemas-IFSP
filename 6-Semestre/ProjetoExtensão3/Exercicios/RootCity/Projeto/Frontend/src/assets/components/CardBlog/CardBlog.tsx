import { useState } from 'react';
import './CardBlog.css';

interface CardBlogProps {
  imageUrl: string;
  perfilImg: string;
  nome: string;
  title: string;
  message: string;
  date: string;
}

export const CardBlog = ({ imageUrl, perfilImg, nome, title, message, date }: CardBlogProps) => {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const author = nome.trim() || 'Comunidade Cidade Raiz';

  return (
    <article className="cardBlog">
      <div className="cardBlogPhoto">
        {imageUrl && failedPhoto !== imageUrl ? (
          <img src={imageUrl} alt={title || 'Registro do plantio'} loading="lazy" decoding="async" onError={() => setFailedPhoto(imageUrl)} />
        ) : (
          <div className="cardBlogPlaceholder"><span aria-hidden="true">❧</span>Registro sem foto</div>
        )}
        <span className="cardBlogBadge">Diário de plantio</span>
      </div>
      <div className="cardBlogBody">
        <div className="cardBlogAuthor">
          {perfilImg && failedAvatar !== perfilImg ? (
            <img src={perfilImg} alt="" loading="lazy" onError={() => setFailedAvatar(perfilImg)} />
          ) : <span className="cardBlogInitial" aria-hidden="true">{author.charAt(0)}</span>}
          <div><strong>{author}</strong><span>{date}</span></div>
        </div>
        <div className="cardMessage"><h3>{title}</h3><p>{message}</p></div>
        <div className="cardBlogFooter"><span className="cardBlogSeed" aria-hidden="true">❧</span> Mais uma história criando raízes</div>
      </div>
    </article>
  );
};
