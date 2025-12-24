import React, { useState, useEffect } from 'react';
import QuantumBackground from './QuantumBackground';
import './Home.css';
import BlochSphereImage from './image.png';
import Footer from "./Footer";
import { Center } from '@react-three/drei';
import img2 from './images/Screenshot 2025-12-14 094941.png'
import img3 from './images/Screenshot 2025-12-14 094956.png'
import img4 from './images/Screenshot 2025-12-14 095008.png'
import img5 from "./images/Quantum_lock.png";
import img6 from "./images/Gemini_Generated_Image_866cv8866cv8866c.png";
import img7 from "./images/Gemini_Generated_Image_f8mn9zf8mn9zf8mn.png";

import img8 from "./images/Gemini_Generated_Image_72w9yp72w9yp72w9.png";
import img9 from "./images/Gemini_Generated_Image_z12bb8z12bb8z12b.png";
import img10 from "./images/Gemini_Generated_Image_s9bfqus9bfqus9bf.png";
import img11 from "./images/Gemini_Generated_Image_9xs4639xs4639xs4.png";
import img12 from "./images/Gemini_Generated_Image_raxnr0raxnr0raxn.png";

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
      <p>Thank you, ${name || 'User'}, for reaching out to the Virtual Lab.</p>
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
            <h1>QKD_Xplore</h1>
            <h2 className="hero-subtitle">Virtual Lab</h2>
            <p className="hero-tagline">BB84 Made Interactive</p>
            <div className="hero-features">
              <span>Learn</span>
              <span>·</span>
              <span>Test</span>
              <span>·</span>
              <span>Analyze</span>
              <span>·</span>
              <span>Secure</span>
            </div>
            <p className="hero-description">
              Understand how quantum physics enables secure communication and why eavesdropping cannot remain hidden.
            </p>
          </div>
          <div className="scroll-indicator">↓</div>
        </section>
        {/* Target Audience Section */}
        <section id="audience">
          <div className="container">
            <h2>Designed for Education and Demonstration</h2>
            <p className="section-intro">QKD_Xplore is built for:</p>
            <div className="audience-grid">
              <div className="audience-card">
                <h3>🎓 Students</h3>
                <p>Learning quantum communication and modern cryptography principles through interactive exploration.</p>
              </div>
              <div className="audience-card">
                <h3>👨‍🏫 Educators</h3>
                <p>Teaching complex quantum concepts with visual, hands-on demonstrations that make theory tangible.</p>
              </div>
              <div className="audience-card">
                <h3>💻 Hackathons</h3>
                <p>Live demonstrations and experimental quantum security challenges for competitive learning.</p>
              </div>
              <div className="audience-card">
                <h3>🔬 Researchers</h3>
                <p>Early-stage quantum security research and protocol testing in a controlled environment.</p>
              </div>
            </div>
            <p className="audience-values">It prioritizes intuition, transparency, and correctness.</p>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission">
          <div className="container">
            <div className="mission-content">
              <h2>Transform Theory into Understanding</h2>
              <p>
                QKD_Xplore transforms quantum key distribution from abstract theory into a hands-on learning environment. Instead of reading equations, users observe quantum behavior directly: photons collapse, errors emerge, and security breaks the moment an attacker interferes.
              </p>
            </div>
          </div>
        </section>

        {/* Quantum Threat Section */}
        <section id="quantum-threat">
          <div className="container">
            <h2>Why This Matters: The Quantum Threat</h2>
            <div className="threat-grid">
              <div className="threat-card">
                <div className="threat-icon">🔒</div>
                <h3>Current Cryptography</h3>
                <p>Most modern cryptography relies on the difficulty of mathematical problems. RSA and elliptic curve encryption protect today's internet.</p>
                {/* Image under the text */}
                <img
                  src={img5}
                  alt="Harvest Now Decrypt Later"
                  className="threat-card-image"
                />
              </div>
              <div className="threat-card threat-warning">
                <div className="threat-icon">⚛️</div>
                <h3>Quantum Computers</h3>
                <p>Algorithms such as Shor's can efficiently break RSA and elliptic curve cryptography. The clock is ticking.</p>
                {/* Image under the text */}
                <img
                  src={img7}
                  alt="Harvest Now Decrypt Later"
                  className="threat-card-image"
                />
              </div>
              <div className="threat-card threat-danger">
                <div className="threat-icon">📡</div>
                <h3>Harvest Now, Decrypt Later</h3>
                <p>
                  Data encrypted today using classical computers can be harvested and decrypted in the future once
                  large-scale quantum machines become available.
                </p>

                {/* Image under the text */}
                <img
                  src={img6}
                  alt="Harvest Now Decrypt Later"
                  className="threat-card-image"
                />
              </div>

            </div>

          </div>
        </section>

        {/* Classical vs Quantum Section */}
        <section id="comparison">
          <div className="container">
            <h2>What Makes QKD Different</h2>
            <div className="comparison-grid">
              <div className="comparison-column">
                <h3>Classical Communication</h3>
                <ul className="comparison-list">
                  <li>Encryption keys are classical data</li>
                  <li>Copies can be made perfectly</li>
                  <li>Eavesdropping is undetectable</li>
                  <li>Security based on computational complexity</li>
                </ul>
              </div>
              <div className="comparison-divider">vs</div>
              <div className="comparison-column comparison-quantum">
                <h3>Quantum Communication</h3>
                <ul className="comparison-list">
                  <li>Information encoded in quantum states</li>
                  <li>Measurement irreversibly disturbs the system</li>
                  <li>Any interception leaves a measurable trace</li>
                  <li>Security is experimentally verified</li>
                </ul>
              </div>

            </div>
          </div>
        </section>

