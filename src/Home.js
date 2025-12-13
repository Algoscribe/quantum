import React, { useState, useEffect } from 'react';
import QuantumBackground from './QuantumBackground';
import './Home.css';
import BlochSphereImage from './image.png'; // 1. Import the image
import Footer from "./Footer";


// Modal data
const experiments = {
  exp1: {
    title: 'Key Generation',
    content: `
      <h3>How it works</h3>
      <p>Alice picks random bits—0s and 1s—and random bases to encode them. She sends photons to Bob. He measures with his own random bases. When their bases match, he gets the right bit. That's the foundation.</p>
      
      <h3>Why it's secure</h3>
      <p>You can't copy a quantum state. If someone tries to intercept and measure the photons, they disturb them. Alice and Bob will see extra errors and know something's wrong.</p>
      
      <h3>The process</h3>
      <p>1. Alice generates random bits and bases<br>
      2. She encodes bits in photon polarization<br>
      3. Sends photons through quantum channel<br>
      4. Bob measures with random bases<br>
      5. They compare basis choices publicly<br>
      6. Keep only matching measurements</p>
    `
  },
  exp2: {
    title: 'Polarization States',
    content: `
      <h3>Four states, two bases</h3>
      <p>Photons can be polarized horizontally (0°), vertically (90°), or at 45° and 135°. The first two form the rectilinear basis. The diagonal angles form the diagonal basis. Each photon carries one bit.</p>
      
      <h3>Encoding information</h3>
      <p>In the rectilinear basis: horizontal = 0, vertical = 1<br>
      In the diagonal basis: 45° = 0, 135° = 1</p>
      
      <h3>Measurement outcomes</h3>
      <p>If Bob uses the same basis as Alice, he gets the correct bit with certainty. If he uses the wrong basis, he gets a random result. That's quantum mechanics—not a bug, it's a feature.</p>
    `
  },
  exp3: {
    title: 'Basis Selection',
    content: `
      <h3>Random is key</h3>
      <p>Alice and Bob each flip coins to choose bases. After transmission, they compare basis choices publicly. They keep the bits where bases matched and throw out the rest. About half survive.</p>
      
      <h3>Why randomness matters</h3>
      <p>If Eve knew which basis was used, she could measure without introducing errors. But she doesn't. She has to guess. Half the time she's wrong, and wrong measurements create detectable disturbances.</p>
      
      <h3>Public comparison</h3>
      <p>After all photons are sent and measured, Alice and Bob announce their basis choices over a public channel. This doesn't compromise security because they only reveal the bases, not the actual bit values.</p>
    `
  },
  exp4: {
    title: 'Eavesdropping Detection',
    content: `
      <h3>Detection method</h3>
      <p>After sifting, Alice and Bob compare some of their bits. If too many don't match, someone intercepted the photons. They abort and start over.</p>
      
      <h3>The math</h3>
      <p>No eavesdropper: 0-3% error rate (from channel noise)<br>
      Full intercept: ~25% error rate<br>
      Security threshold: 11%</p>
      
      <h3>Why it works</h3>
      <p>Eve has to measure to gain information. When she measures with the wrong basis, she changes the photon state. Bob then measures a different state than Alice sent. These errors accumulate and become statistically significant.</p>
    `
  },
  exp5: {
    title: 'Key Sifting',
    content: `
      <h3>Building the key</h3>
      <p>They announce which bases they used but not the bit values. Discard mismatches. What's left becomes the raw key, ready for error correction.</p>
      
      <h3>Efficiency</h3>
      <p>Since bases match randomly about 50% of the time, if Alice sends 1000 photons, they end up with roughly 500 bits of sifted key. Some of those get used for error checking, so the final key is smaller.</p>
      
      <h3>Error correction</h3>
      <p>Even without eavesdroppers, channel noise introduces some errors. They use classical error correction to fix these. Then privacy amplification to remove any information Eve might have gained.</p>
    `
  },
  exp6: {
    title: 'Error Rate Analysis',
    content: `
      <h3>QBER threshold</h3>
      <p>Quantum Bit Error Rate tells you if the channel is clean. Below 11% means you're safe. Above that, either the channel is noisy or someone's listening.</p>
      
      <h3>Calculating QBER</h3>
      <p>Alice and Bob compare a random subset of their sifted key bits. Count the mismatches. Divide by total bits checked. That's your QBER.</p>
      
      <h3>What to do</h3>
      <p>QBER < 11%: Proceed with error correction and privacy amplification<br>
      QBER ≥ 11%: Abort protocol, diagnose the channel, try again</p>
    `
  }
};

