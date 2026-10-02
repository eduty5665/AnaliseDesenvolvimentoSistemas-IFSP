import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'
import { useEffect, useRef, useState } from 'react'
import { API_URL, lerSessao } from '../api/cliente'
import type { EventoPainel } from '../api/tipos'

export type EstadoConexao = 'conectando' | 'ao-vivo' | 'reconectando' | 'offline'

/** Conecta ao hub /hubs/painel (SignalR) e entrega cada evento publicado pela API. */
export function useAoVivo(aoReceber: (e: EventoPainel) => void) {
  const [estado, setEstado] = useState<EstadoConexao>('conectando')
  const callback = useRef(aoReceber)
  callback.current = aoReceber

  useEffect(() => {
    let conexao: HubConnection | null = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/painel`, { accessTokenFactory: () => lerSessao('admin')?.token ?? '' })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build()

    conexao.on('evento', (e: EventoPainel) => callback.current(e))
    conexao.onreconnecting(() => setEstado('reconectando'))
    conexao.onreconnected(() => setEstado('ao-vivo'))
    conexao.onclose(() => setEstado('offline'))

    conexao
      .start()
      .then(() => setEstado('ao-vivo'))
      .catch(() => setEstado('offline'))

    return () => {
      const c = conexao
      conexao = null
      if (c && c.state !== HubConnectionState.Disconnected) void c.stop()
    }
  }, [])

  return estado
}
