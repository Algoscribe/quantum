// src/QuantumChannel.js
// Complete, copy-paste-ready component with visible transmission table + in-channel Eve (detector + re-encoder).
// Behavior:
// - numPhotons prop controls number of photons
// - Alice & Bob bases independent unless `forceMatchBases` is true
// - Photon visual remains Alice's prepared state while in-flight; measurement happens AFTER arrival
// - Table shows only measured/sent photons (sentTransmissions) and updates in real-time
// - Clicking a table row replays the animation for that photon (non-destructive)
// - NEW: Eve visuals + intercept-resend simulated in-channel when eveEnabled is true

import React, { useEffect, useState, useRef, useCallback } from "react";
import "./QuantumChannel.css";
import {
  BB84,
  POLARIZATION_MAP,
  ANGLE_MAP,
  PHOTON_PREP_TIME_MS,
  DURATION_ENCODER_TO_RECEIVER,
  DELAY_TO_BOB_DETECTOR,
  ANIMATION_POSITIONS,
  measureQubit,
  updatePhotonVisuals,
  animatePhoton,
  updateQuantumTable,
  updateUIOnCompletion,
  initializeProtocol,
} from "./QuantumChannelLogic";

function QuantumChannel({
  numPhotons = 16,
  eveLevel = 0, // legacy; kept for backwards compatibility
  channelNoisePercent = 0,
  channelDistanceKm = 0,
  onMeasured = () => { },
  registerControls = () => { },
  forceMatchBases = false, // when true, Bob's basis = Alice's basis
  // NEW props for Eve behavior & visuals
  eveEnabled = false,
  eveInterceptPercent = 30, // 0..100
  eveBasisMode = "random", // "random" | "+" | "×" or "x"
}) {
  const [quantumData, setQuantumData] = useState([]);
  const [currentPhotonIndex, setCurrentPhotonIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sentTransmissions, setSentTransmissions] = useState([]);
  const flowRef = useRef(null);

  // animation speed factor
  const SLOW_FACTOR = 2.2;

  // ---------------- Initialization ----------------
  useEffect(() => {
    try {
      initializeProtocol(numPhotons);
    } catch (e) {
      // ignore if init doesn't accept arg
    }

    if (typeof BB84 !== "undefined" && Array.isArray(BB84.quantumData) && BB84.keyLength === numPhotons) {
      setQuantumData(BB84.quantumData.map((d) => ({ ...d })));
    } else {
      const local = [];
      for (let i = 0; i < numPhotons; i++) {
        const aBit = Math.floor(Math.random() * 2);
        const aBasis = Math.random() < 0.5 ? "+" : "×";
        const bBasis = forceMatchBases ? aBasis : (Math.random() < 0.5 ? "+" : "×");
        local.push({
          index: i + 1,
          aBit,
          aBasis,
          bBasis,
          bMeas: null,
          match: null,
          isError: false,
        });
      }
      if (typeof BB84 !== "undefined") {
        BB84.keyLength = numPhotons;
        BB84.quantumData = local.map((c) => ({ ...c }));
      }
      setQuantumData(local);
    }

    setSentTransmissions([]);
    setCurrentPhotonIndex(0);
    setIsAnimating(false);
    clearFlow();

    const status = document.getElementById("transmission-status");
    if (status) status.textContent = `Channel (N=${numPhotons}) initialized. Ready — 0 photons sent.`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantumData, currentPhotonIndex, sentTransmissions, isAnimating]);

  // ---------------- Utilities ----------------
  const clearFlow = useCallback(() => {
    const flow = document.getElementById("quantum-channel-flow");
    if (!flow) return;
    Array.from(flow.querySelectorAll(".photon")).forEach((p) => p.remove());

    // Reset Eve visuals if present
    const det = document.getElementById("eve-detector-box");
    const reenc = document.getElementById("eve-reencoder-box");
    const badge = document.getElementById("eve-active-badge");
    if (det) det.classList.remove("active");
    if (reenc) reenc.classList.remove("active");
    if (badge) badge.textContent = "INACTIVE";
  }, []);

  const _chance = (p) => Math.random() * 100 < p;
  const _chooseEveBasis = () => {
    if (eveBasisMode === "+") return "+";
    if (eveBasisMode === "x" || eveBasisMode === "×") return "×";
    return Math.random() < 0.5 ? "+" : "×";
  };

  // ---------------- Eve UI helpers ----------------
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
    } catch (e) {
      // ignore
    }
  }

  // ---------------- push snapshot to table & parent ----------------
  const pushMeasuredRow = useCallback(
    (data) => {
      const snapshot = {
        index: data.index,
        aBit: data.aBit,
        aBasis: data.aBasis,
        // Eve fields (may be absent)
        eveIntercepted: data.eveIntercepted || false,
        eveBasis: typeof data.eveBasis !== "undefined" ? data.eveBasis : "—",
        eveMeas: typeof data.eveMeas !== "undefined" ? data.eveMeas : "—",
        eveResendBit: typeof data.eveResendBit !== "undefined" ? data.eveResendBit : "—",
        eveResendBasis: typeof data.eveResendBasis !== "undefined" ? data.eveResendBasis : "—",
        // Bob fields
        bBasis: data.bBasis,
        bMeas: data.bMeas,
        match: data.match,
        isError: data.isError,
      };

      setSentTransmissions((prev) => [...prev, snapshot]);
      try {
        onMeasured(snapshot);
      } catch (e) {
        // ignore
      }
      try {
        updateQuantumTable(data, false);
      } catch (e) {
        // ignore
      }

      const status = document.getElementById("transmission-status");
      if (status) {
        status.textContent = `Sent ${snapshot.index}/${BB84.keyLength || quantumData.length} · Alice:${snapshot.aBasis}${snapshot.aBit} → Bob:${snapshot.bBasis} = ${snapshot.bMeas === null ? "—" : snapshot.bMeas} (${snapshot.match ? "match" : "mismatch"})`;
      }
    },
    [onMeasured, quantumData.length]
  );

  // ---------------- Core: sendPhoton (with Eve intercept-resend) ----------------
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

    if (forceMatchBases) {
      entry.bBasis = entry.aBasis;
    }

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
      const status1 = document.getElementById("transmission-status");
      if (status1) status1.textContent = `Photon ${entry.index}: prepared in ${polarizationAngle} (Alice ${entry.aBasis})`;

      // animate to encoder
      await animatePhoton(photon, ANIMATION_POSITIONS.ALICE_ENCODER, PHOTON_PREP_TIME_MS * SLOW_FACTOR);

      // Decide Eve intercept BEFORE travel to BobReceiver
      let eveIntercepted = false;
      let eveBasis = undefined;
      let eveMeas = undefined;
      let eveResendBit = undefined;
      let eveResendBasis = undefined;

      if (eveEnabled && _chance(eveInterceptPercent)) {
        eveIntercepted = true;
        eveBasis = _chooseEveBasis();

        // Use measureQubit for Eve's measurement (no extra eveProb)
        const eveResult = typeof measureQubit === "function"
          ? measureQubit(entry.aBit, entry.aBasis, eveBasis, {
            eveProb: 0,
            channelNoisePercent,
            distanceKm: channelDistanceKm,
          })
          : null;

        if (eveResult && eveResult.reason === "lost") {
          eveMeas = null;
          eveResendBit = null;
          eveResendBasis = eveBasis;
        } else if (eveResult) {
          eveMeas = eveResult.measured;
          eveResendBit = eveMeas;
          eveResendBasis = eveBasis;
        } else {
          // fallback
          eveMeas = eveBasis === entry.aBasis ? entry.aBit : (Math.random() < 0.5 ? 0 : 1);
          eveResendBit = eveMeas;
          eveResendBasis = eveBasis;
        }
      } else {
        // No Eve intercept: photon continues with original state
        eveIntercepted = false;
        eveBasis = "—";
        eveMeas = "—";
        eveResendBit = entry.aBit;
        eveResendBasis = entry.aBasis;
      }

      // Update Eve device bases & badge, animate detector/re-encoder
      if (eveIntercepted) {
        setEveDeviceBasis(eveBasis || "+", eveResendBasis || eveBasis || "+");
        setEveActiveBadge(true, "ACTIVE");
        // await sequential pulses so UI shows detector then re-encoder
        await pulseEveDevice("eve-detector-box", 200);
        await pulseEveDevice("eve-reencoder-box", 260);
        // keep badge briefly then reset
        setTimeout(() => setEveActiveBadge(false), 520);
      } else {
        // show default basis as passthrough (Alice basis), subtle pulse on detector
        setEveDeviceBasis("+", "+"); // neutral default

        setEveActiveBadge(false, "INACTIVE");
        pulseEveDevice("eve-detector-box", 140).catch(() => { });
      }

      // traveling status
      const status2 = document.getElementById("transmission-status");
      if (status2) status2.textContent = `Photon ${entry.index}: traveling to Bob...`;

      // animate full travel to Bob; measurement AFTER arrival
      await animatePhoton(photon, ANIMATION_POSITIONS.BOB_RECEIVER, DURATION_ENCODER_TO_RECEIVER * SLOW_FACTOR);

      // Now Bob measures the (possibly resent) photon
      let bobResult;
      try {
        bobResult = typeof measureQubit === "function"
          ? measureQubit(eveResendBit, eveResendBasis, entry.bBasis, {
            eveProb: 0,
            channelNoisePercent,
            distanceKm: channelDistanceKm,
          })
          : null;
      } catch (err) {
        bobResult = null;
      }

      if (bobResult && bobResult.reason === "lost") {
        entry.bMeas = null;
        entry.match = false;
        entry.isError = false;
        photon.textContent = "✖";
        angleDisplay.textContent = "";
        updatePhotonVisuals(photon, "✖");
        const statusLost = document.getElementById("transmission-status");
        if (statusLost) statusLost.textContent = `Photon ${entry.index}: lost in channel.`;
      } else {
        entry.bMeas = bobResult && typeof bobResult.measured !== "undefined" ? bobResult.measured : (entry.aBit);
        entry.match = entry.aBasis === entry.bBasis;
        entry.isError = entry.match && entry.aBit !== entry.bMeas;
        const status3 = document.getElementById("transmission-status");
        if (status3) status3.textContent = `Photon ${entry.index}: Bob measured ${entry.bMeas} (basis ${entry.bBasis})`;
      }

      // commit measurement
      setQuantumData((prev) => {
        const copy = prev.map((p) => ({ ...p }));
        copy[currentPhotonIndex] = { ...copy[currentPhotonIndex], bMeas: entry.bMeas, match: entry.match, isError: entry.isError, bBasis: entry.bBasis };
        if (typeof BB84 !== "undefined") BB84.quantumData = copy.map((c) => ({ ...c }));
        return copy;
      });

      // extended snapshot with Eve fields
      const extendedData = {
        ...entry,
        eveIntercepted,
        eveBasis,
        eveMeas,
        eveResendBit,
        eveResendBasis,
      };

      // push the snapshot so table shows it
      pushMeasuredRow(extendedData);

      photon.style.transition = "opacity 0.3s ease-out";
      photon.style.opacity = "0";
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error("sendPhoton error:", err);
      const statusErr = document.getElementById("transmission-status");
      if (statusErr) statusErr.textContent = "Error during transmission. See console.";
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

  // ---------------- Burst (simulate Eve but keep visuals non-blocking) ----------------
  function sendBurst() {
    if (!quantumData) return;
    const start = currentPhotonIndex;
    if (start >= quantumData.length) {
      updateUIOnCompletion();
      return;
    }

    const btnNext = document.getElementById("btn-send-photon");
    const btnBurst = document.getElementById("btn-send-burst");
    if (btnNext) btnNext.disabled = true;
    if (btnBurst) btnBurst.disabled = true;

    const newData = quantumData.map((d) => ({ ...d }));
    const snapshots = [];

    for (let i = start; i < newData.length; i++) {
      const d = newData[i];

      if (forceMatchBases) {
        d.bBasis = d.aBasis;
      }

      // Eve simulation (non-blocking visual)
      let eveIntercepted = false;
      let eveBasis = "—";
      let eveMeas = "—";
      let eveResendBit = d.aBit;
      let eveResendBasis = d.aBasis;

      if (eveEnabled && _chance(eveInterceptPercent)) {
        eveIntercepted = true;
        eveBasis = _chooseEveBasis();
        const eveResult = typeof measureQubit === "function"
          ? measureQubit(d.aBit, d.aBasis, eveBasis, { eveProb: 0, channelNoisePercent, distanceKm: channelDistanceKm })
          : null;

        if (eveResult && eveResult.reason === "lost") {
          eveMeas = null;
          eveResendBit = null;
          eveResendBasis = eveBasis;
        } else if (eveResult) {
          eveMeas = eveResult.measured;
          eveResendBit = eveMeas;
          eveResendBasis = eveBasis;
        } else {
          eveMeas = eveBasis === d.aBasis ? d.aBit : (Math.random() < 0.5 ? 0 : 1);
          eveResendBit = eveMeas;
          eveResendBasis = eveBasis;
        }

        // non-blocking visual cue: set bases and pulse asynchronously
        setEveDeviceBasis(eveBasis || "+", eveResendBasis || eveBasis || "+");
        setEveActiveBadge(true, "ACTIVE");
        pulseEveDevice("eve-detector-box", 160).catch(() => { });
        setTimeout(() => pulseEveDevice("eve-reencoder-box", 160).catch(() => { }), 140);
        setTimeout(() => setEveActiveBadge(false), 420);
      } else {
        // no intercept — subtle detector pulse
        setEveDeviceBasis(d.aBasis, d.aBasis);
        setEveActiveBadge(false, "INACTIVE");
        pulseEveDevice("eve-detector-box", 120).catch(() => { });
      }

      // Bob's measurement after (possibly) Eve resent
      let res = null;
      if (typeof measureQubit === "function") {
        try {
          res = measureQubit(eveResendBit, eveResendBasis, d.bBasis, { eveProb: 0, channelNoisePercent, distanceKm: channelDistanceKm });
        } catch (e) {
          res = null;
        }
      }

      if (res && res.reason === "lost") {
        d.bMeas = null;
        d.match = false;
        d.isError = false;
      } else if (res) {
        d.bMeas = res.measured;
        d.match = d.aBasis === d.bBasis;
        d.isError = d.match && d.aBit !== d.bMeas;
      } else {
        d.bMeas = d.aBit;
        d.match = d.aBasis === d.bBasis;
        d.isError = d.match && d.aBit !== d.bMeas;
      }

      snapshots.push({
        index: d.index,
        aBit: d.aBit,
        aBasis: d.aBasis,
        eveIntercepted,
        eveBasis,
        eveMeas,
        eveResendBit,
        eveResendBasis,
        bBasis: d.bBasis,
        bMeas: d.bMeas,
        match: d.match,
        isError: d.isError,
      });

      try {
        updateQuantumTable(d, true);
      } catch (e) {
        // ignore
      }
    }

    setQuantumData(newData);
    setSentTransmissions((prev) => [...prev, ...snapshots]);
    snapshots.forEach((s) => {
      try {
        onMeasured(s);
      } catch (e) { }
    });

    setCurrentPhotonIndex(newData.length);

    const status = document.getElementById("transmission-status");
    if (status) status.textContent = `All ${newData.length} photons measured (burst).`;

    if (btnNext) btnNext.disabled = false;
    if (btnBurst) btnBurst.disabled = false;
    updateUIOnCompletion();
  }

  // ---------------- Replay animation (non-destructive) ----------------
  function replayPhotonAnimation(index) {
    const entry = quantumData[index];
    if (!entry) return;
    const flowContainer = document.getElementById("quantum-channel-flow");
    if (!flowContainer) return;

    if (forceMatchBases) {
      entry.bBasis = entry.aBasis;
    }

    const polarizationState = POLARIZATION_MAP[entry.aBasis + entry.aBit];
    const polarizationAngle = ANGLE_MAP[entry.aBasis + entry.aBit];

    const alicePol = document.getElementById("alice-polarizer");
    const bobPol = document.getElementById("bob-polarizer");
    if (alicePol) alicePol.setAttribute("data-basis", entry.aBasis);
    if (bobPol) bobPol.setAttribute("data-basis", entry.bBasis);

    const photon = document.createElement("div");
    photon.className = "photon replay";
    photon.textContent = polarizationState;
    photon.style.left = ANIMATION_POSITIONS.ALICE_START;
    updatePhotonVisuals(photon, polarizationState);

    const angleDisplay = document.createElement("div");
    angleDisplay.className = "photon-angle";
    angleDisplay.textContent = polarizationAngle;
    photon.appendChild(angleDisplay);
    flowContainer.appendChild(photon);

    animatePhoton(photon, ANIMATION_POSITIONS.ALICE_ENCODER, PHOTON_PREP_TIME_MS * SLOW_FACTOR)
      .then(async () => {
        // show a replayed Eve pulse if Eve was involved originally (non-blocking)
        const intercepted = entry.eveIntercepted;

        if (intercepted) {
          setEveDeviceBasis(entry.eveBasis || _chooseEveBasis(), entry.eveResendBasis || (entry.eveBasis || _chooseEveBasis()));
          setEveActiveBadge(true, "ACTIVE");
          // visual pulses but don't block too long
          pulseEveDevice("eve-detector-box", 180).catch(() => { });
          setTimeout(() => pulseEveDevice("eve-reencoder-box", 180).catch(() => { }), 160);
          setTimeout(() => setEveActiveBadge(false), 520);
        } else {
          setEveDeviceBasis(entry.aBasis, entry.aBasis);
          setEveActiveBadge(false, "INACTIVE");
          pulseEveDevice("eve-detector-box", 120).catch(() => { });
        }

        return animatePhoton(photon, ANIMATION_POSITIONS.BOB_RECEIVER, DURATION_ENCODER_TO_RECEIVER * SLOW_FACTOR);
      })
      .then(() => {
        const result = measureQubit(entry.aBit, entry.aBasis, entry.bBasis, {
          eveProb: eveLevel,
          channelNoisePercent,
          distanceKm: channelDistanceKm,
        });

        if (result && result.reason === "lost") {
          photon.textContent = "✖";
          angleDisplay.textContent = "";
        } else {
          const measuredState = entry.bBasis + (result && typeof result.measured !== "undefined" ? result.measured : entry.bMeas);
          photon.textContent = POLARIZATION_MAP[measuredState] || photon.textContent;
          angleDisplay.textContent = ANGLE_MAP[measuredState] || angleDisplay.textContent;
        }
        updatePhotonVisuals(photon, photon.textContent);
      })
      .then(() => {
        photon.style.transition = "opacity 0.3s ease-out";
        photon.style.opacity = "0";
        return new Promise((r) => setTimeout(r, 300));
      })
      .then(() => {
        if (photon.parentNode === flowContainer) flowContainer.removeChild(photon);
      })
      .catch(() => {
        if (photon.parentNode === flowContainer) flowContainer.removeChild(photon);
      });
  }

  // ---------------- Render ----------------
  return (
    <div className="mock-container">
      <div className="quantum-channel-section">
        <div className="channel-title">QUANTUM CHANNEL</div>

        <div className="quantum-channel-container">
          <div className="quantum-channel-flow" id="quantum-channel-flow" ref={flowRef}>
            {/* ALICE label (left) */}
            <div className="flow-station" style={{ left: "5%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 4 }}>
              <div className="channel-label-stack">
                <span className="font-bold text-lg">ALICE</span>
                <br />
                <span className="text-xs text-gray-500">(Source)</span>
              </div>
            </div>

            {/* Alice polarizer — placed on dotted line (top:50%) */}
            <div
              id="alice-polarizer"
              className="polarizer flow-station"
              data-basis="+"
              style={{ position: "absolute", left: "25%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 6 }}
            >
              <div className="polarizer-label-stack" style={{ position: "absolute", top: "-48px", left: "50%", transform: "translateX(-50%)" }}>
                <span className="polarizer-label-text">Alice's</span>
                <span className="polarizer-label-text">Polarizer</span>
              </div>
            </div>

            {/* ---------------- EVE STATION (center, on the same dotted line) ---------------- */}
            <div
              className="flow-station"
              style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 5, pointerEvents: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {/* Detector (slightly above the dotted line so it doesn't occlude polarizer labels) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 8 }}>
                  <div id="eve-detector-box" className="polarizer eve-device" data-basis="+" aria-hidden />
                  <div className="eve-sub-label">Detector</div>
                </div>


                {/* EVE main label — centered between polarizers */}
                <div className="eve-center-label" style={{ fontWeight: 900, color: "#fff", fontSize: 16, textAlign: "center", pointerEvents: "none" }}>
                  EVE
                  <div style={{ fontWeight: 600, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>(Eavesdropper)</div>
                </div>

                {/* Re-encoder (slightly above the dotted line) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 8 }}>
                  <div id="eve-reencoder-box" className="polarizer eve-device" data-basis="×" aria-hidden />
                  <div className="eve-sub-label">Re-encoder</div>
                </div>

              </div>
            </div>
            {/* -------------------------------------------------------------- */}

            {/* Bob polarizer — placed on dotted line (top:50%) */}
            <div
              id="bob-polarizer"
              className="polarizer flow-station"
              data-basis="+"
              style={{ position: "absolute", left: "75%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 6 }}
            >
              <div className="polarizer-label-stack" style={{ position: "absolute", top: "-48px", left: "50%", transform: "translateX(-50%)" }}>
                <span className="polarizer-label-text">Bob's</span>
                <span className="polarizer-label-text">Polarizer</span>
              </div>
            </div>

            {/* BOB label (right) */}
            <div className="flow-station" style={{ left: "95%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 4 }}>
              <div className="channel-label-stack">
                <span className="font-bold text-lg">BOB</span>
                <br />
                <span className="text-xs text-gray-500">(Receiver)</span>
              </div>
            </div>

            {/* photon track (dotted line) */}
            <div className="photon-track" id="photon-track" style={{ top: "50%" }}></div>
          </div>
        </div>
      </div>

      <div
        className="action-section"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginTop: "16px",
        }}
      >
        <button
          className="btn btn-primary"
          id="btn-send-photon"
          onClick={sendPhoton}
          disabled={isAnimating || currentPhotonIndex >= (BB84 && BB84.keyLength ? BB84.keyLength : numPhotons)}
        >
          Send Next Photon
        </button>
        <button
          className="btn btn-warning"
          id="btn-send-burst"
          onClick={sendBurst}
          disabled={isAnimating || currentPhotonIndex >= (BB84 && BB84.keyLength ? BB84.keyLength : numPhotons)}
        >
          Send All Photons
        </button>
      </div>

      {/* VISIBLE Transmission table (now includes Eve columns) */}
      <div className="table-responsive" style={{ marginTop: "18px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Index</th>
              <th>Alice's Bit</th>
              <th>Alice's Basis</th>

              {/* Eve columns */}
              <th>Eve's Basis</th>
              <th>Eve's Meas.</th>
              <th>Eve's Resend</th>

              <th>Bob's Basis</th>
              <th>Bob's Measurement</th>
              <th>Match?</th>
            </tr>
          </thead>
          <tbody>
            {sentTransmissions.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", opacity: 0.7 }}>
                  No photons sent yet — use "Send Next Photon" or "Send All Photons".
                </td>
              </tr>
            ) : (
              sentTransmissions.map((r) => (
                <tr
                  key={r.index}
                  onClick={() => replayPhotonAnimation(r.index - 1)}
                  style={{ cursor: "pointer" }}
                  title="Click to replay this photon"
                >
                  <td>{r.index}</td>
                  <td>{r.aBit}</td>
                  <td>{r.aBasis}</td>

                  {/* UPDATED: always show Eve columns with sensible fallbacks (no more bare "—") */}
                  <td style={{ textAlign: "center" }}>
                    {r.eveIntercepted ? r.eveBasis : "—"}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {r.eveIntercepted
                      ? (r.eveMeas === null ? "✖" : r.eveMeas)
                      : "—"}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {r.eveIntercepted
                      ? (r.eveResendBit === null ? "✖" : r.eveResendBit)
                      : "—"}
                  </td>

                  <td>{r.bBasis}</td>
                  <td>{r.bMeas === null ? "—" : r.bMeas}</td>
                  <td style={{ color: r.bMeas === null ? "#999" : (r.match ? "#ffffff" : "#ffffff"), fontWeight: 700 }}>
                    {r.bMeas === null ? "—" : (r.match ? "Yes" : "No")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuantumChannel;
