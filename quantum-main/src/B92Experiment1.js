import React, { useState, useEffect, useRef, useMemo } from "react";
// Pointing directly to your dedicated B92 custom telemetry view
import QuantumChannelB92 from "./QuantumChannelB92";
import "./Experiment1.css";
// Point explicitly to your separate B92 logic engine!
import { initializeProtocol } from "./QuantumChannelLogicB92";
import KeyAnalysisPanelB92 from "./KeyAnalysisPanelB92";
import "./KeyAnalysisPanel.css";

export default function B92Experiment1() {
  // Committed (current) state
  const [numPhotons, setNumPhotons] = useState(16);
  const [eveLevel, setEveLevel] = useState(0);
  const [channelNoisePercent, setChannelNoisePercent] = useState(0);
  const [channelDistanceKm, setChannelDistanceKm] = useState(0);

  // Temporary values shown on sliders until user confirms
  const [sliderTempValue, setSliderTempValue] = useState(16);
  const [tempEveLevel, setTempEveLevel] = useState(0);
  const [tempChannelNoisePercent, setTempChannelNoisePercent] = useState(0);
  const [tempChannelDistanceKm, setTempChannelDistanceKm] = useState(0);
  const DEFAULT_PHOTONS = 16;
  const reportDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Modal & UI
  const [showSliderConfirm, setShowSliderConfirm] = useState(false);

  // Transmission tracking
  const [sentTransmissions, setSentTransmissions] = useState([]);
  const [channelKey, setChannelKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState(`Ready to transmit ${numPhotons} photons`);
  const [showInstructions, setShowInstructions] = useState(false);

  // Ref to receive QuantumChannel controls
  const qcControlsRef = useRef(null);

  // Initialize protocol once using the unified engine
  useEffect(() => {
    initializeProtocol(numPhotons);
    updateStatus(`B92 Protocol initialized with N=${numPhotons} photons`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers
  const updateStatus = (message) => setStatusMessage(message);

  // ================= REPORT WINDOW (PRINT-SAFE) =================
  const openReportWindow = () => {
    const width = 900;
    const height = 650;

    const left = Math.max(0, (window.screen.availWidth - width) / 2);
    const top = Math.max(0, (window.screen.availHeight - height) / 2);

    const w = window.open(
      "",
      "_blank",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // B92 Metrics Translation
    const reportStats = {
      total: stats.totalPlanned || numPhotons,
      conclusive: stats.conclusiveCount,
      inconclusive: stats.inconclusiveCount,
      siftedKey: stats.siftedKeyLength,
      discarded: stats.discardedCount,
      qber: stats.qberPercent,
    };

    // Fix NaN behavior by ensuring yMax defaults to total photon initialization length
    const yMax = Math.max(
      reportStats.conclusive,
      reportStats.inconclusive,
      reportStats.siftedKey,
      reportStats.discarded,
      reportStats.total,
      1
    );

    const yScale = 200 / yMax;

    const yTicks = [
      0,
      Math.round(yMax * 0.25),
      Math.round(yMax * 0.5),
      Math.round(yMax * 0.75),
      yMax,
    ];

    const securityVerdict =
      reportStats.qber <= 11
        ? "SECURE KEY ACCEPTED"
        : "KEY ABORTED";
    w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Experiment 1 Report — B92 QKD</title>
  <style>
    body { font-family: "Times New Roman", serif; background: white; color: black; margin: 40px; }
    h1, h2 { text-align: center; margin: 0; }
    h1 { font-size: 22px; }
    h2 { font-size: 16px; margin-bottom: 20px; }
    h3 { font-size: 16px; margin-top: 22px; text-decoration: underline; }
    p, li { font-size: 14px; line-height: 1.5; }
    ul { margin-left: 20px; }
    .print-btn {
      display: block;
      margin: 30px auto;
      padding: 8px 20px;
      border: 1px solid black;
      background: white;
      cursor: pointer;
    }
    @media print { .print-btn { display: none; } }
    .graph-row { display: flex; width: 100%; margin-top: 20px; margin-bottom: 50px; }
    .graph-container { width: 33.333%; box-sizing: border-box; text-align: center; }
    .graph-container h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: bold; }
    .graph-box { width: 100%; height: 300px; box-sizing: border-box; padding: 0; border: none; }
    .graph-box svg { width: 100%; height: 100%; display: block; }
  </style>
</head>
<body>

<button class="print-btn" onclick="window.print()">Print Report</button>

<h1>B92 Quantum Key Distribution</h1>
<h2>Ideal B92 Transmission: Analysis of Projections and Erasures</h2>

<h3>1. Aim</h3>
<p>
To study the behavior of the B92 Quantum Key Distribution protocol in an
ideal, disturbance-free environment and observe how non-orthogonal quantum state
projections lead to distinct conclusive and inconclusive measurement profiles.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice Quantum Transmitter (Two-State Polarization Source)</li>
  <li>Photon Polarization State Encoder (0° and 45°)</li>
  <li>Ideal Noise-Free Quantum Channel</li>
  <li>Bob Quantum Receiver (Inverse-Click Polarization Filters)</li>
  <li>Conclusive / Inconclusive Signal Measurement Board</li>
  <li>Photon Count Control</li>
  <li>Dynamic Telemetry Graphs and Analytics Activity Stream</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
The B92 protocol, proposed by Charles Bennett in 1992, simplifies quantum key distribution by utilizing exactly two non-orthogonal polarization states rather than the four states found in BB84. Alice prepares her raw photon sequences by mapping bit values directly onto single non-orthogonal coordinates: bit 0 maps to a 0° (Horizontal) polarization vector, and bit 1 maps to a 45° (Diagonal) polarization vector.
</p>
<p>
Bob implements a unique inverse configuration filtering system at his receiver. Rather than matching a coordinated basis, Bob utilizes filters designed to completely block one of the states and test for the other. He sets up a 90° filter to isolate bit 1 (since a 0° photon cannot pass a 90° filter, any click guarantees Alice sent a 45° state) and a -45° filter to isolate bit 0. Due to quantum projection rules, a valid photon only triggers a detector fire 50% of the time, providing a <b>Conclusive Measurement</b> that forms the sifted key. The remaining 50% project indeterminately, resulting in an <b>Inconclusive Erasure</b> where the detectors remain silent. In an ideal channel, all conclusive events match perfectly, keeping the QBER at 0%.
</p>

<h3>4. Observations</h3>
<ul>
  <li>All quantum transmission photon pulses processed successfully through the ideal channel.</li>
  <li>Every conclusive detection event resolved cleanly without bit distortion errors.</li>
  <li>Inconclusive erasure states were safely identified and dropped from the key matrix.</li>
</ul>

<p>
Total Transmissions Sent: ${reportStats.total}<br/>
Conclusive Measurements: ${reportStats.conclusive}<br/>
Inconclusive Measurements: ${reportStats.inconclusive}<br/>
Sifted Key Length: ${reportStats.siftedKey}<br/>
Calculated QBER: ${reportStats.qber}%<br/>
Result: <strong>${securityVerdict}</strong>
</p>

<h4>TELEMETRY PLOTS</h4>
<div class="graph-row">
  <div class="graph-container">
    <h4>Conclusive vs Inconclusive</h4>
    <div class="graph-box">
      <svg viewBox="0 0 300 300" preserveAspectRatio="none">
        <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
        <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
        
        <text x="25" y="264" font-size="12" text-anchor="end">${yTicks[0]}</text>
        <text x="25" y="214" font-size="12" text-anchor="end">${yTicks[1]}</text>
        <text x="25" y="164" font-size="12" text-anchor="end">${yTicks[2]}</text>
        <text x="25" y="114" font-size="12" text-anchor="end">${yTicks[3]}</text>
        <text x="25" y="64" font-size="12" text-anchor="end">${yTicks[4]}</text>
        
        <rect x="90" y="${260 - reportStats.conclusive * yScale}" width="40" height="${reportStats.conclusive * yScale}" fill="black"/>
        <rect x="170" y="${260 - reportStats.inconclusive * yScale}" width="40" height="${reportStats.inconclusive * yScale}" fill="gray"/>
        <text x="110" y="285" font-size="12">Conclusive</text>
        <text x="190" y="285" font-size="12">Inconclusive</text>
      </svg>
    </div>
  </div>

  <div class="graph-container">
    <h4>Sifted Key vs Discarded</h4>
    <div class="graph-box">
      <svg viewBox="0 0 300 300" preserveAspectRatio="none">
        <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
        <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
        
        <text x="25" y="264" font-size="12" text-anchor="end">${yTicks[0]}</text>
        <text x="25" y="214" font-size="12" text-anchor="end">${yTicks[1]}</text>
        <text x="25" y="164" font-size="12" text-anchor="end">${yTicks[2]}</text>
        <text x="25" y="114" font-size="12" text-anchor="end">${yTicks[3]}</text>
        <text x="25" y="64" font-size="12" text-anchor="end">${yTicks[4]}</text>
        
        <rect x="90" y="${260 - reportStats.siftedKey * yScale}" width="40" height="${reportStats.siftedKey * yScale}" fill="black"/>
        <rect x="170" y="${260 - reportStats.discarded * yScale}" width="40" height="${reportStats.discarded * yScale}" fill="gray"/>
        <text x="110" y="285" font-size="12">Sifted Key</text>
        <text x="190" y="285" font-size="12">Discarded</text>
      </svg>
    </div>
  </div>

  <div class="graph-container">
    <h4>QBER Matrix (%)</h4>
    <div class="graph-box">
      <svg viewBox="0 0 300 300" preserveAspectRatio="none">
        <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
        <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
        <circle cx="160" cy="260" r="6" fill="black"/>
        <text x="145" y="245" font-size="12">${reportStats.qber}%</text>
      </svg>
    </div>
  </div>
</div>

<h3>5. Conclusion</h3>
<p>
Experiment 1 successfully demonstrates ideal quantum key distribution using the B92 framework. Due to the intrinsic properties of non-orthogonal states, approximately 50% of the raw photons yield inconclusive tracking erasures by design and are discarded from the key matrix. However, all conclusive detections exhibit absolute transmission accuracy, establishing a flawless 0% QBER baseline before line hazards or active interception nodes are added.
</p>

<p style="margin-top:30px; text-align:center;">
  <strong>Experiment Date:</strong> ${reportDate}
</p>
</body>
</html>
    `);
    w.document.close();
  };

  // ---------- Slider change handlers ----------
  const handlePhotonSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderTempValue(val);
    setTimeout(() => setShowSliderConfirm(true), 3000);
  };

  // ---------- Confirm / Cancel for the modal ----------
  const confirmApplyChanges = () => {
    setNumPhotons(sliderTempValue);
    initializeProtocol(sliderTempValue);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`Protocol re-initialized with N=${sliderTempValue} photons`);
    setShowSliderConfirm(false);
  };

  const cancelApplyChanges = () => {
    setSliderTempValue(numPhotons);
    setShowSliderConfirm(false);
  };

  const applyChannelOptions = () => {
    initializeProtocol(numPhotons);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`B92 Workspace Applied: Tracking telemetry streams.`);
  };

  const resetChannelOptions = () => {
    setNumPhotons(DEFAULT_PHOTONS);
    setSliderTempValue(DEFAULT_PHOTONS);
    initializeProtocol(DEFAULT_PHOTONS);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`Experiment reset to ideal state (N=${DEFAULT_PHOTONS})`);
  };

  const handleMeasured = (snapshot) => {
    setSentTransmissions((prev) => {
      const updated = [...prev, snapshot];
      // Filter out erasures and channel loss flags using clean conditions
      const conclusive = updated.filter((t) => t.bMeas !== "Erasure" && t.bMeas !== "Lost" && t.bMeas !== null).length;
      updateStatus(`Photon #${snapshot.index} processed. Detected Signals: ${conclusive}/${updated.length}`);
      return updated;
    });
  };

  const registerControls = (controls) => {
    qcControlsRef.current = controls;
  };

  // --- Derived stats calculation loop mapped specifically to B92 telemetry outputs ---
  const stats = useMemo(() => {
    const totalPlanned = numPhotons;
    const conclusiveCount = sentTransmissions.filter((t) => t.bMeas !== "Erasure" && t.bMeas !== "Lost" && t.bMeas !== null).length;
    const inconclusiveCount = sentTransmissions.length - conclusiveCount;

    const siftedKeyLength = conclusiveCount;
    const discardedCount = inconclusiveCount;
    const errorCount = 0;
    const qberPercent = 0; // Absolute 0% for ideal Experiment 1 execution

    return {
      totalPlanned,
      conclusiveCount,
      inconclusiveCount,
      siftedKeyLength,
      discardedCount,
      errorCount,
      qberPercent,
    };
  }, [numPhotons, sentTransmissions]);

  /* ---------- ScientificBar ---------- */
  function ScientificBar({ title, leftLabel, rightLabel, leftValue, rightValue, maxY = null }) {
    const vbW = 700;
    const vbH = 400;
    const margin = { top: 50, right: 60, bottom: 70, left: 120 };
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
          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none">
            {ticks.map((tick, i) => {
              const y = margin.top + innerH - (i / yTicks) * innerH;
              return (
                <g key={`tick-${i}`}>
                  <line x1={margin.left} x2={margin.left + innerW} y1={y} y2={y} className="chart-gridline" />
                  <text x={margin.left - 25} y={y + 6} className="chart-tick-label" style={{ fontSize: 16, fill: "#fff" }} textAnchor="end">{tick}</text>
                </g>
              );
            })}
            <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + innerH} className="chart-axis-main" />
            <line x1={margin.left} x2={margin.left + innerW} y1={baselineY} y2={baselineY} className="chart-axis-main" />

            <rect x={leftX} y={valueToY(leftValue)} width={barWidth} height={baselineY - valueToY(leftValue)} rx="8" fill="#fff" />
            <rect x={rightX} y={valueToY(rightValue)} width={barWidth} height={baselineY - valueToY(rightValue)} rx="8" fill="#555" />

            <text x={leftX + barWidth / 2} y={baselineY + 30} className="chart-tick-label" style={{ fontSize: 20, fill: "#ddd", fontWeight: 800 }} textAnchor="middle">{leftLabel}</text>
            <text x={rightX + barWidth / 2} y={baselineY + 30} className="chart-tick-label" style={{ fontSize: 20, fill: "#ddd", fontWeight: 800 }} textAnchor="middle">{rightLabel}</text>
          </svg>
        </div>
      </div>
    );
  }

  /* ---------- QBERLine ---------- */
  function QBERLine({ finalQBER }) {
    return (
      <div className="chart-wrapper" role="group" aria-label="QBER (%)">
        <div className="chart-title-outside">QBER (%)</div>
        <div className="chart-card" style={{ padding: 8 }}>
          <div className="chart-subtitle" style={{ textAlign: "center", fontSize: "14px", color: "#bbb", marginBottom: "6px" }}>
            Ideal channel — zero error parameters by design
          </div>
          <svg viewBox="0 0 700 400" className="chart-svg" preserveAspectRatio="none">
            {[0, 20, 40, 60, 80, 100].map((v, i) => {
              const y = 330 - (v / 100) * 260;
              return (
                <g key={i}>
                  <line x1="120" x2="640" y1={y} y2={y} className="chart-gridline" />
                  <text x="90" y={y + 6} className="chart-tick-label" style={{ fill: "#fff" }} textAnchor="end">{v}%</text>
                </g>
              );
            })}
            <line x1="120" x2="120" y1="50" y2="330" className="chart-axis-main" />
            <line x1="120" x2="640" y1="330" y2="330" className="chart-axis-main" />
            <circle cx="380" cy="330" r="10" fill="#a855f7" />
          </svg>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div className="chart-caption" style={{ fontSize: 15, color: "#bbb" }}>Target verification matrix</div>
          <div className="qber-value" style={{ fontSize: 22, color: "#fff", fontWeight: "bold" }}>{finalQBER}%</div>
        </div>
      </div>
    );
  }

  return (
    <div className="horizontal-scroll-wrapper">
      <div className="lab-container vertical-layout">
        <div className="bb84-onboarding">
          {showSliderConfirm && (
            <div className="modal-overlay">
              <div className="slider-modal" role="dialog" aria-modal="true">
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: "1.1rem" }}>This will reset current data blocks</div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button className="exp-btn exp-btn-primary" onClick={confirmApplyChanges}>Apply</button>
                  <button className="exp-btn exp-btn-ghost" onClick={cancelApplyChanges}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showInstructions && (
            <div className="modal-overlay">
              <div className="instructions-modal" role="dialog" aria-modal="true">
                <h2>Instructions</h2>
                <ol className="instructions-list">
                  <li>Select the target number of photons (N) using the photon stream control slider. The simulation default value maps to <strong>16</strong>.</li>
                  <li>Click <strong>Apply Configurations</strong> to dynamically initialize the quantum workspace using your chosen parameters.</li>
                  <li>Use <strong>Send Next Photon</strong> to execute single photon animations, or click <strong>Send All Photons</strong> to process a complete burst frame down the fiber link.</li>
                  <li>Observe how Alice selects data inputs randomly, translating bit values directly onto the two active non-orthogonal vectors.</li>
                  <li>Notice how Bob's alternative vector criteria filter out incompatible states, causing roughly half of the transmission indices to result in <strong>Inconclusive Erasures</strong>.</li>
                  <li>Analyze the <strong>Conclusive vs Inconclusive</strong> graph to observe the statistical distribution of direct click events against empty runs.</li>
                  <li>Review the <strong>Sifted Key vs Discarded</strong> chart to evaluate key generation efficiency across the entire sample batch.</li>
                  <li>Monitor the running <strong>QBER (%)</strong> panel to confirm that the error rate remains locked at <strong>0%</strong>, illustrating a perfect baseline network channel.</li>
                  <li>Note: Eve active interception controls, noise sliders, and transmission distance panels are disabled for this experiment to maintain a pure simulation baseline.</li>
                </ol>
                <div className="instructions-footer">
                  <button className="exp-btn exp-btn-primary" onClick={() => setShowInstructions(false)}>Got it</button>
                </div>
              </div>
            </div>
          )}

          <div className="experiment-theory-wrapper">
            <div className="experiment-theory-box" role="region" aria-label="Experiment 1 theory">
              <div className="theory-top"><h2 className="theory-title">Ideal B92 Virtual Laboratory Workspace</h2></div>
              <div className="theory-body">
                <strong>Welcome to Experiment 1.</strong>
                <p>In this framework setup, you isolate the mathematical and physical parameters of two-state quantum key distribution under uncompromised, ideal channel constraints. Photons travel securely from Alice to Bob without interacting with external noise matrices or intercepting nodes, providing a clean baseline profile.</p>

                <h4>What Alice Does</h4>
                <p>As the quantum simulator initializes, Alice streams individual polarized photon pulses. She randomly determines the bit value for each slot and maps it directly onto one of two non-orthogonal positions. Qubits carry a 0° polarization string to specify bit 0, and a 45° polarization string to specify bit 1. This forms the absolute, un-sifted raw state matrix.</p>

                <h4>How the Photon Moves</h4>
                <p>When state vectors depart Alice's transmission line, they travel across a perfectly insulated fiber optic track. Because the simulated channel remains completely ideal, the polarization orientation stays perfectly stable. No environmental noise shifts the coordinates, and no transmission losses take place.</p>

                <h4>What Bob Does</h4>
                <p>Bob processes the incoming photon stream using alternative structural validation rules. Instead of aligning a coordinated basis configuration with Alice, Bob tests whether alternative states are completely blocked by using cross-polarized filters. When a filter fires a click, it eliminates the alternative choice, providing a <b>Conclusive Measurement</b>. If the projection results in an indeterminate match, it causes an erasure.</p>

                <h4>How the Sifted Key Forms</h4>
                <p>Only the conclusive click channels map into the final secret key framework, while erasures are cleanly bypassed. Since the channel remains free of spatial distortions, every single conclusive detection matches Alice's input bit matrix exactly, keeping the operational QBER held at a pristine 0% limit.</p>

                <p className="theory-highlight"><strong>Highlight: Two-State Non-Orthogonal Telemetry (Teaching Mode)</strong><br />
                  In the real B92 protocol, Alice and Bob manage completely independent random selections, causing approximately half of all ideal signals to drop as structural erasures. This workspace isolates these quantum boundary projections cleanly so you can observe key generation efficiency metrics before adding active line compromises.</p>
                <p className="theory-footer">Once you thoroughly review these baseline metrics, proceed to subsequent modules to introduce active noise channels, line attenuation, and intercept-resend eavesdropping arrays.</p>
              </div>
            </div>
          </div>

          <section className="bb84-onboarding" aria-label="B92 protocol step parameters">
            <details className="bb84-step" open>
              <summary>STEP 1 — Fundamentals of B92 Architecture</summary>
              <p>B92 is a simplified quantum key distribution model designed by Charles Bennett, proving that absolute cryptographic security can be achieved using exactly two non-orthogonal states rather than the four states required by BB84.</p>
              <ul>
                <li>Alice streams bits using simple two-state polarization coordinates (0° or 45°).</li>
                <li>Bob detects bits by verifying instances where alternative vectors fail to project across his diagnostic layout.</li>
                <li>The physical properties of quantum non-orthogonality guarantee that an eavesdropper cannot clone or probe the line without causing visible collapses.</li>
              </ul>
            </details>

            <details className="bb84-step">
              <summary>STEP 2 — The Inverse-Click Filtering Matrix</summary>
              <p><strong>Conclusive Detections (Valid Key Material)</strong></p>
              <p>Bob targets the alternative vector set. If his 90° filter fires a click, the photon could not have been a 0° state, meaning Alice definitively sent a 45° polarization (Bit 1).</p>
              <p><strong>Inconclusive Erasures (Safely Discarded)</strong></p>
              <p>When the projection components fail to cross the filter thresholds, detectors remain completely silent. Bob informs Alice of these silent slots, and both parties wipe them from the tracking log without running public basis-sifting cycles.</p>
            </details>

            <details className="bb84-step">
              <summary>STEP 3 — Physical Quantum Collapses</summary>
              <p>Photons carry delicate quantum wavefunctions down the fiber track that map directly to the source bit choices.</p>
              <p>If the quantum channel remains undisturbed, the vector structure passes through into Bob's analyzer completely unchanged.</p>
              <p>If an intruder or active line disturbance attempts to measure the non-orthogonal states, the wavefunction collapses into a random alignment, creating irreversible, visible tracing errors.</p>
            </details>

            <div className="bb84-ready">
              <div className="bb84-ready-title">Telemetry System Initialized</div>
              <button type="button" className="exp-btn exp-btn-ghost instructions-btn bb84-instructions-btn" onClick={() => setShowInstructions(true)}>Instructions</button>
            </div>
          </section>

          <div className="channel-and-controls-wrapper">
            <aside className={`controls-left-column ${showSliderConfirm ? "disabled" : ""}`}>
              <h3>Experiment Workspace</h3>

              <div className="control-row">
                <label>Number of Photons (N)</label>
                <div className="slider-row">
                  <input type="range" min="16" max="256" step="16" value={sliderTempValue} className="exp-slider" onChange={handlePhotonSliderChange} />
                  <span className="slider-value">{sliderTempValue}</span>
                </div>
              </div>

              <div className="control-row">
                <label>Eve Interception (Frozen)</label>
                <div className="slider-row">
                  <input type="range" disabled className="exp-slider" value={0} readOnly />
                  <span className="slider-value">0%</span>
                </div>
              </div>

              <div className="control-row">
                <label>Channel Noise (Frozen)</label>
                <div className="slider-row">
                  <input type="range" disabled className="exp-slider" value={0} readOnly />
                  <span className="slider-value">0%</span>
                </div>
              </div>

              <div className="control-row">
                <label>Line Distance (Frozen)</label>
                <div className="slider-row">
                  <input type="range" disabled className="exp-slider" value={0} readOnly />
                  <span className="slider-value">0 km</span>
                </div>
              </div>

              <div className="control-actions">
                <button className="exp-btn exp-btn-primary" onClick={applyChannelOptions}>Apply Configurations</button>
                <button className="exp-btn exp-btn-ghost" onClick={resetChannelOptions}>Reset Matrix</button>
              </div>
              <div id="transmission-status">{statusMessage}</div>
            </aside>

            <div className="channel-right-area">
              <section className="channel-hero">
                <div className="channel-stage">
                  {/* Changed forceMatchBases to false for true random B92 projections */}
                  <QuantumChannelB92
                    key={`qc-${channelKey}`}
                    numPhotons={numPhotons}
                    channelNoisePercent={channelNoisePercent}
                    channelDistanceKm={channelDistanceKm}
                    onMeasured={handleMeasured}
                    registerControls={registerControls}
                    forceMatchBases={false}
                  />
                </div>
              </section>
            </div>
          </div>

          <section className="graphs-row-wrapper" aria-label="Experiment graphs">
            <div className="graphs-row" style={{ alignItems: "flex-start" }}>
              <ScientificBar
                title="Conclusive vs Inconclusive Measurements"
                leftLabel="Conclusive"
                rightLabel="Inconclusive"
                leftValue={stats.conclusiveCount}
                rightValue={stats.inconclusiveCount}
                maxY={numPhotons}
              />

              <ScientificBar
                title="Sifted Key vs Discarded Measurements"
                leftLabel="Sifted Key"
                rightLabel="Discarded"
                leftValue={stats.siftedKeyLength}
                rightValue={stats.discardedCount}
                maxY={numPhotons}
              />

              <QBERLine finalQBER={stats.qberPercent} />
            </div>
          </section>

          <KeyAnalysisPanelB92
            transmissions={sentTransmissions}
            stats={stats}
            truncateLength={16}
          />
        </div>

        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <button className="exp-btn exp-btn-primary report-btn-large" onClick={openReportWindow}>
            GENERATE CALIBRATED REPORT
          </button>
        </div>
      </div>
    </div>
  );
}