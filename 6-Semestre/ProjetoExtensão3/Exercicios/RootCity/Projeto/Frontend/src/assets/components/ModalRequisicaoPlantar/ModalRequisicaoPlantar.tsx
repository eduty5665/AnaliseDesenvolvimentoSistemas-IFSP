import ModalForm from "../ModalForm/ModalForm";
import type { Requisicao } from "../../../types";

import "../ModalRequisicao/ModalRequisicao.css";
import { formatarData, formatarStatus } from "../../../utils/formatadores";
import { SkeletonTable } from "../Skeletons/SkeletonTable";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarMinhasRequisicoes } from "../../../services/requisicaoService";

interface ModalRequisicaoProps {
    aberto: boolean;
    fechar: () => void;
    onSelecionar?: (requisicao: Requisicao) => void;
}

export default function ModalRequisicaoPlantar({
    aberto,
    fechar,
    onSelecionar
}: ModalRequisicaoProps) {

    const formatDate = (date: Date) => {
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const dia = String(date.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    };

    const hoje = new Date();

    const umMesAtras = new Date();
    umMesAtras.setMonth(hoje.getMonth() - 1);

    const [dataInicio, setDataInicio] = useState(formatDate(umMesAtras));
    const [dataFim, setDataFim] = useState(formatDate(hoje));

    const [dataInicioFiltrada, setDataInicioFiltrada] = useState(
        formatDate(umMesAtras)
    );

    const [dataFimFiltrada, setDataFimFiltrada] = useState(
        formatDate(hoje)
    );

    const mostrarBotaoFiltrar =
        dataInicio !== dataInicioFiltrada ||
        dataFim !== dataFimFiltrada;

    const {
        data: requisicoes = [],
        isFetching: carregando,
    } = useQuery<Requisicao[]>({
        queryKey: [
            "requisicoes",
            "minhas",
            dataInicioFiltrada,
            dataFimFiltrada,
        ],
        queryFn: () =>
            listarMinhasRequisicoes(
                dataInicioFiltrada,
                dataFimFiltrada
            ),
        enabled: aberto,
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 30 * 60 * 1000,   // 30 minutos
        refetchOnWindowFocus: false,
    });

    const handleFiltrar = () => {
        if (
            !dataInicio ||
            !dataFim ||
            dataInicio > dataFim
        ) {
            return;
        }

        setDataInicioFiltrada(dataInicio);
        setDataFimFiltrada(dataFim);
    };

    return (
        <ModalForm
            aberto={aberto}
            fechar={fechar}
            titulo="Minhas requisições"
            descricao="Acompanhe suas solicitações de plantio."
        >
            <div className="modalRequisicao">
                <div className="d-flex flex-row gap-2">

                    <div className="d-flex flex-column datas">
                        <span>Data inicial</span>
                        <input className="dataInicial " type="date" value={dataInicio} onChange={(e) => {
                            const novaData = e.target.value;
                            setDataInicio(novaData);
                        }} />
                    </div>

                    <div className="d-flex flex-column">
                        <span>Data final</span>
                        <input className="dataFinal " type="date" value={dataFim} onChange={(e) => {
                            const novaData = e.target.value;
                            setDataFim(novaData);
                        }} />
                    </div>

                    {mostrarBotaoFiltrar && (
                        <button
                            type="button"
                            className="btnGestaoGlobal align-self-end"
                            onClick={handleFiltrar}
                            disabled={
                                !dataInicio ||
                                !dataFim ||
                                dataInicio > dataFim
                            }
                        >
                            Filtrar
                        </button>
                    )}
                </div>

                <section className="secaoRequisicao">

                    <div className="listaResultado">
                        {carregando ? (
                            <SkeletonTable linhas={4} />
                        ) : (
                            <table className="table tableRequisicao">

                                <thead>
                                    <tr>
                                        <th scope="col">Nome</th>
                                        <th scope="col">Árvore</th>
                                        <th scope="col">Data</th>
                                        <th scope="col">Status</th>
                                        <th
                                            scope="col"
                                            className="text-center"
                                        >
                                            Ações
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {requisicoes.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="mensagemVazio"
                                            >
                                                Você ainda não possui
                                                requisições.
                                            </td>
                                        </tr>
                                    ) : (

                                        requisicoes.map((item) => (

                                            <tr key={item.id}>

                                                <td>
                                                    <strong>
                                                        {item.nomeBeneficiario ||
                                                            "Não informado"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {item.arvore?.nomePopular ||
                                                            "Não informado"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {formatarData(item.criadoEm)}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`statusTag ${item.status.toLowerCase()}`}
                                                    >
                                                        {formatarStatus(
                                                            item.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="text-center">

                                                    <button
                                                        type="button"
                                                        className="btnVerificar"
                                                        onClick={() =>
                                                            onSelecionar?.(item)
                                                        }
                                                    >
                                                        Ver detalhes
                                                    </button>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>
                            </table>
                        )}
                    </div>

                </section>

            </div>
        </ModalForm>
    );
}
