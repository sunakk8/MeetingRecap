# MeetingRecap

This is an LLM-powered web application that transcribes uploaded audio files and generates a concise summary, whether it's for a work meeting, a YouTube video, or a class lecture. Built with Flask, OpenAI's Whisper model, and a local Ollama LLM, the app provides transcription, summarization, and an interactive chat interface for follow-up questions.

## Features
 - **Audio Transcription** – Convert speech into accurate text using Faster-Whisper.
- **Automated Summarization** – Generate concise and structured notes with an LLM.
- **Interactive Chat Interface** – User can follow-up questions about the transcript or summary.
- **Transcript Viewer** – Expand/collapse the full transcript with clickable timestamps for audio replay.
- **User-Friendly Web Interface** – Simple upload form and dynamic result display.

## Technologies Used
- **Backend:** Python, Flask, Flask-SocketIO
- **Frontend:** HTML, JavaScript, Axios, Socket.IO
- **AI Models:** 
      - Faster-Whisper for fast transcription
      - Ollama local LLM (mistral) for summarization and Q&A

## Installation

### Prerequisites
Ensure you have **Python 3.x** and **pip** installed on your system.


### Clone the Repository
```bash
git clone https://github.com/sunakk8/MeetingRecap.git
cd MeetingRecap
```

### Install Dependencies
```bash
pip install -r requirements.txt
```
 - Note: Ollama must be installed separately.

## Running the App
```bash
python app.py
```
The server will start on `http://localhost:5000`.

## Usage
1. Upload an audio file and wait for the transcription/summarization to complete.
2. Access the transcription and summary, click on the timestamps for playback, or use the chat box to ask follow up questions.


## Folder Structure
```
MeetingRecap/
│── app.py                 # Flask backend & Socket.IO events
│── index.html             # Main frontend UI
│── script.js              # Client-side logic
│── uploads/               # Uploaded audio files
│── transcripts/             # Generated transcripts
```

## TODO / Future Improvements
- Add support for multiple uploaded files.
- Add CSS to improve the design.
- Fix minor bugs with reconnecting.


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


