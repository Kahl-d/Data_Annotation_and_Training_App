import React, { useState, useEffect } from "react";
import "./SentenceAnnotation.css";

const SentenceAnnotation = () => {
  const [sentence, setSentence] = useState("");
  const [correctLabel, setCorrectLabel] = useState("");
  const [userSelection, setUserSelection] = useState("");
  const [result, setResult] = useState(null);

  const CCTOptions = [
    "Attainment", "Aspirational", "Navigational", "Perseverant", "Resistance",
    "Familial", "Filial", "First Gen", "Social", "Community", "Spiritual", "Class 0"
  ];

  useEffect(() => {
    fetchSentence();
  }, []);

  const fetchSentence = async () => {
    const response = await fetch("http://127.0.0.1:5000/get-sentence");
    const data = await response.json();
    setSentence(data.sentence);
    setCorrectLabel(data.cct_label);
    setResult(null);
    setUserSelection("");
  };

  const submitAnnotation = async () => {
    const response = await fetch("http://127.0.0.1:5000/submit-annotation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_selection: userSelection, correct_label: correctLabel }),
    });
    const data = await response.json();
    setResult(data.is_correct);
  };

  return (
    <div className="annotation-container">
      <div className="sentence-box">
        <h2>Sentence:</h2>
        <div className="sentence-content">
          <p>{sentence}</p>
        </div>
      </div>
      {result !== null && (
        <p className={`result ${result ? "correct" : "incorrect"}`}>
          {result ? "Correct!" : `Correct Answer: ${correctLabel}`}
        </p>
      )}
      <div className="options-container">
        {CCTOptions.map((option, index) => (
          <label
            key={index}
            className={`option-label ${userSelection === option ? "selected" : ""}`}
          >
            <input
              type="radio"
              value={option}
              checked={userSelection === option}
              onChange={(e) => setUserSelection(e.target.value)}
            />
            {option}
          </label>
        ))}
      </div>
      <footer className="action-buttons">
        <button onClick={fetchSentence} className="navigation-button">
          Previous
        </button>
        <button
          onClick={submitAnnotation}
          className="submit-button"
          disabled={!userSelection}
        >
          Submit
        </button>
        <button onClick={fetchSentence} className="navigation-button">
          Next
        </button>
      </footer>
    </div>
  );
};

export default SentenceAnnotation;
