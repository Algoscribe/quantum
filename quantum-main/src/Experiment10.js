import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment10.css";
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";

// 🔒 Experiment 10 is classical-only
const EXP10_FROZEN = true;



export default function Exp10BB84() {
  // Committed (current) state
  

  const [numPhotons, setNumPhotons] = useState(16);



  // For Experiment 2 default Eve is ON — but slider should NOT start at 100%.
  // Set a sensible interactive default (change this if you prefer another starting %).
  const DEFAULT_EVE_PERCENT = 0;
  const [channelNoisePercent, setChannelNoisePercent] = useState(0);
  const [keyRateVsDistance, setKeyRateVsDistance] = useState([]);


  const [eveLevel, setEveLevel] = useState(DEFAULT_EVE_PERCENT);
  const [channelDistanceKm, setChannelDistanceKm] = useState(0);

  // Temporary values shown on sliders until user confirms
  const [sliderTempValue, setSliderTempValue] = useState(16);
  const [tempEveLevel, setTempEveLevel] = useState(DEFAULT_EVE_PERCENT);
  const [tempChannelNoisePercent, setTempChannelNoisePercent] = useState(0);
  const [tempChannelDistanceKm, setTempChannelDistanceKm] = useState(0);

  // Modal & UI
  const [showSliderConfirm, setShowSliderConfirm] = useState(false);
 


  // Transmission tracking
  const [sentTransmissions, setSentTransmissions] = useState([]);
  const [channelKey, setChannelKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
  "Authentication attack active — Eve impersonates both parties"
);

  // Helpers
  const updateStatus = (message) => setStatusMessage(message);



  // Ref to receive QuantumChannel controls
  const qcControlsRef = useRef(null);

  // Initialize protocol once (on mount)
useEffect(() => {
  if (!EXP10_FROZEN) {
    initializeProtocol(numPhotons);
  }

  setEveLevel(DEFAULT_EVE_PERCENT);
  setTempEveLevel(DEFAULT_EVE_PERCENT);

  updateStatus(
    "Authentication attack active — Eve impersonates Alice and Bob"
  );
}, []);



  useEffect(() => {
    setEveLevel(DEFAULT_EVE_PERCENT);
  }, []);




  // ---------- Slider change handlers (set temp values + show modal) ----------
  const handlePhotonSliderChange = () => {
setStatusMessage(
  "Authentication attack active — Eve impersonates both parties"
);

};

  const handleEveSliderChange = () => {
    // Experiment 5: Eve is fixed at 20%
  };


  const handleNoiseChange = () => {
    // Noise fixed at 0% in Experiment 5
  };

  const handleDistanceChange = () => {
    // Distance fixed at 0 km in Experiment 5
  };


  // ---------- Confirm / Cancel for the modal ----------
  const confirmApplyChanges = () => {
    setNumPhotons(sliderTempValue);
    setEveLevel(DEFAULT_EVE_PERCENT);
    setTempEveLevel(DEFAULT_EVE_PERCENT);
    setChannelNoisePercent(0);
    setChannelDistanceKm(0);

    if (!EXP10_FROZEN) {
  initializeProtocol(sliderTempValue);
}

    setSentTransmissions([]);
    setChannelKey((k) => k + 1);

    updateStatus(
      `"Post-processing parameters updated (theoretical model)"
`
    );

    setShowSliderConfirm(false);
  };

  const cancelApplyChanges = () => {
    setSliderTempValue(numPhotons);
    setTempEveLevel(DEFAULT_EVE_PERCENT);
    setTempChannelNoisePercent(channelNoisePercent);
    setTempChannelDistanceKm(channelDistanceKm);

    setShowSliderConfirm(false);
  };

  // ---------- Channel options ----------
  const applyChannelOptions = () => {
    if (!EXP10_FROZEN) {
  initializeProtocol(numPhotons);
}

    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(
      `Channel updated: Distance = ${channelDistanceKm} km · Noise fixed at 0%`
    );


  };

  const resetChannelOptions = () => {
    setEveLevel(DEFAULT_EVE_PERCENT);
    setChannelNoisePercent(0);
    setChannelDistanceKm(0);

    if (!EXP10_FROZEN) {
  initializeProtocol(numPhotons);
}

    setSentTransmissions([]);
    setChannelKey(k => k + 1);

    updateStatus(
      `Reset complete — Photon loss experiment · Observe key rate reduction`
    );


  };

  function distanceToChannelEffects(distanceKm) {
    // Exponential-like attenuation (simplified, pedagogical)

    const lossPercent = Math.min(95, distanceKm * 0.6);

    // Noise becomes relevant only at long distance
    let noisePercent = 0;
    if (distanceKm > 80) noisePercent = 2;
    if (distanceKm > 120) noisePercent = 5;
    if (distanceKm > 160) noisePercent = 10;

    return { lossPercent, noisePercent };
  }

 const handleMeasured = (s) => {
  setStatusMessage(
    "Quantum measurement disabled — using theoretical post-processing model"
  );

  if (EXP10_FROZEN) return;

  // ===== LEGACY LOGIC (FROZEN, NEVER RUNS) =====

  if (typeof s.eveIntercepted === "undefined") s.eveIntercepted = false;

  if (!s.eveIntercepted) {
    s.eveBasis = "—";
    s.eveMeas = "—";
    s.eveResendBit = "—";
    s.eveResendBasis = "—";
  }

  setSentTransmissions((prev) => prev);
};


  // replay photon
  const handleRowClick = (index) => {
    if (qcControlsRef.current && typeof qcControlsRef.current.replayPhotonAnimation === "function") {
      try {
        qcControlsRef.current.replayPhotonAnimation(index - 1);
        updateStatus(`Replaying photon #${index}`);
        return;
      } catch (e) { }
    }
    const ev = new CustomEvent("replayPhoton", { detail: { index: index - 1 } });
    window.dispatchEvent(ev);
    updateStatus(`Replaying photon #${index}`);
  };

  // registerControls passed to QuantumChannel
  const registerControls = (controls) => {
  qcControlsRef.current = {
    ...controls,

    // 🔒 Disable quantum actions for Exp 10
    sendPhoton: () => {
      setStatusMessage(
        "Quantum transmission disabled — classical post-processing only"
      );
    },

    sendBurst: () => {
      setStatusMessage(
        "Quantum transmission disabled — classical post-processing only"
      );
    },
  };
};

  // Page-level handlers
  const pageSendNextPhoton = () => {
    if (qcControlsRef.current && typeof qcControlsRef.current.sendPhoton === "function") {
      qcControlsRef.current.sendPhoton();
      return;
    }
    window.dispatchEvent(new CustomEvent("sendNextPhoton"));
  };

  const pageSendAllPhotons = () => {
    if (qcControlsRef.current && typeof qcControlsRef.current.sendBurst === "function") {
      qcControlsRef.current.sendBurst();
      return;
    }
    window.dispatchEvent(new CustomEvent("sendAllPhotons"));
  };

  // Ensure temps mirror committed on mount/when committed values change
  useEffect(() => {
    setSliderTempValue(numPhotons);
    setTempEveLevel(eveLevel);
    setTempChannelNoisePercent(channelNoisePercent);
    setTempChannelDistanceKm(channelDistanceKm);
  }, [numPhotons, eveLevel, channelNoisePercent, channelDistanceKm]);

// ===============================
// EXPERIMENT 10 — ASSUMED VALUES
// ===============================
const assumedSiftedKeyLength = Math.floor(numPhotons * 0.5);
const assumedQBER = 3;
// MITM condition
const keysMatch = false;          // Alice ≠ Bob
const eveKnowledgePercent = 100;  // Eve knows both keys


const rawKeyLength = numPhotons;
const siftedKeyLength = assumedSiftedKeyLength;
const afterErrorCorrection = siftedKeyLength;
const finalSecureKeyLength = Math.max(
  1,
  Math.floor(siftedKeyLength * (1 - assumedQBER / 100) * 0.6)
);

  // --- Derived stats for graphs ---
 const stats = useMemo(() => {
  return {
    totalSent: rawKeyLength,
    detected: siftedKeyLength,
    lost: rawKeyLength - siftedKeyLength,
    siftedKeyBits: siftedKeyLength,
    matched: siftedKeyLength,
    errors: Math.floor(siftedKeyLength * assumedQBER / 100),
    qber: assumedQBER,
  };
}, [rawKeyLength, siftedKeyLength, assumedQBER]);


  /* ❄️ FROZEN — legacy fallback (DO NOT DELETE)
  // fallback (never used in Exp 10)
  return {
    totalSent: 0,
    detected: 0,
    lost: 0,
    siftedKeyBits: 0,
    matched: 0,
    errors: 0,
    qber: 0,
  };
}, [numPhotons, siftedKeyLength, assumedQBER]);
*/




  useEffect(() => {
    if (sentTransmissions.length !== numPhotons) return;

    setKeyRateVsDistance(prev => {
      const filtered = prev.filter(
        p => p.distance !== channelDistanceKm
      );

      return [
        ...filtered,
        {
          distance: channelDistanceKm,
          keyRate: stats.siftedKeyBits,
          qber: stats.qber,
        },
      ];
    });

    if (stats.qber > 11) {
      updateStatus(
        "QBER exceeded threshold — secure key generation aborted"
      );
    }
  }, [sentTransmissions, channelDistanceKm, numPhotons, stats]);

useEffect(() => {
  const blockQuantumSend = (e) => {
    e.stopImmediatePropagation();
    setStatusMessage(
      "Quantum transmission disabled — classical post-processing only"
    );
  };

  window.addEventListener("sendNextPhoton", blockQuantumSend, true);
  window.addEventListener("sendAllPhotons", blockQuantumSend, true);

  return () => {
    window.removeEventListener("sendNextPhoton", blockQuantumSend, true);
    window.removeEventListener("sendAllPhotons", blockQuantumSend, true);
  };
}, []);




  /* ---------- ScientificBar (title outside + svg fills card) ---------- */
  function ScientificBar({
    title,
    leftLabel,
    rightLabel,
    leftValue,
    rightValue,
    yLabel = "Count",
    xLabel = "",
    maxY = null,
  }) {
    const vbW = 800;
    const vbH = 400;
    const margin = { top: 50, right: 16, bottom: 70, left: 100 };
    const innerW = vbW - margin.left - margin.right;
    const innerH = vbH - margin.top - margin.bottom;
    const domainMax = Math.max(1, maxY ? maxY : leftValue, rightValue);
    const yTicks = 5;
    const tickStep = Math.ceil(domainMax / yTicks);
    const barWidth = Math.min(360, innerW * 0.26);
    const spacing = Math.max(24, Math.round(innerW * 0.04));
    const center = margin.left + innerW / 2;
    const leftX = center - barWidth - spacing / 2;
    const rightX = center + spacing / 2;
    const baselineY = margin.top + innerH;
    const valueToY = (v) => {
      const frac = Math.min(1, v / (tickStep * yTicks));
      return Math.round(baselineY - frac * innerH);
    };
    const ticks = [];
    for (let i = 0; i <= yTicks; i++) ticks.push(i * tickStep);

    return (
      <div className="chart-wrapper" role="group" aria-label={title}>
        <div className="chart-title-outside">{title}</div>
        <div className="chart-card" style={{ padding: 8 }}>
          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none" aria-hidden>
            {ticks.map((tick, i) => {
              const y = margin.top + innerH - (i / yTicks) * innerH;
              return (
                <g key={`tick-${i}`}>
                  <line x1={margin.left} x2={margin.left + innerW} y1={y} y2={y} className="chart-gridline" />
                  <text x={margin.left - 14} y={y + 6} className="chart-tick-label" style={{ fontSize: 16, fill: "#fff" }} textAnchor="end">
                    {tick}
                  </text>
                </g>
              );
            })}
            <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + innerH} className="chart-axis-main" />
            <polyline
              points={`${margin.left},${margin.top} ${margin.left - 10},${margin.top + 20} ${margin.left + 10},${margin.top + 20}`}
              className="chart-axis-arrow"
              fill="none"
            />
            <text
              x={margin.left - 60}
              y={margin.top + innerH / 2}
              className="chart-axis-label"
              transform={`rotate(-90 ${margin.left - 72} ${margin.top + innerH / 2})`}
              style={{ fontSize: 18, fill: "#fff" }}
            >
              {yLabel}
            </text>
            <line x1={margin.left} x2={margin.left + innerW} y1={baselineY} y2={baselineY} className="chart-axis-main" />
            <polyline
              points={`${margin.left + innerW},${baselineY} ${margin.left + innerW - 14},${baselineY - 10} ${margin.left + innerW - 14},${baselineY + 10}`}
              className="chart-axis-arrow"
              fill="none"
            />
            {xLabel && (
              <text x={margin.left + innerW / 2} y={vbH - 12} className="chart-axis-label" style={{ fontSize: 16, fill: "#fff" }}>
                {xLabel} →
              </text>
            )}
            <rect
              x={leftX}
              y={valueToY(leftValue)}
              width={barWidth}
              height={baselineY - valueToY(leftValue)}
              rx="8"
              fill="#fff"
            />
            <rect
              x={rightX}
              y={valueToY(rightValue)}
              width={barWidth}
              height={baselineY - valueToY(rightValue)}
              rx="8"
              fill="#fff"
            />
            <text
              x={leftX + barWidth / 2}
              y={baselineY + 44}
              className="chart-tick-label"
              style={{ fontSize: 18, fill: "#ddd", fontWeight: 800, letterSpacing: "0.02em" }}
              textAnchor="middle"
            >
              {leftLabel}
            </text>
            <text
              x={rightX + barWidth / 2}
              y={baselineY + 44}
              className="chart-tick-label"
              style={{ fontSize: 18, fill: "#ddd", fontWeight: 800, letterSpacing: "0.02em" }}
              textAnchor="middle"
            >
              {rightLabel}
            </text>
          </svg>
        </div>
      </div>
    );
  }
