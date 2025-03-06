import React, { useState, useEffect } from "react";
import "./SentenceAnnotation.css";

const SentenceAnnotation = () => {
  const [sentence, setSentence] = useState("");
  const [correctLabels, setCorrectLabels] = useState([]);
  const [userSelection, setUserSelection] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  const CCTOptions = [
    "Attainment", "Aspirational", "Navigational", "Perseverant", "Resistance",
    "Familial", "Filial Piety", "First Gen", "Social", "Community", "Spiritual", "Class 0"
  ];

  useEffect(() => {
    // First, wake up the backend, then fetch the sentence
    setLoading(true);
    wakeUpBackend().then(() => {
      setTimeout(fetchSentence, 1000); // Wait a second to allow startup
    });
  }, []);

  const wakeUpBackend = async () => {
    try {
      await fetch("https://t-lingo.onrender.com/", { method: "GET" });
    } catch (error) {
      console.error("Failed to wake up the backend:", error);
    }
  };

  const fetchSentence = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://t-lingo.onrender.com/get-sentence");
      const data = await response.json();

      setSentence(data.sentence || "No sentence available");
      setCorrectLabels(Array.isArray(data.correct_labels) ? data.correct_labels : []);
      setUserSelection([]);
      setFeedback(null);
    } catch (error) {
      console.error("Failed to fetch sentence:", error);
      setSentence("Error fetching sentence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = (option) => {
    // Allow changes even after submission
    setUserSelection((prevSelection) =>
      prevSelection.includes(option)
        ? prevSelection.filter((item) => item !== option)
        : [...prevSelection, option]
    );
    
    // If we've already shown feedback, reset it so users can try again
    if (feedback) {
      setFeedback(null);
    }
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
      <header className="app-header">
        <h1>TACIT</h1>
      </header>
      
      <div className="sentence-card">
        <h2>Analyze this sentence:</h2>
        <div className="sentence-content">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <p>{sentence}</p>
          )}
        </div>
      </div>

      <div className="annotation-section">
        <h3>Select all applicable categories:</h3>
        <div className="options-container">
          {CCTOptions.map((option, index) => {
            let className = "option-label";
            
            // Always show selection state first
            if (userSelection.includes(option)) {
              className += " selected";
            }
            
            // Then apply feedback highlights if available
            if (feedback) {
              if (feedback.correct_selected.includes(option)) className += " correct-highlight";
              else if (feedback.incorrect_selected.includes(option)) className += " incorrect-highlight";
              else if (feedback.missed_correct.includes(option)) className += " missed-highlight";
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
      </div>

      {feedback && (
        <div className="feedback-container">
          <div className="feedback-details">
            <p>
              <span className="feedback-icon correct">✓</span> 
              <strong>Correct Answers:</strong> {correctLabels.join(", ")}
            </p>
            {feedback.incorrect_selected.length > 0 && (
              <p>
                <span className="feedback-icon incorrect">✗</span>
                <strong>Incorrect Choices:</strong> {feedback.incorrect_selected.join(", ")}
              </p>
            )}
            {feedback.missed_correct.length > 0 && (
              <p>
                <span className="feedback-icon missed">!</span>
                <strong>Missed Choices:</strong> {feedback.missed_correct.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      <footer className="action-buttons">
        <button 
          onClick={checkAnswers} 
          className="submit-button" 
          disabled={userSelection.length === 0}
        >
          Check Answer
        </button>
        <button 
          onClick={fetchSentence} 
          className="next-button"
        >
          Next Sentence
        </button>
      </footer>
    </div>
  );
};

export default SentenceAnnotation;