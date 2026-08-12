export type AppPhase = 'idle' | 'processing' | 'ready'

export type TranscriptSegment = {
  start: number
  time: string
  text: string
}

export type UploadResponse = {
  transcript: TranscriptSegment[]
  summary: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ProcessStage = 'uploading' | 'transcribing' | 'summarizing' | 'complete'
