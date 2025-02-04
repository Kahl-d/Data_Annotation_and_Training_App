from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import pandas as pd
import random

app = Flask(__name__)
CORS(app)

# Path to updated dataset
DATA_FILE = "processed_cct_data.csv"

# Load dataset
if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(f"Dataset not found at {DATA_FILE}")

df = pd.read_csv(DATA_FILE)

# Ensure valid columns
if "sentence" not in df.columns or "CCTs" not in df.columns:
    raise ValueError("Dataset must contain 'sentence' and 'CCTs' columns.")

# Process CCT labels properly to ensure they are lists
df["CCTs"] = df["CCTs"].apply(lambda x: [label.strip() for label in str(x).split(",") if label.strip()] if isinstance(x, str) else [])

@app.route("/get-sentence", methods=["GET"])
def get_sentence():
    """Returns a random sentence with correct labels."""
    try:
        row = df.sample(n=1).iloc[0]
        return jsonify({
            "sentence": row["sentence"],
            "correct_labels": row["CCTs"]  # Keeping same API format for frontend compatibility
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
