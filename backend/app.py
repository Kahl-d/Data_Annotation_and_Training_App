from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import pandas as pd
import random

app = Flask(__name__)
CORS(app)

# Paths to datasets
DATA_FILE = "processed_cct_data.csv"
CLASS0_FILE = "pure_class0.csv"

# Load datasets
if not os.path.exists(DATA_FILE) or not os.path.exists(CLASS0_FILE):
    raise FileNotFoundError("One or more datasets not found.")

df = pd.read_csv(DATA_FILE)
df_class0 = pd.read_csv(CLASS0_FILE)

# Ensure valid columns
if "sentence" not in df.columns or "CCTs" not in df.columns:
    raise ValueError("Dataset must contain 'sentence' and 'CCTs' columns.")
if "sentence" not in df_class0.columns:
    raise ValueError("Class 0 dataset must contain a 'sentence' column.")

# Process CCT labels properly
df["CCTs"] = df["CCTs"].apply(lambda x: [label.strip() for label in str(x).split(",") if label.strip()] if isinstance(x, str) else [])

df_class0["CCTs"] = [[] for _ in range(len(df_class0))]  # Assign empty CCT list to class 0 sentences

# Combine datasets
df["category"] = "CCT"
df_class0["category"] = "Class0"
df_combined = pd.concat([df, df_class0], ignore_index=True)

# Shuffle data
df_combined = df_combined.sample(frac=1, random_state=42).reset_index(drop=True)

# CCT percentage distribution
cct_distribution = {
    "Class0": 10,
    "Attainment": 12,
    "Aspirational": 12,
    "Navigational": 12,
    "Perserverant": 8,
    "Resistance": 3,
    "Familial": 10,
    "Filial Piety": 10,
    "First Gen": 3,
    "Social": 5,
    "Community Consciousness": 5,
    "Spiritual": 10
}

# Function to sample based on distribution
def get_sampled_data():
    sampled_data = []
    total_samples = len(df_combined)
    
    for category, percentage in cct_distribution.items():
        category_df = df_combined[df_combined["category"].eq("Class0") if category == "Class0" else df_combined["CCTs"].apply(lambda x: category in x)]
        sample_size = max(1, int((percentage / 100) * total_samples))
        sampled_data.append(category_df.sample(n=min(sample_size, len(category_df)), random_state=42))
    
    return pd.concat(sampled_data, ignore_index=True).sample(frac=1, random_state=42)  # Final shuffle

@app.route("/get-sentence", methods=["GET"])
def get_sentence():
    """Returns a random sentence with correct labels based on percentage distribution."""
    try:
        sampled_df = get_sampled_data()
        row = sampled_df.sample(n=1).iloc[0]
        return jsonify({
            "sentence": row["sentence"],
            "correct_labels": row["CCTs"]  # Keeping same API format for frontend compatibility
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
