// src/App.js
import React from "react";
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
  return (
    <Router>
      {/* Top navigation always visible */}
      <QXNavbar />

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
        <Route path="/lab/equipment" element={<LabEquipment/>}/>
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
