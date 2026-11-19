import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { NavLink, useLocation } from "react-router-dom";

import "./Menu.css";
import { useAuth } from "../../../contexts/AuthContext";
import { podeAcessarGestao } from "../../../utils/permissoes";
import { useState } from "react";
import { ModalConfirm } from "../ModalConfirm/ModalConfirm";

export function Menu() {
  const { hash, pathname } = useLocation();
  const { usuario, logout } = useAuth();

  // Estado para controlar a abertura do modal
  const [mostrarModalLogout, setMostrarModalLogout] = useState(false);

  async function handleConfirmarLogout() {
    setMostrarModalLogout(false);
    await logout();
  }

  const menuLinkClass = (isActive: boolean, additionalClass = "") =>
    `nav-link natureLink ${additionalClass} ${isActive ? "active" : ""}`.trim();

  return (
    <>
      <nav className="navbar navbar-expand-md natureNavbar">
        <div className="container-fluid">

          {/* Botão hamburger no mobile */}
          <button
            className="navbar-toggler natureToggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Abrir menu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Links */}
          <div
            className="collapse navbar-collapse"
            id="navbarContent"
          >
            <ul className="navbar-nav ms-auto align-items-md-center gap-md-2">

              {/* Home */}
              <li className="nav-item">
                <NavLink
                  className={() => menuLinkClass(pathname === "/" && !hash, "homeLink")}
                  to="/"
                  aria-label="Home"
                >
                  <FontAwesomeIcon icon={faHouse} />
                </NavLink>
              </li>

              {/* Blog */}
              <li className="nav-item">
                <NavLink className={({ isActive }) => menuLinkClass(isActive)} to="/blog">
                  Blog
                </NavLink>
              </li>

              {/* Sobre */}
              <li className="nav-item">
                <NavLink
                  className={() => menuLinkClass(pathname === "/" && hash === "#nossoObjetivo")}
                  to="/#nossoObjetivo"
                >
                  Sobre
                </NavLink>
              </li>

              {/* Plantar */}
              <li className="nav-item">
                <NavLink className={({ isActive }) => menuLinkClass(isActive)} to="/plantar">
                  Plantar
                </NavLink>
              </li>

              {/* Gestão: Renderiza APENAS se for FUNCIONARIO, ADMIN_LOCAL ou GLOBAL */}
              {podeAcessarGestao(usuario) && (
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => menuLinkClass(isActive)}
                    to="/gestao"
                  >
                    Gestão
                  </NavLink>
                </li>
              )}

              {/* Login ou Sair */}
              <li className="nav-item">
                {usuario ? (
                  <button
                    type="button"
                    className="nav-link natureLink natureLogin"
                    onClick={() => setMostrarModalLogout(true)}
                  >
                    Sair
                  </button>
                ) : (
                  <NavLink
                    className={({ isActive }) => menuLinkClass(isActive, "natureLogin")}
                    to="/login"
                  >
                    Login
                  </NavLink>
                )}
              </li>

            </ul>
          </div>

        </div>
      </nav>

      <ModalConfirm
        isOpen={mostrarModalLogout}
        titulo="Encerrar sesão"
        mensagem="Tem certeza que deseja realizar logout?"
        onConfirmar={handleConfirmarLogout}
        onCancelar={() => setMostrarModalLogout(false)}
      />
    </>
  );
}
