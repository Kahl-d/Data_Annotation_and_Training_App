from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import pandas as pd
import random

app = Flask(__name__)
CORS(app)

# Path to dataset
DATA_FILE = "processed_cct_data.csv"

# Load dataset
if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(f"Dataset not found: {DATA_FILE}")

df = pd.read_csv(DATA_FILE)

# Ensure valid columns
required_columns = ["sentence", "CCTs"]
for col in required_columns:
    if col not in df.columns:
        raise ValueError(f"Dataset must contain '{col}' column.")

# Process CCT labels properly
# For compatibility with the frontend, convert comma-separated string to list
df["CCTs_list"] = df["CCTs"].apply(lambda x: [label.strip() for label in str(x).split(",") if label.strip()])

# Add a category column for filtering
df["category"] = df["CCTs"].apply(lambda x: "Class0" if x == "Class 0" else "CCT")

# Shuffle data
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# CCT percentage distribution
cct_distribution = {
    "Class 0": 10,
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
    total_samples = len(df)
    
    for category, percentage in cct_distribution.items():
        if category == "Class 0":
            # Filter for Class 0 sentences
            category_df = df[df["category"] == "Class0"]
        else:
            # Filter for sentences containing this category
            category_df = df[df["CCTs"].str.contains(category, na=False)]
        
        # Calculate sample size based on percentage
        sample_size = max(1, int((percentage / 100) * total_samples))
        
        # Handle case where we don't have enough samples
        if len(category_df) > 0:
            sample_count = min(sample_size, len(category_df))
            sampled = category_df.sample(n=sample_count, random_state=42)
            sampled_data.append(sampled)
    
    # Combine and shuffle the final sample
    return pd.concat(sampled_data, ignore_index=True).sample(frac=1, random_state=42)

@app.route("/get-sentence", methods=["GET"])
def get_sentence():
    """Returns a random sentence with correct labels based on percentage distribution."""
    try:
        sampled_df = get_sampled_data()
        row = sampled_df.sample(n=1).iloc[0]
        
        # Format the CCTs for compatibility with frontend
        cct_string = row["CCTs"]
        cct_list = [label.strip() for label in cct_string.split(",")]
        
        # Return both formats for flexibility
        return jsonify({
            "sentence": row["sentence"],
            "correct_labels": cct_list,  # Array format for better frontend compatibility
            "correct_labels_str": cct_string,  # Original string format (comma-separated)
            "essay_id": row.get("essay_id", "Unknown")  # Include essay_id if available
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/stats", methods=["GET"])
def get_stats():
    """Returns statistics about the dataset."""
    try:
        # Count sentences per category
        category_counts = {}
        
        # Count CCT categories
        for category in cct_distribution.keys():
            if category == "Class 0":
                count = len(df[df["category"] == "Class0"])
            else:
                count = len(df[df["CCTs"].str.contains(category, na=False)])
            category_counts[category] = count
            
        return jsonify({
            "total_sentences": len(df),
            "total_essays": len(df["essay_id"].unique()) if "essay_id" in df.columns else "Unknown",
            "category_counts": category_counts
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)