// Modal Component
const Modal = ({ isOpen, onClose, content }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

// Cube Face Component
const CubeFace = ({ position, number }) => (
  <div className={`cube-face cube-${position}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
    {number}
  </div>
);

// Step Cube Component
const StepCube = ({ number, title, description }) => (
  <div className="step-3d">
    <div className="step-cube">
      <CubeFace position="front" number={number} />
      <CubeFace position="back" number={number} />
      <CubeFace position="right" number={number} />
      <CubeFace position="left" number={number} />
      <CubeFace position="top" number={number} />
      <CubeFace position="bottom" number={number} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

// Main Home Component
export default function Home() {
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (expId) => {
    const exp = experiments[expId];
    setModalContent(`<h2>${exp.title}</h2>${exp.content}`);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    
    setModalContent(`
      <h2>Message Sent!</h2>
      <p>Thank you, ${name || 'User'}, for reaching out to the Quantum Lab.</p>
      <p>This contact form is for demonstration purposes only, and no actual email was sent. You can close this window now.</p>
    `);
    setIsModalOpen(true);
    e.target.reset();
  };

  return (
    <>
      <QuantumBackground />
      
      <main className="qx-page">
        {/* Hero Section */}
        <section id="hero">
          <div className="container">
            <h1>THE QUBIT</h1>
            <p>
              A qubit exists in superposition—both 0 and 1 at once. When you measure it, it collapses to one state. This isn't some tech buzzword. It's how nature works at the quantum level, and it's what makes unbreakable encryption possible.
            </p>
          </div>
          <div className="scroll-indicator">↓</div>
        </section>

        {/* About Section */}
        <section id="about">
          <div className="container">
            <div className="about-grid">
              <div className="about-text">
                <h2>What is BB84?</h2>
                <p>
                  BB84 is the first quantum key distribution protocol. Charles Bennett and Gilles Brassard invented it in 1984. It lets two people create a shared secret key using the laws of quantum mechanics.
                </p>
                <p>
                  The security doesn't come from math being hard to solve. It comes from physics. If someone tries to intercept the key, they have to measure the quantum states. And measuring disturbs them. You can't avoid it.
                </p>
                <p>
                  That disturbance is detectable. So Alice and Bob know if someone's listening. The eavesdropper can't copy the quantum states either—the no-cloning theorem forbids it.
                </p>
              </div>
<div className="about-visual">
    {/* Option 1: Direct Image Tag with an imported source */}
    <img 
        src={BlochSphereImage} // 2. Use the imported variable
        alt="Bloch Sphere Visualization Diagram"
        style={{ 
            width: '500px',         // <- Change this to your desired width (e.g., '100%', '300px')
            height: 'auto',         // Ensures the image scales proportionally
            borderRadius: '10px',   // <- Change this for different border rounding (e.g., '50%' for a circle)
            border: '2px solid #ccc',// Optional: Add a subtle border
            opacity: 0.8,
        }} 
        className="bloch-sphere-image" 
    />
</div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="process-3d">
          <div className="container">
            <h2 className="title-large">Operational Workflow</h2>
            <div className="steps-container">
              <StepCube number="1" title="Acquire" description="Learn quantum fundamentals" />
              <div className="arrow-3d">→</div>
              <StepCube number="2" title="Execute" description="Run live simulation" />
              <div className="arrow-3d">→</div>
              <StepCube number="3" title="Decrypt" description="Analyze secure transmission" />
            </div>
          </div>
        </section>

        {/* Theory Section */}
        <section id="theory">
          <div className="container">
            <div className="theory-content">
              <h2>The Science</h2>
              
              <div className="theory-box">
                <h3>Quantum Superposition</h3>
                <p>Classical bits are either 0 or 1. Qubits can be both at the same time. It's not that we don't know which—they genuinely exist in both states until measured.</p>
              </div>

              <div className="theory-box">
                <h3>The No-Cloning Theorem</h3>
                <p>You can't make a perfect copy of an unknown quantum state. This is a fundamental law, not a technical limitation.</p>
              </div>

              <div className="theory-box">
                <h3>Measurement Disturbance</h3>
                <p>Measuring a quantum system changes it. If Eve measures a photon with the wrong basis, she'll change its state. When Alice and Bob compare their results later, they'll see extra errors.</p>
              </div>

              <div className="theory-box">
                <h3>The Four States</h3>
                <p>BB84 uses four polarization states:</p>
                <ul>
                  <li><strong>Horizontal (0°)</strong> - represents bit 0 in rectilinear basis</li>
                  <li><strong>Vertical (90°)</strong> - represents bit 1 in rectilinear basis</li>
                  <li><strong>Diagonal (45°)</strong> - represents bit 0 in diagonal basis</li>
                  <li><strong>Anti-diagonal (135°)</strong> - represents bit 1 in diagonal basis</li>
                </ul>
                <p>Alice randomly picks a bit and a basis for each photon. Bob randomly picks a basis to measure with. When their bases match, he gets the right bit. When they don't match, he gets a random result.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact">
          <div className="container">
            <h2>Get in Touch</h2>
            <p>Questions about quantum cryptography? Want to collaborate? Reach out.</p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" placeholder="Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Email" required />
              </div>
              <div className="form-group">
                <textarea placeholder="Message" required></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </section>
     </main> 
     <Footer /> 

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} content={modalContent} />
    </>
  );
}