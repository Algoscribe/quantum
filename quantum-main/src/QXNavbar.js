// src/QXNavbar.js
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./QXNavbar.css";
import GeminiIcon from "./assets/gemini.svg";

export default function QXNavbar({ onOpenGemini }) {
  const location = useLocation();

  const [isLabDropdownOpen, setIsLabDropdownOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null); // Tracks 'bb84' or 'b92' nested hover
  const [isBB84DropdownOpen, setIsBB84DropdownOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path ? { color: "#ffffff" } : {};

  const isLabActive = () =>
    location.pathname.startsWith("/virtual-lab") ||
    location.pathname.startsWith("/lab/");

  const isBB84Active = () =>
    location.pathname.startsWith("/bb84-");

  return (
    <nav className="qx-nav">
      <ul className="qx-nav-links">
        <li>
          <Link to="/" className="qx-nav-logo" style={isActive("/")}>
            QKD_Xplore Virtual Lab
          </Link>
        </li>

        <li>
          <Link to="/concepts" style={isActive("/concepts")}>
            Concepts
          </Link>
        </li>

        <li>
          <Link to="/prequiz" style={isActive("/prequiz")}>
            Knowledge Check
          </Link>
        </li>

        {/* ------------------ BB84 SIMULATION DROPDOWN ------------------ */}
        <li
          className="qx-nav-dropdown"
          onMouseEnter={() => setIsBB84DropdownOpen(true)}
          onMouseLeave={() => setIsBB84DropdownOpen(false)}
        >
          <button
            type="button"
            className="qx-nav-link-btn"
            style={isBB84Active() ? { color: "#ffffff" } : {}}
          >
            BB84 Simulation <span className="qx-nav-caret">▾</span>
          </button>

          <div className={`qx-nav-dropdown-menu ${isBB84DropdownOpen ? "active" : ""}`}>
            <Link to="/bb84-theory">Theory</Link>
            <a href="/IDEAL.html" className="dropdown-item">Ideal</a>
            <a href="/NONIDEAL.html" className="dropdown-item">NonIdeal</a>
          </div>
        </li>

        {/* ------------------ NESTED VIRTUAL LAB DROPDOWN ------------------ */}
        <li
          className="qx-nav-dropdown"
          onMouseEnter={() => setIsLabDropdownOpen(true)}
          onMouseLeave={() => {
            setIsLabDropdownOpen(false);
            setActiveSubMenu(null);
          }}
        >
          <button
            type="button"
            className="qx-nav-link-btn"
            style={isLabActive() ? { color: "#ffffff" } : {}}
          >
            Virtual Lab <span className="qx-nav-caret">▾</span>
          </button>

          <div className={`qx-nav-dropdown-menu ${isLabDropdownOpen ? "active" : ""}`}>

            {/* BB84 Cascading Item */}
            <div
              className="nested-dropdown-trigger"
              onMouseEnter={() => setActiveSubMenu('bb84')}
            >
              <span className="menu-label">BB84 Protocols</span>
              <span className="qx-nav-caret-right">▸</span>

              <div className={`qx-nav-sub-menu ${activeSubMenu === 'bb84' ? "active" : ""}`}>
                <Link to="/virtual-lab">BB84 Overview</Link>
                <Link to="/lab/experiment-1">Experiment 1</Link>
                <Link to="/lab/experiment-2">Experiment 2</Link>
                <Link to="/lab/experiment-3">Experiment 3</Link>
                <Link to="/lab/experiment-4">Experiment 4</Link>
                <Link to="/lab/experiment-5">Experiment 5</Link>
                <Link to="/lab/experiment-6">Experiment 6</Link>
                <Link to="/lab/experiment-7">Experiment 7</Link>
                <Link to="/lab/experiment-8">Experiment 8</Link>
              </div>
            </div>

            {/* B92 Cascading Item */}
            <div
              className="nested-dropdown-trigger"
              onMouseEnter={() => setActiveSubMenu('b92')}
            >
              <span className="menu-label">B92 Protocols</span>
              <span className="qx-nav-caret-right">▸</span>

              <div className={`qx-nav-sub-menu ${activeSubMenu === 'b92' ? "active" : ""}`}>
                <Link to="/lab/b92-overview">B92 Overview</Link>
                <Link to="/lab/b92-experiment-1">Experiment 1</Link>
                <Link to="/lab/b92-experiment-2">Experiment 2</Link>
                <Link to="/lab/b92-experiment-3">Experiment 3</Link>
                <Link to="/lab/b92-experiment-4">Experiment 4</Link>
                <Link to="/lab/b92-experiment-5">Experiment 5</Link>
              </div>
            </div>

            {/* Lab Equipment remains at the bottom of the main dropdown */}
            <Link to="/lab/equipment" onMouseEnter={() => setActiveSubMenu(null)}>
              Lab Equipment
            </Link>
          </div>
        </li>

        <li>
          <Link to="/code-explorer" style={isActive("/code-explorer")}>
            Code Explorer
          </Link>
        </li>

        <li>
          <Link to="/postquiz" style={isActive("/postquiz")}>
            Assessment
          </Link>
        </li>

        <li>
          <Link to="/certification" style={isActive("/certification")}>
            Certification
          </Link>
        </li>

        <li>
          <Link
            to="/credits"
            className={`qx-nav-link ${location.pathname === "/credits" ? "active" : ""}`}
          >
            Credits
          </Link>
        </li>

        {/* GEMINI */}
        <li className="gemini-nav-item">
          <button
            className="qx-nav-link-btn gemini-btn"
            onClick={onOpenGemini}
            title="Gemini"
          >
            <img src={GeminiIcon} alt="Gemini" className="gemini-icon" />
          </button>
        </li>
      </ul>

      {/* START BUTTON */}
      <button
        className="qx-nav-start"
        onClick={() => (window.location.href = "/login")}
      >
        Start
      </button>
    </nav>
  );
}