import React, { useState } from "react";

export default function LabBB84() {
  const [eve, setEve] = useState(false);
  const [noise, setNoise] = useState(5);
  const [result, setResult] = useState(null);

  const runSimulation = () => {
    // Placeholder result logic for now (we will update later)
    const qber = eve ? 25 : noise * 0.5;
    const status = qber > 11 ? "Eavesdropping detected!" : "Secure channel";

    setResult({
      qber: qber.toFixed(2),
      status,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "white",
        padding: "32px",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px" }}>
        🧪 BB84 Virtual Lab
      </h1>

      <p style={{ opacity: 0.8, marginBottom: "20px" }}>
        Configure your experiment parameters and simulate quantum key exchange.
      </p>

      {/* Eve Toggle */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "16px" }}>
          Eavesdropper (Eve):{" "}
          <input
            type="checkbox"
            checked={eve}
            onChange={() => setEve(!eve)}
            style={{ transform: "scale(1.3)", marginLeft: "10px" }}
          />
        </label>
      </div>

      {/* Noise slider */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "16px" }}>
          Noise: {noise}%
          <input
            type="range"
            min="0"
            max="20"
            value={noise}
            onChange={(e) => setNoise(Number(e.target.value))}
            style={{ width: "250px", marginLeft: "12px" }}
          />
        </label>
      </div>

      {/* Run Button */}
      <button
        onClick={runSimulation}
        style={{
          background: "linear-gradient(135deg, #7A5BFF, #5634E3)",
          padding: "12px 28px",
          borderRadius: "10px",
          border: "none",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Run Simulation →
      </button>

      {/* Result Display */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "18px",
            borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            width: "300px",
          }}
        >
          <p style={{ fontSize: "18px", margin: "6px 0" }}>
            <strong>QBER:</strong> {result.qber}%
          </p>
          <p style={{ fontSize: "16px", margin: "6px 0" }}>
            <strong>Status:</strong> {result.status}
          </p>
        </div>
      )}
    </div>
  );
}
