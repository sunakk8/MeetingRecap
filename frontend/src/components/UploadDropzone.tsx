import { useCallback, useId, useRef, useState, type DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AudioLines, FileAudio, Upload, X } from 'lucide-react'
import { formatFileSize, validateAudioFile } from '../api/client'
import { AlertBanner } from './AlertBanner'

type UploadDropzoneProps = {
  onSubmit: (file: File) => void
  disabled?: boolean
}

export function UploadDropzone({ onSubmit, disabled = false }: UploadDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyFile = useCallback((next: File | null) => {
    if (!next) {
      setFile(null)
      return
    }
    const validationError = validateAudioFile(next)
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }
    setError(null)
    setFile(next)
  }, [])

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    if (disabled) return
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) applyFile(dropped)
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-16 sm:py-24">
      <div className="text-center">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-accent-ink">
          <AudioLines className="size-4" aria-hidden />
          Local Whisper + Ollama
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          MeetingRecap
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">
          Upload audio. Get a transcript, summary, and answers.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        aria-describedby={`${inputId}-hint`}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          if (!disabled) setDragActive(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragActive(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragActive(false)
        }}
        onDrop={onDrop}
        onClick={() => {
          if (!disabled) inputRef.current?.click()
        }}
        className={[
          'relative cursor-pointer rounded-2xl border-2 border-dashed bg-surface-elevated/90 p-10 text-center transition duration-200',
          dragActive
            ? 'border-accent bg-accent-soft/60 scale-[1.01]'
            : 'border-border hover:border-accent/50 hover:bg-surface-elevated',
          disabled ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="audio/*"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
        />
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Upload className="size-6" aria-hidden />
        </div>
        <p className="text-base font-medium text-ink">
          Drag and drop audio here, or{' '}
          <span className="text-accent underline-offset-2 hover:underline">browse</span>
        </p>
        <p id={`${inputId}-hint`} className="mt-2 text-sm text-ink-subtle">
          mp3, wav, m4a, and similar · up to 100 MB
        </p>
      </div>

      <AnimatePresence>
        {file ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3"
          >
            <FileAudio className="size-5 shrink-0 text-accent" aria-hidden />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-ink">{file.name}</p>
              <p className="text-xs text-ink-subtle">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              aria-label="Remove selected file"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="rounded-md p-2 text-ink-subtle transition hover:bg-surface hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? <AlertBanner message={error} onDismiss={() => setError(null)} /> : null}

      <button
        type="button"
        disabled={!file || disabled}
        onClick={() => file && onSubmit(file)}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-ink-subtle"
      >
        Generate recap
      </button>
    </section>
  )
}
