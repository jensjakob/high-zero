import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Lines from "./Lines";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Lines />
      </header>
    </div>
  );
}

export default App;
