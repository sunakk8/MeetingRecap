import type { UploadResponse } from '../types'

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/upload', {
    method: 'POST',
    body: formData,
  })

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  if (!res.ok) {
    const error =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof (payload as { error: unknown }).error === 'string'
        ? (payload as { error: string }).error
        : 'Upload failed'
    throw new Error(error)
  }

  return payload as UploadResponse
}

export async function sendChat(msg: string): Promise<string> {
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msg }),
  })

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  if (!res.ok) {
    throw new Error('Failed to get a reply')
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    !('reply' in payload) ||
    typeof (payload as { reply: unknown }).reply !== 'string'
  ) {
    throw new Error('Invalid chat response')
  }

  return (payload as { reply: string }).reply
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const MAX_AUDIO_BYTES = 100 * 1024 * 1024

export function validateAudioFile(file: File): string | null {
  if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|flac|aac|webm)$/i.test(file.name)) {
    return 'Choose an audio file (mp3, wav, m4a, and similar).'
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return 'File is too large. Maximum size is 100 MB.'
  }
  return null
}
