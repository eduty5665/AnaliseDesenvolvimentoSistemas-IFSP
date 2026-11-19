import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

interface FooterProps{
  children: ReactNode,
}

export function Footer({children}:FooterProps) {
  return (
    <footer className="footer">
      <div className="container py-5">

        <div className="row gy-4">

          {/* Marca */}
          <div className="col-lg-5">
            {children}

            <p className="footerDescription">
              Conectando pessoas e natureza para construir
              cidades mais verdes, sustentáveis e vivas.
            </p>
          </div>


          {/* Navegação */}
          <div className="col-6 col-lg-3">
            <h5 className="footerHeading">
              Navegação
            </h5>

            <ul className="footerLinks">
              <li>
                <Link to="/">Início</Link>
              </li>

              <li>
                <Link to="/blog">Blog</Link>
              </li>

              <li>
                <Link to="/#nossoObjetivo">Sobre</Link>
              </li>

              <li>
                <Link to="/login">Login</Link>
              </li>

            </ul>
          </div>


          {/* Contato */}
          <div className="col-6 col-lg-4">
            <h5 className="footerHeading">
              Faça parte
            </h5>

            <p className="footerDescription">
              Ajude a transformar nossa cidade em um
              lugar mais verde.
            </p>

            <Link to="/plantar" className="footerButton">
              Quero plantar uma árvore
            </Link>
          </div>

        </div>


        {/* Rodapé inferior */}
        <div className="footerBottom">

          <span>
            © {new Date().getFullYear()} Cidade Raiz
          </span>

        </div>

      </div>
    </footer>
  );
}
