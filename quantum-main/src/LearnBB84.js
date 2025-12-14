import React, { useState } from "react";
import "./LearnBB84.css";
import BlochSphereImage from './image.png';
import img1 from './images/image.png';

const TOPICS = [
  { 
    id: "quantum-basics",
    label: "Quantum Basics: The Qubit",
    tag: "What is a qubit?",
    image: BlochSphereImage,
    bullets: [
      "A classical bit is either 0 or 1. A qubit can exist in a superposition of both 0 and 1 at the same time.",
      "This superposition is not uncertainty—it is a real physical state.",
      "Only when a qubit is measured does it collapse into a definite value."
    ],
    longContent: {
      description: "Understanding qubits is the first step to grasping quantum cryptography. Unlike classical bits that are definitively 0 or 1, qubits exist in superposition—a fundamental quantum property that enables QKD."
    }
  },
  {
    id: "measurement-disturbance",
    label: "Measurement Disturbance",
    tag: "The core reason QKD works",
    image: BlochSphereImage,
    bullets: [
      "In classical systems, you can read data without changing it.",
      "In quantum systems, measurement changes the state and destroys the original superposition.",
      "This disturbance is unavoidable and fundamental—this single fact is the core reason QKD works."
    ],
    longContent: {
      description: "The measurement disturbance principle is the cornerstone of quantum security. Any attempt to observe a quantum state inevitably alters it, making eavesdropping detectable by the laws of physics themselves."
    }
  },
  {
    id: "no-cloning",
    label: "The No-Cloning Theorem",
    tag: "Why copying is impossible",
    image: img1,
    bullets: [
      "It is impossible to create an identical copy of an unknown quantum state.",
      "An eavesdropper cannot copy a photon and forward it safely.",
      "Any attempt to extract information leaves a trace, directly preventing invisible interception."
    ],
    longContent: {
      description: "The No-Cloning Theorem is a fundamental principle of quantum mechanics that guarantees the security of quantum communication. Unlike classical information, quantum states cannot be duplicated perfectly."
    }
  },
  {
    id: "bases-complementarity",
    label: "Bases and Complementarity",
    tag: "Incompatible measurements",
    image: BlochSphereImage,
    bullets: [
      "In BB84, two bases are used: Rectilinear basis (+) and Diagonal basis (×).",
      "If measured in the correct basis → original bit is recovered. Wrong basis → completely random result.",
      "These bases are incompatible—knowing one gives no information about the other (complementarity)."
    ],
    longContent: {
      description: "Complementarity is the quantum property that makes BB84 secure. The two measurement bases are incompatible, ensuring that an eavesdropper's wrong guess produces detectable randomness.",
      table: {
        title: "Basis Comparison",
        rows: [
          { basis: "Rectilinear (+)", bit0: "Horizontal (0°)", bit1: "Vertical (90°)" },
          { basis: "Diagonal (×)", bit0: "45°", bit1: "135°" }
        ]
      }
    }
  },
  {
    id: "quantum-cryptography",
    label: "What is Quantum Cryptography?",
    tag: "Security from physics, not math",
    image: BlochSphereImage,
    bullets: [
      "Quantum cryptography uses quantum mechanics to secure communication.",
      "Unlike classical cryptography (relies on hard math problems), it relies on physical laws that cannot be bypassed.",
      "Information encoded in quantum states cannot be observed or copied without changing it—eavesdropping becomes detectable by nature."
    ],
    longContent: {
      description: "Quantum cryptography represents a paradigm shift in secure communication. Instead of relying on computational complexity, it leverages the fundamental laws of physics to guarantee security."
    }
  },
  {
    id: "classical-weakness",
    label: "Why Classical Cryptography Is Not Enough",
    tag: "The quantum computer threat",
    image: BlochSphereImage,
    bullets: [
      "Today's secure communication relies on RSA (integer factorization) and ECC (discrete logarithms).",
      "A quantum computer running Shor's algorithm can break RSA and ECC efficiently.",
      "Attackers can store encrypted data today and decrypt it later ('harvest now, decrypt later')."
    ],
    longContent: {
      description: "The quantum threat is real and imminent. While classical cryptography has served us well, the advent of quantum computers poses an existential risk to current security infrastructure."
    }
  },
  {
    id: "qkd-types",
    label: "Types of Quantum Cryptography",
    tag: "Different approaches",
    image: BlochSphereImage,
    bullets: [
      "QKD (Quantum Key Distribution): Most mature, generates shared secret keys. Examples: BB84, E91, CV-QKD.",
      "QSDC (Quantum Secure Direct Communication): Sends message itself using quantum states, no separate key exchange.",
      "Quantum Digital Signatures: Verifies authenticity and non-repudiation using quantum states.",
      "Post-Quantum Cryptography: Classical algorithms designed to resist quantum attacks (not quantum cryptography)."
    ],
    longContent: {
      description: "Quantum cryptography encompasses various techniques, each with different applications. This lab focuses on QKD, specifically BB84, as it's the most practical and widely implemented approach."
    }
  },
  {
    id: "bb84-protocol",
    label: "What is the BB84 Protocol?",
    tag: "The foundation of QKD",
    image: BlochSphereImage,
    bullets: [
      "BB84 was proposed in 1984 by Charles Bennett and Gilles Brassard—the first QKD protocol.",
      "It's a prepare-and-measure protocol: Alice prepares quantum states (photons), Bob measures them.",
      "Goal: securely generate a shared secret key for encryption (e.g., one-time pad), not send messages directly."
    ],
    longContent: {
      description: "BB84 marked the beginning of quantum cryptography. Its elegance lies in its simplicity—using only single photons and two measurement bases to achieve provable security."
    }
  },
  {
    id: "bb84-security",
    label: "Why BB84 Is Secure",
    tag: "Physics guarantees security",
    image: BlochSphereImage,
    bullets: [
      "Security comes from quantum physics, not math problems.",
      "Measurement disturbs quantum states: non-orthogonal states cannot be perfectly distinguished.",
      "No-cloning theorem: unknown quantum states cannot be copied perfectly.",
      "Public but authenticated classical communication: bases are compared publicly, but key values never revealed."
    ],
    longContent: {
      description: "BB84's security is unconditional—it doesn't depend on the computational power of adversaries. The laws of quantum mechanics themselves prevent undetectable eavesdropping."
    }
  },
  {
    id: "bb84-encoding",
    label: "Information Encoding in BB84",
    tag: "Photon polarization",
    image: BlochSphereImage,
    bullets: [
      "Information encoded using single photons—each represents one bit (0 or 1).",
      "Rectilinear basis (+): Horizontal (0°) = bit 0, Vertical (90°) = bit 1.",
      "Diagonal basis (×): 45° = bit 0, 135° = bit 1.",
      "Incompatible bases: measuring in wrong basis produces random result."
    ],
    longContent: {
      description: "The encoding scheme is beautifully simple yet quantum mechanically robust. By using two incompatible bases, BB84 ensures that any interception attempt introduces detectable errors."
    }
  },
  {
    id: "bb84-workflow",
    label: "BB84 Workflow",
    tag: "From random bits to secret key",
    image: BlochSphereImage,
    bullets: [
      "1️⃣ Alice generates random bit string and random basis string.",
      "2️⃣ Alice prepares photons using these bits and bases, sends to Bob over quantum channel.",
      "3️⃣ Bob independently chooses random bases to measure each photon.",
      "4️⃣ Over public channel: Alice announces bases used, Bob tells which matched.",
      "5️⃣ Both discard mismatched bases—remaining bits form the sifted key.",
      "6️⃣ QBER estimation, error correction, privacy amplification → final secret key."
    ],
    longContent: {
      description: "The BB84 workflow is a carefully orchestrated dance between quantum and classical communication. Each step is designed to maximize security while maintaining practicality."
    }
  },
  {
    id: "detecting-eve",
    label: "Detecting an Eavesdropper (Eve)",
    tag: "QBER reveals attacks",
    image: BlochSphereImage,
    bullets: [
      "If Eve intercepts photons, she must guess the basis. Wrong guess collapses state randomly.",
      "Bob may receive incorrect bit even when his basis matches Alice's—creates extra errors.",
      "QBER = (Incorrect bits / Total matched bits) × 100%",
      "Low QBER → secure channel. High QBER → possible eavesdropping. If QBER exceeds threshold, abort."
    ],
    longContent: {
      description: "The Quantum Bit Error Rate is the security thermometer of BB84. It transforms the abstract concept of measurement disturbance into a concrete, measurable security metric."
    }
  },
  {
    id: "final-key",
    label: "Final Key Generation",
    tag: "Error correction & privacy amplification",
    image: BlochSphereImage,
    bullets: [
      "If error rate is acceptable: perform error correction to fix natural errors.",
      "Apply privacy amplification to remove any information Eve might have gained.",
      "Result: shared secret key known only to Alice and Bob.",
      "If error rate too high: discard protocol and restart."
    ],
    longContent: {
      description: "Key generation is the final stage where the raw quantum correlations are refined into a usable cryptographic key. Error correction and privacy amplification ensure both correctness and security."
    }
  },
  {
    id: "practical-considerations",
    label: "Practical Considerations",
    tag: "Real-world implementation",
    image: BlochSphereImage,
    bullets: [
      "Theoretical security proofs assume perfect implementations.",
      "Real systems face: hardware imperfections, detector inefficiencies, side-channel attacks.",
      "These can leak information without directly violating quantum laws.",
      "Modern QKD research focuses on closing these implementation gaps."
    ],
    longContent: {
      description: "The gap between theoretical security and practical implementation is a major focus of current QKD research. Real-world systems must account for imperfections while maintaining security guarantees."
    }
  },
  {
    id: "why-bb84-matters",
    label: "Why BB84 Matters",
    tag: "Foundation for secure quantum future",
    image: BlochSphereImage,
    bullets: [
      "BB84 is the first quantum cryptography protocol and foundation of modern QKD systems.",
      "It's a practical demonstration that physics can guarantee security.",
      "Represents a crucial step toward secure communication in the quantum era.",
      "In this lab: run BB84 under ideal conditions, introduce Eve, measure QBER, explore attacks."
    ],
    longContent: {
      description: "BB84 is more than a protocol—it's proof that quantum mechanics can solve real-world security problems. This lab transforms these concepts into observable, interactive experiences."
    }
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
      {/* HERO SECTION */}
      <section className="learn-hero">
        <div className="learn-hero-inner">
          <p className="learn-pill">Complete BB84 Foundation: From Qubits to Keys</p>
          <h1>Master quantum cryptography from first principles.</h1>
          <p className="learn-hero-sub">
            Dive deep into the quantum mechanics that powers unbreakable encryption.
            From the fundamental properties of qubits to the complete BB84 workflow,
            understand how physics itself guarantees security in the quantum age.
          </p>

          <div className="learn-hero-buttons">
            <button
              className="learn-cta-primary"
              onClick={() => scrollToTopic("quantum-basics")}
            >
              Start with Quantum Basics →
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
              <h3>Foundations</h3>
              <p>
                Build a solid understanding of quantum mechanics principles—
                qubits, superposition, measurement disturbance, and complementarity.
              </p>
            </div>
            <div className="learn-hero-card">
              <h3>Protocol</h3>
              <p>
                Walk through every step of BB84, from photon encoding to
                final key generation with error correction and privacy amplification.
              </p>
            </div>
            <div className="learn-hero-card">
              <h3>Security</h3>
              <p>
                Discover why quantum cryptography is fundamentally different—
                security guaranteed by physics, not computational complexity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TOPIC CARDS */}
      <section className="learn-topics">
        <div className="learn-topics-header">
          <h2>Explore the complete BB84 journey</h2>
          <p>
            Each card covers a key concept. Click for a quick overview, or scroll
            down for in-depth explanations with diagrams and examples.
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

      {/* LONG SCROLL SECTIONS */}
      {TOPICS.map((topic, index) => (
        <section
          key={topic.id}
          id={topic.id}
          className={`learn-section ${index % 2 === 1 ? "learn-section-reverse" : ""
            }`}
        >
          <div className="learn-section-text">
            <p className="learn-section-kicker">Concept {index + 1} of {TOPICS.length}</p>
            <h2>{topic.label}</h2>
            <p className="learn-section-tagline">{topic.tag}</p>

            {topic.longContent?.description && (
              <p className="learn-section-description">
                {topic.longContent.description}
              </p>
            )}

            <ul>
              {topic.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            {topic.id === "bases-complementarity" && topic.longContent?.table && (
              <div className="learn-basis-table">
                <h4>{topic.longContent.table.title}</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Basis</th>
                      <th>Bit 0</th>
                      <th>Bit 1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topic.longContent.table.rows.map((row, i) => (
                      <tr key={i}>
                        <td><strong>{row.basis}</strong></td>
                        <td>{row.bit0}</td>
                        <td>{row.bit1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {topic.id === "classical-weakness" && (
              <div className="learn-threat-box">
                <h4>⚠️ The Harvest Now, Decrypt Later Threat</h4>
                <p>
                  Adversaries are already storing encrypted communications. Once
                  quantum computers mature, they'll decrypt historical data retroactively.
                  Quantum cryptography addresses this by making the keys themselves
                  quantum—impossible to copy or store for later attack.
                </p>
              </div>
            )}

            {topic.id === "detecting-eve" && (
              <div className="learn-qber-detailed">
                <h4>Understanding QBER</h4>
                <div className="qber-formula">
                  <strong>QBER = (Incorrect bits / Total matched bits) × 100%</strong>
                </div>
                <div className="qber-ranges">
                  <div className="qber-range qber-safe">
                    <span className="qber-label">0–11%</span>
                    <span className="qber-desc">Normal noise, secure</span>
                  </div>
                  <div className="qber-range qber-suspicious">
                    <span className="qber-label">11–25%</span>
                    <span className="qber-desc">Suspicious, investigate</span>
                  </div>
                  <div className="qber-range qber-danger">
                    <span className="qber-label">&gt;25%</span>
                    <span className="qber-desc">Eve active, abort</span>
                  </div>
                </div>
              </div>
            )}

            {topic.id === "bb84-workflow" && (
              <div className="learn-workflow-steps">
                <h4>Step-by-Step Process</h4>
                <ol className="workflow-list">
                  <li>
                    <strong>Alice's Preparation:</strong> Generate random bits and bases,
                    encode into photon polarizations
                  </li>
                  <li>
                    <strong>Quantum Transmission:</strong> Send photons through quantum
                    channel (fiber optic or free space)
                  </li>
                  <li>
                    <strong>Bob's Measurement:</strong> Choose random bases independently,
                    measure incoming photons
                  </li>
                  <li>
                    <strong>Basis Reconciliation:</strong> Compare bases publicly via
                    authenticated classical channel
                  </li>
                  <li>
                    <strong>Key Sifting:</strong> Keep only bits where bases matched,
                    discard the rest
                  </li>
                  <li>
                    <strong>Error Estimation:</strong> Sacrifice sample bits to calculate
                    QBER and detect eavesdropping
                  </li>
                  <li>
                    <strong>Post-Processing:</strong> Error correction and privacy
                    amplification yield final secure key
                  </li>
                </ol>
              </div>
            )}
          </div>

          <div className="learn-section-visual">
            <div
              className="learn-section-image"
              style={{ backgroundImage: `url(${topic.image})` }}
            />

            {topic.id === "quantum-basics" && (
              <div className="learn-qubit-states">
                <h4>Qubit States</h4>
                <div className="state-item">
                  <span className="state-label">Classical bit:</span>
                  <span className="state-value">0 <strong>or</strong> 1</span>
                </div>
                <div className="state-item">
                  <span className="state-label">Qubit:</span>
                  <span className="state-value">0 <strong>and</strong> 1 (superposition)</span>
                </div>
                <div className="state-item">
                  <span className="state-label">After measurement:</span>
                  <span className="state-value">Collapses to 0 <strong>or</strong> 1</span>
                </div>
              </div>
            )}

            {topic.id === "qkd-types" && (
              <div className="learn-types-summary">
                <div className="type-badge type-primary">QKD (Focus of this lab)</div>
                <div className="type-badge type-secondary">QSDC (Research)</div>
                <div className="type-badge type-secondary">Quantum Signatures (Experimental)</div>
                <div className="type-badge type-tertiary">Post-Quantum Crypto (Classical)</div>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* FINAL CTA SECTION */}
      <section className="learn-final-cta">
        <div className="learn-final-inner">
          <h2>Ready to see it in action?</h2>
          <p>
            You've learned the theory—now experience BB84 firsthand in the Virtual Lab.
            Run simulations, activate Eve, measure QBER, and explore how quantum physics
            detects eavesdropping in real time.
          </p>
          <div className="learn-final-buttons">
            <button
              className="learn-cta-primary"
              onClick={() => (window.location.href = "/lab")}
            >
              Launch Virtual Lab →
            </button>
            <button
              className="learn-cta-secondary"
              onClick={() => scrollToTopic("quantum-basics")}
            >
              ↑ Back to Top
            </button>
          </div>
        </div>
      </section>

      {/* MODAL FOR QUICK OVERVIEW */}
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