import { lazy, Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClipboardList,
    faTree,
    faUsers,
    faShieldHalved,
    faChartPie,
    faGear,
    faLocationDot
} from "@fortawesome/free-solid-svg-icons";
import { SectionContent } from "../../components/SectionContent/SectionContent";
import "./Gestao.css";
import { obterUsuarioLogado } from "../../../services/authService";
import { type Usuario } from "../../../types";
import { SkeletonCard } from "../../components/Skeletons/SkeletonCard";
import { SkeletonTable } from "../../components/Skeletons/SkeletonTable";

const AbaRequisicoes = lazy(() =>
    import("./abas/Requisicao/AbaRequisicao").then(m => ({
        default: m.AbaRequisicoes
    }))
);

const AbaArvores = lazy(() =>
    import("./abas/Arvores/AbaArvores").then(m => ({
        default: m.AbaArvores
    }))
);

const AbaConfig = lazy(() =>
    import("./abas/ConfigAdmin/AbaConfig").then(m => ({
        default: m.AbaConfig
    }))
);

const AbaUsuarios = lazy(() =>
    import("./abas/Usuarios/AbaUsuarios").then(m => ({
        default: m.AbaUsuarios
    }))
);

const AbaRelatorio = lazy(() =>
    import("./abas/Relatorio/AbaRelatorio").then(m => ({
        default: m.AbaRelatorio
    }))
);

const AbaEnderecos = lazy(() =>
    import("./abas/Enderecos/AbaEnderecos").then(m => ({
        default: m.AbaEnderecos
    }))
);

// Definição das abas disponíveis
export type AbaGestao = "requisicoes" | "arvores" | "endereco" | "usuarios" | "relatorios" | "configAdmin";

interface TabItem {
    id: AbaGestao;
    label: string;
    icon: typeof faClipboardList;
}

const TABS: TabItem[] = [
    {
        id: "requisicoes",
        label: "Requisições",
        icon: faClipboardList
    },
    {
        id: "arvores",
        label: "Árvores / Espécies",
        icon: faTree
    },
    {
        id: "relatorios",
        label: "Relatórios",
        icon: faChartPie
    },
    {
        id: "endereco",
        label: "Endereços",
        icon: faLocationDot
    },
    {
        id: "usuarios",
        label: "Usuários",
        icon: faUsers
    },
    {
        id: "configAdmin",
        label: "Config. Administrador",
        icon: faGear
    }
];

function AbaSkeleton({ aba }: { aba: AbaGestao }) {
    if (aba === "arvores") {
        return <SkeletonCard quantidade={6} />;
    }

    return <SkeletonTable linhas={5} />;
}

export function Gestao() {
    // Estado para armazenar qual aba está ativa no momento
    const [abaAtiva, setAbaAtiva] = useState<AbaGestao>("requisicoes");
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const dadosUsuario = await obterUsuarioLogado();
            setUsuario(dadosUsuario.usuario);

        } catch (error) {
            console.log("Erro ao carregar dados: ", error);
        }
    }

    useEffect(() => {
        if (usuario?.role !== "GLOBAL" && abaAtiva === "configAdmin") {
            setAbaAtiva("requisicoes");
        }
    }, [usuario, abaAtiva]);

    return (
        <SectionContent className="sectionGestao">
            <div className="gestaoContainer">

                {/* Cabeçalho do Painel */}
                <header className="gestaoHeader">
                    <div className="gestaoTitulo">
                        <div className="gestaoIconeHeader">
                            <FontAwesomeIcon icon={faShieldHalved} />
                        </div>
                        <div>
                            <h2>Painel de Gestão</h2>
                            <p>Gerencie as solicitações, o catálogo de mudas e o acesso dos usuários.</p>
                        </div>
                    </div>

                    {/* MENU DE 5 ABAS NO TOPO */}
                    <nav className="gestaoAbasNav" aria-label="Abas de Gestão">
                        {TABS.filter((tab) => {
                            if (tab.id === 'configAdmin') {
                                return usuario?.role === 'GLOBAL';
                            }

                            if (tab.id === 'usuarios') {
                                return usuario?.role === 'GLOBAL' || usuario?.role === 'ADMIN_LOCAL';
                            }

                            return true;
                        })
                            .map((tab) => {
                                const isActive = abaAtiva === tab.id;
                                return (

                                    <button
                                        key={tab.id}
                                        type="button"
                                        className={`gestaoAbaBtn ${isActive ? "active" : ""}`}
                                        onClick={() => setAbaAtiva(tab.id)}
                                        aria-selected={isActive}
                                        role="tab"
                                    >
                                        <FontAwesomeIcon icon={tab.icon} className="gestaoAbaIcone" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                    </nav>
                </header>

                {/* CONTEÚDO DAS ABAS */}
                <main className="gestaoConteudoArea">
                    <Suspense fallback={<AbaSkeleton aba={abaAtiva} />}>
                        {/* Aba 1: Solicitações */}
                        {abaAtiva === "requisicoes" && (
                            <section className="gestaoAbaCard" role="tabpanel">
                                <div className="cardHeaderAba">
                                    <h3>Gerenciar Requisições de Plantio</h3>
                                </div>
                                <AbaRequisicoes />
                            </section>
                        )}

                        {/* Aba 2: Árvores / Espécies */}
                        {abaAtiva === "arvores" && (
                            <section className="gestaoAbaCard" role="tabpanel">
                                <div className="cardHeaderAba">
                                    <h3>Catálogo de Árvores e Mudas</h3>
                                </div>
                                <AbaArvores />
                            </section>
                        )}

                        {/* Aba 3: Relatórios */}
                        {abaAtiva === "relatorios" && (
                            <section className="gestaoAbaCard" role="tabpanel">
                                <div className="cardHeaderAba">
                                    <h3>Relatórios</h3>
                                </div>
                                <AbaRelatorio />
                            </section>
                        )}

                        {/* Aba 4: Endereços */}
                        {(usuario?.role === 'GLOBAL' || usuario?.role === 'ADMIN_LOCAL') && abaAtiva === "endereco" && (
                            <section className="gestaoAbaCard" role="tabpanel">
                                <div className="cardHeaderAba">
                                    <h3>Endereços para retirada de mudas</h3>
                                </div>
                                <AbaEnderecos />
                            </section>
                        )}

                        {/* Aba 5: Usuários e Cidades */}
                        {(usuario?.role === 'GLOBAL' || usuario?.role === 'ADMIN_LOCAL') && abaAtiva === "usuarios" && (
                            <section className="gestaoAbaCard" role="tabpanel">
                                <div className="cardHeaderAba">
                                    <h3>Gestão de Usuários e Permissões</h3>
                                </div>
                                <AbaUsuarios />
                            </section>
                        )}

                        {/* Aba 6: Configurações Admin */}
                        {usuario?.role === 'GLOBAL' && abaAtiva === "configAdmin" && (
                            <section className="gestaoAbaCard" role="tabpanel">
                                <div className="cardHeaderAba">
                                    <h3>Configurações Administrador</h3>
                                </div>
                                <AbaConfig />
                            </section>
                        )}
                    </Suspense>
                </main>

            </div>
        </SectionContent>
    );
}

export default Gestao;
