// src/Exp5BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment5.css"; // use a new css for exp2 (or point to Experiment1.css if you prefer)
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";
import "./KeyAnalysisPanel.css";

export default function Exp5BB84() {
  // Committed (current) state
  const [numPhotons, setNumPhotons] = useState(16);
  const AXIS_TICK_COUNT = 5;

  // For Experiment 2 default Eve is ON — but slider should NOT start at 100%.
  // Set a sensible interactive default (change this if you prefer another starting %).
  const DEFAULT_EVE_PERCENT = 20;

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
  const reportDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });


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
  <title>Experiment 5 Report — Photon Count & QBER</title>

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

<h1>LAR REPORT - EXPERIMENT 5</h1>
<h2>Effect of Photon Count on QBER in BB84</h2>

<h3>1. Aim</h3>
<p>
To study how the number of transmitted photons affects the stability and
reliability of the Quantum Bit Error Rate (QBER) in the BB84 protocol.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice (random bit and basis preparation)</li>
  <li>Eve module (fixed interception level)</li>
  <li>Quantum channel</li>
  <li>Bob (random basis measurement)</li>
  <li>Photon count control</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
In BB84, each photon transmission is governed by quantum probability.
Individual outcomes are random, but averages become meaningful over many trials.
</p>
<p>
The Quantum Bit Error Rate (QBER) is defined as:
</p>
<p><strong>QBER = (Incorrect bits in matched bases) / (Total matched bases)</strong></p>
<ul>
  <li>Small photon counts → large fluctuations</li>
  <li>Large photon counts → stable averages</li>
</ul>
<p>
This statistical convergence follows the law of large numbers.
</p>

<h3>4. Observations</h3>
<ul>
  <li>For small N, QBER fluctuates significantly</li>
  <li>Graphs appear noisy for low photon counts</li>
  <li>As N increases, QBER stabilizes</li>
  <li>Correct vs Incorrect bits scale proportionally with N</li>
  <li>Basis match ratio remains approximately 50%</li>
</ul>
<h3>4. Observations</h3>

<p>
Total Photons: ${reportStats.total}<br/>
Correct Measurements: ${reportStats.correct}<br/>
Incorrect Measurements: ${reportStats.incorrect}<br/>
QBER: ${reportStats.qber}%<br/>
Result:
<strong>
${stats.qberPercent < 11
        ? "SAFE (No Eavesdropping Detected)"
        : stats.qberPercent <= 25
          ? "EAVESDROPPING SUSPECTED"
          : "EAVESDROPPING CONFIRMED"}
</strong>
</p>
<h4>GRAPHS</h4>

<div class="graph-row">

  <!-- ================= GRAPH 1 ================= -->
  <div class="graph-container">
    <h4>Correct vs Incorrect</h4>
    <div class="graph-box">
      <svg viewBox="0 0 300 300" preserveAspectRatio="none">

        <!-- Y axis -->
        <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
        <polyline points="50,30 44,40 56,40" stroke="black" stroke-width="2" fill="none"/>

        <!-- X axis -->
        <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
        <polyline points="270,260 260,254 260,266" stroke="black" stroke-width="2" fill="none"/>

        <!-- Y ticks -->
        <text x="30" y="264">${yTicks[0]}</text>
        <text x="30" y="214">${yTicks[1]}</text>
        <text x="30" y="164">${yTicks[2]}</text>
        <text x="24" y="114">${yTicks[3]}</text>
        <text x="24" y="64">${yTicks[4]}</text>

        <!-- Y label -->
        <text x="14" y="260"
              transform="rotate(-90 14 260)"
              font-size="15"
              font-weight="bold">
          Count of Bits →
        </text>

        <!-- X label -->
        <text x="160" y="298"
              font-size="14"
              font-weight="bold"
              text-anchor="middle">
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

        <!-- Y axis -->
        <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
        <polyline points="50,30 44,40 56,40" stroke="black" stroke-width="2" fill="none"/>

        <!-- X axis -->
        <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
        <polyline points="270,260 260,254 260,266" stroke="black" stroke-width="2" fill="none"/>

        <!-- Y ticks -->
        <text x="30" y="264">${yTicks[0]}</text>
        <text x="30" y="214">${yTicks[1]}</text>
        <text x="30" y="164">${yTicks[2]}</text>
        <text x="24" y="114">${yTicks[3]}</text>
        <text x="24" y="64">${yTicks[4]}</text>

        <!-- Y label -->
        <text x="14" y="260"
              transform="rotate(-90 14 260)"
              font-size="15"
              font-weight="bold">
          Number of Photons →
        </text>

        <!-- X label -->
        <text x="160" y="298"
              font-size="14"
              font-weight="bold"
              text-anchor="middle">
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
  <h4>QBER (%) vs Photon Count (N)</h4>
  <div class="graph-box">
    <svg viewBox="0 0 300 300" preserveAspectRatio="none">

      <!-- Y axis -->
      <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
      <polyline points="50,30 44,40 56,40" stroke="black" stroke-width="2" fill="none"/>

      <!-- X axis -->
      <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
      <polyline points="270,260 260,254 260,266" stroke="black" stroke-width="2" fill="none"/>

      <!-- Y label -->
      <text x="14" y="260"
            transform="rotate(-90 14 260)"
            font-size="14"
            font-weight="bold">
        QBER (%) →
      </text>
      <!-- ===== X AXIS VALUES ===== -->
