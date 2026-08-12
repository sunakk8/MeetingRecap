import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LoaderCircle, Send } from 'lucide-react'
import type { ChatMessage } from '../types'
import { AlertBanner } from './AlertBanner'

const PROMPTS = [
  'What were the action items?',
  'Summarize the key decisions.',
  'Who said what that matters?',
]

type ChatPanelProps = {
  messages: ChatMessage[]
  busy: boolean
  error: string | null
  onClearError: () => void
  onSend: (message: string) => Promise<void>
}

export function ChatPanel({ messages, busy, error, onClearError, onSend }: ChatPanelProps) {
  const inputId = useId()
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, busy])

  const submit = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setDraft('')
    await onSend(trimmed)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void submit(draft)
  }

  return (
    <section
      aria-labelledby="chat-heading"
      className="flex h-full min-h-[24rem] flex-col rounded-2xl border border-border bg-surface-elevated"
    >
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2 id="chat-heading" className="font-display text-xl font-bold tracking-tight text-ink">
          Ask about this recording
        </h2>
        <p className="mt-1 text-sm text-ink-subtle">Answers stay grounded in the transcript.</p>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        {messages.length === 0 && !busy ? (
          <div className="flex h-full flex-col justify-center gap-4 py-6">
            <p className="text-sm text-ink-muted">Try a follow-up question:</p>
            <div className="flex flex-col gap-2">
              {PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={busy}
                  onClick={() => void submit(prompt)}
                  className="rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-sm text-ink transition hover:border-accent/40 hover:bg-accent-soft/40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={[
                  'max-w-[95%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'ml-auto bg-accent text-white'
                    : 'mr-auto bg-surface text-ink border border-border',
                ].join(' ')}
              >
                {msg.content}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {busy ? (
          <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink-muted">
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Thinking…
          </div>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-border px-4 py-3 sm:px-5">
        {error ? <AlertBanner message={error} onDismiss={onClearError} /> : null}
        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <label htmlFor={inputId} className="sr-only">
            Ask a question about the transcript
          </label>
          <textarea
            id={inputId}
            rows={2}
            value={draft}
            disabled={busy}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void submit(draft)
              }
            }}
            placeholder="Ask a question…"
            className="min-h-11 flex-1 resize-y rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label="Send message"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-border-strong"
          >
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      </div>
    </section>
  )
}
