// src/B92Experiment2.js
import React, { useState, useEffect, useRef, useMemo } from "react";
// Pointing directly to your dedicated B92 custom telemetry view
import QuantumChannelB92 from "./QuantumChannelB92";
import "./Experiment2.css";
// Point explicitly to your separate B92 logic engine!
import { initializeProtocol } from "./QuantumChannelLogicB92";
import KeyAnalysisPanelB92 from "./KeyAnalysisPanelB92";
import "./KeyAnalysisPanel.css";

export default function B92Experiment2() {
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
        : "KEY ABORTED DUE TO EXCESSIVE NOISE THRESHOLD";

    w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Experiment 2 Report — B92 QKD</title>
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
<h2>Experiment 2: Imperfect B92 Channel - Analysis of Environmental Noise</h2>

<h3>1. Aim</h3>
<p>
To evaluate the impact of environmental channel noise on the B92 Quantum Key Distribution protocol and determine how polarization vector shifts introduce faulty click metrics, raising the Quantum Bit Error Rate (QBER).
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice Quantum Transmitter (Two-State Polarization Source)</li>
  <li>Photon Polarization State Encoder (0° and 45°)</li>
  <li>Variable Environmental Noise Quantum Channel Simulator</li>
  <li>Bob Quantum Receiver (Inverse-Click Polarization Filters)</li>
  <li>Conclusive / Inconclusive Signal Measurement Board</li>
  <li>Dynamic Telemetry Graphs and Analytics Activity Stream</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
In real-world fiber channels, quantum states do not remain perfectly isolated. Thermal fluctuations, stress on the fiber, and mechanical anomalies cause a random spatial rotation of the photon's polarization axis. 
</p>
<p>
Under the B92 framework, this environment shift creates critical data errors. If Alice sends a Horizontal 0° photon (representing Bit 0) across a noisy link, its vector drifts. When it hits Bob's receiver, it is no longer perfectly aligned to be blocked by his -45° filter. The skewed photon leaks past the filter barrier, triggering an <b>Incorrect Click</b>. Thus, channel noise actively converts what should have been a "Silent Run" or a clean baseline projection into structural error noise, inflating the system QBER. If the QBER surpasses the 11% cryptographic limit, privacy amplification becomes unviable and the generated key must be dropped.
</p>

<h3>4. Observations</h3>
<ul>
  <li>Environmental line noise successfully caused dynamic vector drift across the transmission plane.</li>
  <li>Bob's inverse validation system registered false-alarm clicks due to polarization leakage.</li>
  <li>The calculated QBER altered dynamically as the configured noise percentage fluctuated.</li>
</ul>

<p>
Total Transmissions Sent: ${reportStats.total}<br/>
Configured Channel Noise: ${channelNoisePercent}%<br/>
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
        
        <circle cx="160" cy="${330 - (reportStats.qber / 100) * 260}" r="6" fill="black"/>
        <text x="145" y="${315 - (reportStats.qber / 100) * 260}" font-size="12">${reportStats.qber}%</text>
      </svg>
    </div>
  </div>
</div>

<h3>5. Conclusion</h3>
<p>
Experiment 2 successfully validates that line disturbances degrade B92 efficiency without shifting the base erasure patterns. Instead, the resulting angular mutations compromise the integrity of Bob's click captures. By isolating noise parameters, the direct dependence between structural path interference and performance decay is cleanly benchmarked.
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

  const handleNoiseSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempChannelNoisePercent(val);
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
    setChannelNoisePercent(tempChannelNoisePercent);
    initializeProtocol(numPhotons);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`B92 Workspace Applied: Noise vector tracked at ${tempChannelNoisePercent}%.`);
  };

  const resetChannelOptions = () => {
    setNumPhotons(DEFAULT_PHOTONS);
    setSliderTempValue(DEFAULT_PHOTONS);
    setChannelNoisePercent(0);
    setTempChannelNoisePercent(0);
    initializeProtocol(DEFAULT_PHOTONS);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`Experiment reset to ideal state (N=${DEFAULT_PHOTONS}, Noise=0%)`);
  };

  const handleMeasured = (snapshot) => {
    setSentTransmissions((prev) => {
      const updated = [...prev, snapshot];
      const conclusive = updated.filter((t) => t.bMeas !== "Erasure" && t.bMeas !== "Lost" && t.bMeas !== null).length;
      updateStatus(`Photon #${snapshot.index} processed. Active Telemetry Stream: ${conclusive}/${updated.length}`);
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

    // Simulate real error rate generation from environmental noise metrics
    // As noise shifts, ~half of the leaked signals induce wrong key bits
    const totalConclusive = sentTransmissions.filter((t) => t.bMeas !== "Erasure" && t.bMeas !== "Lost" && t.bMeas !== null);
    const errorCount = totalConclusive.filter((t, idx) => {
      // Use noise percent as an index probability flag for visualization
      return (idx * 7 + 3) % 100 < channelNoisePercent;
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
  }, [numPhotons, sentTransmissions, channelNoisePercent]);

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
            {/* 11% Danger Limit line marker */}
            <line x1="120" x2="640" y1={330 - (11 / 100) * 260} y2={330 - (11 / 100) * 260} stroke="#ef4444" strokeDasharray="6 4" strokeWidth="2" />
            <line x1="120" x2="120" y1="50" y2="330" className="chart-axis-main" />
            <line x1="120" x2="640" y1="330" y2="330" className="chart-axis-main" />
            <circle cx="380" cy={lineY} r="10" fill={finalQBER > 11 ? "#ef4444" : "#a855f7"} />
          </svg>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div className="chart-caption" style={{ fontSize: 15, color: finalQBER > 11 ? "#ef4444" : "#bbb", fontWeight: finalQBER > 11 ? 700 : 400 }}>
            {finalQBER > 11 ? "⚠️ CRYPTOGRAPHIC LIMIT BREACHED" : "Target verification matrix"}
          </div>
          <div className="qber-value" style={{ fontSize: 22, color: finalQBER > 11 ? "#ef4444" : "#fff", fontWeight: "bold" }}>{finalQBER}%</div>
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
                  <li>Select the target number of photons (N) using the photon stream control slider.</li>
                  <li>Adjust the <strong>Channel Noise (%)</strong> slider to inject physical fiber path mutations into the line environment.</li>
                  <li>Click <strong>Apply Configurations</strong> to dynamically update and initialize the quantum workspace with these noise criteria.</li>
                  <li>Use <strong>Send Next Photon</strong> or <strong>Send All Photons</strong> to drive the burst frame down the fiber link.</li>
                  <li>Observe how injected thermal noise shifts the polarization angles of photons mid-transit.</li>
                  <li>Track how skewed vectors fail Bob's structural blocking validation, causing them to leak through the filter and create <strong>bit errors</strong>.</li>
                  <li>Review the <strong>QBER (%)</strong> chart to trace how higher noise pushes the threshold up, eventually crossing the critical <strong>11% threshold limit</strong>.</li>
                  <li>Note: Eve active interception controls and transmission distance panels remain frozen for this module.</li>
                </ol>
                <div className="instructions-footer">
                  <button className="exp-btn exp-btn-primary" onClick={() => setShowInstructions(false)}>Got it</button>
                </div>
              </div>
            </div>
          )}

          <div className="experiment-theory-wrapper">
            <div className="experiment-theory-box" role="region" aria-label="Experiment 2 theory">
              <div className="theory-top"><h2 className="theory-title">Imperfect B92 Laboratory Workspace: Noise Injection Analysis</h2></div>
              <div className="theory-body">
                <strong>Welcome to Experiment 2.</strong>
                <p>In this laboratory module, you introduce environmental channel noise parameters to evaluate how non-orthogonal photon alignments deteriorate inside real-world fiber constraints before active intruders probe the lines.</p>

                <h4>The Distortion Vector</h4>
                <p>As photons depart Alice's transmission module, the environmental line noise applies structural spatial mutations to the vector string. This alters the precise geometric properties of the 0° and 45° coordinates mid-transit, meaning states reach the terminal matrix misaligned.</p>

                <h4>Bob's Leakage Metrics</h4>
                <p>Because B92 relies on Bob's filters perfectly absorbing/blocking specific vectors to claim definitive bit matches, any minor alignment rotation allows a photon to pass through a configuration that should have remained completely <b>Silent</b>. This breakdown triggers unexpected click instances, driving the error loop upward.</p>

                <h4>The Abort Threshold</h4>
                <p>Alice and Bob track this disruption parameter by auditing the running <b>Quantum Bit Error Rate (QBER)</b>. When noise spikes past the 11% cryptographic security margin, the signal integrity degrades past the limit where privacy amplification hashes can filter out inconsistencies, rendering the key aborted.</p>
              </div>
            </div>
          </div>

          <section className="bb84-onboarding" aria-label="B92 protocol step parameters">
            <details className="bb84-step" open>
              <summary>STEP 1 — Channel Noise Metrics</summary>
              <p>Unlike pure quantum erasures that represent acceptable transmission properties, path noise actively alters state geometry, changing true properties into broken bit values.</p>
            </details>

            <details className="bb84-step">
              <summary>STEP 2 — Leakage Projections</summary>
              <p>When environmental noise skews a 0° photon, it gains a component along the vertical axis. This lets it slip past Bob's -45° block filter, registering as a false click that compromises key accuracy.</p>
            </details>

            <div className="bb84-ready">
              <div className="bb84-ready-title">Noise Telemetry Matrix Ready</div>
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
                <label>Channel Noise (Unlocked)</label>
                <div className="slider-row">
                  <input type="range" min="0" max="50" step="5" value={tempChannelNoisePercent} className="exp-slider" onChange={handleNoiseSliderChange} />
                  <span className="slider-value">{tempChannelNoisePercent}%</span>
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