// src/QuantumChannelB92.js
// Dedicated B92 Channel Component replicating the exact main UI/CSS design layout

import React, { useEffect, useState, useRef, useCallback } from "react";
import "./QuantumChannel.css";
import {
  BB84,
  POLARIZATION_MAP,
  ANGLE_MAP,
  PHOTON_PREP_TIME_MS,
  DURATION_ENCODER_TO_RECEIVER,
  ANIMATION_POSITIONS,
  measureQubit,
  updatePhotonVisuals,
  animatePhoton,
  updateUIOnCompletion,
  initializeProtocol,
} from "./QuantumChannelLogicB92";

function QuantumChannelB92({
  numPhotons = 16,
  eveLevel = 0,
  channelNoisePercent = 0,
  channelDistanceKm = 0,
  onMeasured = () => { },
  registerControls = () => { },
  forceMatchBases = false, // In B92, this forces Bob to select the click-conclusive filter configuration
  eveEnabled = false,
  eveInterceptPercent = 30,
  eveBasisMode = "random",
}) {
  const [quantumData, setQuantumData] = useState([]);
  const [currentPhotonIndex, setCurrentPhotonIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sentTransmissions, setSentTransmissions] = useState([]);
  const flowRef = useRef(null);

  const SLOW_FACTOR = 2.2;

  // ---------------- Initialization ----------------
  useEffect(() => {
    try {
      initializeProtocol(numPhotons);
    } catch (e) {
      // ignore
    }

    if (typeof BB84 !== "undefined" && Array.isArray(BB84.quantumData) && BB84.keyLength === numPhotons) {
      setQuantumData(BB84.quantumData.map((d) => ({ ...d })));
    }

    setSentTransmissions([]);
    setCurrentPhotonIndex(0);
    setIsAnimating(false);
    clearFlow();

    const status = document.getElementById("transmission-status");
    if (status) status.textContent = `B92 Channel (N=${numPhotons}) initialized. Ready — 0 photons sent.`;
  }, [numPhotons, forceMatchBases]);

  // ---------------- Register controls for parent ----------------
  useEffect(() => {
    const controls = {
      sendPhoton,
      sendBurst,
      clearFlow,
      replayPhotonAnimation,
      getState: () => ({ currentPhotonIndex, quantumData, sentTransmissions }),
    };
    try {
      registerControls(controls);
    } catch (e) {
      // ignore
    }
  }, [quantumData, currentPhotonIndex, sentTransmissions, isAnimating]);

  // ---------------- Utilities ----------------
  const clearFlow = useCallback(() => {
    const flow = document.getElementById("quantum-channel-flow");
    if (!flow) return;
    Array.from(flow.querySelectorAll(".photon")).forEach((p) => p.remove());

    const det = document.getElementById("eve-detector-box");
    const reenc = document.getElementById("eve-reencoder-box");
    const badge = document.getElementById("eve-active-badge");
    if (det) det.classList.remove("active");
    if (reenc) reenc.classList.remove("active");
    if (badge) badge.textContent = "INACTIVE";
  }, []);

  const _chance = (p) => Math.random() * 100 < p;
  const _chooseEveFilter = () => {
    if (eveBasisMode === "+") return "+";
    if (eveBasisMode === "x" || eveBasisMode === "×") return "×";
    return Math.random() < 0.5 ? "+" : "×";
  };

  function setEveDeviceBasis(detectorBasis, reencoderBasis) {
    try {
      const det = document.getElementById("eve-detector-box");
      const reenc = document.getElementById("eve-reencoder-box");
      if (det) det.setAttribute("data-basis", detectorBasis);
      if (reenc) reenc.setAttribute("data-basis", reencoderBasis);
    } catch (e) { }
  }

  function setEveActiveBadge(active, labelText = null) {
    try {
      const badge = document.getElementById("eve-active-badge");
      if (!badge) return;
      badge.textContent = labelText || (active ? "ACTIVE" : "INACTIVE");
      if (active) {
        badge.style.background = "rgba(255,80,80,0.12)";
        badge.style.color = "#fff";
        badge.style.border = "1px solid rgba(255,80,80,0.22)";
      } else {
        badge.style.background = "rgba(255,255,255,0.04)";
        badge.style.color = "#fff";
        badge.style.border = "none";
      }
    } catch (e) { }
  }

  async function pulseEveDevice(deviceId, activeForMs = 400) {
    try {
      const el = document.getElementById(deviceId);
      if (!el) return;
      el.classList.add("active");
      await new Promise((r) => setTimeout(r, activeForMs));
      el.classList.remove("active");
    } catch (e) { }
  }

  const pushMeasuredRow = useCallback(
    (data) => {
      const snapshot = {
        index: data.index,
        aBit: data.aBit,
        aBasis: data.aBasis, // Mapped to State symbol
        eveIntercepted: data.eveIntercepted || false,
        eveBasis: typeof data.eveBasis !== "undefined" ? data.eveBasis : "—",
        eveMeas: typeof data.eveMeas !== "undefined" ? data.eveMeas : "—",
        eveResendBit: typeof data.eveResendBit !== "undefined" ? data.eveResendBit : "—",
        bBasis: data.bBasis, // Bob's filter angle configuration
        bMeas: data.bMeas,  // Outcome bit or "Erasure" text
        match: data.match,  // Conclusive vs Inconclusive tracking flag
        isError: data.isError,
      };

      setSentTransmissions((prev) => [...prev, snapshot]);
      try {
        onMeasured(snapshot);
      } catch (e) { }

      const status = document.getElementById("transmission-status");
      if (status) {
        status.textContent = `Sent ${snapshot.index}/${BB84.keyLength || quantumData.length} · Alice State: ${snapshot.aBasis} → Bob Filter: ${snapshot.bBasis} = ${snapshot.bMeas}`;
      }
    },
    [onMeasured, quantumData.length]
  );

  // ---------------- Core: sendPhoton ----------------
  async function sendPhoton() {
    if (!quantumData || currentPhotonIndex >= quantumData.length || isAnimating) {
      if (currentPhotonIndex >= quantumData.length) updateUIOnCompletion();
      return;
    }

    setIsAnimating(true);
    const btnNext = document.getElementById("btn-send-photon");
    const btnBurst = document.getElementById("btn-send-burst");
    if (btnNext) btnNext.disabled = true;
    if (btnBurst) btnBurst.disabled = true;

    const entry = { ...quantumData[currentPhotonIndex] };
    const flowContainer = document.getElementById("quantum-channel-flow");

    const polarizationState = POLARIZATION_MAP[entry.aBasis + entry.aBit];
    const polarizationAngle = ANGLE_MAP[entry.aBasis + entry.aBit];

    const alicePol = document.getElementById("alice-polarizer");
    const bobPol = document.getElementById("bob-polarizer");
    if (alicePol) alicePol.setAttribute("data-basis", entry.aBasis);
    if (bobPol) bobPol.setAttribute("data-basis", entry.bBasis);

    const photon = document.createElement("div");
    photon.className = "photon";
    photon.id = "photon-" + entry.index;
    photon.textContent = polarizationState;
    photon.style.left = ANIMATION_POSITIONS.ALICE_START;

    const angleDisplay = document.createElement("div");
    angleDisplay.className = "photon-angle";
    angleDisplay.textContent = polarizationAngle;
    photon.appendChild(angleDisplay);

    updatePhotonVisuals(photon, polarizationState);
    if (flowContainer) flowContainer.appendChild(photon);

    try {
      await new Promise((r) => setTimeout(r, 50));

      await animatePhoton(photon, ANIMATION_POSITIONS.ALICE_ENCODER, PHOTON_PREP_TIME_MS * SLOW_FACTOR);

      // Eve Intercept-Resend Calculations Matrix
      let eveIntercepted = false;
      let eveBasis = undefined;
      let eveMeas = undefined;
      let eveResendBit = undefined;

      if (eveEnabled && _chance(eveInterceptPercent)) {
        eveIntercepted = true;
        eveBasis = _chooseEveFilter();
        const eveResult = measureQubit(entry.aBit, entry.aBasis, eveBasis, { eveProb: 100, channelNoisePercent, distanceKm: channelDistanceKm });

        eveMeas = eveResult.measured;
        eveResendBit = eveMeas;
      } else {
        eveIntercepted = false;
        eveBasis = "—";
        eveMeas = "—";
        eveResendBit = entry.aBit;
      }

      if (eveIntercepted) {
        setEveDeviceBasis(eveBasis || "+", eveBasis || "+");
        setEveActiveBadge(true, "ACTIVE");
        await pulseEveDevice("eve-detector-box", 200);
        await pulseEveDevice("eve-reencoder-box", 260);
        setTimeout(() => setEveActiveBadge(false), 520);
      } else {
        setEveDeviceBasis("+", "+");
        setEveActiveBadge(false, "INACTIVE");
        pulseEveDevice("eve-detector-box", 140).catch(() => { });
      }

      await animatePhoton(photon, ANIMATION_POSITIONS.BOB_RECEIVER, DURATION_ENCODER_TO_RECEIVER * SLOW_FACTOR);

      // Execute Bob Analyzer Filter Measurement
      const bobResult = measureQubit(eveResendBit, entry.aBasis, entry.bBasis, {
        eveProb: 0,
        channelNoisePercent,
        distanceKm: channelDistanceKm,
      });

      if (bobResult.reason === "lost") {
        entry.bMeas = "Lost";
        entry.match = false;
        photon.textContent = "✖";
        angleDisplay.textContent = "";
      } else if (bobResult.measured === null) {
        entry.bMeas = "Erasure";
        entry.match = false;
        photon.textContent = "∅";
        angleDisplay.textContent = "Blocked";
      } else {
        entry.bMeas = bobResult.measured;
        entry.match = true;
      }

      setQuantumData((prev) => {
        const copy = prev.map((p) => ({ ...p }));
        copy[currentPhotonIndex] = { ...copy[currentPhotonIndex], bMeas: entry.bMeas, match: entry.match, bBasis: entry.bBasis };
        return copy;
      });

      pushMeasuredRow({
        ...entry,
        eveIntercepted,
        eveBasis: eveBasis === "+" ? "90° Filter" : (eveBasis === "×" ? "-45° Filter" : "—"),
        eveMeas,
        eveResendBit,
      });

      photon.style.transition = "opacity 0.3s ease-out";
      photon.style.opacity = "0";
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(err);
    } finally {
      if (photon && photon.parentNode === flowContainer) flowContainer.removeChild(photon);
      const newIndex = currentPhotonIndex + 1;
      setCurrentPhotonIndex(newIndex);
      setIsAnimating(false);

      if (newIndex < quantumData.length) {
        if (btnNext) btnNext.disabled = false;
        if (btnBurst) btnBurst.disabled = false;
      } else {
        updateUIOnCompletion();
      }
    }
  }

  // ---------------- Burst: sendBurst ----------------
  function sendBurst() {
    if (!quantumData) return;
    const start = currentPhotonIndex;
    if (start >= quantumData.length) {
      updateUIOnCompletion();
      return;
    }

    const newData = quantumData.map((d) => ({ ...d }));
    const snapshots = [];

    for (let i = start; i < newData.length; i++) {
      const d = newData[i];

      let eveIntercepted = false;
      let eveBasis = "—";
      let eveMeas = "—";
      let eveResendBit = d.aBit;

      if (eveEnabled && _chance(eveInterceptPercent)) {
        eveIntercepted = true;
        eveBasis = _chooseEveFilter();
        const eveResult = measureQubit(d.aBit, d.aBasis, eveBasis, { eveProb: 100, channelNoisePercent, distanceKm: channelDistanceKm });
        eveMeas = eveResult.measured;
        eveResendBit = eveMeas;
      }

      const res = measureQubit(eveResendBit, d.aBasis, d.bBasis, { eveProb: 0, channelNoisePercent, distanceKm: channelDistanceKm });

      if (res.reason === "lost") {
        d.bMeas = "Lost";
        d.match = false;
      } else if (res.measured === null) {
        d.bMeas = "Erasure";
        d.match = false;
      } else {
        d.bMeas = res.measured;
        d.match = true;
      }

      snapshots.push({
        index: d.index,
        aBit: d.aBit,
        aBasis: d.aBasis,
        eveIntercepted,
        eveBasis: eveBasis === "+" ? "90° Filter" : (eveBasis === "×" ? "-45° Filter" : "—"),
        eveMeas,
        eveResendBit,
        bBasis: d.bBasis,
        bMeas: d.bMeas,
        match: d.match,
      });
    }

    setQuantumData(newData);
    setSentTransmissions((prev) => [...prev, ...snapshots]);
    snapshots.forEach((s) => onMeasured(s));
    setCurrentPhotonIndex(newData.length);
    updateUIOnCompletion();
  }

  function replayPhotonAnimation(index) {
    // Left completely safe & abstract to stay un-breaking
  }

  return (
    <div className="mock-container">
      <div className="quantum-channel-section">
        <div className="channel-title">QUANTUM CHANNEL (B92 MODE)</div>
        <div className="quantum-channel-container">
          <div className="quantum-channel-flow" id="quantum-channel-flow" ref={flowRef}>
            <div className="flow-station" style={{ left: "5%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 4 }}>
              <div className="channel-label-stack"><span className="font-bold text-lg">ALICE</span><br /><span className="text-xs text-gray-500">(Source)</span></div>
            </div>

            <div id="alice-polarizer" className="polarizer flow-station" data-basis="+" style={{ position: "absolute", left: "25%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 6 }}>
              <div className="polarizer-label-stack" style={{ position: "absolute", top: "-48px", left: "50%", transform: "translateX(-50%)" }}>
                <span className="polarizer-label-text">Alice's</span><span className="polarizer-label-text">State Encoder</span>
              </div>
            </div>

            <div className="flow-station" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 5, pointerEvents: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 8 }}>
                  <div id="eve-detector-box" className="polarizer eve-device" data-basis="+" />
                  <div className="eve-sub-label">Detector</div>
                </div>
                <div className="eve-center-label" style={{ fontWeight: 900, color: "#fff", fontSize: 16, textAlign: "center" }}>
                  EVE
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 8 }}>
                  <div id="eve-reencoder-box" className="polarizer eve-device" data-basis="×" />
                  <div className="eve-sub-label">Re-encoder</div>
                </div>
              </div>
            </div>

            <div id="bob-polarizer" className="polarizer flow-station" data-basis="+" style={{ position: "absolute", left: "75%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 6 }}>
              <div className="polarizer-label-stack" style={{ position: "absolute", top: "-48px", left: "50%", transform: "translateX(-50%)" }}>
                <span className="polarizer-label-text">Bob's</span><span className="polarizer-label-text">Analysis Filter</span>
              </div>
            </div>

            <div className="flow-station" style={{ left: "95%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 4 }}>
              <div className="channel-label-stack"><span className="font-bold text-lg">BOB</span><br /><span className="text-xs text-gray-500">(Receiver)</span></div>
            </div>
            <div className="photon-track" style={{ top: "50%" }}></div>
          </div>
        </div>
      </div>

      <div className="action-section" style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
        <button className="btn btn-primary" id="btn-send-photon" onClick={sendPhoton}>Send Next Photon</button>
        <button className="btn btn-warning" id="btn-send-burst" onClick={sendBurst}>Send All Photons</button>
      </div>

      {/* SIMPLIFIED TRANSMISSION DATA MATRIX FOR STUDENTS */}
      <div className="table-responsive" style={{ marginTop: "18px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Photon </th>
              <th>Alice Sent</th>
              <th>Eve Setup</th>
              <th>Eve Result</th>
              <th>Bob's Filter Checked For</th>
              <th>Bob's Detector Status</th>
              <th>Key Result</th>
            </tr>
          </thead>
          <tbody>
            {sentTransmissions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", opacity: 0.7 }}>
                  No photons sent yet. Use "Send Next Photon" or "Send All Photons" to start!
                </td>
              </tr>
            ) : (
              sentTransmissions.map((r) => {
                const isBlocked = r.bMeas === "Erasure" || r.bMeas === "Lost";

                return (
                  <tr key={r.index}>
                    <td>{r.index}</td>

                    {/* Alice's Prepared State */}
                    <td>
                      {r.aBasis === "+" ? "Bit 0 (0° State)" : "Bit 1 (45° State)"}
                    </td>

                    {/* Eavesdropper Telemetry */}
                    <td>{r.eveIntercepted ? r.eveBasis : "—"}</td>
                    <td>
                      {r.eveIntercepted
                        ? (r.eveMeas === null || r.eveMeas === "Erasure" ? "Blocked" : `Bit ${r.eveMeas}`)
                        : "—"}
                    </td>

                    {/* --- Bob's Analyzer Action Mapped Correctly to B92 Physics --- */}
                    <td>
                      {r.bBasis === "+" ? "Bit 0 (90° Filter)" : "Bit 1 (-45° Filter)"}
                    </td>

                    {/* Simplified Telemetry Status */}
                    <td style={{
                      fontWeight: 700,
                      color: isBlocked ? "#ef4444" : "#10b981"
                    }}>
                      {isBlocked ? " Silent (Blocked)" : " CLICK!"}
                    </td>

                    {/* Definitive Sifting Action */}
                    <td style={{
                      fontWeight: 700,
                      color: isBlocked ? "rgba(255,255,255,0.4)" : "#fff"
                    }}>
                      {isBlocked ? "Dropped (Trash)" : `Saved (Bit ${r.bMeas})`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuantumChannelB92;