<section id="core-principles">
  <div className="container">
    <h2>Core Quantum Principles Behind BB84</h2>

    <div className="principles-grid">

      {/* 01 */}
      <div className="principle-card">
        <div className="principle-number">01</div>

        <div className="principle-content">
          <h3>Superposition</h3>
          <p>
            A qubit exists in multiple states until measured. It's not that we
            don't know which—it genuinely exists in both states simultaneously.
          </p>
        </div>

        <div className="principle-visual">
          <img src={img8} alt="Quantum Superposition" />
        </div>
      </div>

      {/* 02 */}
      <div className="principle-card">
        <div className="principle-number">02</div>

        <div className="principle-content">
          <h3>Measurement Disturbance</h3>
          <p>
            Observation changes the quantum state. This isn't a limitation of our
            tools—it's a fundamental feature of quantum mechanics.
          </p>
        </div>

        <div className="principle-visual">
          <img src={img10} alt="Measurement Disturbance" />
        </div>
      </div>

      {/* 03 */}
      <div className="principle-card">
        <div className="principle-number">03</div>

        <div className="principle-content">
          <h3>No-Cloning Theorem</h3>
          <p>
            Unknown quantum states cannot be copied. This is a fundamental law,
            not a technical limitation.
          </p>
        </div>

        <div className="principle-visual">
          <img src={img9} alt="No Cloning Theorem" />
        </div>
      </div>

      {/* 04 */}
      <div className="principle-card">
        <div className="principle-number">04</div>

        <div className="principle-content">
          <h3>The Four States</h3>
          <ul className="four-states-list">
            <li><strong>Horizontal (0°)</strong> – bit 0 (rectilinear)</li>
            <li><strong>Vertical (90°)</strong> – bit 1 (rectilinear)</li>
            <li><strong>Diagonal (45°)</strong> – bit 0 (diagonal)</li>
            <li><strong>Anti-diagonal (135°)</strong> – bit 1 (diagonal)</li>
          </ul>
          <p className="soft-text">
            Alice and Bob keep bits only when their bases match. Mismatched bases
            produce random outcomes.
          </p>
        </div>

        <div className="principle-visual">
          <img src={img11} alt="BB84 Polarization States" />
        </div>
      </div>

    </div>

    <p className="principles-note">
      These principles are not theoretical assumptions; they are enforced by nature.
    </p>
  </div>
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
                <img
                  src={img12}
                  alt="Bloch Sphere Visualization"
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: 'auto',
                    borderRadius: '10px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    opacity: 0.8,
                  }}
                  className="bloch-sphere-image"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section id="platform-features">
          <div className="container">
            <h2>What You Can Do in QKD_Xplore</h2>
            <p className="section-intro">This platform is designed as a virtual quantum laboratory.</p>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Visualize Polarization</h3>
                <p>See photon polarization and bases in real-time. Watch quantum states as they're encoded and transmitted.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚙️</div>
                <h3>Execute BB84</h3>
                <p>Run the BB84 protocol step by step. Control every parameter and observe the quantum key distribution process.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎭</div>
                <h3>Activate Eavesdropper</h3>
                <p>Introduce Eve into the channel and observe how quantum disturbance reveals her presence immediately.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>Track Quantum Bit Error Rate Live</h3>
                <p>Monitor Quantum Bit Error Rate in real-time. See how errors emerge when security is compromised.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔬</div>
                <h3>Study Noise Effects</h3>
                <p>Experiment with distance, noise levels, and partial attacks. Understand the boundaries of quantum security.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3>Learn by Doing</h3>
                <p>Each interaction reveals a physical principle rather than hiding it. Understanding through experimentation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* QBER Section */}
        <section id="qber-detection">
          <div className="container">
            <h2>How Security Is Detected: QBER</h2>
            <div className="qber-content">
              <div className="qber-explanation">
                <p className="qber-intro">QBER acts as a security thermometer.</p>
                <div className="qber-indicators">
                  <div className="qber-indicator qber-safe">
                    <div className="qber-badge">✓ Safe</div>
                    <h4>
                      Low QBER
                      <br />
                      <span>(&lt; 11%)</span>
                    </h4>
                    <p>Indicates a clean channel. Communication is secure and unobserved.</p>
                  </div>

                  <div className="qber-indicator qber-warning">
                    <div className="qber-badge">⚠ Warning</div>
                    <h4>
                      Elevated QBER
                      <br />
                      <span>(&gt; 11% – &lt; 25%)</span>
                    </h4>
                    <p>Random interception introduces characteristic error spikes. Investigation needed.</p>
                  </div>

                  <div className="qber-indicator qber-danger">
                    <div className="qber-badge">✕ Danger</div>
                    <h4>
                      High QBER
                      <br />
                      <span>(&gt; 25%)</span>
                    </h4>
                    <p>Sustained high QBER signals eavesdropping. Abort and restart protocol.</p>
                  </div>

                </div>
              </div>
              <p className="qber-conclusion">Alice and Bob do not guess whether Eve is present,they observe it.</p>
            </div>
          </div>
        </section>

        {/* Protocol Steps Section */}
        <section id="protocol-steps">
          <div className="container">
            <h2>From Theory to Secure Key</h2>
            <div className="protocol-timeline">
              <div className="timeline-step">
                <div className="timeline-number">1</div>
                <div className="timeline-content">
                  <h3>Photon Transmission</h3>
                  <p>Alice sends randomly encoded photons through the quantum channel.</p>
                </div>
              </div>
              <div className="timeline-step">
                <div className="timeline-number">2</div>
                <div className="timeline-content">
                  <h3>Random Measurement</h3>
                  <p>Bob measures with random bases, independent of Alice's choices.</p>
                </div>
              </div>
              <div className="timeline-step">
                <div className="timeline-number">3</div>
                <div className="timeline-content">
                  <h3>Basis Comparison</h3>
                  <p>Bases are compared over a public channel. No security risk here.</p>
                </div>
              </div>
              <div className="timeline-step">
                <div className="timeline-number">4</div>
                <div className="timeline-content">
                  <h3>Key Sifting</h3>
                  <p>Matching results form the sifted key. Mismatches are discarded.</p>
                </div>
              </div>
              <div className="timeline-step">
                <div className="timeline-number">5</div>
                <div className="timeline-content">
                  <h3>Error Estimation</h3>
                  <p>QBER is calculated to detect any eavesdropping attempts.</p>
                </div>
              </div>
              <div className="timeline-step">
                <div className="timeline-number">6</div>
                <div className="timeline-content">
                  <h3>Key Finalization</h3>
                  <p>Error correction and privacy amplification produce the final secure key.</p>
                </div>
              </div>
            </div>
            <p className="protocol-conclusion">Security emerges from physics, not mathematics.</p>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="process-3d">
          <div className="container">
            <h2 className="title-large">Virtual Lab Workflow</h2>

            <div className="steps-container">
              <StepCube
                number="1"
                title="Learn"
                description="Understand quantum principles and BB84 fundamentals"
              />

              <div className="arrow-3d">→</div>

              <StepCube
                number="2"
                title="Test"
                description="Run simulations and experiment with protocol parameters"
              />

              <div className="arrow-3d">→</div>

              <StepCube
                number="3"
                title="Analyze"
                description="Observe QBER, key rates, and security indicators"
              />

              <div className="arrow-3d">→</div>

              <StepCube
                number="4"
                title="Secure"
                description="Verify security and finalize a trusted quantum key"
              />
            </div>
          </div>
        </section>

        {/* Final Statement Section */}
        <section id="final-statement">
          <div className="container">
            <div className="final-statement-content">
              <h2>Quantum Security is Real</h2>
              <p>Quantum security is not speculative. It is observable, testable, and measurable.</p>
              <p>The laws of physics protect your data, not just mathematical complexity.</p>
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