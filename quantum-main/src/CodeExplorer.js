import React from 'react';
import './CodeExplorer.css';
// Import the custom background component as requested
import QuantumBackground from './QuantumBackground';

const BB84Page = () => {
  // Direct link to the Colab file provided by the user
  const ipynbUrl = "https://colab.research.google.com/drive/1l2mLWm88IaPHNrY0yDPHkSQrwZJnvbeu#scrollTo=-8x9wNXOLTqC";

  return (
    <div className="bb84-container">
      {/* Background component for the theme */}
      <QuantumBackground />
      
      <div className="bb84-content">
        <h1 className="title">BB84 Quantum Key Distribution Protocol</h1>
        
        <h2 className="subtitle">Project Summary: Secure Key Generation and Encryption</h2>
        
        <p className="summary-text">
          This interactive Jupyter Notebook implements the **BB84 (Bennett and Brassard 1984) Protocol**, the first quantum key distribution (QKD) scheme, using the Qiskit quantum computing framework. The protocol allows two parties, Alice and Bob, to establish a shared, secret cryptographic key whose security is guaranteed by the laws of physics.
        </p>

        <div className="section">
          <h3>Core Protocol Steps:</h3>
          <ul>
            <li>**Quantum Encoding (Alice):** Alice encodes classical bits (0s and 1s) into polarized photons using a randomly chosen basis (Rectilinear or Diagonal). The basis choice is independent of the bit value, which is key to security.</li>
            <li>**Eavesdropper Detection (Eve):** The simulation models an Eve attempting an intercept-resend attack. Due to the **No-Cloning Theorem**, any measurement Eve makes on a photon not in the correct basis introduces a measurable disturbance.</li>
            <li>**Measurement and Sifting (Bob):** Bob randomly chooses a measurement basis for each photon. Alice and Bob publicly compare their bases (but not their results) to "sift" the key, keeping only the bits where their bases matched.</li>
            <li>**Security Analysis (QBER):** The **Quantum Bit Error Rate (QBER)** is calculated from a subset of the sifted key. If the QBER is too high (&gt;25%), eavesdropping is detected and the protocol is aborted.</li>
            <li>**Key Generation:** The final, secure, error-corrected key is used to encrypt a message via a simple repeating XOR cipher, demonstrating the final utility of the quantum-generated key.</li>
          </ul>
        </div>

        <p className="security-note">
          **Key Takeaway:** The BB84 simulation successfully generates a secure key and verifies its security based on standard QKD thresholds, proving that quantum key distribution can detect, and therefore prevent, a third party from secretly acquiring the key.
        </p>

        {/* Button to link to the original .ipynb file */}
        <a 
          href={ipynbUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ipynb-button"
        >
          View the Full BB84 Qiskit Notebook
        </a>
      </div>
    </div>
  );
};

export default BB84Page;
