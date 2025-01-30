import React from "react";
import SentenceAnnotation2 from "./components/SentenceAnnotation2";
import "./App.css";

const App = () => {
  return (
    <div id="appContainer">
      <header className="app-header">
        <h1>TACIT</h1>
      </header>
      <main className="app-main">
        <SentenceAnnotation2 />
      </main>
    </div>
  );
};

export default App;
