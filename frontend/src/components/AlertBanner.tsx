import { AlertCircle, Info, X } from 'lucide-react'

type AlertVariant = 'error' | 'info'

type AlertBannerProps = {
  variant?: AlertVariant
  message: string
  onDismiss?: () => void
}

const styles: Record<AlertVariant, string> = {
  error: 'bg-danger-soft text-danger border-danger/20',
  info: 'bg-accent-soft text-accent-ink border-accent/20',
}

export function AlertBanner({ variant = 'error', message, onDismiss }: AlertBannerProps) {
  const Icon = variant === 'error' ? AlertCircle : Info

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 opacity-70 transition hover:opacity-100"
          aria-label="Dismiss alert"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
