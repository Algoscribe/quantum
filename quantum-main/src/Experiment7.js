// src/Exp7BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment7.css"; // use a new css for exp2 (or point to Experiment1.css if you prefer)
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";
import "./KeyAnalysisPanel.css";

export default function Exp7BB84() {
    // Committed (current) state
    const [numPhotons, setNumPhotons] = useState(16);

    // For Experiment 2 default Eve is ON — but slider should NOT start at 100%.
    // Set a sensible interactive default (change this if you prefer another starting %).
    const DEFAULT_EVE_PERCENT = 0;
    const [channelNoisePercent, setChannelNoisePercent] = useState(0);
    const [photonLossPercent, setPhotonLossPercent] = useState(0);
    const [keyRateVsLoss, setKeyRateVsLoss] = useState([]);

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
        `Photon loss enabled — observe reduction in key rate without loss of security`
    );


    // Ref to receive QuantumChannel controls
    const qcControlsRef = useRef(null);

    // Initialize protocol once (on mount)
    useEffect(() => {
        initializeProtocol(numPhotons);

        setEveLevel(DEFAULT_EVE_PERCENT);      // logic
        setTempEveLevel(DEFAULT_EVE_PERCENT);  // UI

        updateStatus(`Protocol initialized with N=${numPhotons} photons — Photon loss only`);
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
  <title>Experiment 7 Report — Photon Loss</title>

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

<h1>LAB REPORT — Experiment 7</h1>
<h2>Photon Loss vs Key Rate in BB84</h2>

<h3>1. Aim</h3>
<p>
To study the effect of photon loss on key generation and
to understand why photon loss does not increase
the Quantum Bit Error Rate (QBER).
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice (random photon preparation)</li>
  <li>Loss-controlled quantum channel</li>
  <li>Bob (photon detection and measurement)</li>
  <li>Photon loss control</li>
  <li>Photon count control</li>
  <li>Real-time graphs:
    <ul>
      <li>Detected vs Lost Photons</li>
      <li>Correct vs Incorrect Bits</li>
      <li>QBER progression</li>
    </ul>
  </li>
  <li>Transmission log table</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
Photon loss is an inherent feature of quantum communication channels.
Loss occurs due to absorption, scattering, or detector inefficiencies.
</p>
<ul>
  <li>Only detected photons are used for key generation</li>
  <li>Lost photons are ignored</li>
  <li>QBER considers only detected, matched photons</li>
</ul>
<p>
Thus, photon loss affects:
</p>
<ul>
  <li>Key rate (number of usable bits)</li>
</ul>
<p>
But does not affect:
</p>
<ul>
  <li>Error rate</li>
  <li>Security level</li>
</ul>
<p>
This property makes BB84 suitable for long-distance quantum communication.
</p>

<h3>4. Observations</h3>
<ul>
  <li>Increasing photon loss reduces detected photons</li>
  <li>Sifted key length decreases</li>
  <li>Correct-to-incorrect ratio remains stable</li>
  <li>QBER stays approximately constant</li>
  <li>No disturbance signature appears</li>
</ul>

<div class="box">
ADD SCREENSHOT OF KEY RATE vs PHOTON LOSS GRAPH HERE
</div>

<h3>5. Conclusion</h3>
<p>
This experiment demonstrates that photon loss does not imply insecurity.
BB84 remains secure even when many photons are lost,
as long as the remaining photons are correctly measured.
</p>
<ul>
  <li>Loss reduces throughput, not correctness</li>
  <li>Security depends on error statistics, not detection rate</li>
  <li>BB84 is robust against channel attenuation</li>
</ul>

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
    const handleNoiseChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setTempChannelNoisePercent(val);
        setTimeout(() => setShowSliderConfirm(true), 4000);

    };
    const handleEveSliderChange = () => {
        // Experiment 5: Eve is fixed at 20%
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
            `Channel updated: Photon loss = ${photonLossPercent}% · Observing key rate`
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


    const handleMeasured = (s) => {

        // -------- Experiment 7: Photon Loss --------
        if (Math.random() < photonLossPercent / 100) {
            s.bBasis = "—";
            s.bMeas = null;
            s.match = false;        // boolean ONLY
            s.status = "Lost";      // UI label
        } else {
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

    useEffect(() => {
        if (sentTransmissions.length !== numPhotons) return;

        setKeyRateVsLoss(prev => {
            const filtered = prev.filter(p => p.loss !== photonLossPercent);

            return [
                ...filtered,
                {
                    loss: photonLossPercent,
                    keyRate: stats.siftedKeyBits,
                },
            ];
        });
    }, [sentTransmissions, photonLossPercent, numPhotons, stats.siftedKeyBits]);



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
                        <h2>Instructions — Experiment 7</h2>

                        <ol>
                            <li>Set photon loss percentage</li>
                            <li>Click Apply Settings</li>
                            <li>Send photons</li>
                            <li>Observe key length drop</li>
                            <li>Notice QBER stays low</li>
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
                            <h2 className="theory-title">Photon Loss: Loss ≠ Insecurity in BB84</h2>
                        </div>

                        <div className="theory-body">
                            <strong>Welcome to Experiment 7.</strong>

                            <h4>1. What Experiment 7 Demonstrates</h4>
                            <p>
                                Experiment 7 answers a subtle but critical question in the BB84 protocol:
                                <strong> Does losing photons make the protocol insecure?</strong>
                            </p>
                            <p>
                                The correct answer is <strong>NO</strong>.
                            </p>
                            <ul>
                                <li>Eve is completely absent</li>
                                <li>Channel noise is minimal or zero</li>
                                <li>Many photons never reach Bob</li>
                            </ul>
                            <p>
                                Yet:
                            </p>
                            <ul>
                                <li>QBER remains low</li>
                                <li>Security is not compromised</li>
                                <li>Only the key generation rate decreases</li>
                            </ul>
                            <p>
                                This experiment clearly separates <strong>availability</strong> from
                                <strong> security</strong>.
                            </p>

                            <h4>2. What Photon Loss Means Physically</h4>
                            <p>
                                Photon loss occurs when a photon:
                            </p>
                            <ul>
                                <li>Is absorbed in the transmission channel</li>
                                <li>Scatters out of the optical path</li>
                                <li>Fails to reach Bob’s detector</li>
                            </ul>
                            <p>
                                Importantly:
                            </p>
                            <ul>
                                <li>A lost photon is never measured</li>
                                <li>No bit value is generated</li>
                                <li>No error is introduced</li>
                            </ul>
                            <p>
                                Loss is a <strong>missing event</strong>, not a <strong>wrong event</strong>.
                            </p>

                            <h4>3. How Photon Loss Affects BB84</h4>
                            <p>
                                As photon loss increases:
                            </p>
                            <ul>
                                <li>Fewer photons are detected by Bob</li>
                                <li>Fewer basis matches occur</li>
                                <li>The sifted key becomes shorter</li>
                            </ul>
                            <p>
                                However:
                            </p>
                            <ul>
                                <li>Detected bits remain correct</li>
                                <li>Error rate among detected bits does not increase</li>
                                <li>QBER remains near zero in ideal conditions</li>
                            </ul>
                            <p>
                                This shows that:
                            </p>
                            <ul>
                                <li><strong>Key quantity decreases</strong></li>
                                <li><strong>Key quality remains intact</strong></li>
                            </ul>

                            <h4>4. Why Photon Loss Does NOT Increase QBER</h4>
                            <p>
                                QBER is defined as:
                            </p>
                            <p><em>Errors ÷ Matched Measurements</em></p>
                            <p>
                                A lost photon:
                            </p>
                            <ul>
                                <li>Does not produce a measurement</li>
                                <li>Is excluded from QBER calculation</li>
                            </ul>
                            <p>
                                Therefore:
                            </p>
                            <ul>
                                <li>Loss does not add to errors</li>
                                <li>Loss does not distort the error fraction</li>
                            </ul>
                            <p>
                                This is why BB84 protocols tolerate <strong>loss</strong> but not
                                <strong> disturbance</strong>.
                            </p>

                            <h4>5. Why This Experiment Is Necessary</h4>
                            <p>
                                Many beginners incorrectly assume:
                            </p>
                            <p><em>“If Bob misses photons, something bad happened.”</em></p>
                            <p>
                                Experiment 7 corrects this misunderstanding by showing that:
                            </p>
                            <ul>
                                <li>Loss ≠ error</li>
                                <li>Missing data ≠ wrong data</li>
                                <li>Security depends on correctness, not completeness</li>
                            </ul>
                            <p>
                                This understanding is essential for:
                            </p>
                            <ul>
                                <li>Long-distance QKD</li>
                                <li>Satellite-based QKD</li>
                                <li>Fiber-optic QKD deployments</li>
                            </ul>

                            <h4>6. What Students Should Learn</h4>
                            <ul>
                                <li>Photon loss reduces key rate, not security</li>
                                <li>Lost photons do not introduce errors</li>
                                <li>QBER measures correctness, not throughput</li>
                                <li>BB84 remains secure even under high loss</li>
                                <li>Real QKD systems expect and tolerate loss</li>
                            </ul>

                            <p className="theory-highlight">
                                <strong>Key Insight:</strong>
                                <br />
                                Photon loss reduces how much key you get, not how secure it is.
                            </p>
                        </div>

                        {/* ===== BB84 STEP-BY-STEP — EXPERIMENT 7 ===== */}

                        <section
                            className="bb84-onboarding"
                            aria-label="Experiment 7 step-by-step explanation"
                        >

                            <details className="bb84-step" open>
                                <summary>STEP 1 — What Happens When a Photon Is Lost</summary>
                                <p>A lost photon never reaches Bob.</p>
                                <p>No measurement occurs.</p>
                                <p>No bit is produced.</p>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 2 — Loss vs Error</summary>
                                <p>An <strong>error</strong> means a wrong bit was measured.</p>
                                <p><strong>Loss</strong> means no bit exists at all.</p>
                                <p>Only errors contribute to QBER.</p>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 3 — Why QBER Ignores Loss</summary>
                                <p>
                                    QBER is calculated using only <strong>detected and matched photons</strong>.
                                </p>
                                <p>
                                    Lost photons are excluded from the calculation entirely.
                                </p>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 4 — What You Will See in This Experiment</summary>
                                <p>As photon loss increases:</p>
                                <ul>
                                    <li>Detected photons decrease</li>
                                    <li>The sifted key becomes shorter</li>
                                    <li>QBER remains low</li>
                                </ul>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 5 — Why This Matters in Real QKD</summary>
                                <p>
                                    Real quantum channels are inherently lossy.
                                </p>
                                <p>
                                    BB84 is specifically designed to remain secure despite high loss.
                                </p>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 6 — Core Takeaway</summary>
                                <p>
                                    Photon loss affects <strong>key quantity</strong>, not
                                    <strong> key security</strong>.
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
                        <div className="control-row">
                            <label>Photon Loss (%)</label>

                            <div className="slider-row">
                                <input
                                    type="range"
                                    min="0"
                                    max="90"
                                    step="5"
                                    value={photonLossPercent}
                                    className="exp-slider"
                                    onChange={(e) => setPhotonLossPercent(Number(e.target.value))}
                                />

                                <span className="slider-value">{photonLossPercent}%</span>
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
                                    photonLossPercent={photonLossPercent}
                                    eveEnabled={false}
                                    channelNoisePercent={0}
                                    channelDistanceKm={0}
                                    onMeasured={handleMeasured}
                                    registerControls={registerControls}
                                    forceMatchBases={false}
                                />


                            </div>
                        </section>
                    </div>
                </div>

                {/* GRAPH ROW: placed after controls & channel */}
                <section className="graphs-row-wrapper" aria-label="Experiment graphs">
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
                            maxY={stats.totalSent}
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

                        {/* GRAPH 3 — Key Rate vs Photon Loss */}
                        <div className="chart-wrapper">
                            <div className="chart-title-outside">
                                Key Rate vs Photon Loss (Loss ≠ Insecurity)
                            </div>

                            <div className="chart-card">
                                <svg viewBox="0 0 700 400" className="chart-svg" preserveAspectRatio="none">

                                    {/* Y axis */}
                                    <line x1="120" x2="120" y1="50" y2="330" className="chart-axis-main" />
                                    <text
                                        x="60"
                                        y="190"
                                        transform="rotate(-90 60 190)"
                                        className="chart-axis-label"
                                    >
                                        Key Length
                                    </text>
                                    {/* Y-axis tick labels */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
                                        const y = 330 - f * 280;
                                        const value = Math.round(f * stats.totalSent);

                                        return (
                                            <text
                                                key={`y-tick-${i}`}
                                                x="110"
                                                y={y + 5}
                                                textAnchor="end"
                                                className="chart-tick-label"
                                            >
                                                {value}
                                            </text>
                                        );
                                    })}

                                    {/* X axis */}
                                    <line x1="120" x2="640" y1="330" y2="330" className="chart-axis-main" />
                                    <text x="380" y="388" className="chart-axis-label">
                                        Photon Loss (%) →
                                    </text>
                                    {/* X-axis tick labels */}
                                    {[0, 25, 50, 75, 100].map((v, i) => {
                                        const x = 120 + (v / 100) * 520;

                                        return (
                                            <text
                                                key={`x-tick-${i}`}
                                                x={x}
                                                y="360"
                                                textAnchor="middle"
                                                className="chart-tick-label"
                                            >
                                                {v}
                                            </text>
                                        );
                                    })}

                                    {/* Grid lines */}
                                    {[0, 1, 2, 3, 4, 5].map((i) => {
                                        const y = 50 + (280 * i) / 5;
                                        return (
                                            <line
                                                key={i}
                                                x1="120"
                                                x2="640"
                                                y1={y}
                                                y2={y}
                                                className="chart-gridline"
                                            />
                                        );
                                    })}

                                    {/* Line */}
                                    {keyRateVsLoss.length > 1 && (
                                        <path
                                            d={keyRateVsLoss
                                                .slice()
                                                .sort((a, b) => a.loss - b.loss)
                                                .map((p, i) => {
                                                    const x = 120 + (p.loss / 100) * 520;
                                                    const y = 330 - (p.keyRate / stats.totalSent) * 280;
                                                    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                                                })
                                                .join(" ")}
                                            fill="none"
                                            stroke="#ffffff"
                                            strokeWidth="3"
                                        />
                                    )}

                                    {/* Points */}
                                    {keyRateVsLoss.map((p, i) => {
                                        const x = 120 + (p.loss / 100) * 520;
                                        const y = 330 - (p.keyRate / stats.totalSent) * 280;

                                        return (
                                            <g key={i}>
                                                <circle cx={x} cy={y} r="5" fill="#ffffff" />
                                                <text
                                                    x={x}
                                                    y={y - 10}
                                                    textAnchor="middle"
                                                    style={{ fill: "#ddd", fontSize: 14 }}
                                                >
                                                    {p.keyRate}
                                                </text>
                                            </g>
                                        );
                                    })}

                                </svg>
                            </div>
                        </div>

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

