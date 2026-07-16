// src/B92.js
import React from "react";
import "./VirtualLab.css";
import QuantumBackground from "./QuantumBackground";

const QuantumIcon = ({ type }) => {
  switch (type) {
    case "encoding":
      return (
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" strokeDasharray="2 2" />
          <line x1="50" y1="10" x2="50" y2="90" />
          <line x1="22" y1="22" x2="78" y2="78" />
          <circle cx="50" cy="50" r="3" />
        </svg>
      );
    case "transmission":
      return (
        <svg viewBox="0 0 100 100">
          <path d="M10 50 Q 30 20, 50 50 T 90 50" />
          <line x1="0" y1="60" x2="100" y2="60" strokeDasharray="4 4" />
        </svg>
      );
    case "measurement":
      return (
        <svg viewBox="0 0 100 100">
          <rect x="30" y="30" width="40" height="40" />
          <line x1="50" y1="10" x2="50" y2="30" />
          <path d="M40 80 L 50 70 L 60 80" />
        </svg>
      );
    case "qber":
      return (
        <svg viewBox="0 0 100 100" className="error-icon">
          <line x1="20" y1="20" x2="80" y2="80" />
          <line x1="80" y1="20" x2="20" y2="80" />
          <circle cx="50" cy="50" r="40" />
        </svg>
      );
    case "privacy":
      return (
        <svg viewBox="0 0 100 100">
          <path d="M30 40 V 70 H 70 V 40 Z" />
          <path d="M40 40 V 30 C 40 20, 60 20, 60 30 V 40" />
        </svg>
      );
    default:
      return null;
  }
};

const B92_STEPS = [
  {
    id: "01",
    icon: "encoding",
    title: "Writing the Message",
    subtitle: "Alice Sends Letters",
    desc: "Alice prepares photons using only two specialized states: a flat 0° line for Bit 0, and a diagonal 45° line for Bit 1.",
    theory: "Forget BB84's matching bases game! B92 relies strictly on these two unique, offset choices to trigger specific detector clicks."
  },
  {
    id: "02",
    icon: "transmission",
    title: "The Filter Test",
    subtitle: "Bob's Clicks & Silent Runs",
    desc: "Bob sets up a 90° filter to look for Bit 1, and a -45° filter to look for Bit 0. He listens to see if his detector clicks or stays silent.",
    theory: "If Bob's filter matches Alice's line, the photon is blocked (Silent Run). If he picks the other filter, it passes through 50% of the time (💥 CLICK!)."
  },
  {
    id: "03",
    icon: "measurement",
    title: "Catching the Intruder",
    subtitle: "Eve Destroys the Story",
    desc: "If Eve intercept-resends, she opens the letters midway. This breaks their orientation and causes random results at Bob's end.",
    theory: "Interception Footprint: Eve trying to read the lines introduces a massive, highly visible 25% mistake rate in Bob's saved clicks."
  },
  {
    id: "04",
    icon: "qber",
    title: "Checking for Mistakes",
    subtitle: "Calculating QBER",
    desc: "Alice and Bob share a public sample of their saved bits to check the Error Rate (QBER) and catch any active eavesdroppers.",
    theory: "Safety Limit: In a perfect channel, the error rate should be exactly 0%. Any mistake means someone is actively reading your mail!"
  },
  {
    id: "05",
    icon: "privacy",
    title: "Sifting the Final Key",
    subtitle: "Saving the Clicks",
    desc: "Bob completely throws away all the 'Silent' results (Trash). He keeps only the '💥 CLICK!' results to build the secret key.",
    theory: "Result: A clean, fully compiled secure key built strictly from the clicks, keeping the password totally safe from the outside world."
  }
];

export default function B92Overview() {
  return (
    <div className="lab-container">
      {/* 3D Visual Layer */}
      <QuantumBackground />
      <div className="technical-grid" />
      <div className="scanline" />

      <main className="lab-main">
        <header className="lab-header">
          <h1 className="lab-title">
            Physics of <br />
            <span className="title-connector">B92</span> Secrecy
          </h1>
          <p className="lab-subtitle">
            B92 Interactive Virtual Lab // Simple Learning Guide to Two-State Quantum Key Distribution.
          </p>
        </header>

        <div className="divider-label">
          <span className="divider-text">B92_Architecture</span>
        </div>

        <section className="schema-section">
          <div className="schema-header">
            <h2 className="schema-title">The Two-State Mapping Layout</h2>
            <p className="schema-description">
              Alice sets up her photons using only two distinct vector positions:
            </p>
          </div>
          <div className="schema-row" style={{ justifyContent: "center", gap: "40px" }}>
            <div className="schema-item">
              <span className="schema-label">BIT 0</span>
              <span className="schema-icon">→</span>
              <span className="schema-deg">Horizontal (0°)</span>
            </div>
            <div className="schema-item">
              <span className="schema-label">BIT 1</span>
              <span className="schema-icon">↗</span>
              <span className="schema-deg">Diagonal (45°)</span>
            </div>
          </div>
        </section>

        <div className="divider-label">
          <span className="divider-text">How_B92_Works_Step_By_Step</span>
        </div>

        <section className="phase-grid">
          {B92_STEPS.map((step) => (
            <article key={step.id} className="phase-card">
              <div className="phase-content">
                <div className="phase-header">
                  <span className="phase-id">Step_{step.id}</span>
                  <div className="phase-icon">
                    <QuantumIcon type={step.icon} />
                  </div>
                </div>

                <div className="phase-info">
                  <h3 className="phase-title">{step.title}</h3>
                  <p className="phase-subtitle">{step.subtitle}</p>
                  <p className="phase-desc">{step.desc}</p>
                </div>

                <div className="phase-theory">
                  <div className="theory-line" />
                  <p className="theory-text">
                    <span className="theory-label">WHAT HAPPENS:</span> {step.theory}
                  </p>
                </div>
              </div>
              <div className="card-glow" />
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}