type SummaryPanelProps = {
  summary: string
}

export function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <section aria-labelledby="summary-heading" className="space-y-4">
      <h2 id="summary-heading" className="font-display text-2xl font-bold tracking-tight text-ink">
        Summary
      </h2>
      <div className="whitespace-pre-wrap text-base leading-7 text-ink-muted">{summary}</div>
    </section>
  )
}
