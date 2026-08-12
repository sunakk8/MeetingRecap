import { useEffect, useState, type RefObject } from 'react'
import type { TranscriptSegment } from '../types'

export function useAudioSync(
  audioRef: RefObject<HTMLAudioElement | null>,
  segments: TranscriptSegment[],
) {
  const [currentTime, setCurrentTime] = useState(0)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      const t = audio.currentTime
      setCurrentTime(t)

      if (segments.length === 0) {
        setActiveIndex(-1)
        return
      }

      let index = -1
      for (let i = 0; i < segments.length; i += 1) {
        const start = segments[i].start
        const end =
          i < segments.length - 1 ? segments[i + 1].start : Number.POSITIVE_INFINITY
        if (t >= start && t < end) {
          index = i
          break
        }
      }
      setActiveIndex(index)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('seeked', onTimeUpdate)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('seeked', onTimeUpdate)
    }
  }, [audioRef, segments])

  const seekTo = (start: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = start
    void audio.play()
  }

  return { currentTime, activeIndex, seekTo }
}
