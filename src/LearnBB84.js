import React, { useState } from "react";
import "./App.css";

const TOPICS = [
  {
    id: "quantum-threat",
    label: "The Quantum Threat",
    tag: "Why today’s crypto breaks",
    image:
      "https://images.pexels.com/photos/5380640/pexels-photo-5380640.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bullets: [
      "Classical crypto (RSA, ECC) relies on hard math problems.",
      "A large quantum computer running Shor’s algorithm can break RSA/ECC in minutes.",
      "Attackers can “Harvest Now, Decrypt Later” – store your data today and decrypt it when quantum machines arrive."
    ]
  },
  {
    id: "classical-vs-quantum",
    label: "Classical vs Quantum Keys",
    tag: "Why QKD is different",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS3AdkeE8oyHAHTkNJD1PIwFIKTyvA1leHag&s",
    bullets: [
      "Classical key exchange: keys are just bits → can be copied perfectly.",
      "An attacker (Eve) can intercept, copy and forward, leaving no trace.",
      "QKD uses single photons. Measurement disturbs them, so eavesdropping leaves a detectable fingerprint."
    ]
  },
  {
    id: "quantum-principles",
    label: "Quantum Principles",
    tag: "The physics behind QKD",
    image:
      "https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bullets: [
      "Superposition: a qubit can be 0 and 1 at the same time until measured.",
      "Measurement Disturbance: observing a qubit forces it into one state and changes it.",
      "No-Cloning Theorem: you cannot make a perfect copy of an unknown quantum state.",
      "Complementarity: some measurements are incompatible – wrong basis gives random results."
    ]
  },
  {
    id: "qber",
    label: "Quantum Bit Error Rate (QBER)",
    tag: "Security thermometer",
    image:
      "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bullets: [
      "QBER = (number of mismatched bits) / (total bits compared) × 100%.",
      "Low QBER (~0–11%) → normal noise, channel considered secure.",
      "Eve measuring randomly introduces ~25% errors in tampered bits → clearly visible spike in QBER."
    ]
  },
  {
    id: "qkd-types",
    label: "Types of QKD",
    tag: "Different flavours",
    image:
      "https://images.pexels.com/photos/5867440/pexels-photo-5867440.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bullets: [
      "BB84: the original polarization-based protocol, simplest to learn and simulate.",
      "E91: uses entangled photon pairs and Bell-inequality tests.",
      "CV-QKD: uses continuous variables of light (amplitude, phase) – better for existing fibre networks."
    ]
  },
  {
    id: "bb84-steps",
    label: "BB84 Workflow",
    tag: "From random bits to secret key",
    image:
      "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bullets: [
      "1️⃣ Alice encodes random bits using random bases (+ or ×) on single photons.",
      "2️⃣ Bob measures each photon with his own random choice of basis.",
      "3️⃣ Over a public channel they reveal only the bases, not the bit values (sifting).",
      "4️⃣ They keep bits where bases matched → sifted key.",
      "5️⃣ They reveal a small sample to estimate QBER and detect Eve.",
      "6️⃣ If QBER is low → error correction + privacy amplification → final secret key."
    ]
  },
  {
    id: "activate-eve",
    label: "Activate Eve",
    tag: "See attacks live in the lab",
    image:
      "https://images.pexels.com/photos/5380641/pexels-photo-5380641.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bullets: [
      "In your BB84 Virtual Lab, you can switch Eve ON and OFF.",
      "When Eve guesses the basis wrongly, she collapses the qubit in a random way.",
      "This random disturbance increases the QBER towards ~25%.",
      "By just looking at QBER, Alice and Bob can decide whether to keep or discard the key."
    ]
  }
];

