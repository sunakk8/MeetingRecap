from flask import Flask, request, jsonify, send_from_directory
import json
import os
import re

from flask_socketio import SocketIO

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(ROOT_DIR, "frontend", "dist")
TRANSCRIPTS_DIR = os.path.join(ROOT_DIR, "transcripts")
TRANSCRIPT_TXT = os.path.join(TRANSCRIPTS_DIR, "tr.txt")
TRANSCRIPT_JSON = os.path.join(TRANSCRIPTS_DIR, "tr.json")

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = os.path.join(ROOT_DIR, "uploads")

socketio = SocketIO(app, cors_allowed_origins="*")

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)

_whisper = None
_llm = None


def get_whisper():
    global _whisper
    if _whisper is None:
        from faster_whisper import WhisperModel

        _whisper = WhisperModel("tiny.en", device="cpu")
    return _whisper


def get_llm():
    global _llm
    if _llm is None:
        from langchain_community.llms import Ollama

        _llm = Ollama(model="mistral", temperature=0.1)
    return _llm


def format_time(t):
    total = max(0, int(round(float(t))))
    minutes = total // 60
    sec = total % 60
    return f"{minutes}:{sec:02d}"


def format_timed_transcript(segments):
    lines = []
    for seg in segments:
        start = format_time(seg["start"])
        end = format_time(seg.get("end", seg["start"]))
        text = seg["text"].strip()
        lines.append(f"[{start}-{end}] {text}")
    return "\n".join(lines)


def parse_requested_times(msg):
    """Extract timestamps mentioned in a user question as seconds."""
    times = []
    for match in re.finditer(r"\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b", msg):
        a, b, c = match.groups()
        if c is not None:
            times.append(int(a) * 3600 + int(b) * 60 + int(c))
        else:
            times.append(int(a) * 60 + int(b))
    return times


def segments_near_times(segments, times, window=12.0):
    if not segments or not times:
        return []
    picked = []
    seen = set()
    for t in times:
        for i, seg in enumerate(segments):
            start = float(seg["start"])
            end = float(seg.get("end", start))
            if start - window <= t <= end + window and i not in seen:
                seen.add(i)
                picked.append(seg)
    return picked


def load_segments():
    if not os.path.exists(TRANSCRIPT_JSON):
        return []
    with open(TRANSCRIPT_JSON, "r") as f:
        data = json.load(f)
    return data if isinstance(data, list) else []


def build_chat_prompt(msg, timed_transcript, segments):
    focus_times = parse_requested_times(msg)
    focus_segs = segments_near_times(segments, focus_times)
    focus_block = ""
    if focus_segs:
        focus_block = (
            "\nRELEVANT SEGMENTS NEAR THE ASKED TIMESTAMP(S):\n"
            + format_timed_transcript(focus_segs)
            + "\n"
        )

    return f"""You are answering questions about one audio transcript.
Use ONLY the transcript below. Do not invent dialogue, names, or events.
If the answer is not in the transcript, say you cannot find it in the transcript.
When the user asks about a timestamp, quote the segment(s) whose time range covers or is nearest that time, and cite the bracketed timestamp.
Prefer exact wording from the transcript over paraphrase when asked "what did they say".

FULL TIMED TRANSCRIPT:
{timed_transcript}
{focus_block}
USER QUESTION:
{msg}

ANSWER:"""


def build_summary_prompt(timed_transcript):
    return f"""Summarize the following timed transcript.
Keep all important points, decisions, names, and action items.
Do not invent details that are not present.
You may mention timestamps when useful.

TRANSCRIPT:
{timed_transcript}

SUMMARY:"""


def _frontend_ready():
    return os.path.exists(os.path.join(FRONTEND_DIST, "index.html"))


@app.route("/")
def index():
    if not _frontend_ready():
        return (
            jsonify(
                {
                    "error": "Frontend build not found. Run: cd frontend && npm run build",
                    "dev": "Or run the Vite dev server: cd frontend && npm run dev",
                }
            ),
            503,
        )
    return send_from_directory(FRONTEND_DIST, "index.html")


@app.route("/assets/<path:filename>")
def frontend_assets(filename):
    return send_from_directory(os.path.join(FRONTEND_DIST, "assets"), filename)


@app.route("/favicon.svg")
def favicon():
    return send_from_directory(FRONTEND_DIST, "favicon.svg")


@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    try:
        whisper = get_whisper()
    except Exception as exc:
        return (
            jsonify(
                {
                    "error": (
                        "Could not load Whisper transcription model. "
                        f"Details: {exc}"
                    )
                }
            ),
            503,
        )

    try:
        llm = get_llm()
    except Exception as exc:
        return (
            jsonify(
                {
                    "error": (
                        "Could not reach Ollama. Ensure it is installed, running, "
                        f"and `mistral` is pulled. Details: {exc}"
                    )
                }
            ),
            503,
        )

    socketio.emit("status", {"msg": "Transcribing..."})
    segments, _ = whisper.transcribe(filepath, language="en")
    transcript_data = []
    for segment in segments:
        time_range = f"{format_time(segment.start)}-{format_time(segment.end)}".ljust(20, " ")
        transcript_data.append(
            {
                "start": segment.start,
                "end": segment.end,
                "time": time_range,
                "text": segment.text,
            }
        )

    timed_transcript = format_timed_transcript(transcript_data)

    socketio.emit("status", {"msg": "Summarizing..."})
    try:
        summary = llm(build_summary_prompt(timed_transcript))
    except Exception as exc:
        return (
            jsonify(
                {
                    "error": (
                        "Summarization failed. Is Ollama running with the `mistral` model? "
                        f"Details: {exc}"
                    )
                }
            ),
            503,
        )

    socketio.emit("status", {"msg": "Summarization Complete"})
    print(summary)

    with open(TRANSCRIPT_TXT, "w") as f:
        f.write(timed_transcript)
    with open(TRANSCRIPT_JSON, "w") as f:
        json.dump(transcript_data, f)

    return jsonify({"transcript": transcript_data, "summary": summary})


@app.route("/chat", methods=["POST"])
def chat():
    msg = request.json.get("msg", "") if request.json else ""
    timed_transcript = ""
    if os.path.exists(TRANSCRIPT_TXT):
        with open(TRANSCRIPT_TXT, "r") as f:
            timed_transcript = f.read()
    segments = load_segments()

    if not timed_transcript.strip():
        return jsonify({"error": "No transcript available. Upload audio first."}), 400

    try:
        llm = get_llm()
        reply = llm(build_chat_prompt(msg, timed_transcript, segments))
    except Exception as exc:
        return (
            jsonify(
                {
                    "error": (
                        "Chat failed. Is Ollama running with the `mistral` model? "
                        f"Details: {exc}"
                    )
                }
            ),
            503,
        )
    return jsonify({"reply": reply})


if __name__ == "__main__":
    # Avoid macOS AirPlay Receiver which often binds :5000
    socketio.run(app, debug=True, port=5001, allow_unsafe_werkzeug=True)
