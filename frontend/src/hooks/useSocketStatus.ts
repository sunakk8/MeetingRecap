import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { ProcessStage } from '../types'

function stageFromMessage(msg: string): ProcessStage | null {
  const lower = msg.toLowerCase()
  if (lower.includes('transcrib')) return 'transcribing'
  if (lower.includes('summariz')) return 'summarizing'
  if (lower.includes('complete')) return 'complete'
  return null
}

export function useSocketStatus(enabled: boolean) {
  const [statusMessage, setStatusMessage] = useState('Waiting…')
  const [stage, setStage] = useState<ProcessStage>('uploading')

  useEffect(() => {
    if (!enabled) return

    let socket: Socket | null = null

    try {
      socket = io({
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      })

      socket.on('status', (data: { msg?: string }) => {
        const msg = data?.msg?.trim()
        if (!msg) return
        setStatusMessage(msg)
        const next = stageFromMessage(msg)
        if (next) setStage(next)
      })

      socket.on('connect_error', () => {
        // Status is best-effort; HTTP upload still drives the main flow.
      })
    } catch {
      // Ignore socket setup failures; processing UI still works via local stage.
    }

    return () => {
      socket?.disconnect()
    }
  }, [enabled])

  return { statusMessage, stage, setStage, setStatusMessage }
}
