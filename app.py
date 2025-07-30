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
    transcript = ""
    text = ""
    for segment in segments:
        transcript += f"{segment.start}-{segment.end}:    {segment.text}\n"
        text += segment.text

    socketio.emit("status", {"msg": "Summarizing..."})
    summary = llm("Summarize this text, maintaining all relevant points: " + text)

    socketio.emit("status", {"msg": "Summarization Complete"})
    print(summary)
    return jsonify({"transcript": transcript, "summary": summary})

if __name__ == "__main__":
    from flask_socketio import SocketIO

    # Make sure this is defined globally
    socketio = SocketIO(app, cors_allowed_origins="*")

    socketio.run(app, debug=True)