// VirtualLab.js
import React from "react";
import "./VirtualLab.css";

const QuantumIcon = ({ type }) => {
  const stroke = "currentColor";
  switch (type) {
    case "encoding":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
          <circle cx="50" cy="50" r="40" stroke={stroke} fill="none" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="50" y1="10" x2="50" y2="90" stroke={stroke} strokeWidth="1.5" />
          <line x1="10" y1="50" x2="90" y2="50" stroke={stroke} strokeWidth="1.5" />
          <line x1="22" y1="22" x2="78" y2="78" stroke={stroke} strokeWidth="0.5" />
          <line x1="78" y1="22" x2="22" y2="78" stroke={stroke} strokeWidth="0.5" />
          <circle cx="50" cy="50" r="3" fill={stroke} />
        </svg>
      );
    case "transmission":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
          <path d="M10 50 Q 30 20, 50 50 T 90 50" stroke={stroke} fill="none" strokeWidth="1" />
          <circle cx="15" cy="50" r="2" fill={stroke} />
          <circle cx="45" cy="50" r="2" fill={stroke} />
          <circle cx="85" cy="50" r="2" fill={stroke} />
          <line x1="0" y1="60" x2="100" y2="60" stroke={stroke} strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
      );
    case "measurement":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
          <rect x="30" y="30" width="40" height="40" stroke={stroke} fill="none" strokeWidth="1" />
          <line x1="50" y1="10" x2="50" y2="30" stroke={stroke} strokeWidth="1" />
          <path d="M40 80 L 50 70 L 60 80" stroke={stroke} fill="none" strokeWidth="1" />
          <circle cx="50" cy="50" r="10" stroke={stroke} fill="none" strokeDasharray="2 2" />
        </svg>
      );
    case "sifting":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
          <rect x="20" y="20" width="25" height="25" fill={stroke} />
          <rect x="55" y="20" width="25" height="25" stroke={stroke} fill="none" />
          <rect x="20" y="55" width="25" height="25" stroke={stroke} fill="none" />
          <rect x="55" y="55" width="25" height="25" fill={stroke} />
        </svg>
      );
    case "qber":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 text-red-500">
          <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="2" />
          <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="0.5" />
        </svg>
      );
    case "privacy":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
          <path d="M30 40 V 70 H 70 V 40 Z" fill="none" stroke={stroke} strokeWidth="1.5" />
          <path d="M40 40 V 30 C 40 20, 60 20, 60 30 V 40" fill="none" stroke={stroke} strokeWidth="1.5" />
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
    title: "Quantum State Mapping",
    subtitle: "Alice’s Source Initialization",
    desc: "Alice selects a random bit value and a random basis. She prepares a photon in one of four states: |0°⟩, |90°⟩, |45°⟩, or |135°⟩.",
    theory: "By choosing non-orthogonal states from two different bases, Alice ensures that a measurement in the wrong basis will yield an inherently probabilistic result."
  },
  {
    id: "02",
    icon: "transmission",
    title: "The Secure Channel",
    subtitle: "Physical Qubit Propagation",
    desc: "Photons are emitted across a fiber link. This is a one-way channel where single-photon pulses prevent 'Photon Number Splitting' attacks.",
    theory: "The No-Cloning Theorem proves that an unknown quantum state cannot be copied. This ensures Eve cannot 'sniff' data without altering the carrier."
  },
  {
    id: "03",
    icon: "measurement",
    title: "Basis Reconciliation",
    subtitle: "Bob’s Detection Choice",
    desc: "Bob receives the photons and must choose a measurement basis (+ or ×) at random. If his hardware matches Alice's orientation, he records a deterministic bit.",
    theory: "Heisenberg's Uncertainty Principle dictates that measuring one property (basis) irreversibly alters another, making wrong guesses permanent."
  },
  {
    id: "04",
    icon: "sifting",
    title: "Classical Sifting",
    subtitle: "The Reconciliation Phase",
    desc: "Alice and Bob reveal their bases on a public channel. They discard any events where their choices did not align, keeping only the matches.",
    theory: "Sifting reduces the Raw Key to the Sifted Key. Statistically, 50% of the bits are kept, forming the foundation of the secret key."
  },
  {
    id: "05",
    icon: "qber",
    title: "Security Thresholding",
    subtitle: "QBER Analysis",
    desc: "A small subset of the key is revealed to calculate the error rate. This bounds the information Eve could have stolen.",
    theory: "If QBER > 11%, Alice and Bob assume the channel is compromised and abort. 11% is the mathematical limit for secure distillation."
  },
  {
    id: "06",
    icon: "privacy",
    title: "Privacy Distillation",
    subtitle: "Final Key Compression",
    desc: "Survivors are processed via Hashing (Privacy Amplification) to shrink the key and remove Eve's partial knowledge.",
    theory: "The result is a One-Time Pad. This is the only mathematically proven method of Perfect Secrecy, unbreakable even by quantum computers."
  }
];