export default function LearnBB84() {
  const [activeTopic, setActiveTopic] = useState(null);

  const closeModal = () => setActiveTopic(null);

  const scrollToTopic = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="learn-page qx-page">
      {/* HERO SECTION (STYLE A) */}
      <section className="learn-hero">
        <div className="learn-hero-inner">
          <p className="learn-pill">BB84 Made Interactive: Learn · Test · Innovate</p>
          <h1>Understand the physics behind unbreakable keys.</h1>
          <p className="learn-hero-sub">
            Q-Xplore turns abstract quantum theory into a hands-on adventure.
            Learn how Quantum Key Distribution (QKD) protects data not with
            hard maths, but with the laws of nature.
          </p>

          <div className="learn-hero-buttons">
            <button
              className="learn-cta-primary"
              onClick={() => scrollToTopic("quantum-threat")}
            >
              Start with the Quantum Threat →
            </button>
            <button
              className="learn-cta-secondary"
              onClick={() => (window.location.href = "/prequiz")}
            >
              Take the Pre-Quiz
            </button>
          </div>

          <div className="learn-hero-grid">
            <div className="learn-hero-card">
              <h3>Learn</h3>
              <p>
                Short, visual explanations of QKD concepts – built from your
                project document, but broken into snack-sized pieces.
              </p>
            </div>
            <div className="learn-hero-card">
              <h3>Simulate</h3>
              <p>
                Run the BB84 protocol with Qiskit, toggle Eve, and see QBER
                change in real time in the Virtual Lab.
              </p>
            </div>
            <div className="learn-hero-card">
              <h3>Secure</h3>
              <p>
                Understand why QKD is future-proof against quantum computers –
                no matter how powerful they become.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TOPIC CARDS (STYLE C) */}
      <section className="learn-topics">
        <div className="learn-topics-header">
          <h2>Pick a concept to dive into</h2>
          <p>
            Each card opens a quick explainer. You can also scroll down to see
            the same ideas as full-screen sections with diagrams.
          </p>
        </div>

        <div className="learn-cards-grid">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              className="learn-card"
              onClick={() => setActiveTopic(topic)}
            >
              <div
                className="learn-card-image"
                style={{ backgroundImage: `url(${topic.image})` }}
              />
              <div className="learn-card-body">
                <h3>{topic.label}</h3>
                <p>{topic.tag}</p>
                <span className="learn-card-link">Open quick overview ↗</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* LONG SCROLL SECTIONS (STYLE A) */}
      {TOPICS.map((topic, index) => (
        <section
          key={topic.id}
          id={topic.id}
          className={`learn-section ${index % 2 === 1 ? "learn-section-reverse" : ""
            }`}
        >
          <div className="learn-section-text">
            <p className="learn-section-kicker">Section {index + 1}</p>
            <h2>{topic.label}</h2>
            <p className="learn-section-tagline">{topic.tag}</p>
            <ul>
              {topic.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            {topic.id === "classical-vs-quantum" && (
              <div className="learn-mini-table">
                <div>
                  <h4>Classical Key Exchange</h4>
                  <ul>
                    <li>Security from hard math problems.</li>
                    <li>Keys can be copied undetected.</li>
                    <li>Breakable by large quantum computers.</li>
                  </ul>
                </div>
                <div>
                  <h4>Quantum Key Distribution</h4>
                  <ul>
                    <li>Security from quantum physics.</li>
                    <li>Measurement leaves a trace.</li>
                    <li>Secure even against quantum computers.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="learn-section-visual">
            <div
              className="learn-section-image"
              style={{ backgroundImage: `url(${topic.image})` }}
            />
            {topic.id === "bb84-steps" && (
              <ol className="learn-step-list">
                <li>Alice: random bits + random bases → photons.</li>
                <li>Bob: random bases → measurement results.</li>
                <li>Public channel: compare bases, sift key.</li>
                <li>Sample bits for QBER → detect Eve.</li>
                <li>Low QBER → error correction + privacy amplification.</li>
              </ol>
            )}
            {topic.id === "qber" && (
              <div className="learn-qber-box">
                <p>
                  <strong>QBER = (mismatched bits / tested bits) × 100%</strong>
                </p>
                <p>0–11% → OK · 11–25% → suspicious · &gt;25% → Eve active</p>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* MODAL FOR QUICK OVERVIEW (FROM CARDS) */}
      {activeTopic && (
        <div className="learn-modal-backdrop" onClick={closeModal}>
          <div
            className="learn-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="learn-modal-close" onClick={closeModal}>
              ×
            </button>
            <div
              className="learn-modal-image"
              style={{ backgroundImage: `url(${activeTopic.image})` }}
            />
            <h3>{activeTopic.label}</h3>
            <p className="learn-modal-tag">{activeTopic.tag}</p>
            <ul>
              {activeTopic.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <button
              className="learn-cta-primary learn-modal-button"
              onClick={() => {
                closeModal();
                scrollToTopic(activeTopic.id);
              }}
            >
              Scroll to full section ↓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
