// src/Exp1BB84.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import QuantumChannel from "./QuantumChannel";
import "./Experiment1.css";
import { initializeProtocol } from "./QuantumChannelLogic";

export default function Exp1BB84() {
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

  // ---------- Slider change handlers (set temp values + show modal) ----------
  const handlePhotonSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderTempValue(val);
    setShowSliderConfirm(true);
  };

  const handleEveSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempEveLevel(val);
    setShowSliderConfirm(true);
  };

  const handleNoiseChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempChannelNoisePercent(val);
    setShowSliderConfirm(true);
  };

  const handleDistanceChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTempChannelDistanceKm(val);
    setShowSliderConfirm(true);
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
      } catch (e) {}
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
    // Experiment 1 (Teaching Mode):
// QBER is guaranteed to be 0 because bases always match and channel is ideal
const qberPercent = 0;

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
    const vbW = 800;
    const vbH = 400;
    const margin = { top: 50, right: 16, bottom: 70, left: 100 };
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
              x={margin.left - 60}
              y={margin.top + innerH / 2}
              className="chart-axis-label"
              transform={`rotate(-90 ${margin.left - 72} ${margin.top + innerH / 2})`}
              style={{ fontSize: 18, fill: "#fff" }}
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
              <text x={margin.left + innerW / 2} y={vbH - 12} className="chart-axis-label" style={{ fontSize: 16, fill: "#fff" }}>
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
              y={baselineY + 44}                /* moved down for breathing room */
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
    const vbW = 1400;
    const vbH = 520;
    const pad = 20; // << smaller pad so axis fits
    const innerW = vbW - pad * 2;
    const innerH = vbH - pad * 2;
    const maxX = Math.max(1, totalPlanned);

    const xFor = (step) => pad + ((step - 1) / (maxX - 1 || 1)) * innerW;
    const yFor = (v) => pad + innerH - (v / 100) * innerH;

    const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${xFor(p.step)} ${yFor(p.qber)}`).join(" ");

    return (
      <div className="chart-wrapper" role="group" aria-label="QBER (%)">
        <div className="chart-title-outside">QBER (%)</div>
        <div className="chart-subtitle">Ideal channel — zero error by design</div>


        <div className="chart-card" style={{ padding: 8 }}>
          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="chart-svg" preserveAspectRatio="none" aria-hidden>
            {/* horizontal gridlines */}
            {[0, 20, 40, 60, 80, 100].map((v, i) => (
              <line key={`g-${i}`} x1={pad} x2={vbW - pad} y1={yFor(v)} y2={yFor(v)} className="chart-gridline" />
            ))}

            {/* Y axis */}
            <line x1={pad} x2={pad} y1={pad} y2={pad + innerH} className="chart-axis-main" />
            <polyline points={`${pad},${pad} ${pad - 10},${pad + 22} ${pad + 10},${pad + 22}`} className="chart-axis-arrow" fill="none" />
            <text x={pad - 72} y={vbH / 2} className="chart-axis-label" transform={`rotate(-90 ${pad - 72} ${vbH / 2})`} style={{ fontSize: 18, fill: "#fff" }}>
              Error Rate (%)
            </text>

            {/* X axis */}
            <line x1={pad} x2={vbW - pad} y1={vbH - pad} y2={vbH - pad} className="chart-axis-main" />
            <polyline points={`${vbW - pad},${vbH - pad} ${vbW - pad - 16},${vbH - pad - 8} ${vbW - pad - 16},${vbH - pad + 8}`} className="chart-axis-arrow" fill="none" />
            <text x={vbW / 2} y={vbH - 8} className="chart-axis-label" style={{ fontSize: 16, fill: "#fff" }}>
              Photon Index →
            </text>

            {/* y tick labels */}
            {[0, 20, 40, 60, 80, 100].map((v, i) => (
              <text key={`yt-${i}`} x={pad - 16} y={yFor(v) + 6} className="chart-tick-label" style={{ fontSize: 16, fill: "#fff" }} textAnchor="end">
                {v}%
              </text>
            ))}

            {/* x ticks (sampled 5 positions) */}
            {Array.from({ length: 5 }).map((_, i) => {
              const step = 1 + Math.round((i / 4) * (maxX - 1 || 1));
              const x = xFor(step);
              return (
                <g key={`xt-${i}`}>
                  <line x1={x} x2={x} y1={vbH - pad} y2={vbH - pad + 8} className="chart-tick" />
                  <text x={x} y={vbH - pad + 28} className="chart-tick-label" style={{ fontSize: 16, fill: "#ddd" }} textAnchor="middle">
                    {step}
                  </text>
                </g>
              );
            })}

            {/* line + dots */}
            {points.length > 0 && <path d={pathD} className="chart-line" style={{ strokeWidth: 4 }} />}
            {points.map((p, i) => (
              <circle key={`pt-${i}`} cx={xFor(p.step)} cy={yFor(p.qber)} r={6} className="chart-dot" />
            ))}

            {/* final numeric QBER */}
            <text x={vbW - pad + 8} y={pad + 18} className="chart-tick-label" style={{ fontSize: 16, fill: "#fff" }} textAnchor="start">
              {finalQBER}%
            </text>
          </svg>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div className="chart-caption" style={{ fontSize: 15, color: "#bbb" }}>{showFormula ? "QBER = (incorrect_bits / matched_bits) × 100" : ""}</div>
          <div className="qber-value" style={{ fontSize: 22, color: "#fff" }}>{finalQBER}%</div>
        </div>
      </div>
    );
  }

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
        <div className="experiment-theory-box" role="region" aria-label="Experiment 1 theory">
          <div className="theory-top">
            <h2 className="theory-title">Ideal BB84 Experiment — Theory</h2>
          </div>

          <div className="theory-body">
            <p><strong>Welcome to Experiment 1.</strong> In this setup, you will see how BB84 behaves when everything works perfectly. The photon travels cleanly from Alice to Bob, and nothing in the channel interferes with it. This gives you the purest form of BB84 to learn from.</p>

            <h4>What Alice Does</h4>
            <p>As the simulation begins, Alice prepares each photon for you. She randomly decides which bit the photon will carry and which basis will encode it. Watch how the photon immediately takes on a specific polarization based on those two choices — this is the quantum information Alice is sending.</p>

            <h4>How the Photon Moves</h4>
            <p>When the photon leaves Alice, its polarization stays exactly the same while traveling. Nothing rotates it, bends it, or disturbs it — this is an ideal, error-free quantum channel.</p>

            <h4>What Bob Does</h4>
            <p>Bob measures each photon that reaches him. In this teaching experiment Bob's basis is intentionally made identical to Alice’s so you can clearly observe a correct measurement. His measurement always reveals the correct bit here.</p>

            <h4>How the Sifted Key Forms</h4>
            <p>Every photon where Alice and Bob used the same basis becomes part of the sifted key. Since their bases are aligned, the sifted key forms smoothly and without errors — a perfect baseline before we introduce noise or eavesdropping.</p>

            <h4>Why QBER Is Zero</h4>
            <p>Because the channel is ideal, the photon never changes, and Bob measures in the correct basis, the matched bits are always correct. QBER stays at 0% in this experiment.</p>

            <p className="theory-highlight"><strong>Highlight: Forced Basis Matching (Teaching Mode)</strong><br />
            In the real BB84 protocol Alice and Bob don't coordinate bases — half match by chance. Here Bob's basis is forced to match Alice's so you can see how ideal, zero-error transmission should look before exploring noise and eavesdroppers.</p>

            <p className="theory-footer">Once you understand this, use the control panel to introduce noise, distance, or an eavesdropper to explore realistic behaviour.</p>
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
  title="Disabled in Experiment 1 (teaching mode)"
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
  title="Disabled in Experiment 1 (teaching mode)"
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
  title="Disabled in Experiment 1 (teaching mode)"
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
  forceMatchBases={true} /* force matching for Experiment 1 teaching mode */
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
          <QBERLine sentTransmissions={sentTransmissions} totalPlanned={stats.totalPlanned} showFormula={false} />
        </div>
      </section>
    </div>
  );
}