export default function VirtualLab() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <div className="technical-grid" />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20 relative z-10">


        <section className="mb-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-4">

              The Physics <br />
              <span className="serif-italic text-white/40">of Privacy.</span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-white/60 max-w-3xl">

              A comprehensive breakdown of the 1984 Bennett-Brassard protocol. Master the six core phases and the mathematical safeguards that enforce absolute security.
            </p>
          </div>
        </section>

        <div className="divider-label">
           <span className="mono text-[10px] uppercase tracking-widest opacity-40">System Architecture</span>
        </div>
        
        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
             <div className="md:col-span-1">
                <h2 className="text-3xl font-bold tracking-tight mb-4 leading-none text-white/90">The Encoding <br/> Schema.</h2>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                   Alice maps binary digits to physical orientations across two non-orthogonal bases (+ and ×).
                </p>
                <div className="mono text-[10px] p-3 border border-white/10 rounded uppercase tracking-widest opacity-60">
                   Operational Logic: 1 Bit = 1 Qubit
                </div>
             </div>
             <div className="md:col-span-3 encoding-grid">
                {[
                  { label: 'RECT (+) / 0', icon: '↑', deg: '0° VERT' },
                  { label: 'RECT (+) / 1', icon: '→', deg: '90° HORIZ' },
                  { label: 'DIAG (×) / 0', icon: '↗', deg: '45° DIAG' },
                  { label: 'DIAG (×) / 1', icon: '↘', deg: '135° DIAG' },
                ].map((item, i) => (
                  <div key={i} className="state-bubble border-white/20 hover:border-white/50 cursor-default">
                    <div className="mono text-[9px] opacity-40 mb-2 tracking-tighter uppercase">{item.label}</div>
                    <div className="text-4xl font-mono my-4">{item.icon}</div>
                    <div className="mono text-[9px] opacity-60 uppercase tracking-widest">{item.deg}</div>
                  </div>
                ))}
             </div>
          </div>
        </section>
       {/* Phase Grid: 3 Rows x 2 Columns */}
<section className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 gap-px bg-white/10 mb-32 max-w-6xl mx-auto border-l border-t border-white/10">

  {STEPS.map((step) => (
    <div 
      key={step.id} 
      className="group bg-black border-r border-b border-white/10 p-4 flex flex-col"

    >
      <div>
        <div className="flex justify-between items-start mb-12">
          <span className="mono text-xs font-bold group-hover:text-black/40 transition-colors tracking-tighter">
            PHASE_{step.id}
          </span>
          <div className="w-6 h-6 group-hover:text-black transition-colors">
            <QuantumIcon type={step.icon} />
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-1 group-hover:text-black transition-colors tracking-tight">
            {step.title}
          </h3>
          <p className="mono text-[10px] uppercase tracking-widest text-white/40 group-hover:text-black/60 transition-colors">
            {step.subtitle}
          </p>
        </div>
        
        <p className="text-sm leading-relaxed text-white/60 mb-6 group-hover:text-black/70 transition-colors">
          {step.desc}
        </p>
      </div>

      <div className="pt-6 border-t border-white/5 group-hover:border-black/10 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <p className="text-[11px] mono text-black/40 leading-relaxed uppercase">
          <span className="text-black font-bold">Physics Core:</span> {step.theory}
        </p>
      </div>
    </div>
  ))}
</section>

       
      </main>
    </div>
  );
}