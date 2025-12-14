// src/QuantumChannelLogic.js
// Core BB84 mock state + helpers that support Eve, noise and loss

// --- CORE BB84 MOCK STATE & LOGIC ---
export const BB84 = {
  keyLength: 0,
  quantumData: [],
  siftingIndices: [],
};

export const BASES = ['+', '×'];

export const POLARIZATION_MAP = {
  '+0': '→',
  '+1': '↑',
  '×0': '↗',
  '×1': '↖',
};

export const ANGLE_MAP = {
  '+0': '0°',
  '+1': '90°',
  '×0': '45°',
  '×1': '135°',
};

// Timing constants (tweakable)
export const PHOTON_PREP_TIME_MS = 750;
export const DURATION_ENCODER_TO_RECEIVER = 3000;
export const DISTANCE_RATIO_E_TO_D = 50 / 70;
export const DELAY_TO_BOB_DETECTOR = Math.round(DURATION_ENCODER_TO_RECEIVER * DISTANCE_RATIO_E_TO_D);

export const ANIMATION_POSITIONS = {
  ALICE_START: '5%',
  ALICE_ENCODER: '25%',
  BOB_DETECTOR: '75%',
  BOB_RECEIVER: '95%',
};

export function randomBit() {
  return Math.floor(Math.random() * 2);
}

export function randomBasis() {
  return BASES[Math.floor(Math.random() * BASES.length)];
}

/*
  measureQubit(aliceBit, aliceBasis, bobBasis, options)
  options: { eveProb: 0-100, channelNoisePercent: 0-100, distanceKm: number }
  Returns object:
    { measured: 0|1|null, reason: 'measured'|'lost', eveHappened: boolean, eveBasis: '+/×' | null }
*/
export function measureQubit(aliceBit, aliceBasis, bobBasis, options = {}) {
  const {
    eveProb = 0,
    channelNoisePercent = 0,
    distanceKm = 0,
  } = options;

  // Loss model (simple): probability increases with distance (clamped)
  // e.g. distance 200 => lossProb 0.9 (clamped)
  const lossProb = Math.min(0.9, Math.max(0, distanceKm / 200));
  if (Math.random() < lossProb) {
    return { measured: null, reason: 'lost', eveHappened: false, eveBasis: null };
  }

  // Eve intercept-resend
  let eveHappened = false;
  let eveBasis = null;
  let stateAfterEve = { bit: aliceBit, basis: aliceBasis };

  if (Math.random() < (eveProb / 100)) {
    eveHappened = true;
    eveBasis = randomBasis();
    const eveMeasured = (eveBasis === aliceBasis) ? aliceBit : randomBit();
    // Eve resends in her basis the measured bit
    stateAfterEve = { bit: eveMeasured, basis: eveBasis };
  }

  // Bob measurement
  let bobMeasured;
  if (bobBasis === stateAfterEve.basis) bobMeasured = stateAfterEve.bit;
  else bobMeasured = randomBit();

  // Channel noise may flip the measured bit
  if (Math.random() < (channelNoisePercent / 100)) {
    bobMeasured = 1 - bobMeasured;
  }

  return { measured: bobMeasured, reason: 'measured', eveHappened, eveBasis };
}

// Minimal visual update (kept intentionally simple)
export function updatePhotonVisuals(el, polarizationState) {
  if (!el) return;
  el.style.transform = 'translateY(-50%)';
}

// Simple animator returning a Promise
export function animatePhoton(photonElement, targetLeft, duration) {
  return new Promise((resolve) => {
    if (!photonElement || !photonElement.style) return resolve();
    photonElement.style.transition = 'left ' + duration + 'ms linear, opacity 0.3s ease-out';
    // force reflow
    // eslint-disable-next-line no-unused-expressions
    photonElement.offsetHeight;
    photonElement.style.left = targetLeft;
    setTimeout(resolve, duration + 40);
  });
}

// Old DOM helper kept for compatibility but NOT relied upon as canonical source
export function updateQuantumTable(data) {
  const body = document.getElementById('quantum-table-body');
  if (!body) return;
  const row = body.insertRow(-1);
  const match = (data.aBasis === data.bBasis);
  const matchColor = match ? 'text-success-green' : 'text-danger-red';
  const matchText = match ? '✔' : '✘';
  const displayIndex = data.index || '';
  row.innerHTML = `
    <td>${displayIndex}</td>
    <td class="text-red-600">${data.aBit}</td>
    <td class="text-red-600">${data.aBasis}</td>
    <td class="text-green-600">${data.bBasis}</td>
    <td class="text-green-600">${data.bMeas === null ? '—' : data.bMeas}</td>
    <td class="${matchColor}">${data.bMeas === null ? '—' : matchText}</td>
  `;
  row.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

export function updateUIOnCompletion() {
  const statusEl = document.getElementById('transmission-status');
  if (statusEl) statusEl.textContent = 'Transmission complete! Proceed to classical channel.';
  const btnNext = document.getElementById('btn-send-photon');
  const btnBurst = document.getElementById('btn-send-burst');
  if (btnNext) btnNext.disabled = true;
  if (btnBurst) btnBurst.disabled = true;
}

/*
 initializeProtocol(n)
 - sets BB84.keyLength = n (if provided)
 - generates BB84.quantumData with independent Alice/Bob bases
*/
export function initializeProtocol(n = undefined) {
  if (typeof n === 'number' && n >= 0) BB84.keyLength = n;
  if (!BB84.keyLength || BB84.keyLength <= 0) {
    BB84.quantumData = [];
    return;
  }
  BB84.quantumData = [];
  for (let i = 0; i < BB84.keyLength; i++) {
    const aBit = randomBit();
    const aBasis = randomBasis();
    const bBasis = randomBasis(); // independent by design
    BB84.quantumData.push({
      index: i + 1,
      aBit,
      aBasis,
      bBasis,
      bMeas: null,
      match: null,
    });
  }
}

export function getStats(data) {
  if (!Array.isArray(data)) return { total: 0, matches: 0, errors: 0, qber: "0.00" };
  const matches = data.filter(d => d.match);
  const errors = matches.filter(d => d.aBit !== d.bMeas);
  return {
    total: data.length,
    matches: matches.length,
    errors: errors.length,
    qber: matches.length ? ((errors.length / matches.length) * 100).toFixed(2) : "0.00",
  };
}

export function getSiftedKey(data) {
  if (!Array.isArray(data)) return '';
  return data.filter(d => d.match).map(d => (typeof d.bMeas !== 'undefined' ? d.bMeas : '')).join('');
}
