import React from "react";
import SensorLogger from "./components/SensorLogger";
import Ball from "./components/Ball";

function App() {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Sensor PWA</h1>
      <h2>Rollender Ball</h2>
      <div style={{ width: "100%", height: "400px", marginBottom: "20px" }}>
        <Ball />
      </div>
    </div>
  );
}

export default App;
