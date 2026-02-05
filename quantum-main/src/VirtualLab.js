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
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="22" y1="22" x2="78" y2="78" />
          <line x1="78" y1="22" x2="22" y2="78" />
          <circle cx="50" cy="50" r="3" />
        </svg>
      );
    case "transmission":
      return (
        <svg viewBox="0 0 100 100">
          <path d="M10 50 Q 30 20, 50 50 T 90 50" />
          <circle cx="15" cy="50" r="2" />
          <circle cx="45" cy="50" r="2" />
          <circle cx="85" cy="50" r="2" />
          <line x1="0" y1="60" x2="100" y2="60" strokeDasharray="4 4" />
        </svg>
      );
    case "measurement":
      return (
        <svg viewBox="0 0 100 100">
          <rect x="30" y="30" width="40" height="40" />
          <line x1="50" y1="10" x2="50" y2="30" />
          <path d="M40 80 L 50 70 L 60 80" />
          <circle cx="50" cy="50" r="10" strokeDasharray="2 2" />
        </svg>
      );
    case "sifting":
      return (
        <svg viewBox="0 0 100 100">
          <rect x="20" y="20" width="25" height="25" className="filled" />
          <rect x="55" y="20" width="25" height="25" />
          <rect x="20" y="55" width="25" height="25" />
          <rect x="55" y="55" width="25" height="25" className="filled" />
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

const STEPS = [
  {
    id: "01",
    icon: "encoding",
    title: "Quantum Mapping",
    subtitle: "Alice initialization",
    desc: "Alice selects random bit values and bases. Photons are prepared in |0°⟩, |90°⟩, |45°⟩, or |135°⟩ states.",
    theory: "Non-orthogonal state selection ensures inherently probabilistic results for intruders."
  },
  {
    id: "02",
    icon: "transmission",
    title: "Secure Channel",
    subtitle: "Qubit Propagation",
    desc: "Single-photon pulses emitted across fiber link. Hardware prevents Photon Number Splitting (PNS) attacks.",
    theory: "No-Cloning Theorem: Unknown quantum states cannot be copied without altering the original."
  },
  {
    id: "03",
    icon: "measurement",
    title: "Basis Choice",
    subtitle: "Bob Detection",
    desc: "Bob chooses measurement bases (+ or ×) randomly. Matching hardware orientation yields deterministic bits.",
    theory: "Heisenberg's Uncertainty Principle: Measuring one property irreversibly alters the other."
  },
  {
    id: "04",
    icon: "sifting",
    title: "Sifting Phase",
    subtitle: "Reconciliation",
    desc: "Bases are revealed over public channel. Non-matching events are discarded; only alignment matches remain.",
    theory: "Sifting statistically reduces the Raw Key by 50%, forming the secure 'Sifted Key'."
  },
  {
    id: "05",
    icon: "qber",
    title: "Error Analysis",
    subtitle: "Thresholding",
    desc: "Quantum Bit Error Rate (QBER) calculation. This bounds the total info leak to potential eavesdroppers.",
    theory: "Mathematical limit: If QBER exceeds 11%, security is compromised and the protocol aborts."
  },
  {
    id: "06",
    icon: "privacy",
    title: "Distillation",
    subtitle: "Final Compression",
    desc: "Privacy amplification via hashing removes partial knowledge. Key is shrunk to ensure absolute secrecy.",
    theory: "Result: A One-Time Pad, the only mathematically proven unbreakable encryption method."
  }
];

export default function VirtualLab() {
  return (
    <div className="lab-container">
      <QuantumBackground />
      <div className="technical-grid" />
      <div className="scanline" />

      <main className="lab-main">
        {/* Header */}
        <header className="lab-header">
          <h1 className="lab-title">
            Physics of <br />
            <span className="title-connector">of</span> Privacy
          </h1>
          <p className="lab-subtitle">
            BB84 Protocol Documentation // System-Level Analysis of Quantum Key Distribution Safeguards.
          </p>
        </header>

        <div className="divider-label">
          <span className="divider-text">Architecture_v2.0</span>
        </div>

        {/* Encoding Schema */}
        <section className="schema-section">
          <div className="schema-header">
            <h2 className="schema-title">The Schema.</h2>
            <p className="schema-description">
              Mapping binary logic to non-orthogonal basis states (+/×).
            </p>
          </div>
          <div className="schema-row">
            <div className="schema-item">
              <span className="schema-label">RECT/0</span>
              <span className="schema-icon">↑</span>
              <span className="schema-deg">0°</span>
            </div>
            <div className="schema-item">
              <span className="schema-label">RECT/1</span>
              <span className="schema-icon">→</span>
              <span className="schema-deg">90°</span>
            </div>
            <div className="schema-item">
              <span className="schema-label">DIAG/0</span>
              <span className="schema-icon">↗</span>
              <span className="schema-deg">45°</span>
            </div>
            <div className="schema-item">
              <span className="schema-label">DIAG/1</span>
              <span className="schema-icon">↘</span>
              <span className="schema-deg">135°</span>
            </div>
          </div>
        </section>

        <div className="divider-label">
          <span className="divider-text">Operation_Phases</span>
        </div>

        {/* Phase Grid */}
        <section className="phase-grid">
          {STEPS.map((step) => (
            <article key={step.id} className="phase-card">
              <div className="phase-content">
                <div className="phase-header">
                  <span className="phase-id">P_{step.id}</span>
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
                    <span className="theory-label">LOG_CORE:</span> {step.theory}
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