${xAxisValues.map(v => `
  <text
    x="${50 + (v / maxPhotonCount) * 220}"
    y="275"
    font-size="11"
    text-anchor="middle">
    ${v}
  </text>
`).join("")}
  <!-- ===== Y AXIS VALUES ===== -->
${yAxisValues.map(v => `
  <text
    x="18"
    y="${260 - (v / qberYMax) * 230}"
    font-size="11">
    ${Math.round(v)}%
  </text>
`).join("")}
     

      <!-- ===== SECURITY THRESHOLDS (LIVE) ===== -->

<line
  x1="50"
  x2="270"
  y1="${260 - (11 / qberYMax) * 230}"
  y2="${260 - (11 / qberYMax) * 230}"
  stroke="#000000"
  stroke-dasharray="4 4"
  stroke-width="1.4"
/>

<text
  x="275"
  y="${260 - (11 / qberYMax) * 230 + 4}"
  font-size="10"
  fill="#000000"
>
  
</text>
<line
  x1="50"
  x2="270"
  y1="${260 - (25 / qberYMax) * 230}"
  y2="${260 - (25 / qberYMax) * 230}"
  stroke="#000000"
  stroke-dasharray="4 4"
  stroke-width="1.4"
/>

<text
  x="275"
  y="${260 - (25 / qberYMax) * 230 + 4}"
  font-size="10"
  fill="#000000"
>
  
