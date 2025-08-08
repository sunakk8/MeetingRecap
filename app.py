from flask import Flask, request, jsonify, render_template
import os

from flask_socketio import SocketIO, emit

socketio = SocketIO(Flask(__name__), cors_allowed_origins="*")

from faster_whisper import WhisperModel
from langchain.llms import Ollama


app = Flask(__name__, template_folder='')
app.config["UPLOAD_FOLDER"] = "uploads"

# Create the uploads folder if it doesn't exist
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

model = WhisperModel("tiny.en", device="cpu")

llm = Ollama(model="mistral")
llm("Your job is to summarize transcripts that may be from audio files/videos. After you summarize, the user may ask you follow-up questions. You are to respond to these questions truthfully, based on the transcript, without fabricating any information. You may cite the transcript and/or summary.")
print("Model Loaded")
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)
    
    socketio.emit("status", {"msg": "Transcribing..."})
    segments, _ = model.transcribe(filepath, language="en")
    transcript = "\n"
    text = ""
    for segment in segments:
        time_range = f"{format_time(segment.start)}-{format_time(segment.end)}".ljust(20, " ")
        transcript += (time_range + f"{segment.text}\n")
        text += segment.text

    socketio.emit("status", {"msg": "Summarizing..."})
    summary = llm("Summarize this transcription, maintaining all relevant points: " + text)

    socketio.emit("status", {"msg": "Summarization Complete"})
    print(summary)

    with open("transcripts/tr.txt", "w") as f:
        f.write(text)

    return jsonify({"transcript": transcript, "summary": summary})

@app.route("/chat", methods=["POST"])
def chat():
    msg = request.json.get('msg','')
    transcript = ""
    with open(f"transcripts/tr.txt", "r") as f:
        transcript = f.read()
    reply = llm(f"Answer the user's question truthfully. This is the transcript to refer to: \"{transcript}\". User Message: " + msg)
    return jsonify({'reply': reply})

def format_time(t):
    min = int(t) // 60
    sec = int(t) % 60
    return f"{min}:{sec:02d}"

if __name__ == "__main__":
    from flask_socketio import SocketIO

    # Make sure this is defined globally
    socketio = SocketIO(app, cors_allowed_origins="*")

    socketio.run(app, debug=True)