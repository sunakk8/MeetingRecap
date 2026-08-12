import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ProcessStage } from '../types'

const STEPS: { id: ProcessStage; label: string }[] = [
  { id: 'uploading', label: 'Uploading' },
  { id: 'transcribing', label: 'Transcribing' },
  { id: 'summarizing', label: 'Summarizing' },
  { id: 'complete', label: 'Ready' },
]

function stepIndex(stage: ProcessStage): number {
  return STEPS.findIndex((s) => s.id === stage)
}

type ProcessingStatusProps = {
  stage: ProcessStage
  statusMessage: string
  fileName: string
}

export function ProcessingStatus({ stage, statusMessage, fileName }: ProcessingStatusProps) {
  const current = stepIndex(stage)

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-20">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Creating your recap</h1>
        <p className="mt-2 truncate text-sm text-ink-muted" title={fileName}>
          {fileName}
        </p>
      </div>

      <ol className="space-y-4" aria-label="Processing steps">
        {STEPS.map((step, index) => {
          const done = index < current || stage === 'complete'
          const active = index === current && stage !== 'complete'
          return (
            <li
              key={step.id}
              className={[
                'flex items-center gap-4 rounded-xl border px-4 py-3 transition',
                active
                  ? 'border-accent/40 bg-accent-soft/70'
                  : done
                    ? 'border-border bg-surface-elevated'
                    : 'border-transparent bg-transparent opacity-50',
              ].join(' ')}
            >
              <span
                className={[
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  done
                    ? 'bg-accent text-white'
                    : active
                      ? 'bg-accent text-white'
                      : 'bg-border text-ink-subtle',
                ].join(' ')}
                aria-hidden
              >
                {done && !active ? <Check className="size-4" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{step.label}</p>
                {active ? (
                  <p className="text-xs text-ink-muted" aria-live="polite">
                    {statusMessage}
                  </p>
                ) : null}
              </div>
              {active ? (
                <span
                  className="size-4 shrink-0 animate-spin rounded-full border-2 border-accent/30 border-t-accent"
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuetext={statusMessage}
        aria-label="Processing progress"
      >
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={false}
          animate={{
            width: `${Math.min(100, ((current + (stage === 'complete' ? 1 : 0.45)) / STEPS.length) * 100)}%`,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>
    </section>
  )
}
