import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import { faPagelines } from '@fortawesome/free-brands-svg-icons';
import { HeaderVideo } from '../../components/HeaderVideo/HeaderVideo';

import { CardBlog } from '../../components/CardBlog/CardBlog';

import { listarPublicacoes } from '../../../services/blogService';
import type { Cidade, CursorPublicacao } from '../../../types';
import blogImg from '../../media/blogHeader.webp';
import userImg from '../../media/user.webp';
import './BlogPage.css';
import { listarCidadesAtivas } from '../../../services/cidadeService';
import { queryKeys } from '../../../services/queryKeys';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const BlogPage = () => {
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [minhasPublicacoes, setMinhasPublicacoes] = useState(false);

  const { data: cidades = [] } = useQuery<Cidade[]>({
    queryKey: queryKeys.cidades.ativas,
    queryFn: listarCidadesAtivas,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data,
    isLoading: loading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.publicacoes.infinitas({
      cidadeFiltro,
      minhasPublicacoes,
    }),
    initialPageParam: null as CursorPublicacao | null,
    queryFn: ({ pageParam, signal }) =>
      listarPublicacoes(
        10,
        pageParam,
        cidadeFiltro,
        minhasPublicacoes,
        signal,
      ),
    getNextPageParam: (ultimaPagina) =>
      ultimaPagina.hasMore
        ? ultimaPagina.nextCursor
        : undefined,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const publicacoes = data?.pages.flatMap((pagina) => pagina.items) ?? [];

  return (
    <div className="blogPage">
      {/* Fixo na tela: não acompanha a rolagem. */}
      <div className="blogHero">
        <HeaderVideo
          imgSrc={blogImg}
          title="Blog da Comunidade"
          icon={
            <FontAwesomeIcon
              icon={faPagelines}
              style={{ color: '#739d1e' }}
            />
          }
        />
      </div>
      {/* Reserva a altura do header no fluxo da página. */}
      <div className="blogHeroSpacer" aria-hidden="true" />
      {/* Rola normalmente sobre o header. */}
      <div className="blogContent">
        <div className="blogShell">
          <header className="blogIntro">
            <div>
              <span className="blogEyebrow"><FontAwesomeIcon icon={faLeaf} /> NOSSA COMUNIDADE</span>
              <h2>Pequenos plantios.<br /><em>Grandes histórias.</em></h2>
            </div>
            <p>Cada árvore tem uma história. Acompanhe quem está deixando nossa cidade mais verde.</p>
          </header>
          <div className="blogLayout">
            <div className="blogFeed">
              <div className="blogToolbar">
                <div className="blogFeedTitle"><span className="blogLiveDot" aria-hidden="true" /><h3>Histórias da comunidade</h3></div>
                <div className="blogFilters">
                  <label className="blogCityFilter" htmlFor="blogCidade">
                    <span>Cidade</span>
                    <select id="blogCidade" value={cidadeFiltro} onChange={(e) => setCidadeFiltro(e.target.value)}>
                      <option value="">Todas as cidades</option>
                      {cidades.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                    </select>
                  </label>
                  <label className="blogMyPosts" htmlFor="myPubli">
                    <input type="checkbox" className="myPubli" id="myPubli" checked={minhasPublicacoes} onChange={(e) => setMinhasPublicacoes(e.target.checked)} />
                    <span>Minhas publicações</span>
                  </label>
                </div>
              </div>
              <section className="publication" aria-label="Publicações da comunidade" aria-busy={loading || loadingMore}>

                {publicacoes.map((publicacao) => (
                  <CardBlog
                    key={publicacao.id}
                    imageUrl={
                      publicacao.requisicao?.fotoPlantioUrl ?? ''
                    }
                    perfilImg={userImg}
                    title={publicacao.titulo}
                    message={publicacao.descricao}
                    nome={
                      publicacao.requisicao?.nomeBeneficiario ?? ''
                    }
                    date={new Date(
                      publicacao.criadoEm,
                    ).toLocaleString('pt-BR')}
                  />
                ))}
                {loading && (
                  <p className="blogStatus" role="status">
                    Carregando publicações...
                  </p>
                )}
                {isError && (
                  <div className="blogFeedback" role="alert">
                    <p>
                      {error instanceof Error
                        ? error.message
                        : 'Não foi possível carregar as publicações.'}
                    </p>

                    <button
                      className="blogLoadMore"
                      type="button"
                      onClick={() => refetch()}
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
                {!loading && !error && publicacoes.length === 0 && (
                  <p className="blogStatus">
                    Nenhuma publicação encontrada.
                  </p>
                )}
                {hasNextPage && !loading && (
                  <div className="blogActions">
                    <button
                      className="blogLoadMore"
                      type="button"
                      onClick={() => fetchNextPage()}
                      disabled={loadingMore}
                    >
                      {loadingMore ? 'Carregando...' : 'Carregar mais'}
                    </button>
                  </div>
                )}
                {(!hasNextPage && !loading && publicacoes.length !== 0) && (
                  <p className="blogStatus">
                    Você chegou ao fim das publicações.
                  </p>
                )}
              </section>
            </div>
            <aside className="blogSidebar" aria-label="Sobre a comunidade">
              <section className="blogAbout">
                <span className="blogAsideIcon"><FontAwesomeIcon icon={faLeaf} /></span>
                <span className="blogEyebrow">RAÍZES QUE CONECTAM</span>
                <h3>Uma cidade mais verde começa com a gente.</h3>
                <p>Um espaço para compartilhar fotos, experiências e o cuidado com as árvores da nossa cidade.</p>
                <div className="blogAboutFooter"><span aria-hidden="true">↗</span> Cada muda faz parte dessa mudança.</div>
              </section>
              <section className="blogNote">
                <span className="blogEyebrow">DEPOIS DO PLANTIO</span>
                <h3>A história continua.</h3>
                <p>Observe o crescimento da sua árvore e registre novas fotos. Os pequenos detalhes também merecem ser compartilhados.</p>
                <div className="blogNoteSignature">Cultivar também é acompanhar.</div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BlogPage;
