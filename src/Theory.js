// src/Theory.js
import React from "react";
import QuantumBackground from "./QuantumBackground";
import "./Theory.css";

const THEORY_STEPS = [
  {
    id: "step-1",
    stepNo: "01",
    title: "Quantum Bases",
    subtitle: "Alice encodes bits into photons",
    image: "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=1200",
    short: "The BB84 scheme uses two bases: Rectilinear (+) and Diagonal (×).",
    bullets: [
      "Alice randomly chooses bases & bits to encode photons.",
      "Bob randomly measures them.",
      "Only matching-basis results are kept."
    ]
  },
  {
    id: "step-2",
    stepNo: "02",
    title: "Eavesdropping Detection",
    subtitle: "Errors reveal Eve",
    image: "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=1200",
    short: "Any attempt by Eve to intercept introduces detectable errors.",
    bullets: [
      "No-cloning theorem prevents perfect copying of qubits.",
      "Measurement by Eve collapses quantum states.",
      "Alice and Bob can detect the presence of an eavesdropper."
    ]
  },
  {
    id: "step-3",
    stepNo: "03",
    title: "Sifting & Key Generation",
    subtitle: "Forming the final key",
    image: "https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&w=1200",
    short: "After basis reconciliation, Alice and Bob obtain a raw key.",
    bullets: [
      "Mismatched bits are removed.",
      "Remaining bits form a shared raw key.",
      "Further processing yields a final secure key."
    ]
  }
];

export default function Theory() {
  return (
    <>
      <QuantumBackground />

      <main className="qx-page virtual-lab-page">
        {/* HERO */}
        <section className="vl-hero">
          <div className="vl-hero-inner">
            <p className="vl-pill">BB84 Theory · Overview</p>
            <h1>
              Understanding BB84 key distribution
              <span className="vl-hero-accent">
                {" "}step by step.
              </span>
            </h1>
            <p className="vl-hero-sub">
              This page mirrors the Virtual Lab layout but focuses on theory. 
              Hover on any tile to learn the key concepts behind each step.
            </p>
          </div>
        </section>

        {/* THEORY STEPS GRID */}
        <section className="vl-steps-section">
          <div className="vl-steps-inner">
            <div className="vl-steps-grid">
              {THEORY_STEPS.map((step, index) => (
                <article
                  key={step.id}
                  className={`vl-step-card vl-step-${index + 1} vl-anim`}
                >
                  <div
                    className="vl-step-image"
                    style={{ backgroundImage: `url(${step.image})` }}
                  />

                  <div className="vl-step-overlay vl-hover-card">
                    <div className="vl-step-header">
                      <span className="vl-step-no">{step.stepNo}</span>
                      <div className="vl-step-titles">
                        <p className="vl-step-label">{step.title}</p>
                        <p className="vl-step-subtitle">{step.subtitle}</p>
                      </div>
                    </div>
                    <p className="vl-step-short">{step.short}</p>
                    <span className="vl-step-hint">
                      Hover to see details ↗
                    </span>
                  </div>

                  <div className="vl-step-detail">
                    <ul>
                      {step.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
