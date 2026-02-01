import React, { useState, useRef, useEffect } from "react";
import "./Theory.css";
import QuantumBackground from "./QuantumBackground";

const STORY_CHAPTERS = [
  {
    id: "chapter-1",
    number: "01",
    title: "The Intercepted Message",
    location: "Naval Command Center, Pacific Zone",
    time: "0300 Hours",
    gradient: "from-blue-600/25 to-transparent",
    accentColor: "cyan",
    icon: "🌊",
    storyText: `Captain Alice stares at the terminal. Fleet Command has issued Level 5 intelligence regarding a high-value deployment, but standard classical channels are flagged as compromised. Hostile signals intelligence is active, and traditional RSA encryption is no longer a guarantee against modern quantum-capable adversaries.
    
    "Operator Bob, the integrity of this mission rests on a secure handshake," Alice commands. "We cannot risk a mathematical leak. It is time to initiate the BB84 protocol." The decision is clear: they will use the fundamental laws of physics to generate a key that cannot be observed without detection.`,
    technicalNote: "Traditional encryption relies on mathematical complexity. Quantum Key Distribution (QKD) relies on the No-Cloning Theorem: any attempt to measure the photon alters its state."
  },
  {
    id: "chapter-2",
    number: "02",
    title: "The Quantum Handshake",
    location: "MIT Quantum Research Division",
    time: "Project Inception",
    gradient: "from-purple-600/25 to-transparent",
    accentColor: "purple",
    icon: "⚛️",
    storyText: `The protocol is elegant. Alice prepares single photons in random polarization bases—Rectilinear (+) or Diagonal (×). On the receiving end, Bob makes his own independent, random choices to measure them. 
    
    In a world of perfect physics, when their bases match, the result is 100% certain. When they mismatch, quantum uncertainty takes over, yielding random noise. By publicly reconciling these bases afterward, they sift through the chaos to form a Raw Key, ensuring that the final shared secret (K) is known only to them.`,
    technicalNote: "ASCII encoding converts your 2-character text message (M) into a 16-bit binary stream. QKD generates the 16-bit key (K) needed for the One Time Pad (OTP) operation."
  },
  {
    id: "chapter-3",
    number: "03",
    title: "Simulation Alpha: Ideal State",
    location: "Secure Lab Environment",
    time: "Controlled Test",
    gradient: "from-emerald-600/25 to-transparent",
    accentColor: "emerald",
    icon: "✨",
    storyText: `In the Alpha simulation, we observe the theoretical foundation of BB84. Transmitting 16 photons through a pristine vacuum, Alice and Bob find a 100% basis correlation. With zero Quantum Bit Error Rate (QBER), the full 16-bit key is adopted immediately.
    
    Because the Key length perfectly matches the 2-character message length (16 bits), they achieve true One Time Pad security. The XOR operation (M ⊕ K) produces a ciphertext (C) that is mathematically unbreakable. The mission is a success; the data is secured by the certainty of an ideal channel.`,
    technicalNote: "Ideal Scenario (16 photons): 100% basis match is forced to demonstrate perfect synchronization. QBER = 0%."
  },
  {
    id: "chapter-4",
    number: "04",
    title: "Simulation Omega: The Breach",
    location: "Compromised Quantum Line",
    time: "Active Intercept",
    gradient: "from-red-600/25 to-transparent",
    accentColor: "red",
    icon: "🕵️",
    storyText: `The adversary, codenamed "Eve," has tapped the line. Her strategy is the Intercept-Resend attack: she measures Alice's photons and resends new ones to Bob. But quantum mechanics is an unforgiving witness. 
    
    Eve cannot know Alice's basis choice. Every time she chooses wrong, she risks collapsing the photon's state and introducing an error. To counter this, Alice and Bob increase their transmission to 32 photons, knowing that sifting and eavesdropping will reduce their final key length. The trap is set—physics will reveal her presence.`,
    technicalNote: "Breach Scenario (32 photons): Eve's interference introduces a signature 25.0% error rate (QBER) into the sifted key."
  },
  {
    id: "chapter-5",
    number: "05",
    title: "The Threshold Check",
    location: "Command Terminal",
    time: "Final Verification",
    gradient: "from-orange-600/25 to-transparent",
    accentColor: "orange",
    icon: "⚠️",
    storyText: `Alice and Bob calculate the QBER on their 32-photon transmission. The terminal flashes red: 25.0% Error Detected. The high rate confirms Eve's presence. "Security breach confirmed," Alice reports. "The raw key is compromised and must be discarded."
    
    Eve learned some bits, but by revealing herself, she has failed. This is the beauty of BB84: it doesn't just encrypt; it detects. If the key is not secret, it is not used. Communication is aborted, preserving the integrity of the mission and leaving the enemy with nothing but useless noise.`,
    technicalNote: "Protocol Abort: When QBER exceeds the 5.0% threshold, the protocol blocks encryption. Alice and Bob must restart on a clean channel."
  }
];

