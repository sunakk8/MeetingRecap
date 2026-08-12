import { forwardRef } from 'react'

type AudioPlayerProps = {
  src: string
  fileName: string
}

export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  function AudioPlayer({ src, fileName }, ref) {
    return (
      <div className="border-b border-border/80 bg-surface-elevated/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
          <p className="shrink-0 truncate text-sm font-medium text-ink-muted sm:max-w-48" title={fileName}>
            {fileName}
          </p>
          <audio
            ref={ref}
            id="audio-player"
            controls
            src={src}
            preload="metadata"
            className="w-full min-w-0 flex-1"
          >
            Your browser does not support audio playback.
          </audio>
        </div>
      </div>
    )
  },
)
