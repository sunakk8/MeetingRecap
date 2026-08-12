type AppHeaderProps = {
  showNewFile?: boolean
  onNewFile?: () => void
  fileName?: string | null
}

export function AppHeader({ showNewFile = false, onNewFile, fileName }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-surface-elevated/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-baseline gap-3">
          <a href="/" className="font-display text-lg font-bold tracking-tight text-ink no-underline">
            MeetingRecap
          </a>
          {fileName ? (
            <span className="hidden truncate text-sm text-ink-subtle sm:inline" title={fileName}>
              {fileName}
            </span>
          ) : null}
        </div>
        {showNewFile && onNewFile ? (
          <button
            type="button"
            onClick={onNewFile}
            className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface-elevated px-3 text-sm font-medium text-ink transition hover:border-border-strong hover:bg-surface"
          >
            New file
          </button>
        ) : null}
      </div>
    </header>
  )
}
