import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { TranscriptSegment } from '../types'

type TranscriptListProps = {
  segments: TranscriptSegment[]
  activeIndex: number
  onSeek: (start: number) => void
}

export function TranscriptList({ segments, activeIndex, onSeek }: TranscriptListProps) {
  const [open, setOpen] = useState(true)
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open || activeIndex < 0) return
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIndex, open])

  return (
    <section aria-labelledby="transcript-heading" className="space-y-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="transcript-panel"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left"
      >
        <h2 id="transcript-heading" className="font-display text-2xl font-bold tracking-tight text-ink">
          Transcript
        </h2>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted">
          {open ? 'Hide' : 'Show'}
          <ChevronDown
            className={`size-4 transition ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </span>
      </button>

      {open ? (
        <ul
          id="transcript-panel"
          className="max-h-[28rem] space-y-1 overflow-y-auto pr-1"
          role="list"
        >
          {segments.map((seg, index) => {
            const active = index === activeIndex
            return (
              <li key={`${seg.start}-${index}`}>
                <button
                  ref={active ? activeRef : null}
                  type="button"
                  onClick={() => onSeek(seg.start)}
                  className={[
                    'grid w-full grid-cols-[4.5rem_1fr] gap-3 rounded-lg px-3 py-2.5 text-left transition',
                    active
                      ? 'bg-accent-soft text-accent-ink'
                      : 'hover:bg-surface text-ink-muted',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'font-mono text-xs font-medium tabular-nums',
                      active ? 'text-accent' : 'text-accent-ink/80',
                    ].join(' ')}
                  >
                    {seg.time.trim().split('-')[0] ?? seg.time}
                  </span>
                  <span className="text-sm leading-relaxed text-ink">{seg.text}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
