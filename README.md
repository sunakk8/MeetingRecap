# MeetingRecap

LLM-powered web app that transcribes uploaded audio and generates a concise summary — for meetings, lectures, or other speech. Built with Flask, Faster-Whisper, a local Ollama LLM, and a React frontend.

## Features

- **Audio transcription** — Faster-Whisper turns speech into timed text
- **Automated summarization** — Local Ollama (`mistral`) produces structured notes
- **Interactive chat** — Ask follow-up questions grounded in the transcript
- **Transcript viewer** — Expand/collapse segments; click timestamps to seek audio
- **Live processing status** — Socket.IO updates while Whisper and Ollama run

## Technologies

- **Backend:** Python, Flask, Flask-SocketIO
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Socket.IO client
- **AI:** Faster-Whisper (`tiny.en`), Ollama (`mistral`)

## Prerequisites

- Python 3.x and pip
- Node.js 20+ and npm
- [Ollama](https://ollama.com) installed and running, with `mistral` pulled:

```bash
ollama pull mistral
```

## Installation

```bash
git clone https://github.com/sunakk8/MeetingRecap.git
cd MeetingRecap
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

## Development

Run the API and the Vite dev server (with proxy to Flask):

```bash
# Terminal 1 — API on http://localhost:5001
python3 app.py

# Terminal 2 — UI on http://localhost:5173
cd frontend && npm run dev
```

Open **http://localhost:5173**.

> Note: the API uses port **5001** because macOS often reserves **5000** for AirPlay Receiver.

## Production-style run

Build the frontend, then serve it from Flask:

```bash
cd frontend && npm run build && cd ..
python3 app.py
```

Open **http://localhost:5001**.

## Usage

1. Upload an audio file and wait for transcription and summarization.
2. Read the summary, expand the transcript, click timestamps to replay.
3. Use chat to ask follow-up questions about the recording.

## Folder structure

```
MeetingRecap/
├── app.py                 # Flask API & Socket.IO
├── requirements.txt
├── frontend/              # React + Vite SPA
│   ├── src/
│   └── dist/              # Created by npm run build
├── uploads/               # Uploaded audio (runtime)
└── transcripts/           # Saved transcript text (runtime)
```

## TODO / Future improvements

- Support multiple uploaded files / sessions
- Optional abort during long transcriptions
- Hardening around reconnect and concurrent users

## License

MIT — see the LICENSE file for details.
