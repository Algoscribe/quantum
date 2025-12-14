// src/Exp8BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment8.css"; // use a new css for exp2 (or point to Experiment1.css if you prefer)
import { initializeProtocol } from "./QuantumChannelLogic";
import KeyAnalysisPanel from "./KeyAnalysisPanel";


export default function Exp8BB84() {
    // Committed (current) state
    const [numPhotons, setNumPhotons] = useState(16);



    // For Experiment 2 default Eve is ON — but slider should NOT start at 100%.
    // Set a sensible interactive default (change this if you prefer another starting %).
    const DEFAULT_EVE_PERCENT = 0;
    const [channelNoisePercent, setChannelNoisePercent] = useState(0);
    const [keyRateVsDistance, setKeyRateVsDistance] = useState([]);


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

    // ---------- Slider change handlers (set temp values + show modal) ----------
    const handlePhotonSliderChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setSliderTempValue(val);
        setShowSliderConfirm(true);
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
        const vbW = 800;
        const vbH = 400;
        const margin = { top: 50, right: 16, bottom: 70, left: 100 };
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
                    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none" aria-hidden>
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
                        <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + innerH} className="chart-axis-main" />
                        <polyline
                            points={`${margin.left},${margin.top} ${margin.left - 10},${margin.top + 20} ${margin.left + 10},${margin.top + 20}`}
                            className="chart-axis-arrow"
                            fill="none"
                        />
                        <text
                            x={margin.left - 60}
                            y={margin.top + innerH / 2}
                            className="chart-axis-label"
                            transform={`rotate(-90 ${margin.left - 72} ${margin.top + innerH / 2})`}
                            style={{ fontSize: 18, fill: "#fff" }}
                        >
                            {yLabel}
                        </text>
                        <line x1={margin.left} x2={margin.left + innerW} y1={baselineY} y2={baselineY} className="chart-axis-main" />
                        <polyline
                            points={`${margin.left + innerW},${baselineY} ${margin.left + innerW - 14},${baselineY - 10} ${margin.left + innerW - 14},${baselineY + 10}`}
                            className="chart-axis-arrow"
                            fill="none"
                        />
                        {xLabel && (
                            <text x={margin.left + innerW / 2} y={vbH - 12} className="chart-axis-label" style={{ fontSize: 16, fill: "#fff" }}>
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
                            y={baselineY + 44}
                            className="chart-tick-label"
                            style={{ fontSize: 18, fill: "#ddd", fontWeight: 800, letterSpacing: "0.02em" }}
                            textAnchor="middle"
                        >
                            {leftLabel}
                        </text>
                        <text
                            x={rightX + barWidth / 2}
                            y={baselineY + 44}
                            className="chart-tick-label"
                            style={{ fontSize: 18, fill: "#ddd", fontWeight: 800, letterSpacing: "0.02em" }}
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
        <div className="lab-container vertical-layout">
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

            {/* --- Theory / Intro Box (always visible above the channel) --- */}
            <div className="experiment-theory-wrapper">
                <div className="experiment-theory-box" role="region" aria-label="Experiment 7 theory">
                    <div className="theory-top">
                        <h2 className="theory-title">Experiment 8 — Distance Limits: Attenuation and QKD Range</h2>
                    </div>

                    <div className="theory-body">
                        <p><strong>Concept — Distance & Attenuation:</strong> Not all photons sent by Alice reach Bob.
                            Some photons are lost due to absorption, scattering, or detector inefficiency.</p>

                        <h4>What this experiment shows</h4>
                        <ul>
                            <li>No eavesdropper is present.</li>
                            <li>Some photons never reach Bob.</li>
                            <li>Lost photons produce no measurement and no bit.</li>
                            <li>Errors are not introduced by loss.</li>
                        </ul>

                        <h4>Learning Goal</h4>
                        <p>
                            As photon loss increases, the sifted key becomes shorter.
                            However, the correctness of detected bits remains unchanged.
                            Photon loss reduces key rate, not security.
                        </p>


                    </div>
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
                    <section className="graphs-row-wrapper" aria-label="Experiment 6 graphs">
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

                        </div>
                    </section>


                    <div className="chart-wrapper">
                        <div className="chart-title-outside">
                            Key Rate vs Distance
                        </div>
                        <div className="chart-subtitle">
                            Lost photons are discarded · Errors are not created
                        </div>

                        <div className="chart-card">
                            <svg viewBox="0 0 800 400" className="chart-svg">

                                {/* Y Axis */}
                                <line x1="80" y1="40" x2="80" y2="340" className="chart-axis-main" />
                                <text
                                    x="20"
                                    y="200"
                                    transform="rotate(-90 20 200)"
                                    className="chart-axis-label"
                                >
                                    Sifted Key Length (bits)
                                </text>

                                {/* X Axis */}
                                <line x1="80" y1="340" x2="760" y2="340" className="chart-axis-main" />
                                <text x="360" y="390" className="chart-axis-label">
                                    Distance (km)
                                </text>

                                {keyRateVsDistance.map((p, i) => {
                                    const x = 80 + (p.distance / 200) * 680;
                                    const y = 340 - (p.keyRate / numPhotons) * 300;
                                    return <circle key={i} cx={x} cy={y} r={6} fill="#ffffff" />;
                                })}

                                <polyline
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="3"
                                    points={keyRateVsDistance
                                        .map(p => {
                                            const x = 80 + (p.distance / 200) * 680;
                                            const y = 340 - (p.keyRate / numPhotons) * 300;
                                            return `${x},${y}`;
                                        })
                                        .join(" ")}

                                />
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
    );
}
