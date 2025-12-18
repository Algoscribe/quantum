// src/Exp2BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment2.css";
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";
import "./KeyAnalysisPanel.css";

export default function Exp2BB84() {
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

  // Modal & UI
  const [showSliderConfirm, setShowSliderConfirm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);


  // Transmission tracking
  const [sentTransmissions, setSentTransmissions] = useState([]);
  const [channelKey, setChannelKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState(`Ready to transmit ${numPhotons} photons`);

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
  <title>Experiment 2 Report — BB84</title>

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
<h2>Experiment 2 — Quantum Bases & Polarization States Visualizer</h2>

<h3>1. Aim</h3>
<p>
To understand how quantum information is encoded using photon polarization
in the BB84 protocol and to observe how measurement outcomes depend on
the choice of measurement basis.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice’s photon source with basis selection</li>
  <li>Photon polarization visualizer</li>
  <li>Bob’s measurement basis selector</li>
  <li>Measurement result display</li>
  <li>Basis match/mismatch indicator</li>
  <li>Observation table</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
In the BB84 protocol, information is encoded using two non-orthogonal bases:
</p>

<p><strong>Rectilinear (+) Basis</strong></p>
<ul>
  <li>|0⟩ → Vertical polarization</li>
  <li>|1⟩ → Horizontal polarization</li>
</ul>

<p><strong>Diagonal (×) Basis</strong></p>
<ul>
  <li>|0⟩ → 45° diagonal polarization</li>
  <li>|1⟩ → 135° diagonal polarization</li>
</ul>

<p>
These bases are incompatible. A photon prepared in one basis cannot be
measured deterministically in the other.
</p>

<p><strong>Measurement Rules:</strong></p>
<ul>
  <li>Same basis → deterministic result</li>
  <li>Different basis → probabilistic result</li>
</ul>

<p>
Quantum measurement causes the photon’s state to collapse into the
measurement basis, permanently destroying the original state.
</p>

<h3>4. Observations</h3>
<ul>
  <li>When Alice and Bob use the same basis, Bob always measures the correct bit</li>
  <li>When different bases are used, Bob’s measurement results vary randomly</li>
  <li>Repeated trials show approximately:</li>
  <ul>
    <li>100% correctness for same-basis measurements</li>
    <li>50% correctness for wrong-basis measurements</li>
  </ul>
  <li>The polarization visualizer clearly shows state alignment and misalignment</li>
</ul>

<div class="box">
ADD SCREENSHOT OF POLARIZATION VISUALIZATION / OBSERVATION TABLE HERE
</div>

<h3>5. Conclusion</h3>
<p>
This experiment demonstrates that quantum information fundamentally
depends on the choice of measurement basis.
</p>

<ul>
  <li>Quantum states are basis dependent</li>
  <li>Measurement in the wrong basis produces random outcomes</li>
  <li>Basis incompatibility is a feature, not a flaw</li>
  <li>This behavior enables BB84’s security against eavesdropping</li>
</ul>

<p>
Experiment 2 provides the conceptual foundation required to understand
all later BB84 experiments involving disturbance, noise, and attacks.
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
    setTimeout(() => setShowSliderConfirm(true), 4000);

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
    setEveLevel(0);
    setChannelNoisePercent(0);
    setChannelDistanceKm(0);
    setTimeout(() => applyChannelOptions(), 0);
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

  const stats = useMemo(() => {
    const totalPlanned = numPhotons;
    const measuredCount = sentTransmissions.length;
    const matchedMeasured = sentTransmissions.filter((t) => t.match && t.bMeas !== null).length;
    const mismatchedMeasured = sentTransmissions.filter((t) => !t.match && t.bMeas !== null).length;
    const correctBits = sentTransmissions.filter((t) => t.bMeas !== null && t.aBit === t.bMeas).length;
    const incorrectBits = sentTransmissions.filter((t) => t.bMeas !== null && t.aBit !== t.bMeas).length;
    const matchedPositions = sentTransmissions.filter((t) => t.match && t.bMeas !== null);
    const errorsInMatched = matchedPositions.filter((t) => t.aBit !== t.bMeas).length;

    const qberPercent =
      matchedPositions.length === 0
        ? 0
        : Math.round((errorsInMatched / matchedPositions.length) * 1000) / 10;


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
          <div
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#bbb",
              marginBottom: "6px"
            }}

          >
            Non-zero QBER arises from basis mismatch, not eavesdropping
          </div>

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
      points.push({ step: i + 1, qber: matched === 0 ? 0 : (errors / matched) * 100 });
    }
    const finalQBER = points.length === 0 ? 0 : Math.round(points[points.length - 1].qber * 10) / 10;



    // larger viewBox and smaller pad so plotting area is large and x-axis is visible
    const vbW = 700;
    const vbH = 400;
    const margin = { top: 50, right: 60, bottom: 70, left: 120 };

    const innerW = vbW - margin.left - margin.right;
    const innerH = vbH - margin.top - margin.bottom;

    const maxX = Math.max(1, totalPlanned);

    const xFor = (step) =>
      margin.left + ((step - 1) / (maxX - 1 || 1)) * innerW;

    const yFor = (v) =>
      margin.top + innerH - (v / 100) * innerH;


    const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${xFor(p.step)} ${yFor(p.qber)}`).join(" ");

    return (
      <div className="chart-wrapper" role="group" aria-label="QBER (%)">
        <div className="chart-title-outside">QBER (%)</div>

        <div className="chart-card" style={{ padding: 8 }}>
          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none" aria-hidden>
            {/* horizontal gridlines */}
            {[0, 20, 40, 60, 80, 100].map((v, i) => (
              <line
                key={`g-${i}`}
                x1={margin.left}
                x2={margin.left + innerW}
                y1={yFor(v)}
                y2={yFor(v)}
                className="chart-gridline"
              />

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
           ${margin.left - 10},${margin.top + 20}
           ${margin.left + 10},${margin.top + 20}`}
              className="chart-axis-arrow"
              fill="none"
            />

            <text
              x={margin.left - 70}
              y={margin.top + innerH / 2}
              transform={`rotate(-90 ${margin.left - 60} ${margin.top + innerH / 2})`}
              className="chart-axis-label"
              style={{ fontSize: 20, fill: "#fff" }}
            >
              QBER (%)
            </text>


            {/* X axis */}
            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={margin.top + innerH}
              y2={margin.top + innerH}
              className="chart-axis-main"
            />

            <polyline
              points={`${margin.left + innerW},${margin.top + innerH}
           ${margin.left + innerW - 14},${margin.top + innerH - 10}
           ${margin.left + innerW - 14},${margin.top + innerH + 10}`}
              className="chart-axis-arrow"
              fill="none"
            />

            <text
              x={margin.left + innerW / 2}
              y={vbH - 12}
              className="chart-axis-label"
              style={{ fontSize: 18, fill: "#fff" }}
            >
              Measurement Step →
            </text>


            {/* y tick labels */}
            {[0, 20, 40, 60, 80, 100].map((v, i) => (
              <text key={`yt-${i}`} x={margin.left - 16} y={yFor(v) + 6} className="chart-tick-label" style={{ fontSize: 16, fill: "#fff" }} textAnchor="end">
                {v}%
              </text>
            ))}

            {/* x ticks (sampled 5 positions) */}
            {Array.from({ length: 5 }).map((_, i) => {
              const step = 1 + Math.round((i / 4) * (maxX - 1 || 1));
              const x = xFor(step);
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
                    style={{ fontSize: 16, fill: "#ddd" }}
                    textAnchor="middle"
                  >
                    {step}
                  </text>
                </g>
              );
            })}


            {/* line + dots */}
            {points.length > 0 && (
              <path
                d={pathD}
                style={{ stroke: "#22c55e", strokeWidth: 3, fill: "none" }}
              />

            )}

            {points.map((p, i) => (
              <circle
                cx={xFor(p.step)}
                cy={yFor(p.qber)}
                r={5}
                fill="#22c55e"
              />


            ))}

            {/* final numeric QBER */}
            <text x={margin.left + innerW + 8} y={margin.top + 18} className="chart-tick-label" style={{ fontSize: 16, fill: "#fff" }} textAnchor="start">
              {finalQBER}%
            </text>
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <div className="chart-caption" style={{ fontSize: 14, color: "#bbb" }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>QBER shows how often Bob’s bit differs from Alice’s</li>
              <li>Only photons with matching bases are considered</li>
              <li>Here, errors arise from quantum randomness</li>
              <li>No eavesdropper is involved in this experiment</li>
            </ul>
          </div>

          <div className="qber-value" style={{ fontSize: 22, color: "#fff" }}>
            {finalQBER}%
          </div>
        </div>

      </div>
    );
  }

  return (
    <>
      {/* ================= MODALS (TOP LEVEL) ================= */}

      {showSliderConfirm && (
        <div className="modal-overlay">
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
            <h2>Instructions</h2>

            <ol className="instructions-list">
              <li>Choose the desired number of photons</li>
              <li>Default number of photons is 16</li>
              <li>Change photon number and apply</li>
              <li>Send photons to observe transmission</li>
              <li>Observe basis effects</li>
              <li>QBER remains <strong>0%</strong></li>
              <li>Other sliders are frozen</li>
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
      {/* ================= MAIN PAGE ================= */}
      <div className="lab-container vertical-layout">
        {/* --- Theory / Intro Box (always visible above the channel) --- */}
        <div className="experiment-theory-wrapper">

          <div className="experiment-theory-box" role="region" aria-label="Experiment 2 theory">
            <div className="theory-top">
              <h2 className="theory-title">Quantum Bases & Polarization Intuition Experiment</h2>
            </div>


            <div className="theory-body">
              <strong>Welcome to Experiment 2.</strong>
              <p>
                In this experiment, you will explore what a quantum “basis” actually means in the
                BB84 protocol. Unlike later experiments that focus on security and attacks, this
                setup is purely about understanding how quantum information is encoded and
                measured.
              </p>

              <p>
                There is no eavesdropper, no channel noise, and no disturbance introduced in this
                experiment. Any randomness you observe comes entirely from the rules of quantum
                measurement itself.
              </p>

              <h4>What Alice Does</h4>
              <p>
                Alice prepares each photon by choosing two things at random: a bit value and a
                basis. The basis determines how the bit is physically encoded as a photon
                polarization. Depending on her choice, the photon is prepared either in the
                rectilinear (+) basis or the diagonal (×) basis.
              </p>

              <p>
                As soon as Alice prepares the photon, its polarization direction becomes visible in
                the simulation. This polarization is the quantum information that Alice sends to
                Bob.
              </p>

              <h4>What Bob Does</h4>
              <p>
                Bob measures each photon using a basis of his own choice. His measurement device
                is aligned according to the selected basis, and the result depends critically on
                whether this basis matches Alice’s.
              </p>

              <p>
                When Bob uses the same basis as Alice, the photon aligns perfectly with his
                analyzer, and the measurement outcome is always correct. When Bob uses a different
                basis, the photon does not align, and the measurement result becomes unpredictable.
              </p>

              <h4>Why Random Results Appear</h4>
              <p>
                A photon prepared in one basis does not carry definite information in the other
                basis. When Bob measures in the wrong basis, the original quantum state is
                destroyed, and the photon collapses randomly into one of Bob’s basis states.
              </p>

              <p>
                This randomness is not caused by noise, hardware error, or interference. It is a
                fundamental property of quantum mechanics known as measurement collapse.
              </p>

              <h4>How This Connects to BB84</h4>
              <p>
                This experiment explains why BB84 keeps only those photons where Alice’s and Bob’s
                bases match. Measurements made in incompatible bases do not reliably preserve the
                encoded information and are therefore discarded during key generation.
              </p>

              <p className="theory-highlight">
                <strong>Highlight: Basis Incompatibility</strong><br />
                The rectilinear and diagonal bases are incompatible. A photon prepared in one basis
                cannot be measured deterministically in the other. This incompatibility is the
                physical reason why quantum cryptography works.
              </p>

              <p className="theory-footer">
                This experiment builds the intuition required to understand disturbance, errors,
                and eavesdropping in later BB84 experiments.
              </p>
            </div>
          </div>
        </div>
        {/* ===== STEP-BY-STEP: Quantum Basis Intuition ===== */}
        <section className="bb84-onboarding" aria-label="Quantum basis intuition steps">

          <details className="bb84-step" open>
            <summary>STEP 1 — How Alice Encodes a Bit</summary>
            <ul>
              <li>Alice chooses a random bit (0 or 1)</li>
              <li>Alice chooses a random basis (+ or ×)</li>
              <li>The chosen basis determines the photon’s polarization direction</li>
            </ul>
          </details>

          <details className="bb84-step">
            <summary>STEP 2 — What Bob’s Basis Means</summary>
            <p><strong>If Bob’s basis matches Alice’s:</strong></p>
            <ul>
              <li>The photon aligns with the analyzer</li>
              <li>The measurement is correct</li>
            </ul>

            <p><strong>If Bob’s basis differs:</strong></p>
            <ul>
              <li>The photon is misaligned</li>
              <li>The measurement becomes random</li>
            </ul>
          </details>

          <details className="bb84-step">
            <summary>STEP 3 — Why Wrong Basis Causes Randomness</summary>
            <p>
              A photon prepared in one basis has no definite value in the other basis.
            </p>
            <p>
              Measuring in the wrong basis forces the photon to collapse randomly into
              a new quantum state.
            </p>
          </details>

          <details className="bb84-step">
            <summary>STEP 4 — What to Observe in This Experiment</summary>
            <ul>
              <li>Photon rotation shows the encoded polarization state</li>
              <li>Basis match indicator highlights usable cases</li>
              <li>Measurement results change with Bob’s basis</li>
              <li>Randomness appears only for incompatible bases</li>
            </ul>
          </details>

          <details className="bb84-step">
            <summary>STEP 5 — Why This Experiment Is Essential</summary>
            <p>This experiment prepares you to understand:</p>
            <ul>
              <li>QBER in later experiments</li>
              <li>Eavesdropping disturbance</li>
              <li>Why BB84 is secure by design</li>
            </ul>

            <p>
              <strong>
                Without understanding quantum bases, BB84 security cannot be understood.
              </strong>
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
                  title="Disabled in Experiment 2 (teaching mode)"
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
                  title="Disabled in Experiment 2 (teaching mode)"
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
                  title="Disabled in Experiment 2 (teaching mode)"
                />

                <span className="slider-value">{tempChannelDistanceKm} km</span>
              </div>
            </div>

            <div className="control-actions">
              <button className="exp-btn exp-btn-primary" onClick={applyChannelOptions}>
                Apply Settings
              </button>
              <button className="exp-btn exp-btn-ghost" onClick={resetChannelOptions}>
                Reset to Ideal
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
                  forceMatchBases={false} /* force matching for Experiment 1 teaching mode */
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
            <QBERLine sentTransmissions={sentTransmissions} totalPlanned={stats.totalPlanned} showFormula={true} />
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
    </>

  );
}
