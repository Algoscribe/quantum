// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

// pages
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import LearnBB84 from "./LearnBB84";
import LabBB84 from "./LabBB84";

import Theory from "./Theory";
import Ideal from "./Ideal";
import NonIdeal from "./NonIdeal";

import Virtuallab from './VirtualLab';
import Experiment1 from './Experiment1';
import Experiment2 from './Experiment2';
import Experiment3 from './Experiment3';
import Experiment4 from './Experiment4';
import Experiment5 from './Experiment5';
import Experiment6 from './Experiment6';
import Experiment7 from './Experiment7';
import Experiment8 from './Experiment8';
import Experiment9 from './Experiment9';
import Experiment10 from './Experiment10';

import LabEquipment from "./LabEquipment";
import BB84sim from './BB84Sim';
import CodeExplorer from './CodeExplorer';
import PreQuiz from './PreQuiz';
import PostQuiz from './PostQuiz';
import CertificatePage from "./Certification";
import Credits from "./Credits";


// navbar
import QXNavbar from "./QXNavbar";

function App() {

  const [geminiOpen, setGeminiOpen] = useState(false);

  return (
    <Router>

      {/* Top navigation always visible */}
      <QXNavbar onOpenGemini={() => setGeminiOpen(true)} />

{/* Gemini Panel */}
{geminiOpen && (
  <div className="gemini-panel">

    {/* HORIZONTAL RESIZE */}
    <div
      className="gemini-resizer-x"
      onMouseDown={(e) => {
        e.preventDefault();
        const panel = e.target.parentElement;
        const startX = e.clientX;
        const startWidth = panel.offsetWidth;

        const onMouseMove = (ev) => {
          const newWidth = startWidth - (ev.clientX - startX);
          panel.style.width = `${Math.min(Math.max(newWidth, 280), 520)}px`;
        };

        const stop = () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", stop);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", stop);
      }}
    />

    {/* VERTICAL RESIZE */}
    <div
      className="gemini-resizer-y"
      onMouseDown={(e) => {
        e.preventDefault();
        const panel = e.target.parentElement;
        const startY = e.clientY;
        const startHeight = panel.offsetHeight;

        const onMouseMove = (ev) => {
          const newHeight = startHeight + (ev.clientY - startY);
          panel.style.height = `${Math.min(
            Math.max(newHeight, 300),
            window.innerHeight - 120
          )}px`;
        };

        const stop = () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", stop);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", stop);
      }}
    />

    {/* HEADER */}
    <div className="gemini-header">
      <span>Gemini</span>
      <button onClick={() => setGeminiOpen(false)}>✕</button>
    </div>

    {/* BODY */}
    <div className="gemini-body">
      <p style={{ marginBottom: "12px" }}>
        Gemini is available as your Quantum Lab Assistant.
      </p>

      <p style={{ marginBottom: "16px", opacity: 0.8 }}>
        It understands BB84, QBER, eavesdropping detection, and what you are
        seeing in the QKD-Xplore simulations.
      </p>

      <button
        onClick={() =>
          window.open(
            "https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%22197tSeEspYwXv794H97TDNe3VoLkUw4CA%22%5D,%22action%22:%22open%22,%22userId%22:%22106046785362817472380%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing",
            "_blank"
          )
        }
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          background: "#000",
          color: "#fff",
          border: "1px solid #000",
          cursor: "pointer",
          fontWeight: 600,
          width: "100%"
        }}
      >
        Launch Gemini Assistant →
      </button>
    </div>

  </div>
)}



      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Concepts */}
        <Route path="/concepts" element={<LearnBB84 />} />
        <Route path="/learn/bb84" element={<LearnBB84 />} />

        {/* Virtual Lab */}
        <Route path="/virtual-lab" element={<Virtuallab />} />
        <Route path="/lab/experiment-1" element={<Experiment1 />} />
        <Route path="/lab/experiment-2" element={<Experiment2 />} />
        <Route path="/lab/experiment-3" element={<Experiment3 />} />
        <Route path="/lab/experiment-4" element={<Experiment4 />} />
        <Route path="/lab/experiment-5" element={<Experiment5 />} />
        <Route path="/lab/experiment-6" element={<Experiment6 />} />
        <Route path="/lab/experiment-7" element={<Experiment7 />} />
        <Route path="/lab/experiment-8" element={<Experiment8 />} />
        <Route path="/lab/experiment-9" element={<Experiment9 />} />
        <Route path="/lab/experiment-10" element={<Experiment10 />} />
        <Route path="/lab/equipment" element={<LabEquipment />} />
        <Route path="/lab/bb84" element={<LabBB84 />} />

        {/* BB84 Simulation + Theory/Ideal/Non-Ideal */}
        <Route path="/bb84-simulation" element={<BB84sim />} />
        <Route path="/bb84-theory" element={<Theory />} />
        <Route path="/bb84-ideal" element={<Ideal />} />
        <Route path="/bb84-notideal" element={<NonIdeal />} />

        {/* Others */}
        <Route path="/code-explorer" element={<CodeExplorer />} />
        <Route path="/prequiz" element={<PreQuiz />} />
        <Route path="/postquiz" element={<PostQuiz />} />
        <Route path="/certification" element={<CertificatePage />} />
        <Route path="/credits" element={<Credits />} />
        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="qx-page" style={{ padding: "120px 60px" }}>
              <h2>Page not found</h2>
              <p>
                The page you’re looking for doesn’t exist. Go back to{" "}
                <a href="/" style={{ color: "#fff", textDecoration: "underline" }}>
                  Home
                </a>.
              </p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
