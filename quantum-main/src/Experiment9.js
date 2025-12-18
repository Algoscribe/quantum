// src/Exp9BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment9.css"; // use a new css for exp2 (or point to Experiment1.css if you prefer)
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";
import "./KeyAnalysisPanel.css";


export default function Exp9BB84() {
  // Committed (current) state

  const intensityLevels = [
    { mu: 0.1, type: "Decoy" },
    { mu: 0.3, type: "Decoy" },
    { mu: 0.5, type: "Signal" },
    { mu: 0.8, type: "Signal" },
  ];
  function detectionProbability(mu) {
    let base = 1 - Math.exp(-mu); // Poisson statistics

    // Simulated Photon Number Splitting attack
    if (mu > 0.4) {
      base *= 0.55; // Eve suppresses multi-photon detections
    }

    return Math.round(base * 100);
  }

  const [numPhotons, setNumPhotons] = useState(16);



  // For Experiment 2 default Eve is ON — but slider should NOT start at 100%.
  // Set a sensible interactive default (change this if you prefer another starting %).
  const DEFAULT_EVE_PERCENT = 0;
  const [channelNoisePercent, setChannelNoisePercent] = useState(0);



  const [eveLevel, setEveLevel] = useState(DEFAULT_EVE_PERCENT);
  const [channelDistanceKm, setChannelDistanceKm] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

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
    `Distance enabled — observe attenuation and QKD range limits`
  );


  // Ref to receive QuantumChannel controls
  const qcControlsRef = useRef(null);

  // Initialize protocol once (on mount)
  useEffect(() => {
    initializeProtocol(numPhotons);

    setEveLevel(DEFAULT_EVE_PERCENT);      // logic
    setTempEveLevel(DEFAULT_EVE_PERCENT);  // UI

    updateStatus(`Protocol initialized with N=${numPhotons} photons — Distance attenuation model`);
  }, []);


  useEffect(() => {
    setEveLevel(DEFAULT_EVE_PERCENT);
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
  <title>Experiment 9 Report — Decoy State BB84</title>

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

<h1>Decoy State BB84</h1>
<h2>Defense Against Photon Number Splitting Attacks</h2>

<h3>1. Aim</h3>
<p>
To study the photon number splitting attack in practical BB84 systems
and to understand how decoy state techniques restore security
without increasing QBER.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice with variable photon intensity source</li>
  <li>Signal and decoy pulse generator</li>
  <li>Quantum channel</li>
  <li>Bob’s detector</li>
  <li>Eve’s PNS attack module</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
Weak laser sources emit pulses following Poisson statistics.
Some pulses contain multiple photons, enabling Photon Number Splitting attacks.
</p>
<ul>
  <li>No disturbance introduced</li>
  <li>QBER remains low</li>
  <li>Eve learns the key after basis reconciliation</li>
</ul>
<p>
Decoy state BB84 defeats this by monitoring detection statistics.
</p>

<h3>4. Observations</h3>
<p><strong>Without decoy states:</strong></p>
<ul>
  <li>QBER remains low</li>
  <li>Eve remains undetected</li>
</ul>

<p><strong>With decoy states:</strong></p>
<ul>
  <li>Statistical anomalies appear</li>
  <li>Attack is detected</li>
</ul>

<div class="box">
ADD SCREENSHOT OF OBSERVATION TABLE HERE
</div>

<h3>5. Conclusion</h3>
<p>
Low QBER does not guarantee security.
Decoy State BB84 effectively defeats photon number splitting attacks
and enables secure real-world QKD.
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

    initializeProtocol(sliderTempValue);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);

    updateStatus(
      `Protocol re-initialized with N=${sliderTempValue} photons · Eve ${DEFAULT_EVE_PERCENT}% (fixed) · Noise ${tempChannelNoisePercent}% · Distance ${tempChannelDistanceKm}km`
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
    initializeProtocol(numPhotons);
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

    initializeProtocol(numPhotons);
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

    // -------- Experiment 9: Distance Attenuation --------

    const { lossPercent, noisePercent } =
      distanceToChannelEffects(channelDistanceKm);

    // Photon lost due to attenuation
    if (Math.random() < lossPercent / 100) {
      s.bBasis = "—";
      s.bMeas = null;
      s.match = false;
      s.status = "Lost";
    } else {
      // Photon reached Bob → possible noise error
      if (Math.random() < noisePercent / 100) {
        s.bMeas = s.bMeas === 0 ? 1 : 0;
      }
      s.status = s.match ? "Yes" : "No";
    }



    // Guarantee these keys exist (so table never shows `—` due to undefined)
    if (typeof s.eveIntercepted === "undefined") s.eveIntercepted = false;

    // If Eve didn't intercept, set clear passthrough markers
    if (!s.eveIntercepted) {
      s.eveBasis = "—";
      s.eveMeas = "—";
      s.eveResendBit = "—";
      s.eveResendBasis = "—";
    } else {
      // Eve intercepted — if some fields missing, make deterministic fallback values
      s.eveBasis = s.eveBasis ?? (Math.random() < 0.5 ? "+" : "×");
      if (typeof s.eveMeas === "undefined") {
        // if basis matched original assign aBit, else collapse randomly
        s.eveMeas = (s.eveBasis === s.aBasis) ? s.aBit : (Math.random() < 0.5 ? 0 : 1);
      }
      s.eveResendBit = typeof s.eveResendBit === "undefined" ? s.eveMeas : s.eveResendBit;
      s.eveResendBasis = typeof s.eveResendBasis === "undefined" ? s.eveBasis : s.eveResendBasis;
    }

    // keep null as lost indicator (show ✖ in table renderer)
    if (s.eveMeas === null) { /* intentional: keep null to show '✖' */ }

    // push sanitized snapshot into state
    setSentTransmissions((prev) => {
      const updated = [...prev, s];
      const matched = updated.filter((t) => t.match && t.bMeas !== null).length;

      // More informative status (mention Eve when present)
      const eveText = s.eveIntercepted ? `Eve:${s.eveBasis}${s.eveMeas}→` : "";
      const bobText =
        s.bMeas === null ? "Bob:— (lost)" : `Bob:${s.bBasis}${s.bMeas}`;

      updateStatus(
        `Photon #${s.index} processed. ${bobText} · Matched: ${matched}/${updated.length}`
      );
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
    const totalSent = numPhotons;

    const detected = sentTransmissions.filter(
      (t) => t.bMeas !== null
    ).length;

    const lost = totalSent - detected;

    const matched = sentTransmissions.filter(
      (t) => t.match && t.bMeas !== null
    ).length;

    const errors = sentTransmissions.filter(
      (t) =>
        t.match &&
        t.bMeas !== null &&
        t.aBit !== t.bMeas
    ).length;

    const qber =
      matched === 0 ? 0 : Math.round((errors / matched) * 1000) / 10;

    const siftedKeyBits = matched;

    return {
      totalSent,
      detected,
      lost,
      siftedKeyBits,
      matched,
      errors,
      qber,
    };
  }, [numPhotons, sentTransmissions]);





  function DetectionVsIntensityGraph() {
    const vbW = 700;
    const vbH = 400;
    const margin = { top: 50, right: 60, bottom: 70, left: 120 };

    const innerW = vbW - margin.left - margin.right;
    const innerH = vbH - margin.top - margin.bottom;
    const experimentStarted = sentTransmissions.length > 0;


    return (
      <div className="chart-wrapper" role="group">
        <div className="chart-title-outside">
          Detection Probability vs Pulse Intensity (μ)
        </div>

        <div className="chart-card" style={{ padding: 8 }}>
          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none">

            {/* Axes */}
            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + innerH} className="chart-axis-main" />
            <line x1={margin.left} y1={margin.top + innerH} x2={margin.left + innerW} y2={margin.top + innerH} className="chart-axis-main" />

            {/* Axis labels */}
            <text
              x="60"
              y={margin.top + innerH / 2}
              transform={`rotate(-90 60 ${margin.top + innerH / 2})`}
              className="chart-axis-label"
            >
              Detection Probability (%)
            </text>

            <text
              x={margin.left + innerW / 2}
              y={vbH - 10}
              className="chart-axis-label"
            >
              Mean Photon Number (μ)
            </text>

            {/* Y ticks */}
            {[0, 25, 50, 75, 100].map((v) => {
              const y = margin.top + innerH - (v / 100) * innerH;
              return (
                <g key={v}>
                  <line x1={margin.left} x2={margin.left + innerW} y1={y} y2={y} className="chart-gridline" />
                  <text x={margin.left - 10} y={y + 5} textAnchor="end" className="chart-tick-label">
                    {v}
                  </text>
                </g>
              );
            })}

            {/* Data points */}
            {sentTransmissions.length > 0 &&
              intensityLevels.map((p, i) => {
                const x = margin.left + (i / (intensityLevels.length - 1)) * innerW;
                const y =
                  margin.top +
                  innerH -
                  (detectionProbability(p.mu) / 100) * innerH;

                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="7" fill="#fff" />

                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      className="chart-tick-label"
                    >
                      {detectionProbability(p.mu)}%
                    </text>

                    <text
                      x={x}
                      y={margin.top + innerH + 20}
                      textAnchor="middle"
                      className="chart-tick-label"
                    >
                      μ={p.mu}
                    </text>

                    <text
                      x={x}
                      y={margin.top + innerH + 36}
                      textAnchor="middle"
                      style={{ fontSize: 12, opacity: 0.7 }}
                    >
                      {p.type}
                    </text>
                  </g>
                );
              })}

          </svg>
        </div>
      </div>
    );
  }


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
                  <text
                    x={margin.left - 14}
                    y={y + 6}
                    className="chart-tick-label"
                    style={{ fontSize: 16, fill: "#fff" }}
                    textAnchor="end"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + innerH} className="chart-axis-main" />
            <line x1={margin.left} x2={margin.left + innerW} y1={baselineY} y2={baselineY} className="chart-axis-main" />

            {xLabel && (
              <text x={margin.left + innerW / 2} y={vbH - 12} className="chart-axis-label">
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
              y={baselineY + 30}
              className="chart-tick-label"
              style={{ fontSize: 20, fill: "#ddd", fontWeight: 800 }}
              textAnchor="middle"
            >
              {leftLabel}
            </text>

            <text
              x={rightX + barWidth / 2}
              y={baselineY + 30}
              className="chart-tick-label"
              style={{ fontSize: 20, fill: "#ddd", fontWeight: 800 }}
              textAnchor="middle"
            >
              {rightLabel}
            </text>
          </svg>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <>
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
            <h2>Instructions — Experiment 9</h2>

            <ol>
              <li>Select a transmission distance</li>
              <li>Click <strong>Apply Settings</strong></li>
              <li>Send photons</li>
              <li>Observe detected photons decrease</li>
              <li>Notice key rate drops with distance</li>
              <li>Observe QBER rise only at long distances</li>
            </ol>

            <button
              className="exp-btn exp-btn-primary"
              onClick={() => setShowInstructions(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="lab-container vertical-layout">
        {/* --- Theory / Intro Box (always visible above the channel) --- */}
        <div className="experiment-theory-wrapper">
          <div className="experiment-theory-box" role="region" aria-label="Experiment 7 theory">
            <div className="theory-top">
              <h2 className="theory-title"><h2>Experiment 9 — Decoy-State BB84: Defeating Photon-Number Splitting</h2></h2>
            </div>

            <div className="theory-body">
              <strong>Welcome to Experiment 9.</strong>

              <h4>1. What Experiment 9 Demonstrates</h4>
              <p>
                Experiment 9 answers a critical real-world question in quantum cryptography:
                <strong> Why is ideal single-photon BB84 not enough in practice?</strong>
              </p>
              <p>
                In theory, BB84 assumes that Alice sends exactly one photon per pulse.
              </p>
              <p>
                In practice, real systems use weak laser sources.
              </p>
              <ul>
                <li>Some pulses contain multiple photons</li>
                <li>All photons in a pulse carry the same quantum state</li>
                <li>This enables powerful attacks without disturbance</li>
              </ul>
              <p>
                This experiment introduces the <strong>Photon Number Splitting (PNS) attack</strong>
                and the <strong>Decoy State BB84 protocol</strong> that defeats it.
              </p>

              <h4>2. Photon Number Splitting (PNS) Attack</h4>
              <p>
                In real systems, Alice sometimes emits pulses with more than one photon.
              </p>
              <p>
                Eve exploits this by:
              </p>
              <ul>
                <li>Identifying multi-photon pulses</li>
                <li>Removing one photon</li>
                <li>Letting the remaining photons reach Bob</li>
                <li>Measuring her photon after basis disclosure</li>
              </ul>
              <p>
                This attack is extremely dangerous because it introduces <strong>no disturbance</strong>.
              </p>

              <h4>3. Why QBER Alone Is Not Enough</h4>
              <p>
                In earlier experiments, Eve caused detectable errors.
              </p>
              <p>
                In a PNS attack:
              </p>
              <ul>
                <li>Eve does not disturb Bob’s photon</li>
                <li>Bob measures correct bits</li>
                <li>QBER remains near zero</li>
              </ul>
              <p>
                As a result, Eve gains full information while remaining hidden.
              </p>

              <h4>4. How Decoy State BB84 Works</h4>
              <p>
                Decoy State BB84 introduces a simple but powerful idea.
              </p>
              <p>
                Alice randomly varies the intensity of her pulses:
              </p>
              <ul>
                <li><strong>Signal states</strong> — normal intensity</li>
                <li><strong>Decoy states</strong> — lower or varying intensity</li>
              </ul>
              <p>
                Eve cannot distinguish decoy pulses from signal pulses.
                Any PNS attack changes detection statistics and exposes Eve.
              </p>

              <h4>5. Why This Experiment Is Essential</h4>
              <p>
                Without this experiment, students often assume:
              </p>
              <p><em>“Low QBER means the system is secure.”</em></p>
              <p>
                Experiment 9 corrects this misconception by showing that
                security must consider <strong>photon statistics</strong>, not just error rates.
              </p>

              <h4>6. What Students Should Learn</h4>
              <ul>
                <li>Real photon sources are imperfect</li>
                <li>PNS attacks are stealthy and dangerous</li>
                <li>Low QBER does not guarantee security</li>
                <li>Decoy states restore unconditional security</li>
              </ul>

              <p className="theory-highlight">
                <strong>Key Insight:</strong>
                <br />
                Modern BB84 is secure not because sources are perfect,
                but because decoy-state techniques defeat advanced attacks.
              </p>
            </div>
            {/* ===== BB84 STEP-BY-STEP — EXPERIMENT 9 ===== */}
            <section
              className="bb84-onboarding"
              aria-label="Experiment 9 step-by-step explanation"
            >

              <details className="bb84-step" open>
                <summary>STEP 1 — Why Single Photons Are Hard</summary>
                <p>
                  Real sources emit weak laser pulses,
                  not perfect single photons.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 2 — How Eve Exploits Multi-Photon Pulses</summary>
                <p>
                  Eve steals one photon from a multi-photon pulse
                  without disturbing the rest.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 3 — Why QBER Does Not Increase</summary>
                <p>Bob still receives correct photons.</p>
                <p>No disturbance means no errors.</p>
              </details>

              <details className="bb84-step">
                <summary>STEP 4 — What Decoy States Do</summary>
                <p>
                  Decoy pulses confuse Eve and expose
                  statistical anomalies.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 5 — What You Will See in This Experiment</summary>
                <p><strong>With decoys OFF:</strong></p>
                <ul>
                  <li>Eve remains hidden</li>
                </ul>
                <p><strong>With decoys ON:</strong></p>
                <ul>
                  <li>Eve is detected statistically</li>
                </ul>
              </details>

              <details className="bb84-step">
                <summary>STEP 6 — Core Takeaway</summary>
                <p>
                  Modern BB84 is secure because of decoy states,
                  not despite imperfections.
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
                  value={sliderTempValue}
                  className="exp-slider"
                  onChange={handlePhotonSliderChange}
                />
                <span className="slider-value">{sliderTempValue}</span>
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
                  value={channelDistanceKm}
                  className="exp-slider"
                  onChange={(e) => setChannelDistanceKm(Number(e.target.value))}
                />
                <span className="slider-value">{channelDistanceKm} km</span>


              </div>
            </div>

            <div className="control-actions">
              <button className="exp-btn exp-btn-primary" onClick={applyChannelOptions}>
                Apply Settings
              </button>
              <button className="exp-btn exp-btn-ghost" onClick={resetChannelOptions}>
                Reset Experiment
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
                />


              </div>
            </section>
          </div>
        </div>

        {/* GRAPH ROW — Experiment 9 */}
        <section
          className="graphs-row-wrapper"
          aria-label="Experiment 9 graphs"
        >
          <div className="graphs-row" style={{ alignItems: "flex-start" }}>

            {/* GRAPH 1 — Correct vs Incorrect Bits */}
            <ScientificBar
              title="Correct vs Incorrect Bits"
              leftLabel="Correct"
              rightLabel="Incorrect"
              leftValue={stats.matched - stats.errors}
              rightValue={stats.errors}
              yLabel="Count of Bits"
              xLabel="Bit Classification"
              maxY={stats.matched}
            />

            {/* GRAPH 2 — Basis Match vs Basis Mismatch */}
            <ScientificBar
              title="Basis Match vs Basis Mismatch"
              leftLabel="Match"
              rightLabel="Mismatch"
              leftValue={stats.matched}
              rightValue={stats.totalSent - stats.matched}
              yLabel="Number of Photons"
              xLabel="Basis Comparison"
              maxY={stats.totalSent}
            />

            {/* GRAPH 3 — Decoy-State Core */}
            <DetectionVsIntensityGraph />

          </div>
        </section>

        {/* Key Analysis (no abort logic for Decoy-State) */}
        <KeyAnalysisPanel
          transmissions={sentTransmissions}
          qberAbortThreshold={Infinity}
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