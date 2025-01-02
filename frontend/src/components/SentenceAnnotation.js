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
      <h1>TACIT</h1>
      <div className="sentence-box">
        <p>{sentence}</p>
        {result !== null && (
          <p className="result">
            {result ? "Correct!" : `Correct: ${correctLabel}`}
          </p>
        )}
      </div>
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
      <div className="action-buttons">
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
      </div>
    </div>
  );
};

export default SentenceAnnotation;
