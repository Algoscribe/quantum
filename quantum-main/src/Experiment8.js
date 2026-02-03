// src/Exp8BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment8.css"; // use a new css for exp2 (or point to Experiment1.css if you prefer)
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";
import "./KeyAnalysisPanel.css";

export default function Exp8BB84() {
    // Committed (current) state
    const [numPhotons, setNumPhotons] = useState(16);



    // For Experiment 2 default Eve is ON — but slider should NOT start at 100%.
    // Set a sensible interactive default (change this if you prefer another starting %).
    const DEFAULT_EVE_PERCENT = 0;
    const [channelNoisePercent, setChannelNoisePercent] = useState(0);
    const [keyRateVsDistance, setKeyRateVsDistance] = useState([]);
    const [showInstructions, setShowInstructions] = useState(false);

    const reportDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });




    const [eveLevel, setEveLevel] = useState(DEFAULT_EVE_PERCENT);
    const [channelDistanceKm, setChannelDistanceKm] = useState(0);

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
  <title>Experiment 8 Report — Distance & Attenuation</title>

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

<h1>LAB REPORT — Experiment 8</h1>
<h2>Distance & Attenuation: Limits of Quantum Transmission</h2>

<h3>1. Aim</h3>
<p>
To study how transmission distance affects photon detection,
key generation rate, and Quantum Bit Error Rate (QBER)
in the BB84 protocol.
</p>

<h3>2. Apparatus</h3>
<ul>
  <li>Alice (photon source)</li>
  <li>Distance-controlled quantum channel</li>
  <li>Bob (photon detector and measurement)</li>
  <li>Distance control slider</li>
  <li>Photon count control</li>
  <li>Real-time graphs:
    <ul>
      <li>Detected vs Lost Photons</li>
      <li>QBER progression</li>
      <li>Key Rate vs Distance</li>
    </ul>
  </li>
  <li>Transmission log table</li>
</ul>
<p><strong>Software:</strong> QKD_Xplore Virtual Quantum Lab</p>

<h3>3. Theory</h3>
<p>
Photon transmission through optical fibers or free space
experiences attenuation.
The probability of a photon reaching the receiver
decreases exponentially with distance.
</p>
<ul>
  <li>Fewer signal photons arrive at long distances</li>
  <li>Background noise becomes significant</li>
  <li>Detector dark counts contribute errors</li>
</ul>
<p>
When noise dominates over signal:
</p>
<ul>
  <li>QBER rises</li>
  <li>BB84 abort condition is reached</li>
</ul>
<p>
Thus, BB84 security is preserved,
but practical key generation fails beyond a certain distance.
</p>

<h3>4. Observations</h3>
<ul>
  <li>Detected photon count decreases rapidly with distance</li>
  <li>Sifted key rate drops sharply</li>
  <li>QBER remains low at short distances</li>
  <li>QBER rises sharply at large distances</li>
  <li>Secure key generation stops beyond a threshold distance</li>
</ul>

<div class="box">
ADD SCREENSHOT OF KEY RATE vs DISTANCE GRAPH HERE
</div>

<h3>5. Conclusion</h3>
<p>
This experiment demonstrates that BB84 is fundamentally secure
but practically limited by physical channel properties.
</p>
<ul>
  <li>Distance limits key generation rate</li>
  <li>High loss amplifies noise effects</li>
  <li>QBER eventually exceeds the abort threshold</li>
  <li>Long-distance QKD requires advanced techniques</li>
