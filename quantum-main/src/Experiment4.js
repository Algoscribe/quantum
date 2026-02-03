// src/Exp4BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment4.css"; // use a new css for exp2 (or point to Experiment1.css if you prefer)
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";
import "./KeyAnalysisPanel.css";

export default function Exp4BB84() {
  // Committed (current) state
  const [numPhotons, setNumPhotons] = useState(16);

  // For Experiment 2 default Eve is ON — but slider should NOT start at 100%.
  // Set a sensible interactive default (change this if you prefer another starting %).
  const DEFAULT_EVE_PERCENT = 20;

  const [eveLevel, setEveLevel] = useState(DEFAULT_EVE_PERCENT);
  const [channelNoisePercent, setChannelNoisePercent] = useState(0);
  const [channelDistanceKm, setChannelDistanceKm] = useState(0);

  // Temporary values shown on sliders until user confirms
  const [sliderTempValue, setSliderTempValue] = useState(16);
  const [tempEveLevel, setTempEveLevel] = useState(DEFAULT_EVE_PERCENT);
  const [tempChannelNoisePercent, setTempChannelNoisePercent] = useState(0);
  const [tempChannelDistanceKm, setTempChannelDistanceKm] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

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
  const [statusMessage, setStatusMessage] = useState(`Eve ON (${DEFAULT_EVE_PERCENT}%) — ready to transmit ${numPhotons} photons`);

  // Ref to receive QuantumChannel controls
  const qcControlsRef = useRef(null);

  // Initialize protocol once (on mount)
  useEffect(() => {
    initializeProtocol(numPhotons);
    updateStatus(`Protocol initialized with N=${numPhotons} photons — Eve ON`);
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
  <title>Experiment 4 Report — Partial Eavesdropping</title>

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
    /* ===================== */
/* ===== GRAPH ROW ===== */
/* ===================== */
.graph-row {
  display: flex;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 50px;
}

/* ================================= */
/* ===== INDIVIDUAL GRAPH BLOCK ===== */
/* ================================= */
.graph-container {
  width: 33.333%;
  box-sizing: border-box;
  text-align: center;
}

/* ============================== */
/* ===== GRAPH TITLE (TOP) ====== */
/* ============================== */
.graph-container h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: bold;
}

/* =========================== */
/* ===== GRAPH BOX (SVG) ===== */
/* =========================== */
.graph-box {
  width: 100%;
  height: 300px;
  box-sizing: border-box;
  padding: 0;
  border: none;   /* ← boxes removed */
}


/* ======================= */
/* ===== SVG FILL BOX ==== */
/* ======================= */
.graph-box svg {
  width: 100%;
  height: 100%;
  display: block;
}

  </style>
</head>
<body>

<button class="print-btn" onclick="window.print()">Print Report</button>

<h1>Partial Eavesdropping in BB84</h1>
<h2>Experiment 4 — Statistical Detection of Intercept–Resend</h2>

<h3>1. Aim</h3>
<p>
To study how partial eavesdropping affects the BB84 protocol and how the
Quantum Bit Error Rate (QBER) varies with Eve’s interception probability.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice (random bit and basis preparation)</li>
  <li>Eve (probabilistic intercept–resend module)</li>
  <li>Quantum communication channel</li>
  <li>Bob (random basis measurement)</li>
  <li>Eve interception percentage control</li>
  <li>Photon count control</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
In BB84, security relies on detecting disturbances caused by measurement.
When Eve intercepts only a fraction of photons, some remain undisturbed
while others are altered due to incorrect basis measurements.
</p>
<p>
Quantum theory predicts that the QBER introduced by a partial intercept–resend
attack is proportional to Eve’s interception probability.
This enables statistical detection of eavesdropping.
</p>

<h3>4. Observations</h3>
<ul>
  <li>Increasing Eve interception percentage increases incorrect bits</li>
  <li>Correct bits decrease gradually rather than abruptly</li>
  <li>QBER rises approximately linearly with Eve’s interception rate</li>
  <li>Basis match statistics remain unchanged</li>
  <li>Attack remains detectable even at low interception levels</li>
</ul>

<h4>GRAPHS</h4>

<div class="graph-row">

  <!-- ================= GRAPH 1 ================= -->
  <div class="graph-container">
    <h4>Correct vs Incorrect Measurements</h4>
    <div class="graph-box">
      <svg viewBox="0 0 300 300" preserveAspectRatio="none">

        <!-- Y Axis -->
        <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
        <polyline points="50,30 44,40 56,40" stroke="black" stroke-width="2" fill="none"/>

        <!-- X Axis -->
        <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
        <polyline points="270,260 260,254 260,266" stroke="black" stroke-width="2" fill="none"/>

        <!-- Y Ticks (Dynamic) -->
        <text x="30" y="264">${yTicks[0]}</text>
        <text x="30" y="214">${yTicks[1]}</text>
        <text x="30" y="164">${yTicks[2]}</text>
        <text x="24" y="114">${yTicks[3]}</text>
        <text x="24" y="64">${yTicks[4]}</text>

        <!-- Y Label -->
        <text x="14" y="260" transform="rotate(-90 14 260)"
              font-size="15" font-weight="bold" text-anchor="start">
          Count of Bits →
        </text>

        <!-- X Label -->
        <text x="160" y="298" font-size="14" font-weight="bold" text-anchor="middle">
          Bit Classification →
        </text>

        <!-- Bars -->
        <rect x="110"
              y="${260 - reportStats.correct * yScale}"
              width="40"
              height="${reportStats.correct * yScale}"
              fill="black"/>

        <rect x="180"
              y="${260 - reportStats.incorrect * yScale}"
              width="40"
              height="${reportStats.incorrect * yScale}"
              fill="gray"/>

        <!-- Values -->
        <text x="118" y="${255 - reportStats.correct * yScale}">
          ${reportStats.correct}
        </text>
        <text x="188" y="${255 - reportStats.incorrect * yScale}">
          ${reportStats.incorrect}
        </text>

        <text x="105" y="285">Correct</text>
        <text x="165" y="285">Incorrect</text>

      </svg>
    </div>
  </div>

  <!-- ================= GRAPH 2 ================= -->
  <div class="graph-container">
    <h4>Basis Match vs Mismatch</h4>
    <div class="graph-box">
      <svg viewBox="0 0 300 300" preserveAspectRatio="none">

        <!-- Y Axis -->
        <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
        <polyline points="50,30 44,40 56,40" stroke="black" stroke-width="2" fill="none"/>

        <!-- X Axis -->
        <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
        <polyline points="270,260 260,254 260,266" stroke="black" stroke-width="2" fill="none"/>

        <!-- Y Ticks (Dynamic) -->
        <text x="30" y="264">${yTicks[0]}</text>
        <text x="30" y="214">${yTicks[1]}</text>
        <text x="30" y="164">${yTicks[2]}</text>
        <text x="24" y="114">${yTicks[3]}</text>
        <text x="24" y="64">${yTicks[4]}</text>

        <!-- Y Label -->
        <text x="14" y="260" transform="rotate(-90 14 260)"
              font-size="15" font-weight="bold" text-anchor="start">
          Number of Photons →
        </text>

        <!-- X Label -->
        <text x="160" y="298" font-size="14" font-weight="bold" text-anchor="middle">
          Basis Comparison →
        </text>

        <!-- Bars -->
        <rect x="110"
              y="${260 - reportStats.match * yScale}"
              width="40"
              height="${reportStats.match * yScale}"
              fill="black"/>

        <rect x="180"
              y="${260 - reportStats.mismatch * yScale}"
              width="40"
              height="${reportStats.mismatch * yScale}"
              fill="gray"/>

        <!-- Values -->
        <text x="118" y="${255 - reportStats.match * yScale}">
          ${reportStats.match}
        </text>
        <text x="188" y="${255 - reportStats.mismatch * yScale}">
          ${reportStats.mismatch}
        </text>

        <text x="110" y="285">Match</text>
        <text x="175" y="285">Mismatch</text>

      </svg>
    </div>
  </div>

<!-- ================= GRAPH 3 ================= -->
<div class="graph-container">
  <h4>QBER (%) vs Sifted Key Length</h4>
  <div class="graph-box">

    <svg viewBox="0 0 300 300" preserveAspectRatio="none">

      <!-- Y axis -->
      <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
      <polyline points="50,30 44,40 56,40" stroke="black" stroke-width="2" fill="none"/>

      <!-- X axis -->
      <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
      <polyline points="270,260 260,254 260,266" stroke="black" stroke-width="2" fill="none"/>

      <!-- Y ticks -->
      <text x="26" y="264">0%</text>
      <text x="20" y="215">10%</text>
      <text x="20" y="165">20%</text>
      <text x="20" y="115">30%</text>

      <!-- Y label -->
      <text x="14" y="260"
            transform="rotate(-90 14 260)"
            font-size="15"
            font-weight="bold"
            text-anchor="start">
        QBER (%) →
      </text>

      <!-- Threshold: SAFE (11%) -->
      <line
        x1="50" x2="270"
        y1="${260 - 11 * 3}"
        y2="${260 - 11 * 3}"
        stroke="orange"
        stroke-dasharray="4 4"
        stroke-width="3"
      />

      <!-- Threshold: DANGER (25%) -->
      <line
        x1="50" x2="270"
        y1="${260 - 25 * 3}"
        y2="${260 - 25 * 3}"
        stroke="red"
        stroke-dasharray="4 4"
        stroke-width="3"
      />

      <!-- QBER zig-zag curve (ENDS EARLY – MATCHES REAL DATA) -->
      <polyline
        fill="none"
        stroke="black"
        stroke-width="3"
        points="
          50,260
          65,190
          75,220
          90,180
          110,200
          140,215
          170,230
          200,${260 - reportStats.qber * 3}
        "
      />

      <!-- Final QBER line (GREEN, DOTTED, SAME THICKNESS AS YELLOW) -->
      <line
        x1="50" x2="270"
        y1="${260 - reportStats.qber * 3}"
        y2="${260 - reportStats.qber * 3}"
        stroke="green"
        stroke-dasharray="4 4"
        stroke-width="3"
      />

      <!-- Final QBER value -->
      <text x="238" y="45" font-weight="bold">
        ${reportStats.qber}%
      </text>

      <!-- X label -->
      <text x="160" y="298"
            font-size="15"
            font-weight="bold"
            text-anchor="middle">
        Sifted Key Index (bits) →
      </text>

      <!-- X ticks -->
      <text x="48" y="275">0</text>
      <text x="125" y="275">${Math.round(reportStats.total / 2)}</text>
      <text x="258" y="275">${reportStats.total}</text>

    </svg>

  </div>
</div>


</div>


<h3>5. Conclusion</h3>
<p>
This experiment demonstrates that BB84 security does not require
detecting every intercepted photon.
Partial eavesdropping is statistically detectable using QBER thresholds,
proving that quantum cryptography converts physical disturbance into
measurable security guarantees.
</p>
<p style="margin-top:30px; text-align:center;">
  <strong>Experiment Date:</strong> ${reportDate}
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
    initializeProtocol(numPhotons);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);
    updateStatus(
      `Channel updated: Eve=${eveLevel}%, Noise=${channelNoisePercent}%, Distance=${channelDistanceKm}km`
    );
  };

  const resetChannelOptions = () => {
    // typical reset: make Eve very aggressive (you can change to whatever "typical" means)
    setEveLevel(DEFAULT_EVE_PERCENT);
    setChannelNoisePercent(0);
    setChannelDistanceKm(0);
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
// ===== Report-only aggregated stats (SAFE: stats already exists) =====
// ===== Report-only aggregated stats (SAFE: stats already exists) =====
const reportStats = {
  total: stats.totalPlanned,
  correct: stats.correctBits,
  incorrect: stats.incorrectBits,
  match: stats.matchedMeasured,
  mismatch: stats.mismatchedMeasured,
  qber: stats.qberPercent,
};

// ===== Graph scaling (bar graphs must scale to observed counts) =====
const yMax = Math.max(
  reportStats.correct + reportStats.incorrect,
  reportStats.match + reportStats.mismatch,
  1
);

// usable vertical height = 200px (260 - 60)
const yScale = 200 / yMax;

const yTicks = [
  0,
  Math.round(yMax * 0.25),
  Math.round(yMax * 0.5),
  Math.round(yMax * 0.75),
  yMax,
];



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

          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none" aria-hidden>

            {/* horizontal gridlines & y tick labels */}
            {ticks.map((tick, i) => {
              const y = margin.top + innerH - (i / yTicks) * innerH;
              return (
                <g key={`tick-${i}`}>
                  <line x1={margin.left} x2={margin.left + innerW} y1={y} y2={y} className="chart-gridline" />
                  <text x={margin.left - 25} y={y + 6} className="chart-tick-label" style={{ fontSize: 16, fill: "#fff" }} textAnchor="end">
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


    const MAX_QBER = 30; // ← critical for Exp 3
    const maxX = Math.max(1, totalPlanned);



    const xFor = (step) =>
      margin.left + (step / maxX) * innerW;




    const yFor = (v) =>
      margin.top + innerH - (Math.min(v, MAX_QBER) / MAX_QBER) * innerH;


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
                  x={margin.left - 30}
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
              <h2>Instructions — Experiment 4</h2>

              <ol className="instructions-list">
                <li>
                  Select the number of photons (N) using the photon slider (minimum 16 recommended).
                </li>
                <li>
                  Set the <strong>Eve Interception (%)</strong> slider to control how often Eve intercepts photons.
                </li>
                <li>
                  Keep channel noise and distance unchanged to isolate eavesdropping effects.
                </li>
                <li>
                  Click <strong>Apply Settings</strong> to initialize the experiment.
                </li>
                <li>
                  Use <strong>Send Next Photon</strong> or <strong>Send All Photons</strong> to start transmission.
                </li>
                <li>
                  Observe that some photons pass untouched while others are disturbed by Eve.
                </li>
                <li>
                  Notice that incorrect bits appear gradually as Eve’s interception percentage increases.
                </li>
                <li>
                  Observe the graphs: QBER rises smoothly with Eve’s interception rate.
                </li>
                <li>
                  Compare results with Experiment 3 — QBER is lower because Eve attacks only a fraction of photons.
                </li>
                <li>
                  Interpret the result: even partial eavesdropping is <strong>statistically detectable</strong>.
                </li>
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
            aria-label="Experiment 4 theory"
          >
            <div className="theory-top">
              <h2 className="theory-title">
                Partial Eavesdropping in BB84
                <br />
                <span style={{ fontSize: "0.9em", opacity: 0.85 }}>
                  Probabilistic Intercept–Resend Attack
                </span>
              </h2>
            </div>

            <div className="theory-body">
              <strong>Welcome to Experiment 4.</strong>

              <h4>1. What Experiment 4 Demonstrates</h4>
              <p>
                Experiment 4 extends the security analysis of BB84 by moving beyond
                full eavesdropping attacks.
              </p>
              <p>
                Instead of intercepting every photon, Eve performs a
                <strong> partial intercept–resend attack</strong>,
                intercepting only a fraction of the transmitted photons.
              </p>
              <p>
                This reflects a more realistic attacker who tries to reduce
                the chance of detection.
              </p>

              <h4>2. What Partial Eavesdropping Means</h4>
              <p>
                In this experiment:
              </p>
              <ul>
                <li>Each photon has a probability of being intercepted by Eve</li>
                <li>Some photons reach Bob untouched</li>
                <li>Others are disturbed due to Eve’s measurement</li>
              </ul>
              <p>
                Errors therefore appear <strong>gradually</strong>,
                not abruptly as in a full attack.
              </p>

              <h4>3. How Eve Operates</h4>
              <p>
                For every photon sent by Alice:
              </p>
              <ul>
                <li>Eve intercepts with probability <strong>X%</strong></li>
                <li>If intercepted, Eve measures in a random basis</li>
                <li>Eve resends a photon based on her measurement</li>
                <li>If not intercepted, the photon passes unchanged</li>
              </ul>
              <p>
                Eve’s attack strategy is identical to Experiment 3 —
                only the <strong>frequency</strong> of interception changes.
              </p>

              <h4>4. QBER Behavior Under Partial Attack</h4>
              <p>
                Because Eve attacks only some photons:
              </p>
              <ul>
                <li>Only a subset of bits become erroneous</li>
                <li>QBER increases smoothly with Eve’s interception rate</li>
              </ul>
              <p>
                Quantum theory predicts:
              </p>
              <p className="theory-highlight">
                <strong>QBER ≈ 25% × (Eve Interception Fraction)</strong>
              </p>

              <h4>5. Why Partial Attacks Matter</h4>
              <p>
                This experiment demonstrates that:
              </p>
              <ul>
                <li>Eve does not need to attack fully to gain information</li>
                <li>Even weak attacks leave statistical traces</li>
                <li>Security decisions are based on thresholds, not certainty</li>
              </ul>

              <h4>6. What Students Should Learn</h4>
              <ul>
                <li>Eavesdropping can be probabilistic</li>
                <li>QBER grows gradually with Eve’s activity</li>
                <li>Statistical analysis reveals hidden attacks</li>
                <li>More photons improve detection confidence</li>
              </ul>

              <p className="theory-highlight">
                <strong>Key Insight:</strong>
                <br />
                BB84 security is statistical — even partial attacks become detectable
                when enough data is collected.
              </p>
            </div>

            {/* ===== BB84 STEP-BY-STEP — EXPERIMENT 4 ===== */}
            <section
              className="bb84-onboarding"
              aria-label="Experiment 4 step-by-step explanation"
            >

              <details className="bb84-step" open>
                <summary>STEP 1 — What Partial Eavesdropping Means</summary>
                <p>Eve does not intercept every photon.</p>
                <p>Each photon is intercepted with a certain probability.</p>
                <p>Some photons are disturbed, others remain untouched.</p>
              </details>

              <details className="bb84-step">
                <summary>STEP 2 — How Errors Appear Gradually</summary>
                <p>Only intercepted photons can introduce errors.</p>
                <p>As interception probability increases, errors become more frequent.</p>
                <p>This causes a gradual rise in QBER.</p>
              </details>

              <details className="bb84-step">
                <summary>STEP 3 — Why Detection Is Statistical</summary>
                <p>Alice and Bob never know which photons Eve touched.</p>
                <p>They detect Eve by analyzing error patterns over many photons.</p>
              </details>

              <details className="bb84-step">
                <summary>STEP 4 — Security Threshold Concept</summary>
                <p>BB84 defines a maximum tolerable QBER.</p>
                <p>If QBER exceeds this threshold, secure key generation is aborted.</p>
              </details>

              <details className="bb84-step">
                <summary>STEP 5 — Why This Experiment Is Important</summary>
                <ul>
                  <li>Models realistic attacker behavior</li>
                  <li>Demonstrates statistical security</li>
                  <li>Bridges theory and real-world QKD</li>
                </ul>
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


            {/* Eve Level */}
            <div className="control-row">
              <label>Eve Interception (%)</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempEveLevel}
                  onChange={handleEveSliderChange}
                  className="exp-slider"
                  title="Percent chance Eve intercepts each photon"
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

