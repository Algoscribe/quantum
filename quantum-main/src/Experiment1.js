// src/Exp1BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment1.css";
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";
import "./KeyAnalysisPanel.css";



export default function Exp1BB84() {
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


  // Modal & UI
  const [showSliderConfirm, setShowSliderConfirm] = useState(false);

  // Transmission tracking
  const [sentTransmissions, setSentTransmissions] = useState([]);
  const [channelKey, setChannelKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState(`Ready to transmit ${numPhotons} photons`);
  const [showInstructions, setShowInstructions] = useState(false);


  // Ref to receive QuantumChannel controls
  const qcControlsRef = useRef(null);

  // Initialize protocol once (on mount)
  useEffect(() => {
    initializeProtocol(numPhotons);
    updateStatus(`Protocol initialized with N=${numPhotons} photons`);
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

  w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Experiment 1 Report — BB84</title>

  <style>
    body {
      font-family: "Times New Roman", serif;
      background: white;
      color: black;
      margin: 40px;
    }

    h1, h2 {
      text-align: center;
      margin: 0;
    }

    h1 { font-size: 22px; }
    h2 { font-size: 16px; margin-bottom: 20px; }

    h3 {
      font-size: 16px;
      margin-top: 22px;
      text-decoration: underline;
    }

    p, li {
      font-size: 14px;
      line-height: 1.5;
    }

    ul {
      margin-left: 20px;
    }

    .box {
      border: 1px dashed black;
      height: 120px;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-style: italic;
      font-size: 13px;
    }

    .print-btn {
      display: block;
      margin: 30px auto;
      padding: 8px 20px;
      border: 1px solid black;
      background: white;
      cursor: pointer;
    }

    @media print {
      .print-btn { display: none; }
    }
  </style>
</head>

<body>

<button class="print-btn" onclick="window.print()">Print Report</button>

<h1>BB84 Quantum Key Distribution</h1>
<h2>Experiment 1 — Ideal BB84 Transmission: Zero Error Quantum Communication</h2>

<h3>1. Aim</h3>
<p>
To study the behavior of the BB84 Quantum Key Distribution protocol in an
ideal, disturbance-free environment and observe how perfect basis
alignment leads to zero-error quantum communication.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice — photon source</li>
  <li>Photon polarization encoder</li>
  <li>Ideal quantum channel</li>
  <li>Bob — quantum receiver</li>
  <li>Polarization measurement stage</li>
  <li>Photon count control</li>
  <li>Real-time graphs and data log table</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
The BB84 protocol encodes quantum bits using two non-orthogonal bases:
</p>

<p><strong>Rectilinear Basis (+)</strong></p>
<ul>
  <li>0 → 0° polarization</li>
  <li>1 → 90° polarization</li>
</ul>

<p><strong>Diagonal Basis (×)</strong></p>
<ul>
  <li>0 → 45° polarization</li>
  <li>1 → 135° polarization</li>
</ul>

<p>
A qubit measured in the same basis in which it was prepared yields a
deterministic result. Measurement in a different basis produces a random
outcome.
</p>

<p>
In an ideal BB84 system:
</p>
<ul>
  <li>Alice randomly chooses bit and basis</li>
  <li>Bob randomly chooses a basis</li>
  <li>Only matching bases contribute to the sifted key</li>
  <li>QBER indicates the presence of noise or eavesdropping</li>
</ul>

<p><strong>Ideal Teaching Mode Used in Experiment 1:</strong></p>
<ul>
  <li>Bob’s basis is forced to match Alice’s basis</li>
  <li>No eavesdropper (Eve)</li>
  <li>No channel noise</li>
  <li>No distance attenuation</li>
</ul>

<p>
As a result, every photon is measured in the correct basis, no
measurement disturbance occurs, and the QBER remains exactly <strong>0%</strong>.
</p>

<h3>4. Observations</h3>
<ul>
  <li>All photons were transmitted successfully</li>
  <li>Alice’s bit always matched Bob’s measurement</li>
  <li>All photons formed part of the sifted key</li>
</ul>

<p><strong>Graph Observations:</strong></p>
<ul>
  <li>Correct vs Incorrect Bits: Correct = N, Incorrect = 0</li>
  <li>Basis Match vs Mismatch: Match = N, Mismatch = 0</li>
  <li>QBER remained 0% throughout the experiment</li>
</ul>

<div class="box">
ADD SCREENSHOT OF GRAPHS / DATA LOG TABLE HERE
</div>

<h3>5. Conclusion</h3>
<p>
Experiment 1 demonstrates perfect, disturbance-free quantum communication
using the BB84 protocol.
</p>

<p>
Because Bob’s basis always matches Alice’s and no noise or eavesdropping
is present:
</p>
<ul>
  <li>Every bit is transmitted without error</li>
  <li>The sifted key is complete</li>
  <li>QBER is exactly 0%</li>
</ul>

<p>
This experiment establishes the ideal baseline behavior of BB84. All
subsequent experiments involving noise, mismatch, eavesdropping, and
distance effects are compared against this zero-error benchmark.
</p>

</body>
</html>
  `);

  w.document.close();
};

  // ---------- Slider change handlers (set temp values + show modal) ----------
  const handlePhotonSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderTempValue(val);
    setTimeout(() => setShowSliderConfirm(true), 3000);

  };

  const handleEveSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempEveLevel(val);
    setTimeout(() => setShowSliderConfirm(true), 4000);

  };

  const handleNoiseChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempChannelNoisePercent(val);
    setTimeout(() => setShowSliderConfirm(true), 4000);

  };

  const handleDistanceChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempChannelDistanceKm(val);
    setTimeout(() => setShowSliderConfirm(true), 4000);

  };

  // ---------- Confirm / Cancel for the modal ----------
  const confirmApplyChanges = () => {
    setNumPhotons(sliderTempValue);
    setEveLevel(tempEveLevel);
    setChannelNoisePercent(tempChannelNoisePercent);
    setChannelDistanceKm(tempChannelDistanceKm);

    initializeProtocol(sliderTempValue);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(`Protocol re-initialized with N=${sliderTempValue} photons`);

    setShowSliderConfirm(false);
  };

  const cancelApplyChanges = () => {
    setSliderTempValue(numPhotons);
    setTempEveLevel(eveLevel);
    setTempChannelNoisePercent(channelNoisePercent);
    setTempChannelDistanceKm(channelDistanceKm);

    setShowSliderConfirm(false);
  };

  // ---------- Channel options ----------
  const applyChannelOptions = () => {
    initializeProtocol(numPhotons);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(
      `Channel updated: Eve=${eveLevel}%, Noise=${channelNoisePercent}%, Distance=${channelDistanceKm}km`
    );
  };

  const resetChannelOptions = () => {
    // Reset committed values
    setNumPhotons(DEFAULT_PHOTONS);
    setEveLevel(0);
    setChannelNoisePercent(0);
    setChannelDistanceKm(0);

    // Reset slider temp values
    setSliderTempValue(DEFAULT_PHOTONS);
    setTempEveLevel(0);
    setTempChannelNoisePercent(0);
    setTempChannelDistanceKm(0);

    // Reset protocol + visuals
    initializeProtocol(DEFAULT_PHOTONS);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);

    updateStatus(`Experiment reset to ideal state (N=${DEFAULT_PHOTONS})`);
  };


  // Called by QuantumChannel when a photon is measured
  const handleMeasured = (snapshot) => {
    setSentTransmissions((prev) => {
      const updated = [...prev, snapshot];
      const matched = updated.filter((t) => t.match && t.bMeas !== null).length;
      updateStatus(`Photon #${snapshot.index} measured. Matched: ${matched}/${updated.length}`);
      return updated;
    });
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
    qcControlsRef.current = controls;
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

  // --- Derived stats for graphs ---
  const stats = useMemo(() => {
    const totalPlanned = numPhotons;
    const measuredCount = sentTransmissions.length;
    const matchedMeasured = sentTransmissions.filter((t) => t.match && t.bMeas !== null).length;
    const mismatchedMeasured = sentTransmissions.filter((t) => !t.match && t.bMeas !== null).length;
    const correctBits = sentTransmissions.filter((t) => t.bMeas !== null && t.aBit === t.bMeas).length;
    const incorrectBits = sentTransmissions.filter((t) => t.bMeas !== null && t.aBit !== t.bMeas).length;
    const matchedPositions = sentTransmissions.filter((t) => t.match && t.bMeas !== null);
    const errorsInMatched = matchedPositions.filter((t) => t.aBit !== t.bMeas).length;
    // Experiment 1 (Teaching Mode):
    // QBER is guaranteed to be 0 because bases always match and channel is ideal
    const qberPercent = 0;

    return {
      totalPlanned,
      measuredCount,
      matchedMeasured,
      mismatchedMeasured,
      correctBits,
      incorrectBits,
      qberPercent,
    };
  }, [numPhotons, sentTransmissions]);

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
    // Bigger viewBox but much smaller outer margins so inner plotting area is large
    const vbW = 700;
    const vbH = 400;
    const margin = { top: 50, right: 60, bottom: 70, left: 120 };

    const innerW = vbW - margin.left - margin.right;
    const innerH = vbH - margin.top - margin.bottom;

    // Determine Y domain properly (use max of values or explicit maxY)
    const domainMax = Math.max(1, maxY ? maxY : leftValue, rightValue);
    const yTicks = 5;
    const tickStep = Math.ceil(domainMax / yTicks);

    // Bar sizing
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

    // Y ticks values
    const ticks = [];
    for (let i = 0; i <= yTicks; i++) ticks.push(i * tickStep);

    return (
      <div className="chart-wrapper" role="group" aria-label={title}>
        <div className="chart-title-outside">{title}</div>

        <div className="chart-card" style={{ padding: 8 }}>
          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none" aria-hidden>

            {/* horizontal gridlines & y tick labels */}
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

            {/* Y axis */}
            <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + innerH} className="chart-axis-main" />
            <polyline
              points={`${margin.left},${margin.top} ${margin.left - 10},${margin.top + 20} ${margin.left + 10},${margin.top + 20}`}
              className="chart-axis-arrow"
              fill="none"
            />
            <text
              x={margin.left - 70}
              y={margin.top + innerH / 2}
              className="chart-axis-label"
              transform={`rotate(-90 ${margin.left - 60} ${margin.top + innerH / 2})`}
              style={{ fontSize: 20, fill: "#fff" }}
            >
              {yLabel}
            </text>

            {/* X axis */}
            <line x1={margin.left} x2={margin.left + innerW} y1={baselineY} y2={baselineY} className="chart-axis-main" />
            <polyline
              points={`${margin.left + innerW},${baselineY} ${margin.left + innerW - 14},${baselineY - 10} ${margin.left + innerW - 14},${baselineY + 10}`}
              className="chart-axis-arrow"
              fill="none"
            />
            {xLabel && (
              <text x={margin.left + innerW / 2} y={vbH - 12} className="chart-axis-label" style={{ fontSize: 18, fill: "#fff" }}>
                {xLabel} →
              </text>
            )}

            {/* Bars */}
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

            {/* Values above bars */}
            {/* X labels under bars — increased size, weight, and moved lower */}
            <text
              x={leftX + barWidth / 2}
              y={baselineY + 30}                /* moved down for breathing room */
              className="chart-tick-label"
              style={{ fontSize: 20, fill: "#ddd", fontWeight: 800, letterSpacing: "0.02em" }}
              textAnchor="middle"
            >
              {leftLabel}
            </text>

            <text
              x={rightX + barWidth / 2}
              y={baselineY + 30}
              className="chart-tick-label"
              style={{ fontSize: 20, fill: "#ddd", fontWeight: 800, letterSpacing: "0.02em" }}
              textAnchor="middle"
            >
              {rightLabel}
            </text>

          </svg>
        </div>
      </div>
    );
  }

  /* ---------- QBERLine (title outside + svg fills card) ---------- */
  function QBERLine({ sentTransmissions = [], totalPlanned = 1, showFormula = true }) {
    // running QBER series
    const points = [];
    let matched = 0;
    let errors = 0;
    for (let i = 0; i < sentTransmissions.length; i++) {
      const t = sentTransmissions[i];
      if (t.bMeas !== null && t.match) {
        matched += 1;
        if (t.aBit !== t.bMeas) errors += 1;
      }
      points.push({ index: i, qber: matched === 0 ? 0 : (errors / matched) * 100 });

    }
    const finalQBER = points.length === 0 ? 0 : Math.round(points[points.length - 1].qber * 10) / 10;

    // larger viewBox and smaller pad so plotting area is large and x-axis is visible
    const vbW = 700;
    const vbH = 400;

    const margin = { top: 50, right: 60, bottom: 70, left: 120 };
    const innerW = vbW - margin.left - margin.right;
    const innerH = vbH - margin.top - margin.bottom;

    const maxX = Math.max(1, totalPlanned);

    const xFor = (index) =>
      margin.left + (index / (maxX - 1 || 1)) * innerW;


    const yFor = (v) =>
      margin.top + innerH - (v / 100) * innerH;


    const pathD = points
      .map((p, idx) =>
        `${idx === 0 ? "M" : "L"} ${xFor(p.index)} ${yFor(p.qber)}`
      )
      .join(" ");


    return (
      <div className="chart-wrapper" role="group" aria-label="QBER (%)">
        <div className="chart-title-outside">QBER (%)</div>


        <div className="chart-card" style={{ padding: 8 }}>
          <div
            className="chart-subtitle"
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#bbb",
              marginBottom: "6px"
            }}
          >
            Ideal channel — zero error by design
          </div>

          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none" aria-hidden>
            {/* horizontal gridlines */}
            {[0, 20, 40, 60, 80, 100].map((v, i) => (
              <line key={`g-${i}`} x1={margin.left} x2={margin.left + innerW} y1={yFor(v)} y2={yFor(v)} className="chart-gridline" />
            ))}

            {/* Y axis */}
            <line
              x1={margin.left}
              x2={margin.left}
              y1={margin.top}
              y2={margin.top + innerH}
              className="chart-axis-main"
            />

            <polyline
              points={`${margin.left},${margin.top}
           ${margin.left - 10},${margin.top + 22}
           ${margin.left + 10},${margin.top + 22}`}
              className="chart-axis-arrow"
              fill="none"
            />

            <text
              x={margin.left - 72}
              y={margin.top + innerH / 2}
              transform={`rotate(-90 ${margin.left - 72} ${margin.top + innerH / 2})`}
              className="chart-axis-label"
            >

              Error Rate (%)
            </text>

            {/* X axis */}
            <line x1={margin.left} x2={margin.left + innerW} y1={margin.top + innerH} y2={margin.top + innerH} className="chart-axis-main" />
            <polyline
              points={`${margin.left + innerW},${margin.top + innerH}
           ${margin.left + innerW - 14},${margin.top + innerH - 10}
           ${margin.left + innerW - 14},${margin.top + innerH + 10}`}
              className="chart-axis-arrow"
              fill="none"
            />

            <text x={vbW / 2} y={vbH - 14} className="chart-axis-label" style={{ fontSize: 18, fill: "#fff" }}>
              Photon Index →
            </text>

            {/* y tick labels */}
            {[0, 20, 40, 60, 80, 100].map((v, i) => (
              <text
                key={`yt-${i}`}
                x={margin.left - 16}
                y={yFor(v) + 6}
                className="chart-tick-label"
                textAnchor="end"
              >

                {v}%
              </text>
            ))}

            {/* x ticks — clean fixed step starting from 0 */}
            {(() => {
              const tickCount = 5;
              const stepSize = Math.ceil(maxX / (tickCount - 1));

              return Array.from({ length: tickCount }).map((_, i) => {
                const index = Math.min(i * stepSize, maxX);
                const x = margin.left + (index / maxX) * innerW;

                return (
                  <g key={`xt-${i}`}>
                    <line
                      x1={x}
                      x2={x}
                      y1={margin.top + innerH}
                      y2={margin.top + innerH + 8}
                      className="chart-tick"
                    />
                    <text
                      x={x}
                      y={margin.top + innerH + 28}
                      className="chart-tick-label"
                      textAnchor="middle"
                    >
                      {index}
                    </text>
                  </g>
                );
              });
            })()}


            {/* current QBER point */}
            {points.length > 0 && (
              <circle
                cx={xFor(points[points.length - 1].index)}
                cy={yFor(points[points.length - 1].qber)}
                r={10}
                fill="#a855f7"
              />

            )}


          </svg>
        </div><div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <div className="chart-caption" style={{ fontSize: 15, color: "#bbb" }}>
            {showFormula ? "QBER = (incorrect_bits / matched_bits) × 100" : ""}
          </div>

          <div className="qber-value" style={{ fontSize: 22, color: "#fff" }}>
            {finalQBER}%
          </div>
        </div>

      </div >
    );
  }

  return (
    <div className="lab-container vertical-layout">
      {/* ===== BB84 ONBOARDING (Expandable Theory) ===== */}
      <div className="bb84-onboarding">
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
        {showInstructions && (
          <div className="modal-overlay">
            <div className="instructions-modal" role="dialog" aria-modal="true">
              <h2> Instructions</h2>

              <ol className="instructions-list">
                <li>Choose the desired number of photons  </li>
                <li>Default number of photons is 16  </li>
                <li>Move the slider for photon and apply changes</li>
                <li>click on send next photon or send all photons to observe transmission</li>
                <li>Observe how Alice sends photons with random bits and bases.</li>
                <li>Notice that Bob’s basis always matches Alice’s in this experiment(forcefully made).</li>
                <li>Watch the photon travel without disturbance through the channel.</li>
                <li>Observe the graphs QBER remains at <strong>0%</strong>.</li>
                <li>This experiment shows the <strong>ideal BB84 case</strong>.</li>
                <li>REMINDER - Other sliders are frozen for this experiment </li>
              </ol>

              <div className="instructions-footer">
                <button
                  className="exp-btn exp-btn-primary"
                  onClick={() => setShowInstructions(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}


        {/* --- Theory / Intro Box (always visible above the channel) --- */}
        <div className="experiment-theory-wrapper">

          <div className="experiment-theory-box" role="region" aria-label="Experiment 1 theory">
            <div className="theory-top">
              <h2 className="theory-title">Ideal BB84 Experiment </h2>
            </div>

            <div className="theory-body">
              <strong>Welcome to Experiment 1.</strong>
              <p> In this setup, you will see how BB84 behaves when everything works perfectly. The photon travels cleanly from Alice to Bob, and nothing in the channel interferes with it. This gives you the purest form of BB84 to learn from.</p>

              <h4>What Alice Does</h4>
              <p>As the simulation begins, Alice prepares each photon for you. She randomly decides which bit the photon will carry and which basis will encode it. Watch how the photon immediately takes on a specific polarization based on those two choices this is the quantum information Alice is sending.</p>

              <h4>How the Photon Moves</h4>
              <p>When the photon leaves Alice, its polarization stays exactly the same while traveling. Nothing rotates it, bends it, or disturbs it  this is an ideal, error-free quantum channel.</p>

              <h4>What Bob Does</h4>
              <p>Bob measures each photon that reaches him. In this teaching experiment Bob's basis is intentionally made identical to Alice’s so you can clearly observe a correct measurement. His measurement always reveals the correct bit here.</p>

              <h4>How the Sifted Key Forms</h4>
              <p>Every photon where Alice and Bob used the same basis becomes part of the sifted key. Since their bases are aligned, the sifted key forms smoothly and without errors  a perfect baseline before we introduce noise or eavesdropping.</p>

              <h4>Why QBER Is Zero</h4>
              <p>Because the channel is ideal, the photon never changes, and Bob measures in the correct basis, the matched bits are always correct. QBER stays at 0% in this experiment.</p>

              <p className="theory-highlight"><strong>Highlight: Forced Basis Matching (Teaching Mode)</strong><br />
                In the real BB84 protocol Alice and Bob don't coordinate bases — half match by chance. Here Bob's basis is forced to match Alice's so you can see how ideal, zero-error transmission should look before exploring noise and eavesdroppers.</p>

              <p className="theory-footer">Once you understand this, use the control panel to introduce noise, distance, or an eavesdropper to explore realistic behaviour.</p>
            </div>
          </div>
        </div>
        {/* ===== BB84 STEP-BY-STEP ONBOARDING ===== */}
        <section className="bb84-onboarding" aria-label="BB84 step-by-step explanation">

          <details className="bb84-step" open>
            <summary>STEP 1 — What is BB84?</summary>
            <p>
              BB84 is a quantum cryptography protocol where bits are encoded using photon
              polarization.
            </p>
            <ul>
              <li>Alice sends a random bit (0 or 1)</li>
              <li>Using a random basis:</li>
              <li><strong>+</strong> basis: vertical and horizontal states</li>
              <li><strong>×</strong> basis: diagonal states</li>
            </ul>
            <p>
              Bob measures each photon using his own basis. This randomness is what makes
              BB84 secure.
            </p>
          </details>

          <details className="bb84-step">
            <summary>STEP 2 — Why Bases Matter</summary>
            <p><strong>Matching Bases → Correct Measurement</strong></p>
            <p>Alice basis = Bob basis → Bob always receives the correct bit.</p>

            <p><strong>Mismatched Bases → Random Measurement</strong></p>
            <p>Alice basis ≠ Bob basis → Bob obtains a random bit.</p>

            <p>
              This is why BB84 keeps only the matching-basis photons during the sifted
              key step.
            </p>
          </details>

          <details className="bb84-step">
            <summary>STEP 3 — What Happens to the Photon?</summary>
            <p>
              A photon travels through the channel carrying a polarization that encodes
              the bit.
            </p>
            <p>
              If the channel is undisturbed, the polarization remains intact.
            </p>
            <p>
              If someone measures the photon in the wrong basis, the quantum state
              collapses randomly.
            </p>
            <p>
              This collapse is the fundamental reason why eavesdropping becomes
              detectable.
            </p>
          </details>

          <details className="bb84-step">
            <summary>STEP 4 — How Eavesdropping Works (Eve % Explained)</summary>

            <p>The slider “Eve Interception (%)” does <strong>NOT</strong> mean:</p>
            <ul>
              <li>Number of Eves</li>
              <li>Strength of Eve</li>
              <li>That Eve always intercepts photons</li>
            </ul>

            <p>It means:</p>
            <p>
              Each photon has a probability <strong>X%</strong> of being intercepted by Eve.
            </p>

            <table className="bb84-eve-table">
              <thead>
                <tr>
                  <th>Eve %</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>0%</td><td>Eve never intercepts photons</td></tr>
                <tr><td>10%</td><td>Eve intercepts ~1 out of 10 photons</td></tr>
                <tr><td>30%</td><td>Eve intercepts ~1 out of 3 photons</td></tr>
                <tr><td>100%</td><td>Eve intercepts every photon</td></tr>
              </tbody>
            </table>

            <p>
              Realistic eavesdroppers intercept only a fraction of photons to avoid
              detection. QBER rises gradually, not abruptly.
            </p>
          </details>

          <details className="bb84-step">
            <summary>STEP 5 — How Alice and Bob Detect Eve</summary>
            <p>When Eve intercepts a photon:</p>
            <ul>
              <li>She must guess the basis</li>
              <li>A wrong guess collapses the state</li>
              <li>Bob receives an incorrect bit</li>
            </ul>

            <p>
              Alice and Bob never know which photon was intercepted. Eve is detected
              statistically by observing QBER.
            </p>
            <p>
              If QBER rises above the security threshold (~11%), the key is rejected.
            </p>
          </details>

          <details className="bb84-step">
            <summary>STEP 6 — What You Will See in This Experiment</summary>

            <ul>
              <li>Bob’s basis matches Alice’s basis</li>
              <li>Channel is ideal</li>
              <li>Eve is OFF</li>
              <li>QBER remains 0%</li>
            </ul>

            <p>
              Later experiments introduce noise, distance, loss, and advanced attacks.
            </p>
          </details>

          <div className="bb84-ready">
            <div className="bb84-ready-title">You are ready to begin</div>

            <button
              type="button"
              className="exp-btn exp-btn-ghost instructions-btn bb84-instructions-btn"
              onClick={() => setShowInstructions(true)}
            >
              Instructions
            </button>
          </div>



        </section>


        {/* MAIN: Controls (left) + Quantum Channel (right) */}
        <div className="channel-and-controls-wrapper">

          <aside className={`controls-left-column ${showSliderConfirm ? "disabled" : ""}`}>

            <h3>Experiment Controls</h3>

            {/* rest of your controls */}



            {/* Number of Photons */}
            <div className="control-row">
              <label>Number of Photons (N)</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={sliderTempValue}
                  className="exp-slider"
                  onChange={handlePhotonSliderChange}
                />
                <span className="slider-value">{sliderTempValue}</span>
              </div>
            </div>

            {/* Eve Level */}
            <div className="control-row">
              <label>Eve Interception</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempEveLevel}
                  onChange={handleEveSliderChange}
                  className="exp-slider"
                  disabled={true}   /* frozen in Exp1 only */
                  title="Disabled in Experiment 1 (teaching mode)"
                />
                <span className="slider-value">{tempEveLevel}%</span>
              </div>
            </div>

            {/* Channel Noise */}
            <div className="control-row">
              <label>Channel Noise</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={tempChannelNoisePercent}
                  onChange={handleNoiseChange}
                  className="exp-slider"
                  disabled={true}   /* frozen in Exp1 only */
                  title="Disabled in Experiment 1 (teaching mode)"
                />
                <span className="slider-value">{tempChannelNoisePercent}%</span>
              </div>
            </div>

            {/* Distance */}
            <div className="control-row">
              <label>Distance</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={tempChannelDistanceKm}
                  onChange={handleDistanceChange}
                  className="exp-slider"
                  disabled={true}  /* frozen in Exp1 only */
                  title="Disabled in Experiment 1 (teaching mode)"
                />

                <span className="slider-value">{tempChannelDistanceKm} km</span>
              </div>
            </div>

            <div className="control-actions">
              <button className="exp-btn exp-btn-primary" onClick={applyChannelOptions}>
                Apply Settings
              </button>

              <button className="exp-btn exp-btn-ghost" onClick={resetChannelOptions}>
                Reset
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
                  eveLevel={0}                         /* ensure legacy eveLevel is zero */
                  eveEnabled={false}                   /* TURN EVE OFF — freezes Eve interception/animation */
                  eveInterceptPercent={0}              /* ensure interception percent is zero */
                  eveBasisMode={"random"}              /* harmless default */
                  channelNoisePercent={channelNoisePercent}
                  channelDistanceKm={channelDistanceKm}
                  onMeasured={handleMeasured}
                  registerControls={registerControls}
                  forceMatchBases={true} /* force matching for Experiment 1 teaching mode */
                />

              </div>
            </section>
          </div>
        </div>

        {/* GRAPH ROW: placed after controls & channel */}
        <section className="graphs-row-wrapper" aria-label="Experiment graphs">
          <div className="graphs-row" style={{ alignItems: "flex-start" }}>
            {/* GRAPH 1 — Correct vs Incorrect */}
            <ScientificBar
              title="Correct vs Incorrect"
              leftLabel="Correct"
              rightLabel="Incorrect"
              leftValue={stats.correctBits}
              rightValue={stats.incorrectBits}
              yLabel="Count of Bits"
              xLabel="Bit Classification"
              maxY={Math.max(1, stats.totalPlanned)}
            />

            {/* GRAPH 2 — Basis: Match vs Mismatch */}
            <ScientificBar
              title="Basis Match vs Mismatch"
              leftLabel="Match"
              rightLabel="Mismatch"
              leftValue={stats.matchedMeasured}
              rightValue={stats.mismatchedMeasured}
              yLabel="Number of Photons"
              xLabel="Basis Comparison"
              maxY={Math.max(1, stats.totalPlanned)}
            />

            {/* GRAPH 3 — QBER (line) */}
            <QBERLine sentTransmissions={sentTransmissions} totalPlanned={stats.totalPlanned} showFormula={false} />
          </div>
        </section>
        <KeyAnalysisPanel
          transmissions={sentTransmissions}
          qberAbortThreshold={11}
          truncateLength={16}
        />
      </div>
        <div style={{ textAlign: "center", margin: "40px 0" }}>
        <button
          className="exp-btn exp-btn-primary report-btn-large"
          onClick={openReportWindow}
        >
          REPORT
        </button>
      </div>
    </div>

  );
}