</ul>
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

    const handleEveSliderChange = () => {
        // Experiment 5: Eve is fixed at 20%
    };


    const handleNoiseChange = () => {
        // Noise fixed at 0% in Experiment 5
    };

    const handleDistanceChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setTempChannelDistanceKm(val);
        setTimeout(() => setShowSliderConfirm(true), 4000);

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
        setSentTransmissions([]);     // reset photons only
        setChannelKey((k) => k + 1);

        updateStatus(
            `Channel updated: Distance = ${channelDistanceKm} km · Run experiment`
        );
    };



    const resetChannelOptions = () => {
        setEveLevel(DEFAULT_EVE_PERCENT);
        setChannelNoisePercent(0);
        setChannelDistanceKm(0);

        initializeProtocol(numPhotons);
        setSentTransmissions([]);
        setKeyRateVsDistance([]);   // ✅ CLEAR HISTORY ONLY HERE
        setChannelKey(k => k + 1);

        updateStatus(`Reset complete — new experiment`);
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

        // -------- Experiment 7: Photon Loss --------
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


    useEffect(() => {
        if (sentTransmissions.length !== numPhotons) return;

        setKeyRateVsDistance(prev => {
            const filtered = prev.filter(
                p => p.distance !== channelDistanceKm
            );

            return [
                ...filtered,
                {
                    distance: channelDistanceKm,
                    keyRate: stats.siftedKeyBits,
                    qber: stats.qber,
                },
            ];
        });

        if (stats.qber > 11) {
            updateStatus(
                "QBER exceeded threshold — secure key generation aborted"
            );
        }
    }, [sentTransmissions, channelDistanceKm, numPhotons, stats]);

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
                                        x={margin.left - 25}
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
                        <h2>Instructions — Experiment 8</h2>

                        <ol className="instructions-list">
                            <li>
                                Select the total number of photons (N) for the experiment.
                            </li>
                            <li>
                                Adjust the <strong>distance (km)</strong> slider to set the transmission length.
                            </li>
                            <li>
                                Note that <strong>Eve is disabled</strong> and channel noise is fixed at 0%.
                            </li>
                            <li>
                                Click <strong>Apply Settings</strong> to initialize the experiment.
                            </li>
                            <li>
                                Send all photons through the quantum channel.
                            </li>
                            <li>
                                Observe that detected photons decrease as distance increases.
                            </li>
                            <li>
                                Notice that the <strong>sifted key rate drops sharply</strong> with distance.
                            </li>
                            <li>
                                Observe the <strong>QBER</strong>: it remains low at short distances.
                            </li>
                            <li>
                                At large distances, notice QBER rise and cross the abort threshold.
                            </li>
                            <li>
                                Use the <strong>Key Rate vs Distance</strong> graph to identify the practical range limit of BB84.
                            </li>
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
                            <h2 className="theory-title">Distance & Attenuation: Limits of Quantum Transmission</h2>
                        </div>

                        <div className="theory-body">
                            <strong>Welcome to Experiment 8.</strong>

                            <h4>1. What Experiment 8 Demonstrates</h4>
                            <p>
                                Experiment 8 answers a very practical question in the BB84 protocol:
                                <strong> Why can’t BB84 work over infinite distance?</strong>
                            </p>
                            <p>
                                In theory, BB84 is information-theoretically secure.
                            </p>
                            <p>
                                In practice, physical limitations dominate.
                            </p>
                            <ul>
                                <li>Photons weaken as distance increases</li>
                                <li>Photon detection becomes rare</li>
                                <li>Errors and noise begin to dominate</li>
                            </ul>
                            <p>
                                This experiment shows that <strong>distance is not a security flaw</strong>,
                                but a <strong>physical limitation</strong>.
                            </p>

                            <h4>2. What “Distance” Means in Quantum Communication</h4>
                            <p>
                                Increasing distance represents:
                            </p>
                            <ul>
                                <li>Longer optical fiber links</li>
                                <li>Larger free-space separation</li>
                                <li>More opportunities for photon loss</li>
                                <li>Greater environmental disturbance</li>
                            </ul>
                            <p>
                                As distance increases:
                            </p>
                            <ul>
                                <li>Photon attenuation increases exponentially</li>
                                <li>Fewer photons reach Bob</li>
                                <li>Signal-to-noise ratio degrades</li>
                            </ul>
                            <p>
                                Distance combines <strong>loss</strong> and <strong>noise</strong>,
                                making it more challenging than either alone.
                            </p>

                            <h4>3. How Distance Affects BB84 Transmission</h4>
                            <p>
                                With increasing distance:
                            </p>
                            <ul>
                                <li>Photon loss increases significantly</li>
                                <li>Bob detects fewer photons</li>
                                <li>Sifted key rate drops sharply</li>
                            </ul>
                            <p>
                                At the same time:
                            </p>
                            <ul>
                                <li>Background noise becomes significant</li>
                                <li>Detector imperfections contribute errors</li>
                                <li>A small number of noise-induced errors can dominate</li>
                            </ul>
                            <p>
                                As a result:
                            </p>
                            <ul>
                                <li>QBER begins to rise</li>
                                <li>Eventually, QBER crosses the abort threshold</li>
                                <li>Secure key generation becomes impossible</li>
                            </ul>

                            <h4>4. Distance vs QBER — The Key Insight</h4>
                            <p>
                                Distance affects BB84 in <strong>two fundamentally different ways</strong>:
                            </p>
                            <ul>
                                <li>
                                    <strong>Loss effect:</strong>
                                    <ul>
                                        <li>Reduces key rate</li>
                                        <li>Does not directly increase QBER</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>Noise dominance:</strong>
                                    <ul>
                                        <li>Signal photons become rare</li>
                                        <li>Noise clicks become comparable</li>
                                        <li>QBER increases sharply</li>
                                    </ul>
                                </li>
                            </ul>
                            <p>
                                Thus, BB84 fails at long distances
                                <strong> not because it is insecure</strong>,
                                but because usable signal disappears.
                            </p>

                            <h4>5. Why This Experiment Is Essential</h4>
                            <p>
                                Without this experiment, students often assume:
                            </p>
                            <p><em>“If BB84 is secure, it should work forever.”</em></p>
                            <p>
                                Experiment 8 corrects this misunderstanding by teaching that:
                            </p>
                            <ul>
                                <li>Physics limits communication</li>
                                <li>Security does not guarantee practicality</li>
                                <li>Engineering matters as much as theory</li>
                            </ul>
                            <p>
                                This prepares students to understand:
                            </p>
                            <ul>
                                <li>Fiber-based QKD distance limits</li>
                                <li>Satellite-based QKD solutions</li>
                                <li>Why quantum repeaters are actively researched</li>
                            </ul>

                            <h4>6. What Students Should Learn</h4>
                            <ul>
                                <li>Distance causes exponential photon attenuation</li>
                                <li>Loss alone is tolerable, but loss plus noise is not</li>
                                <li>QBER rises when noise overtakes signal</li>
                                <li>BB84 has a maximum practical operating range</li>
                                <li>Long-distance QKD requires advanced techniques</li>
                            </ul>

                            <p className="theory-highlight">
                                <strong>Key Insight:</strong>
                                <br />
                                BB84 is secure in theory, but distance limits it in practice.
                            </p>



                        </div>
                        {/* ===== BB84 STEP-BY-STEP — EXPERIMENT 8 ===== */}

                        <section
                            className="bb84-onboarding"
                            aria-label="Experiment 8 step-by-step explanation"
                        >

                            <details className="bb84-step" open>
                                <summary>STEP 1 — Why Distance Matters</summary>
                                <p>Photons weaken as they travel through a channel.</p>
                                <p>Longer distance means fewer photons reach Bob.</p>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 2 — Loss vs Noise at Long Distance</summary>
                                <p>At short distances, signal photons dominate.</p>
                                <p>At long distances, noise clicks become significant.</p>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 3 — When QBER Starts to Rise</summary>
                                <p>
                                    When noise clicks rival real signal photons,
                                    incorrect measurements become frequent.
                                </p>
                                <p>As a result, QBER rises rapidly.</p>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 4 — What You Will See in This Experiment</summary>
                                <p>As distance increases:</p>
                                <ul>
                                    <li>Photon detection rate drops</li>
                                    <li>Sifted key rate falls sharply</li>
                                    <li>QBER eventually spikes</li>
                                </ul>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 5 — Why BB84 Must Abort</summary>
                                <p>
                                    High QBER means the security of the key
                                    can no longer be guaranteed.
                                </p>
                                <p>The BB84 protocol aborts automatically.</p>
                            </details>

                            <details className="bb84-step">
                                <summary>STEP 6 — Core Takeaway</summary>
                                <p>
                                    BB84 is <strong>secure in theory</strong>,
                                    but <strong>distance limits it in practice</strong>.
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

                        {/* GRAPH 3 — Key Rate vs Distance */}
                        <div className="chart-wrapper" role="group" aria-label="Key Rate vs Distance">
                            <div className="chart-title-outside">Key Rate vs Distance</div>

                            <div className="chart-card" style={{ padding: 8 }}>
                                <svg
                                    viewBox="0 0 700 400"
                                    className="chart-svg"
                                    preserveAspectRatio="none"
                                >
                                    {/* Abort warning */}
                                    {stats.qber > 11 && (
                                        <text
                                            x="380"
                                            y="40"
                                            textAnchor="middle"
                                            style={{ fill: "#ff5555", fontWeight: 700 }}
                                        >
                                            QBER exceeded — protocol aborted
                                        </text>
                                    )}

                                    {/* ================= AXES (always visible) ================= */}

                                    {/* Y Axis */}
                                    <line x1="120" y1="50" x2="120" y2="330" className="chart-axis-main" />
                                    <text
                                        x="60"
                                        y="200"
                                        transform="rotate(-90 60 200)"
                                        className="chart-axis-label"
                                    >
                                        Sifted Key Length
                                    </text>

                                    {/* X Axis */}
                                    <line x1="120" y1="330" x2="640" y2="330" className="chart-axis-main" />
                                    <text x="380" y="388" className="chart-axis-label">
                                        Distance (km) →
                                    </text>

                                    {/* ================= TICKS ================= */}

                                    {/* X-axis ticks */}
                                    {[0, 50, 100, 150, 200].map((d) => {
                                        const x = 120 + (d / 200) * 520;
                                        return (
                                            <text
                                                key={d}
                                                x={x}
                                                y="355"
                                                textAnchor="middle"
                                                className="chart-tick-label"
                                            >
                                                {d}
                                            </text>
                                        );
                                    })}

                                    {/* Y-axis ticks */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
                                        const y = 330 - f * 280;
                                        const value = Math.round(f * numPhotons);
                                        return (
                                            <text
                                                key={i}
                                                x="110"
                                                y={y + 5}
                                                textAnchor="end"
                                                className="chart-tick-label"
                                            >
                                                {value}
                                            </text>
                                        );
                                    })}

                                    {/* ================= GRID ================= */}
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

                                    {/* ================= PLACEHOLDER TEXT ================= */}
                                    {keyRateVsDistance.length === 0 && (
                                        <text
                                            x="380"
                                            y="200"
                                            textAnchor="middle"
                                            style={{ fill: "rgba(255,255,255,0.4)" }}
                                        >
                                            Increase distance and send photons to observe key rate decay
                                        </text>
                                    )}

                                    {/* ================= CURRENT DISTANCE GUIDE ================= */}
                                    <line
                                        x1={120 + (channelDistanceKm / 200) * 520}
                                        x2={120 + (channelDistanceKm / 200) * 520}
                                        y1="50"
                                        y2="330"
                                        stroke="rgba(255,255,255,0.15)"
                                        strokeDasharray="4 4"
                                    />

                                    {/* ================= DATA POINTS ================= */}
                                    {keyRateVsDistance.map((p, i) => {
                                        const x = 120 + (p.distance / 200) * 520;
                                        const y = 330 - (p.keyRate / numPhotons) * 280;

                                        return (
                                            <g key={i}>
                                                {/* Data point */}
                                                <circle cx={x} cy={y} r="5" fill="#fff" />

                                                {/* Key rate value */}
                                                <text
                                                    x={x}
                                                    y={y - 14}
                                                    textAnchor="middle"
                                                    className="chart-tick-label"
                                                >
                                                    {p.keyRate}
                                                </text>

                                                {/* Run number */}
                                                <text
                                                    x={x}
                                                    y={y - 2}
                                                    textAnchor="middle"
                                                    style={{ fontSize: "12px", fill: "rgba(255,255,255,0.7)" }}
                                                >
                                                    ({i + 1})
                                                </text>
                                            </g>
                                        );
                                    })}


                                    {/* ================= CONNECTING LINE ================= */}
                                    {keyRateVsDistance.length > 1 && (
                                        <polyline
                                            fill="none"
                                            stroke="#fff"
                                            strokeWidth="3"
                                            strokeLinejoin="round"
                                            strokeLinecap="round"
                                            points={keyRateVsDistance
                                                .slice()
                                                .sort((a, b) => a.distance - b.distance)
                                                .map((p) => {
                                                    const x = 120 + (p.distance / 200) * 520;
                                                    const y = 330 - (p.keyRate / numPhotons) * 280;
                                                    return `${x},${y}`;
                                                })
                                                .join(" ")}
                                        />
                                    )}
                                </svg>
                            </div>
                        </div>   {/* closes chart-wrapper (Graph 3) */}
                    </div>     {/* closes graphs-row */}
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