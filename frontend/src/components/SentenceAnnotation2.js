import React, { useState, useEffect } from "react";
import "./SentenceAnnotation.css";

const SentenceAnnotation2 = () => {
  const [sentence, setSentence] = useState("");
  const [correctLabels, setCorrectLabels] = useState([]);
  const [userSelection, setUserSelection] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const CCTOptions = [
    "Attainment", "Aspirational", "Navigational", "Perseverant", "Resistance",
    "Familial", "Filial Piety", "First Gen", "Social", "Community", "Spiritual", "Class 0"
  ];

  useEffect(() => {
    fetchSentence();
  }, []);

  const fetchSentence = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-sentence");
      const data = await response.json();

      setSentence(data.sentence || "No sentence available");
      setCorrectLabels(Array.isArray(data.correct_labels) ? data.correct_labels : []);
      setUserSelection([]);
      setFeedback(null);
    } catch (error) {
      console.error("Failed to fetch sentence:", error);
      setSentence("Error fetching sentence.");
    }
  };

  const handleSelection = (option) => {
    setUserSelection((prevSelection) =>
      prevSelection.includes(option)
        ? prevSelection.filter((item) => item !== option)
        : [...prevSelection, option]
    );
  };

  const checkAnswers = () => {
    if (userSelection.length === 0) {
      alert("Please select at least one option before submitting.");
      return;
    }

    const correctSelected = userSelection.filter(label => correctLabels.includes(label));
    const incorrectSelected = userSelection.filter(label => !correctLabels.includes(label));
    const missedCorrect = correctLabels.filter(label => !userSelection.includes(label));

    setFeedback({
      correct_selected: correctSelected,
      incorrect_selected: incorrectSelected,
      missed_correct: missedCorrect
    });
  };

  return (
    <div className="annotation-container">
      <div className="sentence-box">
        <h2>Sentence:</h2>
        <div className="sentence-content">
          <p>{sentence}</p>
        </div>
      </div>

      <div className="options-container">
        {CCTOptions.map((option, index) => {
          let className = "option-label";
          if (feedback) {
            if (feedback.correct_selected.includes(option)) className += " correct-highlight";
            else if (feedback.incorrect_selected.includes(option)) className += " incorrect-highlight";
            else if (feedback.missed_correct.includes(option)) className += " missed-highlight";
          } else if (userSelection.includes(option)) {
            className += " selected";
          }

          return (
            <div
              key={index}
              className={className}
              onClick={() => handleSelection(option)}
            >
              {option}
            </div>
          );
        })}
      </div>

      {feedback && (
        <div className="feedback-container">
          <p><strong>✅ Correct Answers:</strong> {correctLabels.join(", ")}</p>
          <p><strong>❌ Incorrect Choices:</strong> {feedback.incorrect_selected.join(", ") || "None"}</p>
          <p><strong>⚠️ Missed Choices:</strong> {feedback.missed_correct.join(", ") || "None"}</p>
        </div>
      )}

      <footer className="action-buttons">
        <button onClick={fetchSentence} className="navigation-button">
          Next Sentence
        </button>
        <button onClick={checkAnswers} className="submit-button" disabled={userSelection.length === 0}>
          Check Answer
        </button>
      </footer>
    </div>
  );
};

export default SentenceAnnotation2;