</text>
      

      <!-- QBER DATA POINTS -->
      ${qberPointsSVG.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="black"/>
        <text x="${p.x}" y="${p.y - 8}" font-size="11" text-anchor="middle">
          ${p.qber}%
        </text>
      `).join("")}

      <!-- X label -->
      <text x="160" y="298"
            font-size="14"
            font-weight="bold"
            text-anchor="middle">
        Photon Count (N) →
      </text>

    </svg>
  </div>
</div>
  </div>

</div>
<h3>Key Analysis & Security Verification</h3>

<h4>1. Sifted Key Length</h4>
<p>
The sifted key consists of all bits for which Alice’s encoding basis matches
Bob’s measurement basis and successful detection occurs.
</p>

<p><b>Formula:</b></p>
<p>
n<sub>sifted</sub> = | { bits where basis match AND detection occurs } |
</p>

<p><b>Calculation:</b></p>
<p>
n<sub>sifted</sub> = ${stats.matchedMeasured} bits
</p>

<hr/>

<h4>2. Quantum Bit Error Rate (QBER)</h4>
<p>
QBER represents the fraction of erroneous bits in the sifted key and indicates
the presence of noise or eavesdropping in the quantum channel.
</p>

<p><b>Formula:</b></p>
<p>
QBER = ( Number of erroneous bits ) / ( Total number of bits compared )
</p>

<p><b>Calculation:</b></p>
<p>
QBER = (${stats.incorrectBits} / ${stats.matchedMeasured || 1}) = ${stats.qberPercent}%
</p>

<hr/>

<h4>3. Security Thresholds</h4>
<ul>
  <li>QBER &lt; 11% → <b>SAFE</b></li>
  <li>11% ≤ QBER ≤ 25% → <b>BEWARE</b></li>
  <li>QBER &gt; 25% → <b>DANGER</b> (Abort Key)</li>
</ul>

<p>
<b>Current Status:</b>
${stats.qberPercent < 11 ? "SAFE" : stats.qberPercent <= 25 ? "BEWARE" : "DANGER"}
</p>

<hr/>

<h4>Analysis Results</h4>

<table border="1" cellspacing="0" cellpadding="8" width="100%">
  <tr>
    <th align="left">Metric</th>
    <th align="left">Value</th>
    <th align="left">Description</th>
  </tr>

  <tr>
    <td>Total Transmissions</td>
    <td>${stats.totalPlanned}</td>
    <td>Raw photons sent by Alice</td>
  </tr>

  <tr>
    <td>Sifted Key Length</td>
    <td>${stats.matchedMeasured}</td>
    <td>Bits where bases matched and detection occurred</td>
  </tr>

  <tr>
    <td>Detected Errors</td>
    <td>${stats.incorrectBits}</td>
    <td>Mismatched bits in the sifted key</td>
  </tr>

  <tr>
    <td>QBER</td>
    <td>${stats.qberPercent}%</td>
    <td>Quantum Bit Error Rate</td>
  </tr>

  <tr>
    <td>Abort Threshold</td>
    <td>11%</td>
    <td>Maximum acceptable QBER</td>
  </tr>

  <tr>
    <td>Security Status</td>
    <td>
      ${stats.qberPercent < 11 ? "SAFE" : stats.qberPercent <= 25 ? "BEWARE" : "DANGER"}
    </td>
    <td>Channel security decision</td>
  </tr>
</table>


<h3>5. Conclusion</h3>
<p>
This experiment demonstrates that BB84 security analysis depends on
statistical confidence.
Reliable conclusions require sufficiently large photon samples.
Small datasets can be misleading, while large photon counts produce
trustworthy security metrics.
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
      `Channel updated: Eve=${eveLevel}%, Noise=${channelNoisePercent}%, Distance=${channelDistanceKm}km`
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
    // wait until ALL photons are measured
    if (
      sentTransmissions.length === numPhotons &&
      !runCompletedRef.current
    ) {
      qberHistoryRef.current.push({
        N: numPhotons,
        qber: stats.qberPercent,
      });

      runCompletedRef.current = true;
      forceUpdate(v => v + 1); // force graph redraw
    }
  }, [sentTransmissions.length, numPhotons, stats.qberPercent]);
  // ===== Report-only aggregated stats (SAFE: stats already exists) =====
  const reportStats = {
    total: stats.totalPlanned,
    correct: stats.correctBits,
    incorrect: stats.incorrectBits,
    match: stats.matchedMeasured,
    mismatch: stats.mismatchedMeasured,
    qber: stats.qberPercent,
  };
  const qberData = qberHistoryRef.current;
  const safeQberData = qberData.length > 0 ? qberData : [];
  const maxPhotonCount =
    safeQberData.length > 0
      ? Math.max(...safeQberData.map(d => d.N))
      : 1;

  const xAxisValues = Array.from(
    { length: AXIS_TICK_COUNT + 1 },
    (_, i) => Math.round((i / AXIS_TICK_COUNT) * maxPhotonCount)
  );
  // ===== QBER DATA (MATCH LIVE GRAPH) =====


  // Safety: if no completed runs yet

  const Y_TICK_COUNT = 5;
  const X_TICK_COUNT = 5;
  // ===== SVG GEOMETRY (MATCH LIVE GRAPH STYLE) =====
  const X_MIN = 50;
  const X_MAX = 270;
  const Y_MIN = 260;
  const Y_MAX = 30;

  const maxN =
    safeQberData.length > 0
      ? Math.max(...safeQberData.map(d => d.N))
      : 1;

  const MAX_QBER = 30; // fixed (same as live graph)

  // Convert data to SVG points
  const qberPointsSVG = safeQberData.map(d => {
    const x = X_MIN + (d.N / maxN) * (X_MAX - X_MIN);
    const y = Y_MIN - (d.qber / MAX_QBER) * (Y_MIN - Y_MAX);
    return { x, y, qber: d.qber };
  });

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

  const qberSeries = (() => {
    let matched = 0;
    let errors = 0;
    const series = [];

    sentTransmissions.forEach(t => {
      if (t.match && t.bMeas !== null) {
        matched++;
        if (t.aBit !== t.bMeas) errors++;

        series.push({
          step: matched,
          qber: matched === 0 ? 0 : (errors / matched) * 100
        });
      }
    });

    return series;
  })();
  const maxObservedQBER =
    qberSeries.length === 0
      ? 1
      : Math.max(...qberSeries.map(p => p.qber));
  const QBER_ABORT = 11;
  const QBER_THEORETICAL = 25;
  const qberYMax = Math.ceil(
    Math.max(maxObservedQBER, QBER_ABORT, QBER_THEORETICAL)
  );
  const yAxisValues = Array.from(
    { length: AXIS_TICK_COUNT + 1 },
    (_, i) => (i / AXIS_TICK_COUNT) * qberYMax


  );
  const qberPolyline = (() => {
    if (qberSeries.length === 0) return "";

    return qberSeries.map(p => {
      const x =
        50 + (p.step / reportStats.total) * 220;

      const y =
        260 - (p.qber / qberYMax) * 230;

      return `${x},${y}`;
    }).join(" ");
  })();

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
  function QBERvsPhotonCount({ data }) {
    /* === MATCH ScientificBar EXACTLY === */
    const vbW = 700;
    const vbH = 400;
    const margin = { top: 50, right: 60, bottom: 70, left: 120 };

    const innerW = vbW - margin.left - margin.right;
    const innerH = vbH - margin.top - margin.bottom;

    /* === Domains === */
    const maxN =
      data && data.length > 0
        ? Math.max(1, ...data.map(d => d.N))
        : 100;

    const maxQ = 30; // 25% theoretical + margin

    /* === Scales === */
    const xFor = (n) =>
      margin.left + (n / maxN) * innerW;

    const yFor = (q) =>
      margin.top + innerH - (q / maxQ) * innerH;

    return (
      <div className="chart-wrapper">
        <div className="chart-title-outside">
          QBER (%) vs Photon Count (N)
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
            {/* Y ARROW */}
            <polyline
              points={`${margin.left},${margin.top}
           ${margin.left - 12},${margin.top + 18}
           ${margin.left + 12},${margin.top + 18}`}
              stroke="#fff"
              strokeWidth="2"
              fill="none"
            />

            {/* ===== X AXIS ===== */}
            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={margin.top + innerH}
              y2={margin.top + innerH}
              className="chart-axis-main"
            />
            {/* X ARROW */}
            <polyline
              points={`${margin.left + innerW},${margin.top + innerH}
           ${margin.left + innerW - 16},${margin.top + innerH - 12}
           ${margin.left + innerW - 16},${margin.top + innerH + 12}`}
              stroke="#fff"
              strokeWidth="2"
              fill="none"
            />
            {(() => {
              const TICK_COUNT = 5; // ← adjust to 6 or 7 if you want
              const step = Math.ceil(maxN / TICK_COUNT);

              const ticks = [];
              for (let v = 0; v <= maxN; v += step) {
                ticks.push(v);
              }

              // ensure maxN is always shown
              if (ticks[ticks.length - 1] !== maxN) {
                ticks.push(maxN);
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
              Photon Count (N) →
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
              const x = xFor(d.N);
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
              <h2>Instructions — Experiment 3</h2>

              <ol className="instructions-list">
                <li>
                  Select the number of photons (N) using the photon slider.
                </li>
                <li>
                  Keep Eve interception, noise, and distance fixed to isolate statistical effects.
                </li>
                <li>
                  Click <strong>Apply Settings</strong> to initialize the experiment.
                </li>
                <li>
                  Send all photons to complete one full transmission run.
                </li>
                <li>
                  Observe the QBER value after the run is completed.
                </li>
                <li>
                  Increase the photon count and repeat the experiment.
                </li>
                <li>
                  Notice that QBER fluctuates for small N but stabilizes as N increases.
                </li>
                <li>
                  Observe the <strong>QBER vs Photon Count</strong> graph to see convergence.
                </li>
                <li>
                  Interpret the result: larger photon counts give more reliable security estimates.
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
            aria-label="Experiment 3 theory"
          >
            <div className="theory-top">
              <h2 className="theory-title">
                Effect of Photon Count on QBER in BB84

                <br />

              </h2>

            </div>

            <div className="theory-body">
              <strong>Welcome to Experiment 5.</strong>

              <p>
                This experiment explains why the <strong>number of photons</strong> matters
                in the BB84 protocol. In earlier experiments, you may have noticed that QBER
                sometimes fluctuates and results are not perfectly stable for small photon
                counts.
              </p>

              <p>
                This experiment shows that BB84 is <strong>statistical in nature</strong>.
                Security conclusions become reliable only when enough photons are exchanged.
                No new physical effect is introduced here — only statistical confidence.
              </p>

              <h4>What Changes Compared to Previous Experiments</h4>
              <p>
                In this experiment, the physics is kept constant:
              </p>
              <ul>
                <li>Eve’s interception behavior is fixed</li>
                <li>Channel noise is fixed or turned off</li>
                <li>Distance remains unchanged</li>
                <li>
                  The <strong>only major variable</strong> is the number of photons (N)
                </li>
              </ul>

              <p>
                The experiment is repeated with:
              </p>
              <ul>
                <li>Small N (10–20 photons)</li>
                <li>Medium N (50–100 photons)</li>
                <li>Large N (200–500 photons)</li>
              </ul>

              <h4>Why QBER Fluctuates for Small Photon Counts</h4>
              <p>
                Each photon transmission is a random quantum event:
              </p>
              <ul>
                <li>Alice’s basis is random</li>
                <li>Bob’s basis is random</li>
                <li>Eve’s basis (if present) is random</li>
                <li>Measurement outcomes are probabilistic</li>
              </ul>

              <p>
                With a small number of photons, randomness dominates. A few unlucky
                measurements can skew the results, causing QBER to appear higher or lower
                than expected. This does <strong>not</strong> mean the protocol is broken —
                it means there is not yet enough data to trust the average.
              </p>

              <h4>How Large Photon Counts Stabilize QBER</h4>
              <p>
                As the number of photons increases:
              </p>
              <ul>
                <li>Random fluctuations average out</li>
                <li>Measured QBER converges toward the theoretical value</li>
                <li>Graphs become smoother and more predictable</li>
              </ul>

              <p>
                This behavior follows the <strong>law of large numbers</strong>.
              </p>

              <p>
                Example:
              </p>
              <ul>
                <li>Expected QBER from Eve = 10%</li>
                <li>At N = 20 → measured QBER may be 6% or 14%</li>
                <li>At N = 500 → measured QBER stabilizes near 10%</li>
              </ul>

              <h4>What Students Should Learn</h4>
              <ul>
                <li>QBER is an average, not a fixed constant</li>
                <li>Small datasets produce unreliable security estimates</li>
                <li>Large photon counts give trustworthy conclusions</li>
                <li>BB84 accept/abort decisions rely on statistics</li>
                <li>Real QKD systems must exchange many photons before trusting a key</li>
              </ul>

              <p className="theory-highlight">
                <strong>Key Insight:</strong>
                <br />
                BB84 security is statistical. Confidence emerges from repetition, not from
                single photon events.
              </p>

              <p className="theory-footer">
                This experiment builds statistical maturity and prevents misinterpretation
                of results from earlier experiments.
              </p>
            </div>


            {/* ===== BB84 STEP-BY-STEP — EXPERIMENT 5 ===== */}
            <section
              className="bb84-onboarding"
              aria-label="Experiment 5 step-by-step explanation"
            >
              <details className="bb84-step" open>
                <summary>STEP 1 — Why One Photon Is Not Enough</summary>
                <p>
                  A single photon carries quantum information, but its behavior is random.
                </p>
                <p>
                  One measurement result tells you nothing about overall security.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 2 — What QBER Really Measures</summary>
                <p>
                  QBER is an <strong>average</strong> calculated over many photon
                  transmissions.
                </p>
                <p>
                  It only becomes meaningful when enough measurements are collected.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 3 — Small Samples vs Large Samples</summary>
                <p>
                  With a small number of photons:
                </p>
                <ul>
                  <li>Randomness dominates</li>
                  <li>Results fluctuate strongly</li>
                </ul>
                <p>
                  With a large number of photons:
                </p>
                <ul>
                  <li>Statistical patterns emerge</li>
                  <li>Theoretical predictions become visible</li>
                </ul>
              </details>

              <details className="bb84-step">
                <summary>STEP 4 — What to Watch in This Experiment</summary>
                <p>
                  As you increase the photon count:
                </p>
                <ul>
                  <li>QBER stabilizes</li>
                  <li>Graphs become smoother</li>
                  <li>Confidence in results increases</li>
                </ul>
              </details>

              <details className="bb84-step">
                <summary>STEP 5 — Why This Matters in Real QKD</summary>
                <p>
                  Real quantum key distribution systems exchange <strong>millions of photons</strong>
                  before trusting a key.
                </p>
                <p>
                  This experiment explains why large datasets are essential for security.
                </p>
              </details>

              <details className="bb84-step">
                <summary>STEP 6 — Core Takeaway</summary>
                <p>
                  BB84 security is <strong>statistical</strong>.
                </p>
                <p>
                  Trust emerges from repetition, not from single events.
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
                  max="30"
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
                  value={0}
                  className="exp-slider"
                  disabled
                />
                <span className="slider-value">0 km (Fixed)</span>

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
            <QBERvsPhotonCount data={qberHistoryRef.current} />


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

