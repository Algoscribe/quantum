import React from "react";

export default function History() {
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
      <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "12px" }}>
        Experiment History
      </h1>
      <p style={{ opacity: 0.8, maxWidth: "520px", fontSize: "15px" }}>
        Later this page will show a list of all BB84 runs for the logged-in user,
        with QBER and status. We will connect it to the database after the lab
        works.
      </p>
    </div>
  );
}
