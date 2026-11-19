type LoadingListener = (carregando: boolean) => void;

const listeners = new Set<LoadingListener>();

let requisicoesAtivas = 0;

export function iniciarLoading() {
    requisicoesAtivas++;

    listeners.forEach(listener => {
        listener(true);
    });
}

export function finalizarLoading() {
    requisicoesAtivas = Math.max(0, requisicoesAtivas - 1);

    if (requisicoesAtivas === 0) {
        listeners.forEach(listener => {
            listener(false);
        });
    }
}

export function adicionarListener(listener: LoadingListener) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}
