// src/Exp6BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment5.css"; // use a new css for exp2 (or point to Experiment1.css if you prefer)
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";
import "./KeyAnalysisPanel.css";

export default function Exp6BB84() {
  // Committed (current) state
  const [numPhotons, setNumPhotons] = useState(16);

  // For Experiment 2 default Eve is ON — but slider should NOT start at 100%.
  // Set a sensible interactive default (change this if you prefer another starting %).
  const DEFAULT_EVE_PERCENT = 0;

  const [eveLevel, setEveLevel] = useState(DEFAULT_EVE_PERCENT);
  const [channelNoisePercent, setChannelNoisePercent] = useState(0);
  const [channelDistanceKm, setChannelDistanceKm] = useState(0);
  const [, forceUpdate] = useState(0);
  const runCompletedRef = useRef(false);



  // Temporary values shown on sliders until user confirms
  const [sliderTempValue, setSliderTempValue] = useState(16);
  const [tempEveLevel, setTempEveLevel] = useState(DEFAULT_EVE_PERCENT);
  const [tempChannelNoisePercent, setTempChannelNoisePercent] = useState(0);
  const [tempChannelDistanceKm, setTempChannelDistanceKm] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const qberHistoryRef = useRef([]);


  // Modal & UI
  const [showSliderConfirm, setShowSliderConfirm] = useState(false);

  // Transmission tracking
  const [sentTransmissions, setSentTransmissions] = useState([]);
  const [channelKey, setChannelKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState(`No Eve — Channel Noise experiment ready (${numPhotons} photons)`);


  // Ref to receive QuantumChannel controls
  const qcControlsRef = useRef(null);

  // Initialize protocol once (on mount)
  useEffect(() => {
    initializeProtocol(numPhotons);
    updateStatus(`Protocol initialized with N=${numPhotons} photons — No Eve, Noise OFF`);

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
  <title>Experiment 6 Report — Channel Noise in BB84</title>

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

<h1>Channel Noise in BB84</h1>
<h2>Experiment 6 — Environmental Disturbance Without Eavesdropping</h2>

<h3>1. Aim</h3>
<p>
To study how environmental noise in a quantum channel affects photon transmission
and increases the Quantum Bit Error Rate (QBER) in the absence of an eavesdropper.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice (random bit and basis preparation)</li>
  <li>Noise-controlled quantum channel</li>
  <li>Bob (random basis measurement)</li>
  <li>Photon count control</li>
  <li>Channel noise control</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
In real quantum communication systems, photons interact with their environment.
These interactions may unintentionally alter photon states, causing errors.
</p>
<ul>
  <li>Noise does not involve measurement</li>
  <li>Noise does not extract information</li>
  <li>Noise introduces random, unbiased errors</li>
</ul>
<p>
BB84 protocols are designed to tolerate limited noise while remaining secure.
</p>

<h3>4. Observations</h3>
<ul>
  <li>Incorrect bits increase with channel noise</li>
  <li>QBER rises smoothly as noise increases</li>
  <li>Basis match rate remains approximately constant</li>
  <li>No sharp QBER jump toward 25% is observed</li>
</ul>

<div class="box">
ADD SCREENSHOT OF GRAPH / TABLE HERE
</div>

<h3>5. Conclusion</h3>
<p>
This experiment demonstrates that errors in BB84 can arise from natural channel
imperfections and not only from eavesdropping.
Low QBER does not automatically imply an attack.
Understanding error sources is essential for real-world quantum security.
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
    runCompletedRef.current = false;

    initializeProtocol(sliderTempValue);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);

    updateStatus(
      `Protocol re-initialized with N=${sliderTempValue} photons · Eve ${tempEveLevel}% · Noise ${tempChannelNoisePercent}% · Distance ${tempChannelDistanceKm}km`
    );

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
    runCompletedRef.current = false;

    initializeProtocol(numPhotons);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(
      `Channel updated:Eve=0% (disabled), Noise=${channelNoisePercent}%, Distance=${channelDistanceKm}km`
    );
  };

  const resetChannelOptions = () => {
    // typical reset: make Eve very aggressive (you can change to whatever "typical" means)
    setEveLevel(DEFAULT_EVE_PERCENT);
    setChannelNoisePercent(0);
    setChannelDistanceKm(0);
    qberHistoryRef.current = [];
    forceUpdate(v => v + 1);
    runCompletedRef.current = false;

    setTimeout(() => applyChannelOptions(), 0);
  };

  // Called by QuantumChannel when a photon is measured
  const handleMeasured = (snapshotRaw) => {
    // Ensure we never push undefined Eve fields to the table: sanitize snapshot
    const s = { ...snapshotRaw };

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
      updateStatus(`Photon #${s.index} measured. ${eveText}Bob:${s.bBasis}${s.bMeas} · Matched: ${matched}/${updated.length}`);
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
    const qberPercent = matchedPositions.length === 0 ? 0 : Math.round((errorsInMatched / matchedPositions.length) * 1000) / 10;
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
  useEffect(() => {
    if (
      sentTransmissions.length === numPhotons &&
      numPhotons > 0 &&
      !runCompletedRef.current
    ) {
      qberHistoryRef.current.push({
        noise: channelNoisePercent,
        qber: stats.qberPercent,
      });


      runCompletedRef.current = true;
      forceUpdate(v => v + 1);
    }
  }, [sentTransmissions.length]);


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
          </div>

          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none">

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
  function QBERvsNoise({ data }) {

    /* === MATCH ScientificBar EXACTLY === */
    const vbW = 700;
    const vbH = 400;
    const margin = { top: 50, right: 60, bottom: 70, left: 120 };

    const innerW = vbW - margin.left - margin.right;
    const innerH = vbH - margin.top - margin.bottom;

    /* === Domains === */
    const maxNoise =
      data && data.length > 0
        ? Math.max(1, ...data.map(d => d.noise))
        : 50;


    const maxQ = 30; // 25% theoretical + margin

    /* === Scales === */
    const xFor = (noise) =>
      margin.left + (noise / maxNoise) * innerW;


    const yFor = (q) =>
      margin.top + innerH - (q / maxQ) * innerH;

    return (
      <div className="chart-wrapper">
        <div className="chart-title-outside">
          QBER (%) vs Channel Noise (No Eve)
        </div>

        <div className="chart-card" style={{ padding: 8 }}>
          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none">

            {/* ===== Y GRID + TICKS (same density as others) ===== */}
            {[0, 5, 10, 15, 20, 25, 30].map(v => (
              <g key={v}>
                <line
                  x1={margin.left}
                  x2={margin.left + innerW}
                  y1={yFor(v)}
                  y2={yFor(v)}
                  className="chart-gridline"
                />
                <text
                  x={margin.left - 14}
                  y={yFor(v) + 6}
                  className="chart-tick-label"
                  style={{ fontSize: 16, fill: "#fff" }}
                  textAnchor="end"
                >
                  {v}%
                </text>
              </g>
            ))}

            {/* ===== Y AXIS ===== */}
            <line
              x1={margin.left}
              x2={margin.left}
              y1={margin.top}
              y2={margin.top + innerH}
              className="chart-axis-main"
            />

            {/* ===== X AXIS ===== */}
            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={margin.top + innerH}
              y2={margin.top + innerH}
              className="chart-axis-main"
            />

            {(() => {
              const TICK_COUNT = 5; // ← adjust to 6 or 7 if you want
              const step = Math.ceil(maxNoise / TICK_COUNT);

              const ticks = [];
              for (let v = 0; v <= maxNoise; v += step) {
                ticks.push(v);
              }

              if (ticks[ticks.length - 1] !== maxNoise) {
                ticks.push(maxNoise);
              }


              return ticks.map((v, i) => (
                <g key={i}>
                  <line
                    x1={xFor(v)}
                    x2={xFor(v)}
                    y1={margin.top + innerH}
                    y2={margin.top + innerH + 8}
                    className="chart-tick"
                  />
                  <text
                    x={xFor(v)}
                    y={margin.top + innerH + 30}
                    className="chart-tick-label"
                    style={{ fontSize: 16, fill: "#ddd", fontWeight: 600 }}
                    textAnchor="middle"
                  >
                    {v}
                  </text>
                </g>
              ));
            })()}


            {/* ===== AXIS LABELS (MATCH STYLE) ===== */}
            <text
              x={margin.left - 70}
              y={margin.top + innerH / 2}
              transform={`rotate(-90 ${margin.left - 70} ${margin.top + innerH / 2})`}
              className="chart-axis-label"
              style={{ fontSize: 20, fill: "#fff" }}
            >
              QBER (%)
            </text>

            <text
              x={margin.left + innerW / 2}
              y={vbH - 12}
              className="chart-axis-label"
              style={{ fontSize: 18, fill: "#fff" }}
            >
              Channel Noise (%) →

            </text>
            {/* ===== SECURITY THRESHOLDS ===== */}
            {/* Practical abort threshold */}
            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={yFor(11)}
              y2={yFor(11)}
              stroke="#facc15"
              strokeDasharray="6 6"
              strokeWidth="2"
            />

            {/* Intercept–resend theoretical limit */}
            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={yFor(25)}
              y2={yFor(25)}
              stroke="#ef4444"
              strokeDasharray="6 6"
              strokeWidth="2"
            />

            {/* ===== DATA POINTS ===== */}
            {data && data.map((d, i) => {
              const x = xFor(d.noise);

              const y = yFor(d.qber);

              return (
                <g key={i}>
                  {/* Dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill="#ffffff"
                  />

                  {/* Value label above dot */}
                  <text
                    x={x}
                    y={y - 10}          // slightly above the dot
                    textAnchor="middle"
                    className="chart-tick-label"
                    style={{
                      fontSize: 14,
                      fill: "#ddd",
                      fontWeight: 600,
                    }}
                  >
                    {d.qber}%
                  </text>
                </g>
              );
            })}


            {/* ===== PLACEHOLDER (MATCHED STYLE) ===== */}
            {(!data || data.length === 0) && (
              <text
                x={margin.left + innerW / 2}
                y={margin.top + innerH / 2}
                textAnchor="middle"
                style={{
                  fill: "#888",
                  fontSize: 16,
                  fontStyle: "italic",
                }}
              >
                Complete a run to observe QBER convergence
              </text>
            )}

          </svg>
        </div>
      </div>
    );
  }

  /* ---------- QBERLine — QBER vs Sifted Key Length ---------- */

  function QBERLine({ sentTransmissions = [], totalPlanned = 1 }) {
    const points = [];
    let matched = 0;
    let errors = 0;
    let siftedIndex = 0;

    for (let i = 0; i < sentTransmissions.length; i++) {
      const t = sentTransmissions[i];

      // Only update QBER when a NEW sifted bit is formed
      if (t.bMeas !== null && t.match) {
        matched++;
        if (t.aBit !== t.bMeas) errors++;

        if (matched >= 5) {
          points.push({
            step: matched,
            qber: (errors / matched) * 100,
          });
        }
      }
    }


    const finalQBER =
      points.length === 0
        ? 0
        : Math.round(points[points.length - 1].qber * 10) / 10;

    /* === Geometry (MATCH ScientificBar) === */
    const vbW = 800;
    const vbH = 400;
    const margin = { top: 50, right: 16, bottom: 70, left: 100 };

    const innerW = vbW - margin.left - margin.right;
    const innerH = vbH - margin.top - margin.bottom;


    const maxX = Math.max(1, matched);   // sifted key length
    const MAX_QBER = 30;                 // physical upper bound

    const maxN = maxX;
    const maxQ = MAX_QBER;





    const xFor = (n) =>
      margin.left + (n / maxN) * innerW;

    const yFor = (q) =>
      margin.top + innerH - (q / maxQ) * innerH;



    const pathD = points
      .map((p, i) => {
        const x = xFor(p.step);
        const y = yFor(p.qber);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");


    return (
      <div className="chart-wrapper" role="group" aria-label="QBER (%)">
        <div className="chart-title-outside">
          QBER (%) vs Sifted Key Length
        </div>

        <div className="chart-card" style={{ padding: 8 }}>
          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            className="chart-svg"
            preserveAspectRatio="none"
          >


            {/* Grid lines + Y ticks */}
            {[0, 5, 10, 15, 20, 25, 30].map((v) => (
              <g key={v}>
                <line
                  x1={margin.left}
                  x2={margin.left + innerW}
                  y1={yFor(v)}
                  y2={yFor(v)}
                  className="chart-gridline"
                />
                <text
                  x={margin.left - 16}
                  y={yFor(v) + 6}
                  className="chart-tick-label"
                  textAnchor="end"
                >
                  {v}%
                </text>
              </g>
            ))}

            {/* Security Thresholds */}
            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={yFor(11)}
              y2={yFor(11)}
              stroke="#facc15"
              strokeDasharray="6 6"
              strokeWidth="2"
            />
            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={yFor(25)}
              y2={yFor(25)}
              stroke="#ef4444"
              strokeDasharray="6 6"
              strokeWidth="2"
            />

            {/* Axes */}
            <line
              x1={margin.left}
              x2={margin.left}
              y1={margin.top}
              y2={margin.top + innerH}
              className="chart-axis-main"
            />
            {/* X-axis ticks and labels */}
            {(() => {
              // Decide tick values
              let ticks = [];

              if (maxX <= 6) {
                // Small data → show every index INCLUDING 0
                ticks = Array.from({ length: maxX + 1 }, (_, i) => i);
              } else {
                // Larger data → show 0-based evenly spaced ticks
                const stepSize = Math.ceil(maxX / 5);
                ticks = [0, stepSize, stepSize * 2, stepSize * 3, maxX];
              }


              return ticks.map((step, i) => {
                const x = xFor(step); // ✅ DEFINE x HERE

                return (
                  <g key={i}>
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
                      {step}
                    </text>
                  </g>
                );
              });

            })()}

            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={margin.top + innerH}
              y2={margin.top + innerH}
              className="chart-axis-main"
            />

            {/* Axis labels */}
            <text
              x={margin.left - 70}
              y={margin.top + innerH / 2}
              transform={`rotate(-90 ${margin.left - 70} ${margin.top + innerH / 2})`}
              className="chart-axis-label"
            >
              QBER (%)
            </text>

            <text
              x={margin.left + innerW / 2}
              y={vbH - 12}
              className="chart-axis-label"
            >
              Sifted Key Index (bits) →

            </text>

            {/* QBER curve */}
            {points.length > 0 && (
              <path
                d={pathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            )}

            {/* Final QBER */}
            <text
              x={margin.left + innerW + 8}
              y={margin.top + 18}
              className="chart-tick-label"
            >
              {finalQBER}%
            </text>
          </svg>

        </div>

        <div className="qber-calculation-box">

          <div className="qber-formula">
            QBER = (Incorrect Bits ÷ Matched Bits) × 100
          </div>

          <div className="qber-values">
            <div>
              Incorrect Bits = <strong>{errors}</strong>
            </div>
            <div>
              Matched Bits = <strong>{matched}</strong>
            </div>
            <div className="qber-final">
              QBER = ({errors} ÷ {matched || 1}) × 100 ={" "}
              <strong>{finalQBER}%</strong>
            </div>
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "#ccc",
              textAlign: "center",
              maxWidth: "420px",
            }}
          >
            Partial eavesdropping introduces errors only in intercepted photons.
            As Eve’s interception probability increases, the QBER converges to a
            higher statistical value.
          </div>

        </div>

      </div>
    );
  }



  // ---------- Render ----------
  return (
    <>

      {(showSliderConfirm || showInstructions) && (
        <div className="modal-overlay">

          {showSliderConfirm && (
            <div className="slider-modal" role="dialog" aria-modal="true">
              <h3>This will reset all data</h3>

              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  className="exp-btn exp-btn-primary"
                  onClick={confirmApplyChanges}
                >
                  Apply
                </button>

                <button
                  className="exp-btn exp-btn-ghost"
                  onClick={cancelApplyChanges}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showInstructions && (
            <div className="instructions-modal" role="dialog" aria-modal="true">
              <h2>Instructions — Experiment 6</h2>
              <ol>
                <li>Eve is present conceptually but interception is frozen at 0%</li>
                <li>Adjust channel noise</li>
                <li>Apply settings</li>
                <li>Send photons</li>
                <li>Observe QBER increase due to noise only</li>
              </ol>

              <button
                className="exp-btn exp-btn-primary"
                onClick={() => setShowInstructions(false)}
              >
                Got it
              </button>
            </div>
          )}

        </div>
      )}
      <div className="lab-container vertical-layout">



        {/* --- Theory / Intro Box (always visible above the channel) --- */}

        <div className="experiment-theory-wrapper">
          <div
            className="experiment-theory-box"
            role="region"
            aria-label="Experiment 3 theory"
          >
            <div className="theory-top">
              <h2 className="theory-title">
                Channel Noise: Environmental Disturbance in BB84

                <br />

              </h2>

            </div>

            <div className="theory-body">
              <strong>Welcome to Experiment 6.</strong>

              <h4>1. What Experiment 6 Demonstrates</h4>
              <p>
                Experiment 6 answers a critical question in quantum cryptography:
                <strong> Do errors always mean an eavesdropper is present?</strong>
              </p>
              <p>
                The answer is <strong>NO</strong>.
              </p>
              <ul>
                <li>Eve is included in the model, but her interception probability is fixed at 0%, so all errors arise from channel noise only</li>
                <li>Errors still appear</li>
                <li>QBER becomes non-zero</li>
              </ul>
              <p>
                This experiment teaches students that not all errors imply an attack.
                Some errors arise naturally due to imperfections in the quantum channel.
                This distinction is essential for understanding real-world QKD systems.
              </p>

              <h4>2. What Channel Noise Means in BB84</h4>
              <p>
                Channel noise represents physical disturbances that affect photons while
                traveling from Alice to Bob.
              </p>
              <ul>
                <li>Environmental interference</li>
                <li>Fiber imperfections</li>
                <li>Polarization drift</li>
                <li>Detector inaccuracies</li>
                <li>Decoherence effects</li>
              </ul>
              <p>
                Importantly:
              </p>
              <ul>
                <li>Noise does <strong>not</strong> involve measurement</li>
                <li>Noise does <strong>not</strong> extract information</li>
                <li>Noise does <strong>not</strong> behave strategically</li>
                <li>Noise causes bit flips, not espionage</li>
              </ul>

              <h4>3. How Noise Affects Photon Transmission</h4>
              <p>
                When channel noise is present:
              </p>
              <ul>
                <li>Some photons change polarization unintentionally</li>
                <li>Bob measures the wrong bit even when using the correct basis</li>
                <li>Errors appear in the sifted key</li>
              </ul>
              <p>
                Unlike Eve:
              </p>
              <ul>
                <li>Noise does not choose a basis</li>
                <li>Noise does not resend photons</li>
                <li>Noise does not correlate errors with basis choice</li>
              </ul>
              <p>
                The disturbance introduced by noise is random and unbiased.
              </p>

              <h4>4. How QBER Behaves Under Channel Noise</h4>
              <p>
                As channel noise increases:
              </p>
              <ul>
                <li>Incorrect bits increase gradually</li>
                <li>QBER rises smoothly</li>
                <li>The QBER curve looks different from Eve-based attacks</li>
              </ul>
              <p>
                Key differences from eavesdropping:
              </p>
              <ul>
                <li>No sudden jump toward <strong>25%</strong></li>
                <li>Errors are spread evenly</li>
                <li>Basis match statistics remain unchanged</li>
              </ul>
              <p>
                This teaches students that <strong>QBER alone is not enough — its pattern matters</strong>.
              </p>

              <h4>5. Why This Experiment Is Necessary</h4>
              <p>
                Without this experiment, students often assume:
              </p>
              <p><em>“Any error = Eve”</em></p>
              <p>
                This assumption is incorrect and dangerous in real QKD deployment.
              </p>
              <ul>
                <li>How to interpret QBER correctly</li>
                <li>Why security thresholds exist</li>
                <li>Why protocols tolerate small QBER values</li>
                <li>Why BB84 does not abort immediately at low error rates</li>
              </ul>

              <h4>6. What Students Should Learn</h4>
              <ul>
                <li>Errors can occur without eavesdropping</li>
                <li>Noise produces random, unbiased errors</li>
                <li>Low QBER does not automatically imply an attack</li>
                <li>Security decisions require context, not panic</li>
                <li>Real systems must distinguish noise from espionage</li>
              </ul>

              <p className="theory-highlight">
                <strong>Key Insight:</strong>
                <br />
                Errors do not always mean Eve.
                Understanding the source of errors is essential for real quantum security.
              </p>
            </div>



            {/* ===== BB84 STEP-BY-STEP — EXPERIMENT 6 ===== */}
            <section
              className="bb84-onboarding"
              aria-label="Experiment 6 step-by-step explanation"
            >

              <details className="bb84-step" open>
                <summary>STEP 1 — Why Errors Can Occur Without Eve</summary>
                <p>
                  Photons are extremely fragile quantum objects.
                </p>
                <p>
                  Environmental disturbances can alter their states even when
                  no one is measuring them.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 2 — Noise vs Eavesdropping</summary>
                <p>
                  Eavesdropping involves <strong>measurement</strong> and
                  <strong> information gain</strong>.
                </p>
                <p>
                  Noise involves random physical disturbance
                  <strong> without information gain</strong>.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 3 — How Noise Appears in QBER</summary>
                <p>
                  Noise causes gradual and smooth increases in QBER.
                </p>
                <p>
                  There is no sharp or sudden signature like
                  intercept–resend attacks.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 4 — What to Watch in This Experiment</summary>
                <p>
                  As channel noise increases:
                </p>
                <ul>
                  <li>Incorrect bits rise</li>
                  <li>QBER increases steadily</li>
                  <li>Basis match statistics remain unchanged</li>
                </ul>
              </details>

              <details className="bb84-step">
                <summary>STEP 5 — Why BB84 Allows Some Errors</summary>
                <p>
                  Real quantum communication systems are imperfect.
                </p>
                <p>
                  BB84 is designed to tolerate small amounts of noise
                  while still remaining secure.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 6 — Core Takeaway</summary>
                <p>
                  Errors do <strong>not</strong> always mean Eve.
                </p>
                <p>
                  Understanding error sources is essential
                  for real quantum key distribution security.
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
                  min="16"
                  max="500"
                  value={sliderTempValue}
                  onChange={handlePhotonSliderChange}
                  className="exp-slider"
                />
                <span className="slider-value">{sliderTempValue}</span>
              </div>
            </div>


            {/* Eve Level (Frozen at 0%) */}
            <div className="control-row">
              <label>Eve Interception (%)</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={0}
                  className="exp-slider"
                  disabled
                />
                <span className="slider-value">0% (Frozen)</span>
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
                  title="Channel noise (%)"
                />
                <span className="slider-value">{tempChannelNoisePercent}%</span>
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
                  value={tempChannelDistanceKm}
                  onChange={handleDistanceChange}
                  className="exp-slider"
                  title="Approx. channel distance"
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

                  /* === EXPERIMENT 3: EVE ON === */
                  eveEnabled={true}
                  eveInterceptPercent={eveLevel}   // ← slider-controlled %
                  eveBasisMode="random"

                  channelNoisePercent={channelNoisePercent}
                  channelDistanceKm={channelDistanceKm}

                  onMeasured={handleMeasured}
                  registerControls={registerControls}

                  forceMatchBases={false}          // NEVER force in Exp 3
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
            <QBERvsNoise data={qberHistoryRef.current} />


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