function KeyLengthStagesGraph({
  rawKeyLength,
  siftedKeyLength,
  afterErrorCorrection,
  finalSecureKeyLength,
}) {
  const stages = [
    { label: "Raw Key", value: rawKeyLength },
    { label: "Sifted Key", value: siftedKeyLength },
    { label: "After Error Correction", value: afterErrorCorrection },
    { label: "Final Secure Key", value: finalSecureKeyLength },
  ];

  const maxVal = Math.max(...stages.map(s => s.value), 1);

  return (
    <div className="chart-wrapper">
      <div className="chart-title-outside">
        Key Length vs Processing Stage
      </div>

      <div className="chart-card">
        <svg viewBox="0 0 800 400" className="chart-svg">
          <line x1="80" y1="40" x2="80" y2="340" className="chart-axis-main" />
          <line x1="80" y1="340" x2="760" y2="340" className="chart-axis-main" />

          <text
            x="20"
            y="200"
            transform="rotate(-90 20 200)"
            className="chart-axis-label"
          >
            Key Length (bits)
          </text>

          <text x="360" y="390" className="chart-axis-label">
            Processing Stage
          </text>

          {stages.map((s, i) => {
            const barHeight = (s.value / maxVal) * 260;
            const x = 130 + i * 160;
            const y = 340 - barHeight;

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={80}
                  height={barHeight}
                  rx={6}
                  fill="#ffffff"
                />
                <text x={x + 40} y={360} textAnchor="middle" className="chart-tick-label">
                  {s.label}
                </text>
                <text x={x + 40} y={y - 8} textAnchor="middle" className="chart-tick-label">
                  {s.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}


  // ---------- Render ----------
  return (
    <div className="lab-container vertical-layout">
      {/* CENTER POP-UP WARNING — moved outside the aside so it overlays whole page */}
      {showSliderConfirm && (
        <div className="modal-overlay" onClick={() => { /* click outside doesn't auto close */ }}>
          <div className="slider-modal" role="dialog" aria-modal="true">
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: "1.1rem" }}>
              This will reset all data
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="exp-btn exp-btn-primary" onClick={confirmApplyChanges}>
                Apply
              </button>

              <button className="exp-btn exp-btn-ghost" onClick={cancelApplyChanges}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Theory / Intro Box (always visible above the channel) --- */}
      <div className="experiment-theory-wrapper">
        <div className="experiment-theory-box" role="region" aria-label="Experiment 7 theory">
          <div className="theory-top">
            <h2 className="theory-title"><h2>Experiment 10 — Authentication Attack (Man-in-the-Middle in BB84)</h2></h2>
          </div>

          <div className="theory-body">
          <p>
  <strong>Concept — Authentication Attack (Man-in-the-Middle):</strong>
  In this experiment, Eve does not disturb quantum states.
  Instead, she impersonates Bob to Alice and Alice to Bob,
  running two independent BB84 sessions.
</p>

<ul>
  <li>Alice generates a secure key with Eve.</li>
  <li>Bob generates a secure key with Eve.</li>
  <li>Alice and Bob do NOT share the same key.</li>
</ul>

<p>
  <strong>Critical Insight:</strong>
  QBER remains near zero, yet security is completely broken.
  This demonstrates why BB84 requires authenticated classical channels.
</p>



          </div>
        </div>
      </div>

      {/* MAIN: Controls (left) + Quantum Channel (right) */}
      <div className="channel-and-controls-wrapper">
        <aside className={`controls-left-column ${showSliderConfirm ? "disabled" : ""}`}>
          <h3>Experiment Controls</h3>

          {/* Number of Photons */}
          <div className="control-row">
            <label>Number of Photons (N)</label>
            <div className="slider-row">
             <input
  type="range"
  min="1"
  max="500"
  value={numPhotons}
  className="exp-slider"
  disabled
/>

              <span className="slider-value">
  {numPhotons} (Frozen)
</span>
            </div>
          </div>

          {/* Eve Level */}
          <div className="control-row">
            <label>Eve Interception (%)</label>
            <div className="slider-row">
              <input
                type="range"
                min="0"
                max="100"
                value={DEFAULT_EVE_PERCENT}
                className="exp-slider"
                disabled
              />
              <span className="slider-value">
                {DEFAULT_EVE_PERCENT}% (Fixed)
              </span>
            </div>
          </div>

          {/* Channel Noise */}
          {/* Channel Noise (Fixed for Experiment 8) */}
          <div className="control-row">
            <label>Channel Noise</label>
            <div className="slider-row">
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={0}
                className="exp-slider"
                disabled
              />
              <span className="slider-value">0% (Fixed)</span>
            </div>
          </div>


          {/* Distance */}
          <div className="control-row">
            <label>Distance (km)</label>
            <div className="slider-row">
              <input
  type="range"
  min="0"
  max="200"
  step="10"
  value={0}
  className="exp-slider"
  disabled
/>

              <span className="slider-value">0 km (Frozen)</span>



            </div>
          </div>

          <div className="control-actions">
            <button className="exp-btn exp-btn-primary" disabled>
  Apply Settings (Frozen)
</button>

<button className="exp-btn exp-btn-ghost" disabled>
  Reset Experiment (Frozen)
</button>

          </div>

          <div id="transmission-status">{statusMessage}</div>
        </aside>

        <div className="channel-right-area">
          <section className="channel-hero">
            <div className="channel-stage">



              <QuantumChannel
  key={`qc-${channelKey}`}
  numPhotons={numPhotons}
  photonLossPercent={0}
  eveEnabled={false}
  channelNoisePercent={0}
  channelDistanceKm={channelDistanceKm}
  onMeasured={handleMeasured}
  registerControls={registerControls}
  forceMatchBases={false}
  frozen={true}   // 🔒 NEW
/>



            </div>
          </section>
        </div>
      </div>

     {/* GRAPH ROW — Experiment 10 */}
<section className="graphs-row-wrapper" aria-label="Experiment 10 graphs">
  <div className="graphs-row" style={{ alignItems: "flex-start" }}>
    <p className="graph-note">
  Error correction and privacy amplification CANNOT prevent
authentication attacks. Eve remains undetected without
an authenticated classical channel.

</p>

  </div>
</section>
<div className="auth-attack-panel">
  <h3>Key Agreement Verification</h3>

  <ul>
    <li>Alice Key: ✔ Generated</li>
    <li>Bob Key: ✔ Generated</li>
    <li>Alice ↔ Bob: ❌ Keys DO NOT match</li>
    <li>Eve Knowledge: ⚠ Full Access</li>
  </ul>
</div>

{/* Key Analysis Panel */}
<KeyAnalysisPanel
  transmissions={[]}          // keep empty
  truncateLength={16}
  qberAbortThreshold={11}
  overrideMode={true}         // 🔑 THIS IS CRITICAL
 overrideData={{
  totalTransmissions: rawKeyLength,
  siftedKeyLength: siftedKeyLength,
  detectedErrors: 0,              // no disturbance
  qber: 0,                        // looks perfect
  finalKeyLength: siftedKeyLength,
  authenticationFailed: true,     // NEW FLAG
  eveKnowledge: "COMPLETE",       // NEW INFO
}}

/>
</div>
);
}
<p className="experiment-warning">
  ⚠️ Even with zero QBER, BB84 is insecure without authentication.
</p>