const GlobalQuantumWeb = () => {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const particleCount = 140;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseOpacity = Math.random() * 0.2 + 0.1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${this.baseOpacity})`;
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const drawConnections = () => {
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        const dxMouse = particles[i].x - mousePos.current.x;
        const dyMouse = particles[i].y - mousePos.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < 250) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mousePos.current.x, mousePos.current.y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.15 * (1 - distMouse / 250)})`;
          ctx.stroke();
        }

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.07 * (1 - dist / 140)})`;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    init();
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default function App() {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [hoveredChapter, setHoveredChapter] = useState(null);




  return (
    <div className="theory-page">
      <QuantumBackground />

      <GlobalQuantumWeb />

      <div className="scanline-overlay"></div>

      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>

      <main className="main-content">
        <header className="header-container">
          <div className="header-tag">
            <span className="status-dot"></span>
            Tactical Briefing: Authorized L5 Access
          </div>

          <h1 className="main-title">
            <span className="block" style={{ color: "#fff" }}>OPERATION</span>
            <span className="block gradient-text">QUANTUM SHIELD</span>
          </h1>

          <p className="intro-desc">
            Mission briefing for the BB84 Protocol. Establishing absolute key integrity
            across communication channels to protect our 16-bit binary payload (2 characters).
          </p>
        </header>

        <div className="timeline-container">
          <div className="timeline-spine"></div>

          {STORY_CHAPTERS.map((chapter) => (
            <div
              key={chapter.id}
              className="chapter-row"
              onMouseEnter={() => setHoveredChapter(chapter.id)}
              onMouseLeave={() => setHoveredChapter(null)}
            >
              <div className="marker-wrapper">
                <div className={`chapter-node ${hoveredChapter === chapter.id || selectedChapter === chapter.id ? 'active' : ''}`}>
                  <span className="text-mono">{chapter.number}</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedChapter(selectedChapter === chapter.id ? null : chapter.id)}
                className={`tactical-card ${selectedChapter === chapter.id ? 'expanded' : ''}`}
              >
                <div className="card-header">
                  <div>
                    <span className="timestamp">{chapter.time}</span>
                    <h2 style={{ fontSize: "2rem", margin: "0.5rem 0", color: "#fff" }}>{chapter.title}</h2>
                    <p className="text-mono uppercase" style={{ fontSize: "0.75rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>
                      {chapter.location}
                    </p>
                  </div>
                  <span className="card-icon">{chapter.icon}</span>
                </div>

                <div style={{
                  transition: "all 0.5s ease",
                  maxHeight: selectedChapter === chapter.id ? "1200px" : "100px",
                  overflow: "hidden",
                  opacity: selectedChapter === chapter.id ? 1 : 0.6
                }}>
                  <div className="story-text">
                    {chapter.storyText.split('\n\n').map((para, i) => (<p key={i} style={{ marginBottom: "1.5rem" }}>{para}</p>))}
                  </div>

                  {selectedChapter === chapter.id && (
                    <div className="technical-log">
                      <div className="text-mono uppercase tracking-widest" style={{ color: "var(--accent-cyan)", fontSize: "0.7rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                        SYSTEM LOG // TECHNICAL DATA
                      </div>
                      <p className="italic" style={{ fontSize: "1rem", color: "var(--text-dim)" }}>
                        {chapter.technicalNote}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-mono uppercase tracking-widest" style={{ marginTop: "2rem", fontSize: "0.7rem", color: "var(--text-dim)", display: "flex", justifyContent: "space-between" }}>
                  <span>{selectedChapter === chapter.id ? '[ MINIMIZE_FILE ]' : '[ DECRYPT_DATA ]'}</span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        backgroundColor: hoveredChapter === chapter.id ? "var(--accent-cyan)" : "rgba(255,255,255,0.1)",
                        transition: "all 0.3s ease",
                        transitionDelay: `${i * 0.1}s`
                      }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="action-section">
          <h2 className="main-title" style={{ fontSize: "4rem" }}>
            READY TO <span className="gradient-text">DEPLOY?</span>
          </h2>

          <div className="mission-grid">
            <div className="mission-card alpha">


              <span className="text-mono uppercase tracking-widest" style={{ color: "var(--accent-emerald)", fontSize: "0.75rem", fontWeight: "700" }}>
                Mission: Alpha (Ideal 16-bit)
              </span>
              <h3 style={{ fontSize: "1.75rem", margin: "1rem 0", color: "#fff" }}>ALPHA_HANDSHAKE</h3>
              <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                Zero interference simulation. Experience 100% basis correlation to secure your 16-bit payload (2 characters).
              </p>
              <div className="text-mono uppercase tracking-widest" style={{ color: "var(--accent-emerald)", fontSize: "0.7rem", marginTop: "2rem", fontWeight: "700" }}>
              </div>
            </div>

            <div className="mission-card omega">


              <span className="text-mono uppercase tracking-widest" style={{ color: "var(--accent-red)", fontSize: "0.75rem", fontWeight: "700" }}>
                Mission: Omega (Breach 32-bit)
              </span>
              <h3 style={{ fontSize: "1.75rem", margin: "1rem 0", color: "#fff" }}>OMEGA_INTERCEPT</h3>
              <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                Active Intercept-Resend attack. Detect the 25.0% error rate signature and abort before data leak.
              </p>
              <div className="text-mono uppercase tracking-widest" style={{ color: "var(--accent-red)", fontSize: "0.7rem", marginTop: "2rem", fontWeight: "700" }}>
               
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}