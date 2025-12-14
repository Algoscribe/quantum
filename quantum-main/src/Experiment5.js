// src/Exp2BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment5.css"; // use a new css for exp2 (or point to Experiment1.css if you prefer)
import { initializeProtocol } from "./QuantumChannelLogic";

export default function Exp5BB84() {
  // Committed (current) state
  const [numPhotons, setNumPhotons] = useState(16);
  function variance(values) {
    if (values.length === 0) return 0;

    const mean =
      values.reduce((sum, v) => sum + v, 0) / values.length;

    return (
      values.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
      values.length
    );
  }

  // For Experiment 2 default Eve is ON — but slider should NOT start at 100%.
  // Set a sensible interactive default (change this if you prefer another starting %).
  const DEFAULT_EVE_PERCENT = 20;

  const [eveLevel, setEveLevel] = useState(DEFAULT_EVE_PERCENT);
  const [channelNoisePercent, setChannelNoisePercent] = useState(0);
  const [channelDistanceKm, setChannelDistanceKm] = useState(0);
  const qberHistoryRef = useRef([]);



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
  const [statusMessage, setStatusMessage] = useState(`Eve ON (${DEFAULT_EVE_PERCENT}%) — vary photon count ${numPhotons} to observe QBER stability`);

  // Ref to receive QuantumChannel controls
  const qcControlsRef = useRef(null);

  // Initialize protocol once (on mount)
  useEffect(() => {
    initializeProtocol(numPhotons);

    setEveLevel(DEFAULT_EVE_PERCENT);      // logic
    setTempEveLevel(DEFAULT_EVE_PERCENT);  // UI

    updateStatus(`Protocol initialized with N=${numPhotons} photons — Eve fixed at 20%`);
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
    qberHistoryRef.current = [];

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
    qberHistoryRef.current = [];

    setChannelKey((k) => k + 1);
    updateStatus(
      `Channel updated: Eve=${eveLevel}%, Noise=${channelNoisePercent}%, Distance=${channelDistanceKm}km`
    );
  };

  const resetChannelOptions = () => {
    setEveLevel(DEFAULT_EVE_PERCENT);
    setChannelNoisePercent(0);
    setChannelDistanceKm(0);

    initializeProtocol(numPhotons);
    setSentTransmissions([]);
    qberHistoryRef.current = [];

    setChannelKey(k => k + 1);

    updateStatus(
      `Reset complete — Eve ${DEFAULT_EVE_PERCENT}% fixed · Vary photon count to observe QBER stability`
    );
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

 function QBERVarianceLine({ sentTransmissions = [], totalPlanned = 1 }) {
  const points = [];

  let siftedIndex = 0;
  let errors = 0;

  // reset history for fresh render
  qberHistoryRef.current = [];

  for (let i = 0; i < sentTransmissions.length; i++) {
    const t = sentTransmissions[i];

    if (t.bMeas !== null && t.match) {
      siftedIndex++;

      if (t.aBit !== t.bMeas) errors++;

      const qber = errors / siftedIndex;
      qberHistoryRef.current.push(qber);

      const qberVar = variance(qberHistoryRef.current);

      points.push({
        step: siftedIndex,
        variance: qberVar,
      });
    }
  }

  /* === SAME GEOMETRY AS ScientificBar === */
  const vbW = 800;
  const vbH = 400;
  const margin = { top: 50, right: 16, bottom: 70, left: 100 };
  const innerW = vbW - margin.left - margin.right;
  const innerH = vbH - margin.top - margin.bottom;

  const maxX = Math.max(1, totalPlanned);
  const maxVariance =
    Math.max(1e-6, ...points.map((p) => p.variance));

  const xFor = (step) =>
    margin.left + ((step - 1) / (maxX - 1 || 1)) * innerW;

  const yFor = (v) =>
    margin.top + innerH - (v / maxVariance) * innerH;

  const pathD = points
    .map((p, i) => {
      const x = xFor(p.step);
      const y = yFor(p.variance);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  const xTickCount = Math.min(10, maxX);

  return (
    <div className="chart-wrapper" role="group">
      <div className="chart-title-outside">
        QBER Variance vs Photon Count (N)
      </div>

      <div className="chart-card" style={{ padding: 8 }}>
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="chart-svg"
          preserveAspectRatio="none"
        >
          {/* Grid */}
          {[0, maxVariance / 2, maxVariance].map((v, i) => (
            <line
              key={i}
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

          <text
            x={margin.left - 60}
            y={margin.top + innerH / 2}
            transform={`rotate(-90 ${margin.left - 60} ${margin.top + innerH / 2})`}
            className="chart-axis-label"
          >
            Variance of QBER
          </text>

          {/* X axis */}
          <line
            x1={margin.left}
            x2={margin.left + innerW}
            y1={margin.top + innerH}
            y2={margin.top + innerH}
            className="chart-axis-main"
          />

          <text
            x={margin.left + innerW / 2}
            y={vbH - 12}
            className="chart-axis-label"
          >
            Photon Count (N) →
          </text>

          {/* Line */}
          {points.length > 0 && (
            <path
              d={pathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
            />
          )}

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={xFor(p.step)}
              cy={yFor(p.variance)}
              r={5}
              className="chart-dot"
            />
          ))}

          {/* X ticks */}
          {Array.from({ length: xTickCount }).map((_, i) => {
            const step =
              1 + Math.round((i / (xTickCount - 1)) * (maxX - 1));
            const x = xFor(step);
            return (
              <text
                key={i}
                x={x}
                y={margin.top + innerH + 28}
                className="chart-tick-label"
                textAnchor="middle"
              >
                {step}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="qber-calculation-box">
        <strong>Interpretation</strong>
        <p>
          As photon count increases, variance in measured QBER decreases,
          demonstrating statistical confidence (Law of Large Numbers).
        </p>
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
        <div className="experiment-theory-box" role="region" aria-label="Experiment 2 theory">
          <div className="theory-top">
            <h2 className="theory-title">Experiment 5 — Photon Count & QBER (Statistical Confidence)</h2>
          </div>

          <div className="theory-body">
            <p><strong>Concept — Intercept & Resend:</strong> Measuring a qubit disturbs it. Eve intercepts photons, measures them in a random basis and re-sends new photons based on her measurement. Wrong basis → collapse → Bob receives disturbed photon.</p>

            <h4>What this achieves</h4>
            <ul>
              <li>Eve picks random bases and performs intercept-resend.</li>
              <li>When Eve measures in the wrong basis, she introduces errors (QBER ≈ 25% typical).</li>
              <li>User sees QBER rise and the transmitted table shows Eve’s basis & measurement.</li>
            </ul>

            <h4>Learning Goals</h4>
            <p>
              As the number of photons increases, random fluctuations reduce and
              the measured QBER converges to its theoretical value
              (Law of Large Numbers).
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
          <div className="control-row">
            <label>Channel Noise</label>
            <div className="slider-row">
              <input
                type="range"
                min="0"
                max="50"
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
              Reset to Typical (Eve ON)
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

                /* === EXPERIMENT 5: FIXED EVE, VARIABLE PHOTON COUNT === */

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
          <QBERVarianceLine
            sentTransmissions={sentTransmissions}
            totalPlanned={stats.totalPlanned}
          />

        </div>
      </section>
    </div>
  );
}


