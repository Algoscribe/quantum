// src/VirtualLab.js
import React from "react";
import QuantumBackground from "./QuantumBackground";
import "./VirtualLab.css";

const STEPS = [
  {
    id: "step-1",
    stepNo: "01",
    title: "Quantum Encoding",
    subtitle: "Alice turns bits into photons",
    image:
      "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=1200",
    short:
      "Alice starts with a random string of 0s and 1s, and hides them in single photons using two secret bases.",
    bullets: [
      "Alice creates a random list of bits (0s and 1s).",
      "For each bit she secretly picks a basis: + (rectilinear) or × (diagonal).",
      "She sends out one photon per bit, polarised according to the bit and basis."
    ]
  },
  {
    id: "step-2",
    stepNo: "02",
    title: "Quantum Transmission",
    subtitle: "The photons start their journey",
    image:
      "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=1200",
    short:
      "These photons travel down the quantum channel, one by one, carrying Alice’s hidden choices.",
    bullets: [
      "Photons move through fibre or free-space towards Bob.",
      "Nobody can copy these photons perfectly – that would break quantum rules.",
      "At this point only Alice knows exactly what she sent."
    ]
  },
  {
    id: "step-3",
    stepNo: "03",
    title: "Quantum Measurement",
    subtitle: "Bob guesses the bases",
    image:
      "https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&w=1200",
    short:
      "Bob measures each photon with his own random basis choice. Sometimes he’s right, sometimes he’s just guessing.",
    bullets: [
      "For every photon Bob randomly chooses + or × as his measurement basis.",
      "If his basis matches Alice’s, he gets the correct bit.",
      "If it doesn’t match, his result is completely random – a pure guess."
    ]
  },
  {
    id: "step-4",
    stepNo: "04",
    title: "Sifting in Public",
    subtitle: "Talking in public, keeping secrets",
    image:
      "https://images.pexels.com/photos/5380640/pexels-photo-5380640.jpeg?auto=compress&cs=tinysrgb&w=1200",
    short:
      "Alice and Bob now talk on a normal channel, keeping only positions where their bases matched.",
    bullets: [
      "They reveal only the sequence of bases they used, never the bit values.",
      "They keep positions where their bases agree and discard the rest.",
      "The surviving bits form the sifted key – a first draft of the secret key."
    ]
  },
  {
    id: "step-5",
    stepNo: "05",
    title: "Catching Eve with QBER",
    subtitle: "Errors as a security alarm",
    image:
      "https://images.pexels.com/photos/5380645/pexels-photo-5380645.jpeg?auto=compress&cs=tinysrgb&w=1200",
    short:
      "They sacrifice a few bits and measure the error rate. Too many errors → someone has been listening.",
    bullets: [
      "Alice and Bob reveal a random sample of their sifted key.",
      "They compute the Quantum Bit Error Rate (QBER) – the % of mismatches.",
      "Low QBER (0–11%) → mostly noise. High QBER (~25% or more) → Eve is probably active."
    ]
  },
  {
    id: "step-6",
    stepNo: "06",
    title: "Privacy Amplification",
    subtitle: "Shrinking to a perfect key",
    image:
      "https://images.pexels.com/photos/5867440/pexels-photo-5867440.jpeg?auto=compress&cs=tinysrgb&w=1200",
    short:
      "If the line looks safe, Alice and Bob clean up the errors and compress the key into something Eve can’t use.",
    bullets: [
      "They run error correction to fix any remaining mismatches.",
      "They apply privacy amplification to remove any information Eve might still know.",
      "The final result: a shorter, perfectly secret key shared only between Alice and Bob."
    ]
  }
];

export default function VirtualLab() {
  return (
    <>
      <QuantumBackground />

      <main className="qx-page virtual-lab-page">
        {/* HERO */}
        <section className="vl-hero">
          <div className="vl-hero-inner">
            <p className="vl-pill">BB84 Virtual Lab · Overview</p>
            <h1>
              Walk through the BB84 key creation
              <span className="vl-hero-accent">
                {" "}
                in six simple, visual steps.
              </span>
            </h1>
            <p className="vl-hero-sub">
              This page is your map. First you see the six core moments of the
              protocol. Hover on any tile to reveal what’s really happening to
              the photons – and then jump into the lab to see it all in motion.
            </p>
          </div>
        </section>

        {/* STEPS GRID */}
        <section className="vl-steps-section">
          <div className="vl-steps-inner">
            <div className="vl-steps-grid">
              {STEPS.map((step, index) => (
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
                      Hover to see what’s happening behind the scenes ↗
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

        {/* CTA STRIP */}
        <section className="vl-bottom-section">
          <div className="vl-bottom-strip">
            <div className="vl-bottom-text">
              <p className="vl-bottom-heading">
                Ready to move from story mode to lab mode?
              </p>
              <p className="vl-bottom-body">
                In the BB84 Virtual Lab you can flip Eve ON, watch QBER jump,
                and see this six-step story play out in real time.
              </p>
            </div>
            <a href="/bb84-simulation" className="vl-bottom-cta">
              Launch the BB84 Lab
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
