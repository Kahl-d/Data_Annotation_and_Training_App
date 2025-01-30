from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import os
import pandas as pd

app = Flask(__name__)
CORS(app)

# Path to the data folder
DATA_FOLDER = "./data"
CCT_FILES = [
    "attainment_class1.csv", "aspirational_class1.csv", "navigational_class1.csv", "perseverance_class1.csv",
    "resistance_class1.csv", "familial_class1.csv", "filial_piety_class1.csv", "first_gen_class1.csv",
    "social_class1.csv", "community_consiousness_class1.csv", "spiritual_class1.csv", "pure_class0.csv"
]
CCT_LABELS = [
    "Attainment", "Aspirational", "Navigational", "Perseverant", "Resistance",
    "Familial", "Filial", "First Gen", "Social", "Community", "Spiritual", "Class 0"
]

# Sampling percentages
SAMPLING_PERCENTAGES = {
    "pure_class0.csv": 10,
    "attainment_class1.csv": 12,
    "aspirational_class1.csv": 12,
    "navigational_class1.csv": 12,
    "perseverance_class1.csv": 8,
    "resistance_class1.csv": 3,
    "familial_class1.csv": 10,
    "filial_piety_class1.csv": 10,
    "first_gen_class1.csv": 3,
    "social_class1.csv": 5,
    "community_consiousness_class1.csv": 5,
    "spiritual_class1.csv": 10
}

# Preload data into a dictionary
dataframes = {}
for file in CCT_FILES:
    filepath = os.path.join(DATA_FOLDER, file)
    if os.path.exists(filepath):
        df = pd.read_csv(filepath)
        if "sentence" not in df.columns:
            raise ValueError(f"File {file} does not have a 'sentence' column.")
        dataframes[file] = df
    else:
        raise FileNotFoundError(f"File {file} not found in {DATA_FOLDER}.")

@app.route("/get-sentence", methods=["GET"])
def get_sentence():
    try:
        # Weighted random choice based on percentages
        file = random.choices(
            population=list(SAMPLING_PERCENTAGES.keys()),
            weights=list(SAMPLING_PERCENTAGES.values()),
            k=1
        )[0]
        cct_label = CCT_LABELS[CCT_FILES.index(file)]

        # Get a random sentence from the selected file
        sentences = dataframes[file]["sentence"].tolist()
        if not sentences:
            raise ValueError(f"No sentences found in file: {file}")
        sentence = random.choice(sentences)

        return jsonify({"sentence": sentence, "cct_label": cct_label})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/submit-annotation", methods=["POST"])
def submit_annotation():
    try:
        data = request.json
        user_selection = data.get("user_selection")
        correct_label = data.get("correct_label")

        if not user_selection or not correct_label:
            raise ValueError("Invalid data received.")

        is_correct = user_selection == correct_label

        return jsonify({"is_correct": is_correct})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
