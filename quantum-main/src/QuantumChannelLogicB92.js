// src/QuantumChannelLogicB92.js
// Dedicated B92 state engine translating 2-state physics into standard BB84 UI slots

export const BB84 = {
  keyLength: 0,
  quantumData: [],
};

// Map B92 choices to the exact symbols the untouched UI component renders
export const POLARIZATION_MAP = {
  '+0': '→',   // Representing B92 Bit 0 (Horizontal / 0°)
  '×0': '↗',   // Representing B92 Bit 1 (Diagonal / 45°)
  '+1': '↑',   // Fallback visualization hooks
  '×1': '↖',
};

export const ANGLE_MAP = {
  '+0': '0°',
  '×0': '45°',
  '+1': '90°',
  '×1': '135°',
};

// Timing & Animation Metrics matching the original specifications
export const PHOTON_PREP_TIME_MS = 750;
export const DURATION_ENCODER_TO_RECEIVER = 3000;
export const ANIMATION_POSITIONS = {
  ALICE_START: '5%',
  ALICE_ENCODER: '25%',
  BOB_RECEIVER: '95%',
};

export function randomBit() {
  return Math.floor(Math.random() * 2);
}

export function randomBasis() {
  return Math.random() < 0.5 ? "+" : "×";
}

/**
 * B92 Measurement Engine mapping directly to the unedited measureQubit interface
 * Alice: Bit 0 is '+0' (0°), Bit 1 is '×0' (45°)
 * Bob: '+' represents the 90° filter, '×' represents the -45° filter
 */
export function measureQubit(aliceBit, aliceBasis, bobBasis, options = {}) {
  const { eveProb = 0, channelNoisePercent = 0, distanceKm = 0 } = options;

  // 1. Channel attenuation / path loss model
  const lossProb = Math.min(0.9, Math.max(0, distanceKm / 200));
  if (Math.random() < lossProb) {
    return { measured: null, reason: 'lost' };
  }

  // 2. Eve Intercept-Resend Logic (Simulated for future experiments)
  let activeBit = aliceBit;
  let activeBasis = aliceBasis;

  if (Math.random() < (eveProb / 100)) {
    const eveFilterMode = randomBasis(); // + is 90° filter, × is -45° filter
    let eveClick = false;

    if (aliceBit === 0 && eveFilterMode === '×') eveClick = Math.random() < 0.5;
    if (aliceBit === 1 && eveFilterMode === '+') eveClick = Math.random() < 0.5;

    if (eveClick) {
      activeBit = aliceBit;
      activeBasis = aliceBasis;
    } else {
      // Eve got an erasure, forces a blind collapse breakdown
      activeBit = randomBit();
      activeBasis = randomBasis();
    }
  }

  // 3. Bob's Alternative Filter Click Matrix Processing
  let clickDetected = false;

  // Alice sent 0° (+0) and Bob measures with -45° filter (represented by ×)
  if (activeBit === 0 && activeBasis === '+' && bobBasis === '×') {
    clickDetected = Math.random() < 0.5;
  }
  // Alice sent 45° (×0) and Bob measures with 90° filter (represented by +)
  else if (activeBit === 1 && activeBasis === '×' && bobBasis === '+') {
    clickDetected = Math.random() < 0.5;
  }

  if (clickDetected) {
    let finalBit = (activeBasis === '+') ? 0 : 1;
    
    // Noise perturbation flip
    if (Math.random() < (channelNoisePercent / 100)) {
      finalBit = 1 - finalBit;
    }

    return { measured: finalBit, reason: 'measured' };
  } else {
    // Return null to cleanly flag an "Erasure" state to the untouched UI rendering rows
    return { measured: null, reason: 'inconclusive' };
  }
}

export function updatePhotonVisuals(el, polarizationState) {
  if (!el) return;
  el.style.transform = 'translateY(-50%)';
}

export function animatePhoton(photonElement, targetLeft, duration) {
  return new Promise((resolve) => {
    if (!photonElement || !photonElement.style) return resolve();
    photonElement.style.transition = 'left ' + duration + 'ms linear, opacity 0.3s ease-out';
    
    // eslint-disable-next-line no-unused-expressions
    photonElement.offsetHeight;
    
    photonElement.style.left = targetLeft;
    setTimeout(resolve, duration + 40);
  });
}

export function updateUIOnCompletion() {
  const statusEl = document.getElementById('transmission-status');
  if (statusEl) statusEl.textContent = 'Transmission complete! Classical erasure list synchronized.';
}

export function initializeProtocol(n = undefined) {
  if (typeof n === 'number' && n >= 0) BB84.keyLength = n;
  if (!BB84.keyLength || BB84.keyLength <= 0) {
    BB84.quantumData = [];
    return;
  }
  
  BB84.quantumData = [];
  for (let i = 0; i < BB84.keyLength; i++) {
    const aBit = randomBit();
    
    // B92 mapping translations:
    // Alice's bit 0 maps to '+' basis, bit 1 maps to '×' basis (always raw bit 0 value internally)
    const aBasis = aBit === 0 ? '+' : '×';
    
    // For ideal Experiment 1 configuration baseline: 
    // force Bob's selection to line up with the click-conclusive state filter
    const bBasis = aBit === 0 ? '×' : '+';

    BB84.quantumData.push({
      index: i + 1,
      aBit , // Hardcoded to 0 so polarization mapping matches '+0' or '×0'
      aBasis,
      bBasis,
      bMeas: null,
      match: null,
    });
  }
}