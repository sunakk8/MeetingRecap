from flask import Flask, request, jsonify, render_template
import os

import whisper
from langchain.llms import Ollama


app = Flask(__name__, template_folder='')
app.config["UPLOAD_FOLDER"] = "uploads"

# Create the uploads folder if it doesn't exist
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

model = whisper.load_model("small")

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
    
    transcript = model.transcribe(filepath)
    print(transcript["text"])

    summary = llm("Summarize this text, maintaining all relevant points: " + str(transcript["text"]))
    print(summary)
    return jsonify({"summary": summary})

if __name__ == "__main__":
    app.run(debug=True)
