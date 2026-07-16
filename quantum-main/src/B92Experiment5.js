// src/B92Experiment5.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannelB92 from "./QuantumChannelB92";
import "./Experiment5.css"; // Reuses matching visual frame assets
import { initializeProtocol } from "./QuantumChannelLogicB92";
import KeyAnalysisPanelB92 from "./KeyAnalysisPanelB92";
import "./KeyAnalysisPanel.css";

export default function B92Experiment5() {
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

    const reportStats = {
      total: stats.totalPlanned || numPhotons,
      conclusive: stats.conclusiveCount,
      inconclusive: stats.inconclusiveCount,
      siftedKey: stats.siftedKeyLength,
      discarded: stats.discardedCount,
      qber: stats.qberPercent,
    };

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
      reportStats.qber <= 11 && reportStats.siftedKey > 0
        ? "SECURE KEY ACCEPTED (ATTENUATED PATH VIABLE)"
        : reportStats.siftedKey === 0 
        ? "⚠️ LINK CRITICAL FAILURE: COMPLETE PHOTON ABSORPTION (ZERO KEY GENERATED)"
        : "⚠️ KEY ABORTED: CUMULATIVE CHANNELS SURPASSED SECURITY THRESHOLD CEILING";

    w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Experiment 5 Report — B92 QKD</title>
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
<h2>Experiment 5: Fiber Distance Attenuation — Complete Multi-Parameter Network Bounds</h2>

<h3>1. Aim</h3>
<p>
To isolate and map the full operational boundaries of the B92 quantum link by analyzing the compound mathematical effects of fiber distance attenuation alongside passive channel noise and active intercept threats.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice Quantum Transmitter (Two-State Polarization Source)</li>
  <li>Eve Active Intercept-Resend Probing Node</li>
  <li>Variable Environmental Noise Fiber Simulation Module</li>
  <li>Long-Haul Attenuation Fiber Distance Block Emulator</li>
  <li>Bob Quantum Receiver (Inverse-Click Polarization Filters)</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
Real-world quantum key distribution configurations face physical distance limitations dictated by fiber core attenuation. As line distance ($km$) scales upward, the probability of photon absorption follows an exponential decay path. This loss manifests as an expansion of inconclusive measurement drops (Lost photons) arriving at Bob's filter array. 
</p>
<p>
The mathematical footprint of a long-haul channel combines noise leakage, intercept distortions, and distance packet dropping. When the conclusive packet count drops, any bit error induced by noise or Eve represents an amplified percentage of the remaining key space. Thus, increasing distance limits the total throughput matrix capacity (Sifted Key Length) and increases QBER instability, proving the absolute technical constraint of distance limitations on fiber architectures.
</p>

<h3>4. Observations</h3>
<ul>
  <li>Escalating line distance dramatically reduced the count of conclusive detector click signals.</li>
  <li>The sifted key length decayed as a function of the compound line attenuation properties.</li>
  <li>Low conclusive counts amplified minor noise interactions into severe percentage-based QBER anomalies.</li>
</ul>

<p>
Total Transmissions Planned: ${reportStats.total}<br/>
Active Eve Interception: ${eveLevel}%<br/>
Configured Channel Noise: ${channelNoisePercent}%<br/>
Simulated Link Distance: ${channelDistanceKm} km<br/>
Conclusive Measurements: ${reportStats.conclusive}<br/>
Inconclusive Measurements: ${reportStats.inconclusive}<br/>
Final Sifted Key Length: ${reportStats.siftedKey}<br/>
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
        
        <circle cx="160" cy="${330 - (reportStats.qber / 100) * 260}" r="6" fill="black"/>
        <text x="145" y="${315 - (reportStats.qber / 100) * 260}" font-size="12">${reportStats.qber}%</text>
      </svg>
    </div>
  </div>
</div>

<h3>5. Conclusion</h3>
<p>
Experiment 5 isolates the structural limitations of long-distance quantum channels. As attenuation probability triggers major erasure trends, the key matrix output capacity scales down dramatically. This verifies that real-world deployment requires dark-fiber cascading repeaters or trusted relay networks to manage packet losses over expanding geographical distances.
</p>

<p style="margin-top:30px; text-align:center;">
  <strong>Experiment Date:</strong> ${reportDate}
</p>
</body>
</html>
    `);
    w.document.close();
  };
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
    const lineY = 330 - (finalQBER / 100) * 260;
    return (
      <div className="chart-wrapper" role="group" aria-label="QBER (%)">
        <div className="chart-title-outside">QBER (%)</div>
        <div className="chart-card" style={{ padding: 8 }}>
          <div className="chart-subtitle" style={{ textAlign: "center", fontSize: "14px", color: "#bbb", marginBottom: "6px" }}>
            Operational error track — 11% absolute abort threshold limit
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
            <line x1="120" x2="640" y1={330 - (11 / 100) * 260} y2={330 - (11 / 100) * 260} stroke="#ef4444" strokeDasharray="6 4" strokeWidth="2" />
            <line x1="120" x2="120" y1="50" y2="330" className="chart-axis-main" />
            <line x1="120" x2="640" y1="330" y2="330" className="chart-axis-main" />
            <circle cx="380" cy={lineY} r="10" fill={finalQBER > 11 ? "#ef4444" : "#a855f7"} />
          </svg>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div className="chart-caption" style={{ fontSize: 15, color: finalQBER > 11 ? "#ef4444" : "#bbb", fontWeight: finalQBER > 11 ? 700 : 400 }}>
            {finalQBER > 11 ? "⚠️ CRYPTOGRAPHIC LIMIT BREACHED: PURGE KEY" : "Target verification matrix"}
          </div>
          <div className="qber-value" style={{ fontSize: 22, color: finalQBER > 11 ? "#ef4444" : "#fff", fontWeight: "bold" }}>{finalQBER}%</div>
        </div>
      </div>
    );
  }
  // ---------- Slider change handlers ----------
  const handlePhotonSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderTempValue(val);
    setTimeout(() => setShowSliderConfirm(true), 3000);
  };

  const handleEveSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempEveLevel(val);
  };

  const handleNoiseSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempChannelNoisePercent(val);
  };

  const handleDistanceSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempChannelDistanceKm(val);
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
    setEveLevel(tempEveLevel);
    setChannelNoisePercent(tempChannelNoisePercent);
    setChannelDistanceKm(tempChannelDistanceKm);
    initializeProtocol(numPhotons);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`B92 Configurations Applied: Eve=${tempEveLevel}%, Noise=${tempChannelNoisePercent}%, Distance=${tempChannelDistanceKm}km.`);
  };

  const resetChannelOptions = () => {
    setNumPhotons(DEFAULT_PHOTONS);
    setSliderTempValue(DEFAULT_PHOTONS);
    setEveLevel(0);
    setTempEveLevel(0);
    setChannelNoisePercent(0);
    setTempChannelNoisePercent(0);
    setChannelDistanceKm(0);
    setTempChannelDistanceKm(0);
    initializeProtocol(DEFAULT_PHOTONS);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`Workspace reset to uncompromised ideal baseline.`);
  };

  const handleMeasured = (snapshot) => {
    setSentTransmissions((prev) => {
      const updated = [...prev, snapshot];
      const conclusive = updated.filter((t) => t.bMeas !== "Erasure" && t.bMeas !== "Lost" && t.bMeas !== null).length;
      updateStatus(`Photon #${snapshot.index} processed. Full Telemetry Load: ${conclusive}/${updated.length}`);
      return updated;
    });
  };

  const registerControls = (controls) => {
    qcControlsRef.current = controls;
  };

  // --- Derived stats calculation loop mapped onto long-distance attenuation physics ---
  const stats = useMemo(() => {
    const totalPlanned = numPhotons;
    
    // Attenuation loop simulation: calculate losses based on line distance parameter
    const simulatedTransmissions = sentTransmissions.map((t, idx) => {
      // Exponential loss modifier mimicking light decay (approx 1% structural dropping per 5km)
      const isLostByDistance = (idx * 23 + 13) % 100 < (channelDistanceKm / 4);
      if (isLostByDistance && t.bMeas !== "Erasure" && t.bMeas !== null) {
        return { ...t, bMeas: "Lost", match: false };
      }
      return t;
    });

    const conclusiveCount = simulatedTransmissions.filter((t) => t.bMeas !== "Erasure" && t.bMeas !== "Lost" && t.bMeas !== null).length;
    const inconclusiveCount = simulatedTransmissions.length - conclusiveCount;

    const siftedKeyLength = conclusiveCount;
    const discardedCount = inconclusiveCount;

    // Simulate combined additive error footprint (Noise + Intercept-Resend) across un-lost packages
    const totalConclusive = simulatedTransmissions.filter((t) => t.bMeas !== "Erasure" && t.bMeas !== "Lost" && t.bMeas !== null);
    const errorCount = totalConclusive.filter((t, idx) => {
      const eveCeiling = (eveLevel / 100) * 25;
      const noiseCeiling = channelNoisePercent;
      const combinedThreshold = eveCeiling + (noiseCeiling / 2);
      return (idx * 19 + 7) % 100 < combinedThreshold;
    }).length;

    const qberPercent = siftedKeyLength > 0 ? Math.round((errorCount / siftedKeyLength) * 100) : 0;

    return {
      totalPlanned,
      conclusiveCount,
      inconclusiveCount,
      siftedKeyLength,
      discardedCount,
      errorCount,
      qberPercent,
    };
  }, [numPhotons, sentTransmissions, eveLevel, channelNoisePercent, channelDistanceKm]);

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
                  <li>Set the target number of photons (N) using the top configuration slider.</li>
                  <li>Adjust the <strong>Eve Interception (%)</strong> and <strong>Channel Noise (%)</strong> to establish baseline disturbances.</li>
                  <li>Use the <strong>Line Distance (km)</strong> slider to introduce signal attenuation.</li>
                  <li>Click <strong>Apply Configurations</strong> to flash the workspace memory.</li>
                  <li>Transmit packets and monitor the data stream behavior.</li>
                  <li>Observe how high distance levels cause Bob's detector status columns to track <code>Silent (Blocked)</code> or <code>Lost</code> trends.</li>
                  <li>Notice that if distance forces the conclusive sifting size down, single bit anomalies dramatically inflate the dynamic QBER percentages.</li>
                </ol>
                <div className="instructions-footer">
                  <button className="exp-btn exp-btn-primary" onClick={() => setShowInstructions(false)}>Got it</button>
                </div>
              </div>
            </div>
          )}

          {/* Master Theory Block */}
          <div className="experiment-theory-wrapper">
            <div className="experiment-theory-box" role="region" aria-label="Experiment 5 theory">
              <div className="theory-top"><h2 className="theory-title">Long-Haul Attenuation Boundaries</h2></div>
              <div className="theory-body">
                <strong>Welcome to Experiment 5.</strong>
                <p>
                  In this module, you isolate the structural limits of real-world optical fibers. Every component slider is now completely unlocked, enabling you to stress-test the B92 protocol against concurrent attenuation, environmental path noise, and active adversarial taps.
                </p>

                <h4>1. Core Principles of Distant Channel Decay</h4>
                <p>
                  When Alice passes pure polarization vectors ($|0^\circ\rangle$ or $|45^\circ\rangle$) into a long-haul fiber link, the qubits encounter structural photon loss. As geographical distance ($km$) scales upward, the probability of light absorption within the silica core climbs exponentially. 
                </p>
                <p>
                  This attenuation causes a massive drop in Bob's <b>Conclusive Measurement</b> count. Instead of yielding clean bit decodes, the majority of transmissions are lost to the channel path, forcing the slots into <code>Inconclusive Erasures</code> and shrinking the total throughput volume (Sifted Key Length).
                </p>

                <h4>2. The Variance Multiplier Effect</h4>
                <p>
                  When line loss reduces the size of your conclusive data sample, the system encounters extreme statistical variance. Under these conditions, any single error event introduced by background noise or Eve's filters is amplified as a fraction of the remaining key space. This cause-and-effect relationship demonstrates why long-distance networks are highly volatile, suffering rapid QBER spikes even under minor environmental changes.
                </p>

                <h4>3. Comprehensive Cryptographic Network Sanctions</h4>
                <p>
                  If the combined constraints of intercept operations, fiber decay, and noise leakage push the telemetry tracker past the 11% cutoff limit, the safety layer intervenes. Because an attenuated channel makes error distillation impossible, the entire matrix must be wiped out to prevent a security compromise.
                </p>
              </div>
            </div>
          </div>

          <section className="bb84-onboarding" aria-label="B92 protocol step parameters">
            <details className="bb84-step" open>
              <summary>STEP 1 — Long-Haul Attenuation Physics</summary>
              <p>Expanding the transmission distance pushes single photons into exponential loss paths. This attenuation directly shrinks the available conclusive validation pool.</p>
            </details>
            <details className="bb84-step">
              <summary>STEP 2 — Statistical Error Amplification</summary>
              <p>As the sifted sample size contracts due to distance losses, individual bit mismatches constitute a larger percentage of the remaining key space, triggering volatile QBER spikes.</p>
            </details>
            <details className="bb84-step">
              <summary>STEP 3 — Absolute Network Cutoff Execution</summary>
              <p>Any system state exceeding 11% QBER automatically terminates key assembly, enforcing a zero-trust network policy across the deployment environment.</p>
            </details>
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
                <label>Eve Interception (Unlocked)</label>
                <div className="slider-row">
                  <input type="range" min="0" max="100" step="10" value={tempEveLevel} className="exp-slider" onChange={handleEveSliderChange} />
                  <span className="slider-value">{tempEveLevel}%</span>
                </div>
              </div>

              <div className="control-row">
                <label>Channel Noise (Unlocked)</label>
                <div className="slider-row">
                  <input type="range" min="0" max="50" step="5" value={tempChannelNoisePercent} className="exp-slider" onChange={handleNoiseSliderChange} />
                  <span className="slider-value">{tempChannelNoisePercent}%</span>
                </div>
              </div>

              <div className="control-row">
                <label>Line Distance (Unlocked)</label>
                <div className="slider-row">
                  <input type="range" min="0" max="200" step="10" value={tempChannelDistanceKm} className="exp-slider" onChange={handleDistanceSliderChange} />
                  <span className="slider-value">{tempChannelDistanceKm} km</span>
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
                  <QuantumChannelB92
                    key={`qc-${channelKey}`}
                    numPhotons={numPhotons}
                    eveEnabled={eveLevel > 0}
                    eveInterceptPercent={eveLevel}
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