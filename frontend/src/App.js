import React from "react";
import SentenceAnnotation from "./components/SentenceAnnotation";
import "./App.css";

const App = () => {
  return (
    <div id="appContainer">
      <header className="app-header">
        <h1>TACIT</h1>
      </header>
      <main className="app-main">
        <SentenceAnnotation />
      </main>
    </div>
  );
};

export default App;
