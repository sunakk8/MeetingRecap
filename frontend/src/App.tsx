import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sendChat, uploadFile } from './api/client'
import { AppHeader } from './components/AppHeader'
import { AlertBanner } from './components/AlertBanner'
import { AudioPlayer } from './components/AudioPlayer'
import { ChatPanel } from './components/ChatPanel'
import { ProcessingStatus } from './components/ProcessingStatus'
import { SummaryPanel } from './components/SummaryPanel'
import { TranscriptList } from './components/TranscriptList'
import { UploadDropzone } from './components/UploadDropzone'
import { useAudioSync } from './hooks/useAudioSync'
import { useSocketStatus } from './hooks/useSocketStatus'
import type { AppPhase, ChatMessage, TranscriptSegment } from './types'

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [summary, setSummary] = useState('')
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [chatBusy, setChatBusy] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  const { statusMessage, stage, setStage, setStatusMessage } = useSocketStatus(
    phase === 'processing',
  )
  const { activeIndex, seekTo } = useAudioSync(audioRef, segments)

  const revokeAudio = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => revokeAudio()
  }, [revokeAudio])

  const resetWorkspace = () => {
    revokeAudio()
    setPhase('idle')
    setFileName(null)
    setAudioUrl(null)
    setSummary('')
    setSegments([])
    setMessages([])
    setUploadError(null)
    setChatError(null)
    setChatBusy(false)
    setStage('uploading')
    setStatusMessage('Waiting…')
  }

  const handleUpload = async (file: File) => {
    setUploadError(null)
    setChatError(null)
    setMessages([])
    setSummary('')
    setSegments([])
    setFileName(file.name)
    setPhase('processing')
    setStage('uploading')
    setStatusMessage('Uploading…')

    revokeAudio()
    const url = URL.createObjectURL(file)
    audioUrlRef.current = url
    setAudioUrl(url)

    try {
      const result = await uploadFile(file)
      setSummary(result.summary)
      setSegments(result.transcript)
      setStage('complete')
      setStatusMessage('Summarization Complete')
      setPhase('ready')
    } catch (err) {
      revokeAudio()
      setAudioUrl(null)
      setFileName(null)
      setPhase('idle')
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const handleSend = async (content: string) => {
    setChatError(null)
    const userMsg: ChatMessage = { id: newId(), role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setChatBusy(true)
    try {
      const reply = await sendChat(content)
      setMessages((prev) => [...prev, { id: newId(), role: 'assistant', content: reply }])
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Failed to get a reply')
    } finally {
      setChatBusy(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        showNewFile={phase === 'ready' || phase === 'processing'}
        onNewFile={resetWorkspace}
        fileName={fileName}
      />

      <AnimatePresence mode="wait">
        {phase === 'idle' ? (
          <motion.main
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mx-auto max-w-xl px-4 pt-4">
              {uploadError ? (
                <AlertBanner message={uploadError} onDismiss={() => setUploadError(null)} />
              ) : null}
            </div>
            <UploadDropzone onSubmit={(file) => void handleUpload(file)} />
          </motion.main>
        ) : null}

        {phase === 'processing' && fileName ? (
          <motion.main
            key="processing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ProcessingStatus
              stage={stage}
              statusMessage={statusMessage}
              fileName={fileName}
            />
          </motion.main>
        ) : null}

        {phase === 'ready' && audioUrl && fileName ? (
          <motion.main
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pb-16"
          >
            <div className="sticky top-14 z-10">
              <AudioPlayer ref={audioRef} src={audioUrl} fileName={fileName} />
            </div>

            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)] lg:gap-10 sm:px-6">
              <div className="space-y-10">
                <SummaryPanel summary={summary} />
                <TranscriptList
                  segments={segments}
                  activeIndex={activeIndex}
                  onSeek={seekTo}
                />
              </div>
              <div className="lg:sticky lg:top-36 lg:self-start">
                <ChatPanel
                  messages={messages}
                  busy={chatBusy}
                  error={chatError}
                  onClearError={() => setChatError(null)}
                  onSend={handleSend}
                />
              </div>
            </div>
          </motion.main>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
