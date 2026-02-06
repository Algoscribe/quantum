// src/Exp3BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment3.css"; // use a new css for exp2 (or point to Experiment1.css if you prefer)
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";
import "./KeyAnalysisPanel.css";

export default function Exp3BB84() {
  // Committed (current) state
  const [numPhotons, setNumPhotons] = useState(16);

  // For Experiment 3 default Eve is ON — but slider should NOT start at 100%.
  // Set a sensible interactive default (change this if you prefer another starting %).
  const DEFAULT_EVE_PERCENT = 100;

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
    // ===== REPORT QBER CURVE (MATCHES LIVE GRAPH) =====
    let matched = 0;
    let errors = 0;
    const qberPoints = [];

    sentTransmissions.forEach(t => {
      if (t.bMeas !== null && t.match) {
        matched++;
        if (t.aBit !== t.bMeas) errors++;

        if (matched >= 5) {
          qberPoints.push({
            step: matched,
            qber: (errors / matched) * 100
          });
        }
      }
    });

    // SVG geometry (MUST MATCH REPORT SVG)
    const X_MIN = 50;
    const X_MAX = 270;
    const Y_MIN = 260;
    const Y_MAX = 30;

    // ===== SCALE USING TRUE PEAK (NOT FINAL VALUE) =====
const peakQBER =
  qberPoints.length > 0
    ? Math.max(...qberPoints.map(p => p.qber))
    : 0;

// Add headroom so peaks never touch border
const MAX_QBER = Math.max(
  30,
  Math.ceil((peakQBER * 1.15) / 10) * 10
);

    const MAX_X = Math.max(1, reportStats.total);


    const qberPolyline = qberPoints
      .map(p => {
        const x = X_MIN + (p.step / MAX_X) * (X_MAX - X_MIN);
        const y = Y_MIN - (p.qber / MAX_QBER) * (Y_MIN - Y_MAX);

        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    const qberTicks = [];
    for (let v = 0; v <= MAX_QBER; v += 10) {
      qberTicks.push(v);
    }

    w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Experiment 3 Report — BB84</title>

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

<h1>LAB REPORT - EXPERIMENT 3</h1>
<h2>Detecting Eavesdropping — Intercept–Resend Attack</h2>

<h3>1. Aim</h3>
<p>
To study how an intercept–resend eavesdropping attack affects quantum communication
in the BB84 protocol and to observe how measurement disturbance leads to an increase
in Quantum Bit Error Rate (QBER).
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice — quantum transmitter with random basis selection</li>
  <li>Eve — intercept–resend eavesdropping module</li>
  <li>Quantum communication channel</li>
  <li>Bob — quantum receiver with random basis selection</li>
  <li>Photon count control</li>
  <li>Real-time graphs and transmission table</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
In the BB84 protocol, Alice encodes information using randomly chosen bases.
An eavesdropper does not know Alice’s basis in advance.
</p>
<p>
When Eve intercepts a photon, she must guess a basis.
Measuring in the wrong basis collapses the quantum state.
The photon resent by Eve may carry incorrect information.
</p>
<p>
When Bob measures such disturbed photons, errors appear in the sifted key.
These errors are quantified using the Quantum Bit Error Rate (QBER).
</p>
<p>
For a full intercept–resend attack, quantum theory predicts:
<strong>QBER ≈ 25%</strong>.
</p>

<h3>4. Observations</h3>
<ul>
  <li>Incorrect bits appear when Eve is active</li>
  <li>Errors occur only in basis-matched photons</li>
  <li>QBER increases significantly compared to the ideal case</li>
  <li>QBER stabilizes near 25% for a full attack</li>
</ul>

<p><strong>Graph Observations:</strong></p>
<ul>
  <li>Incorrect measurements increase due to Eve’s intercept–resend attack</li>
  <li>Errors appear even when Alice’s and Bob’s bases match</li>
  <li>Observed QBER is a direct indicator of eavesdropping</li>
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

      <!-- Y ticks (DYNAMIC) -->
      <text x="30" y="264">${yTicks[0]}</text>
      <text x="30" y="214">${yTicks[1]}</text>
      <text x="30" y="164">${yTicks[2]}</text>
      <text x="24" y="114">${yTicks[3]}</text>
      <text x="24" y="64">${yTicks[4]}</text>

      <!-- Y label -->
      <text x="14" y="260"
            transform="rotate(-90 14 260)"
            font-size="15"
            font-weight="bold"
            text-anchor="start">
        Count of Bits →
      </text>

      <!-- X label -->
      <text x="160" y="298"
            font-size="14"
            font-weight="bold"
            text-anchor="middle">
        Bit Classification →
      </text>

      <!-- Bars (DYNAMIC SCALE) -->
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

      <!-- Y ticks (DYNAMIC) -->
      <text x="30" y="264">${yTicks[0]}</text>
      <text x="30" y="214">${yTicks[1]}</text>
      <text x="30" y="164">${yTicks[2]}</text>
      <text x="24" y="114">${yTicks[3]}</text>
      <text x="24" y="64">${yTicks[4]}</text>

      <!-- Y label -->
      <text x="14" y="260"
            transform="rotate(-90 14 260)"
            font-size="15"
            font-weight="bold"
            text-anchor="start">
        Number of Photons →
      </text>

      <!-- X label -->
      <text x="160" y="298"
            font-size="14"
            font-weight="bold"
            text-anchor="middle">
        Basis Comparison →
      </text>

      <!-- Bars (DYNAMIC SCALE) -->
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

      <!-- ===== Y AXIS + ARROW ===== -->
      <line x1="50" y1="30" x2="50" y2="260" stroke="black" stroke-width="2"/>
      <polyline points="50,30 44,40 56,40"
                stroke="black" stroke-width="2" fill="none"/>

      <!-- ===== X AXIS + ARROW ===== -->
      <line x1="50" y1="260" x2="270" y2="260" stroke="black" stroke-width="2"/>
      <polyline points="270,260 260,254 260,266"
                stroke="black" stroke-width="2" fill="none"/>

      <!-- ===== Y AXIS LABEL ===== -->
      <text x="14" y="260"
            transform="rotate(-90 14 260)"
            font-size="14"
            font-weight="bold">
        QBER (%) →
      </text>

      <!-- ===== Y TICKS (DYNAMIC) ===== -->
      ${Array.from({ length: MAX_QBER / 10 + 1 }, (_, i) => {
            const v = i * 10;
            return `
          <text x="18"
                y="${260 - (v / MAX_QBER) * 230}"
                font-size="11">
            ${v}%
          </text>
        `;
          }).join("")}

      <!-- ===== SECURITY THRESHOLDS ===== -->
      <!-- 11% -->
      <line x1="50" x2="270"
            y1="${260 - (11 / MAX_QBER) * 230}"
            y2="${260 - (11 / MAX_QBER) * 230}"
            stroke="black"
            stroke-dasharray="4 4"
            stroke-width="1.6"/>
      <text x="54"
            y="${260 - (11 / MAX_QBER) * 230 - 4}"
            font-size="11">11%</text>

      <!-- 25% -->
      <line x1="50" x2="270"
            y1="${260 - (25 / MAX_QBER) * 230}"
            y2="${260 - (25 / MAX_QBER) * 230}"
            stroke="black"
            stroke-dasharray="2 4"
            stroke-width="1.6"/>
      <text x="54"
            y="${260 - (25 / MAX_QBER) * 230 - 4}"
            font-size="11">25%</text>

      <!-- ===== REAL QBER CURVE ===== -->
      <polyline
        points="${qberPolyline}"
        fill="none"
        stroke="black"
        stroke-width="2.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- ===== FINAL QBER VALUE ===== -->
      <text x="265"
            y="${260 - (reportStats.qber / MAX_QBER) * 230 - 6}"
            font-weight="bold"
            text-anchor="end">
        ${reportStats.qber}%
      </text>

      <!-- ===== X TICKS ===== -->
      <text x="48" y="275">0</text>
      <text x="160" y="275">${Math.round(reportStats.total / 2)}</text>
      <text x="258" y="275">${reportStats.total}</text>

      <!-- ===== X LABEL ===== -->
      <text x="160" y="298"
            font-size="14"
            font-weight="bold"
            text-anchor="middle">
        Sifted Key Index (bits) →
      </text>

    </svg>
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
This experiment confirms the fundamental security principle of BB84:
any measurement of a quantum state introduces unavoidable disturbance.
</p>
<p>
The intercept–resend attack produces detectable errors, allowing Alice and Bob
to infer the presence of an eavesdropper using QBER alone.
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

    // FORCE Eve to 100% in Exp 3
    setEveLevel(100);
    setTempEveLevel(100);

    setChannelNoisePercent(tempChannelNoisePercent);
    setChannelDistanceKm(tempChannelDistanceKm);

    initializeProtocol(sliderTempValue);
    setSentTransmissions([]);
    setChannelKey((k) => k + 1);

    updateStatus(
      `Protocol re-initialized with N=${sliderTempValue} photons · Eve 100%`
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
  const reportStats = {
    total: stats.totalPlanned,
    correct: stats.correctBits,
    incorrect: stats.incorrectBits,
    match: stats.matchedMeasured,
    mismatch: stats.mismatchedMeasured,
    qber: stats.qberPercent,
  };
  // ===== QBER AXIS SCALE (REPORT GRAPH 3) =====
  const MAX_QBER = Math.max(
    30,
    Math.ceil(reportStats.qber / 10) * 10
  );

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


  /* ---------- QBERLine — Experiment 3 (Intercept–Resend) ---------- */
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


   // Determine peak from ALL points (not final value)
const peakQBER =
  points.length > 0
    ? Math.max(...points.map(p => p.qber))
    : 0;

// Add scientific headroom
const MAX_QBER = Math.max(
  30,
  Math.ceil((peakQBER * 1.15) / 10) * 10
);


    const maxX = Math.max(1, totalPlanned);



    const xFor = (step) =>
      margin.left + (step / maxX) * innerW;




    const TOP_PAD = 14; // pixels — matches stroke thickness safely

    const yFor = (v) =>
      margin.top + TOP_PAD +
      (innerH - TOP_PAD) * (1 - v / MAX_QBER);




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


            {Array.from(
              { length: MAX_QBER / 10 + 1 },
              (_, i) => i * 10
            ).map((v) => (
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
            {/* Y-axis arrow */}
            <polyline
              points={`
    ${margin.left},${margin.top}
    ${margin.left - 10},${margin.top + 18}
    ${margin.left + 10},${margin.top + 18}
  `}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* X-axis arrow */}
            <polyline
              points={`
    ${margin.left + innerW},${margin.top + innerH}
    ${margin.left + innerW - 18},${margin.top + innerH - 10}
    ${margin.left + innerW - 18},${margin.top + innerH + 10}
  `}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
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
              x={margin.left + innerW - 30}
              y={margin.top + 18}
              className="chart-tick-label"
            >
              {finalQBER}%
            </text>
          </svg>

        </div>

        {/* Explanation */}
        <div className="chart-caption" style={{ marginTop: 8 }}>
          In an intercept–resend attack, Eve introduces measurement disturbance.
          QBER rises toward <strong>25%</strong>, a clear quantum signature of
          eavesdropping.
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
                  This experiment runs with <strong>Eve active</strong>, performing an intercept–resend attack.
                </li>
                <li>
                  Select the number of photons (N) using the photon slider (minimum 16 recommended).
                </li>
                <li>
                  Adjust the <strong>Eve Interception (%)</strong> slider to control how often Eve intercepts photons.
                </li>
                <li>
                  Click <strong>Apply Settings</strong> to initialize the experiment with the selected parameters.
                </li>
                <li>
                  Use <strong>Send Next Photon</strong> or <strong>Send All Photons</strong> to begin transmission.
                </li>
                <li>
                  Observe how Eve measures photons in a random basis and resends them to Bob.
                </li>
                <li>
                  Notice that errors appear even when Alice’s and Bob’s bases match.
                </li>
                <li>
                  Observe the graphs: incorrect bits increase and QBER rises significantly.
                </li>
                <li>
                  For a full intercept–resend attack, QBER stabilizes near <strong>25%</strong>.
                </li>
                <li>
                  Interpret the result: a high QBER is a clear signature of <strong>eavesdropping</strong>.
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
                Detecting Eavesdropping the Intercept–Resend Attack
                <br />
                <span style={{ fontSize: "0.9em", opacity: 0.85 }}>
                  (Eve ON) Experiment
                </span>
              </h2>

            </div>

            <div className="theory-body">
              <strong>Welcome to Experiment 3.</strong>

              <p>
                This experiment introduces the core security principle of the BB84
                protocol: any attempt to measure a quantum state without knowing the
                correct basis introduces a detectable disturbance.
              </p>

              <h4>What Happens in This Experiment</h4>
              <p>
                Alice prepares photons using random bits and random bases. Bob measures
                them using random bases of his own. An eavesdropper, Eve, is actively
                present in the quantum channel.
              </p>

              <h4>What Eve Does</h4>
              <p>
                Eve performs an intercept resend attack. She intercepts photons, measures
                them in a randomly chosen basis, and sends new photons to Bob based on
                her measurement. Because Eve does not know Alice’s basis, she often
                chooses incorrectly.
              </p>

              <h4>Measurement Disturbance</h4>
              <p>
                When Eve measures a photon in the wrong basis, the original quantum state
                is destroyed. The photon she resends carries incorrect information, which
                may cause Bob to measure a different bit than Alice sent.
              </p>

              <h4>How Errors Appear</h4>
              <p>
                These errors appear only when Alice and Bob compare their bases. They are
                not caused by noise or hardware failure, but by unavoidable quantum
                measurement disturbance.
              </p>

              <h4>QBER and Security</h4>
              <p>
                In a full intercept–resend attack, quantum theory predicts a QBER of
                approximately <strong>25%</strong>. This value is a clear and reliable
                indicator of eavesdropping.
              </p>

              <p className="theory-highlight">
                <strong>Key Insight:</strong>
                <br />
                Eve cannot gain information without leaving evidence. BB84 security is
                enforced by the laws of quantum mechanics, not by secrecy or trust.
              </p>

              <p className="theory-footer">
                This experiment forms the security backbone of the BB84 protocol and
                explains how eavesdropping is detected automatically.
              </p>
            </div>
            {/* ===== BB84 STEP-BY-STEP — EXPERIMENT 3 ===== */}
            <section className="bb84-onboarding" aria-label="Experiment 3 step-by-step explanation">

              <details className="bb84-step" open>
                <summary>STEP 1 — What Eve Tries to Do</summary>
                <p>Eve intercepts photons traveling from Alice to Bob.</p>
                <p>She measures them and sends new photons onward.</p>
                <p>This action is unavoidable if Eve wants information.</p>
              </details>

              <details className="bb84-step">
                <summary>STEP 2 — Why Eve Causes Disturbance</summary>
                <p>Eve does not know Alice’s basis.</p>
                <p>Whenever Eve chooses the wrong basis, the photon’s original state is destroyed.</p>
                <p>This disturbance cannot be reversed.</p>
              </details>

              <details className="bb84-step">
                <summary>STEP 3 — How Bob Detects Eve</summary>
                <p>Bob does not see Eve directly.</p>
                <p>He sees errors after comparing bases with Alice.</p>
                <p>These errors raise the QBER.</p>
              </details>

              <details className="bb84-step">
                <summary>STEP 4 — Meaning of High QBER</summary>
                <ul>
                  <li>Low QBER → normal quantum behavior</li>
                  <li>High QBER → external disturbance</li>
                  <li>A QBER near <strong>25%</strong> is a strong indicator of intercept–resend eavesdropping</li>
                </ul>
              </details>

              <details className="bb84-step">
                <summary>STEP 5 — Why This Experiment Is Critical</summary>
                <ul>
                  <li>Quantum cryptography is self-protecting</li>
                  <li>Eavesdropping leaves unavoidable traces</li>
                  <li>Security is enforced by quantum physics</li>
                </ul>
                <p>All later experiments build on this principle.</p>
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

