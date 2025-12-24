// src/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/concepts">Concepts</Link>
        <Link to="/bb84-simulation">BB84 Simulation</Link>
        <Link to="/VirtualLab">Virtual Lab</Link>
        <Link to="/credits">Credits</Link>
      </div>
      <p>© 2025 QKD_Xplore Virtual Lab. Built for education.</p>
      <p style={{ fontSize: "20px" }}>
        BB84 Made Interactive:Learn,Test,Analyze,Secure.
      </p>
    </footer>
  );
}
