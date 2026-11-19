import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    adicionarListener
} from "../services/loadingService";

interface LoadingContextType {
    carregando: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(
    undefined
);

export function LoadingProvider({
    children
}: {
    children: React.ReactNode
}) {

    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        const removerListener = adicionarListener(setCarregando);

        return removerListener;
    }, []);

    return (
        <LoadingContext.Provider value={{ carregando }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);

    if (!context) {
        throw new Error(
            "useLoading deve ser usado dentro de LoadingProvider"
        );
    }

    return context;
}
