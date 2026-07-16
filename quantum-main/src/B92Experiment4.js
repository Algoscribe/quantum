// src/B92Experiment4.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannelB92 from "./QuantumChannelB92";
import "./Experiment4.css";
import { initializeProtocol } from "./QuantumChannelLogicB92";
import KeyAnalysisPanelB92 from "./KeyAnalysisPanelB92";
import "./KeyAnalysisPanel.css";
export default function B92Experiment4() {
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
      reportStats.qber <= 11
        ? "SECURE KEY ACCEPTED (COMBINED PERTURBATIONS TOLERABLE)"
        : "⚠️ SYSTEM CRITICAL: KEY PURGED — CRYPTOGRAPHIC DANGER LIMIT EXCEEDED";

    w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Experiment 4 Report — B92 QKD</title>
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
<h2>Experiment 4: Multi-Parameter Channel Verification — Combined Noise & Eavesdropping</h2>

<h3>1. Aim</h3>
<p>
To evaluate the compound impact of active intercept-resend eavesdropping and environmental line disturbances on the B92 quantum link, analyzing the combined distortion math across the telemetry matrix.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice Quantum Transmitter (Two-State Polarization Source)</li>
  <li>Eve Active Intercept-Resend Probing Node</li>
  <li>Variable Environmental Noise Fiber Simulation Module</li>
  <li>Bob Quantum Receiver (Inverse-Click Polarization Filters)</li>
  <li>Dynamic Telemetry Graphs and Analytics Activity Stream</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
In deployed infrastructure, quantum systems confront both active malicious interception threats and passive ambient environmental perturbations simultaneously. This laboratory module demonstrates the additive property of quantum bit errors: Total QBER acts as a sum of individual channel anomalies ($QBER_{\text{total}} = QBER_{\text{noise}} + QBER_{\text{eve}}$).
</p>
<p>
Environmental noise skews polarization planes randomly, while Eve's intercept operations cause definitive wavefunction collapses. Both phenomena force photons into Bob's inverse analysis filters that should otherwise remain un-triggered, generating false-alarm clicks. The key challenge is diagnostic distinction: Alice and Bob can view the cumulative QBER value, but cannot instantly differentiate between malicious activity and path noise using raw metrics alone. If the additive error sum pushes past the 11% cutoff limit, the key matrix is purged.
</p>

<h3>4. Observations</h3>
<ul>
  <li>Simultaneous activation of noise and probing nodes caused rapid accumulation of erroneous click events.</li>
  <li>Telemetry metrics confirmed that environmental disturbances compounded Eve's error footprint.</li>
  <li>The combined QBER breached the acceptable cryptography limits at lower operational thresholds.</li>
</ul>

<p>
Total Transmissions Sent: ${reportStats.total}<br/>
Active Eve Interception: ${eveLevel}%<br/>
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
Experiment 4 successfully confirms the additive degradation mechanics of real-world quantum channels. The simultaneous footprint of ambient fiber degradation and hostile tapping yields an aggregated QBER spike that triggers absolute security validation alarms, proving that composite channel errors remain completely visible under sifting analysis.
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

  const handleEveSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempEveLevel(val);
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
    setEveLevel(tempEveLevel);
    setChannelNoisePercent(tempChannelNoisePercent);
    initializeProtocol(numPhotons);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`B92 Workspace Applied: Eve=${tempEveLevel}%, Noise=${tempChannelNoisePercent}%.`);
  };

  const resetChannelOptions = () => {
    setNumPhotons(DEFAULT_PHOTONS);
    setSliderTempValue(DEFAULT_PHOTONS);
    setEveLevel(0);
    setTempEveLevel(0);
    setChannelNoisePercent(0);
    setTempChannelNoisePercent(0);
    initializeProtocol(DEFAULT_PHOTONS);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`Workspace reset to uncompromised ideal baseline.`);
  };

  const handleMeasured = (snapshot) => {
    setSentTransmissions((prev) => {
      const updated = [...prev, snapshot];
      const conclusive = updated.filter((t) => t.bMeas !== "Erasure" && t.bMeas !== "Lost" && t.bMeas !== null).length;
      updateStatus(`Photon #${snapshot.index} processed. Combined Streams: ${conclusive}/${updated.length}`);
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

    // Simulate combined additive error footprint (Noise + Intercept-Resend)
    const totalConclusive = sentTransmissions.filter((t) => t.bMeas !== "Erasure" && t.bMeas !== "Lost" && t.bMeas !== null);
    const errorCount = totalConclusive.filter((t, idx) => {
      // Additive calculation: Eve ceiling (25%) + Noise contribution
      const eveCeiling = (eveLevel / 100) * 25;
      const noiseCeiling = channelNoisePercent;
      const combinedThreshold = eveCeiling + (noiseCeiling / 2);
      return (idx * 17 + 11) % 100 < combinedThreshold;
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
  }, [numPhotons, sentTransmissions, eveLevel, channelNoisePercent]);

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
            {finalQBER > 11 ? "⚠️ CRYPTOGRAPHIC LIMIT BREACHED: PURGE KEY" : "Target verification matrix"}
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
                  <li>Select the target number of photons (N) using the top configuration slider.</li>
                  <li>Use the <strong>Eve Interception (%)</strong> slider to set the level of active line tapping.</li>
                  <li>Adjust the <strong>Channel Noise (%)</strong> slider to inject physical path disturbances simultaneously.</li>
                  <li>Click <strong>Apply Configurations</strong> to load the compound environment metrics.</li>
                  <li>Execute transmissions using <strong>Send Next Photon</strong> or <strong>Send All Photons</strong>.</li>
                  <li>Observe how the baseline QBER tracks compound additions linearly, accelerating the threshold breach.</li>
                  <li>Verify that `KeyAnalysisPanelB92` correctly updates its cryptographic health status in response to cumulative matrix inputs.</li>
                </ol>
                <div className="instructions-footer">
                  <button className="exp-btn exp-btn-primary" onClick={() => setShowInstructions(false)}>Got it</button>
                </div>
              </div>
            </div>
          )}

          {/* Master Theory Block */}
          <div className="experiment-theory-wrapper">
            <div className="experiment-theory-box" role="region" aria-label="Experiment 4 theory">
              <div className="theory-top"><h2 className="theory-title">Multi-Parameter Disturbance Analysis</h2></div>
              <div className="theory-body">
                <strong>Welcome to Experiment 4.</strong>
                <p>
                  In real-world quantum key distribution infrastructure, a quantum fiber link is never subjected to isolated anomalies.
                  Instead, practical network nodes experience a simultaneous mix of passive environmental path degradation and active, malicious intercept attempts.
                  This laboratory configuration forces you to analyze how a two-state non-orthogonal B92 system copes when environmental path noise and an active Intercept-Resend line tap deform the flying qubits concurrently.
                </p>

                <h4>The Cumulative Degradation Loop</h4>
                <p>
                  When environmental noise rotations and hostile intercept configurations distort the transmission path at the same time, the physical changes to the photon state vectors accumulate linearly. This combined presence causes an aggressive spike in unexpected detector clicks, pushing validation frameworks past the secure 11% cutoff barrier under much smaller transmission frames.
                </p>
              </div>
            </div>
          </div>

          <section className="bb84-onboarding" aria-label="B92 protocol step parameters">
            {/* STEP 1: PHYSICS BLOCK */}
            <details className="bb84-step" open>
              <summary>STEP 1 — The Physics of Compound Polarization Mutation</summary>
              <p>
                In this advanced workspace, every flying photon sent by Alice ($|0^\circ\rangle$ for Bit 0 or $|45^\circ\rangle$ for Bit 1) must survive a two-layered gauntlet of structural deformation before reaching Bob's analysis filters:
              </p>
              <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                <li>
                  <strong>Passive Environmental Noise:</strong> Thermal fluctuations, structural bends, and mechanical vibrations across the fiber line cause a random spatial rotation of the photon's polarization axis mid-transit. This skews the geometric purity of the state vectors.
                </li>
                <li>
                  <strong>Active Intercept-Resend Collapses:</strong> Concurrently, an active eavesdropper (Eve) samples the stream based on your interception slider. By the laws of quantum mechanics, Eve cannot passively monitor or clone these non-orthogonal states. She drops her own measurement filters onto the link, forcing the delicate wavefunctions to collapse prematurely, and resends a newly encoded state based on her random, imperfect measurements.
                </li>
              </ul>
              <p style={{ marginTop: "8px" }}>
                When these states reach Bob, the combined alterations trick his specialized $90^\circ$ and $-45^\circ$ inverse filters—which are configured to achieve complete destructive interference and stay silent for clean bits—into registering false-alarm, erroneous clicks.
              </p>
            </details>

            {/* STEP 2: MATHEMATICAL BLOCK */}
            <details className="bb84-step">
              <summary>STEP 2 — The Additive Error Footprint & The Diagnostic Paradox</summary>
              <p>
                The Quantum Bit Error Rate (QBER) observed on Bob's dynamic telemetry tracking panel behaves as an additive property of the system's independent disturbances. The cumulative error ceiling climbs according to the linear relation:
              </p>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "6px", fontFamily: "monospace", margin: "12px 0", color: "#a855f7", textAlign: "center", fontSize: "1rem" }}>
                QBER_total ≈ QBER_noise + QBER_eve = (Noise_Percent / 2) + (Eve_Level_Percent × 0.25)
              </div>
              <p>
                This additive behavior exposes a fundamental operational vulnerability known as the <strong>Diagnostic Paradox</strong>. When Alice and Bob process a public sample of their sifting data blocks and calculate an elevated error rate (e.g., 17%), they can only observe the <i>cumulative sum</i> of the channel anomalies.
              </p>
              <p style={{ marginTop: "8px" }}>
                Because a background noise rotation manifests as a false detector click exactly like Eve's intercept signature, Alice and Bob cannot instantly separate baseline fiber degradation from a malicious line tap using raw QBER metrics alone.
              </p>
            </details>

            {/* STEP 3: SECURITY BLOCK */}
            <details className="bb84-step">
              <summary>STEP 3 — Sifting Thresholds & Absolute Key Purging Constraints</summary>
              <p>
                To counter the diagnostic loop limitations, quantum cryptography enforces an absolute worst-case security policy: <strong>All channel perturbations must be statistically treated as an information leak to an eavesdropper.</strong>
              </p>
              <p style={{ marginTop: "8px" }}>
                While the software dashboard steps through warning categories ("SAFE" vs "BEWARE"), the mathematical threshold for information sifting remains unyielding:
              </p>
              <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                <li>
                  <strong>Below 11% QBER:</strong> The mutual information between Alice and Bob remains higher than what Eve could extract. The key is retained, and background error-correction protocols along with privacy amplification math can safely distill a pure secret key.
                </li>
                <li>
                  <strong>Above 11% QBER:</strong> Eve has gained too much potential correlation metrics over the state space. Privacy amplification algorithms break down because the leak is too severe.
                </li>
              </ul>
              <p style={{ marginTop: "8px" }}>
                The moment your cumulative parameter settings force the QBER tracker past the 11% limit, the system triggers the prominent <code>⚠️ CRYPTOGRAPHIC LIMIT BREACHED: PURGE KEY</code> alert, indicating that the current sifted bit sequence is completely compromised and must be completely destroyed.
              </p>
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