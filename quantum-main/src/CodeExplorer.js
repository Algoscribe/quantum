import React from "react";
import "./CodeExplorer.css";
import QuantumBackground from "./QuantumBackground";

const BB84Page = () => {
  // Updated URL with your new Google Colab link
  const ipynbUrl =
    "https://colab.research.google.com/drive/1PbWvoreGXcaiauVaMEH2FHPM_fh-qCLy?usp=sharing";

  return (
    <div className="bb84-container">
      <QuantumBackground />

      <div className="bb84-content">
        <h1 className="title">BB84 Quantum Key Distribution Protocol</h1>

        <h2 className="subtitle">
          Project Summary: Secure Key Generation & Encryption
        </h2>

        <p className="summary-text">
          This interactive Jupyter Notebook implements the{" "}
          <strong>BB84 (Bennett and Brassard, 1984)</strong> protocol the first
          Quantum Key Distribution (QKD) scheme using the{" "}
          <strong>Qiskit quantum computing framework</strong>. The protocol
          enables two legitimate parties, Alice and Bob, to establish a shared,
          secret cryptographic key whose security is guaranteed by the
          fundamental laws of quantum physics.
        </p>

        <div className="section">
          <h3 className="section-title">Core Protocol Steps</h3>

          <ul className="protocol-list">
            <li>
              <strong>Quantum Encoding (Alice):</strong> Alice encodes classical
              bits (0 and 1) into quantum states using a randomly chosen basis
              (Rectilinear or Diagonal). The independence between bit value and
              basis choice is central to BB84’s security.
            </li>

            <li>
              <strong>Eavesdropper Detection (Eve):</strong> The simulation
              models an intercept–resend attack by Eve. Due to the{" "}
              <strong>No-Cloning Theorem</strong>, any incorrect measurement
              irreversibly disturbs the quantum state.
            </li>

            <li>
              <strong>Measurement & Sifting (Bob):</strong> Bob measures each
              photon using a randomly chosen basis. Alice and Bob then publicly
              compare bases (not outcomes) and retain only the bits where their
              bases match.
            </li>

            <li>
              <strong>Security Analysis (QBER):</strong> The{" "}
              <strong>Quantum Bit Error Rate (QBER)</strong> is computed from a
              subset of the sifted key. A QBER exceeding the theoretical
              threshold (~25%) signals the presence of eavesdropping and causes
              the protocol to abort.
            </li>

            <li>
              <strong>Key Generation & Encryption:</strong> The final secure key
              is used to encrypt a message using a simple repeating XOR cipher,
              demonstrating the practical utility of quantum-generated keys.
            </li>
          </ul>
        </div>

        <p className="security-note">
          <strong>Key Takeaway:</strong> The BB84 simulation successfully
          generates a shared secret key and verifies its security using standard
          QKD thresholds, demonstrating that quantum mechanics enables
          intrinsic detection of eavesdropping.
        </p>

        <a
          href={ipynbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ipynb-button"
        >
          View Full BB84 Qiskit Notebook
        </a>
      </div>
    </div>
  );
};

export default BB84Page;