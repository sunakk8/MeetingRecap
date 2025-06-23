from flask import Flask, request, jsonify, render_template
import os
import whisper

app = Flask(__name__, template_folder='')
app.config["UPLOAD_FOLDER"] = "uploads"

# Create the uploads folder if it doesn't exist
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

model = whisper.load_model("small")
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
    
    result = model.transcribe(filepath)
    print(result["text"])

    summary = result["text"]

    return jsonify({"summary": summary})

if __name__ == "__main__":
    app.run(debug=True)


