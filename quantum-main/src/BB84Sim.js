// BB84Sim.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import QBERChart from './BB84Chart';
import './BB84Sim.css'; // Import the extracted CSS

// --- GLOBAL CONSTANTS & CONFIGURATION ---
const KEY_LENGTH = 32; // Total photons sent
const QBER_THRESHOLD = 5.0; // Max allowable QBER for security check
const BASES = ['+', 'X'];
const PHOTON_PREP_TIME_MS = 750;
const DURATION_ALICE_TO_EVE = 2000;
const DURATION_EVE_TO_BOB = 2000;
const DURATION_ENCODER_TO_RECEIVER = DURATION_ALICE_TO_EVE + DURATION_EVE_TO_BOB;
const ANIMATION_POSITIONS = {
    ALICE_START: '5%', ALICE_ENCODER: '20%', EVE_DETECTOR: '50%',
    BOB_DETECTOR: '80%', BOB_RECEIVER: '95%'
};
const POLARIZATION_MAP = { '+0': '→', '+1': '↑', 'X0': '↗', 'X1': '↖' };
const ANGLE_MAP = { '+0': '0°', '+1': '90°', 'X0': '45°', 'X1': '135°' };

// --- CORE BB84 LOGIC FUNCTIONS ---
const randomBit = () => Math.floor(Math.random() * 2);
const randomBasis = () => BASES[Math.floor(Math.random() * 2)];

/** Simulates a quantum measurement. */
const measureQubit = (inputBit, inputBasis, measureBasis) => {
    if (inputBasis === measureBasis) {
        return inputBit;
    }
    return randomBit();
};

/** Simple XOR encryption/decryption function. */
const xorEncryptDecrypt = (binaryMessage, binaryKey) => {
    let result = '';
    const length = Math.min(binaryMessage.length, binaryKey.length);
    for (let i = 0; i < length; i++) {
        const messageBit = parseInt(binaryMessage[i]);
        const keyBit = parseInt(binaryKey[i]);
        result += (messageBit ^ keyBit);
    }
    return result;
};

/** Converts text to a fixed 16 bit binary string. */
const textToBinary = (text) => {
    text = text.substring(0, 2);
    let binary = '';
    for (let i = 0; i < 2; i++) {
        const char = text[i] || '';
        const charCode = char ? char.charCodeAt(0) : 0;
        binary += charCode.toString(2).padStart(8, '0');
    }
    return binary.substring(0, 16);
};

/** Converts a binary string back to text. */
const binaryToText = (binary) => {
    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
        const chunk = binary.substring(i, i + 8);
        if (chunk.length === 8) {
            const charCode = parseInt(chunk, 2);
            if (charCode > 0) {
                text += String.fromCharCode(charCode);
            }
        }
    }
    return text.trim();
};

// --- DIALOGUE AND THEME CONFIG ---
const themes = {
    naval: {
        alice: "CAPTAIN ALICE", bob: "OPERATOR BOB", aliceAvatar: '👩‍✈️', bobAvatar: '👨‍💻',
        d1Role: "COMMUNICATIONS OFFICER", d1Class: "military", d1Line: "Captain, incoming alert! Fleet Command's top secret orders are ready, but traditional transmission is a guaranteed risk. Hostile signals intelligence is active.",
        d2Role: "CAPTAIN ALICE", d2Class: "command", d2Line: "No traditional cryptography is safe enough! We need uncrackable <strong>SECURITY</strong>, immediately. Initiate <strong>BB84 PROTOCOL</strong> for key exchange now!",
        insight: "THIS NAVAL OPERATION DEMANDS <strong>ABSOLUTE KEY SECRECY</strong> AGAINST ADVANCED CYBER ESPIONAGE. ONLY QUANTUM MECHANICS GUARANTEES THE INTEGRITY OF THE KEY BEFORE THE ORDERS ARE SENT."
    },
    // ... (other themes would be structured similarly for brevity)
    ground: {
        alice: "COMMANDER RED", bob: "SPECIALIST GREEN", aliceAvatar: '🪖', bobAvatar: '💂',
        d1Role: "SOLDIER (URGENT)", d1Class: "military", d1Line: "Sir, I have crucial intelligence on enemy movements, coordinates and vectors, I need to send them to HQ immediately! Transmission standing by!",
        d2Role: "COMMANDER RED", d2Class: "command", d2Line: "Hold! The standard <strong>classical channel</strong> is compromised. We cannot risk interception. Abandon the conventional method, soldier. Initiate the <strong>BB84 QUANTUM KEY DISTRIBUTION PROTOCOL</strong>!",
        insight: "THE THREAT IS IMMEDIATE. STANDARD KEYS CAN BE CRACKED EVENTUALLY. WE USE <strong>BB84</strong> TO GENERATE A TRULY SECRET KEY GUARANTEED BY PHYSICS, PROVIDING THE ONLY SECURE METHOD FOR THIS CRITICAL MISSION DATA."
    },
    space: {
        alice: "DR. EVELYN REED", bob: "PILOT ZETA", aliceAvatar: '👩‍🔬', bobAvatar: '🛰️',
        d1Role: "ENGINEER", d1Class: "military", d1Line: "Dr. Reed, the Mars data package is ready for download, but the cosmic distance makes the key vulnerable to interception during the classical handshake.",
        d2Role: "DR. EVELYN REED", d2Class: "command", d2Line: "The time delay is too great for conventional countermeasures. Bob, we are switching to <strong>BB84</strong> for <strong>quantum key generation</strong>! Physics must secure this key!",
        insight: "In deep space, intercepted keys give adversaries too much time. <strong>BB84</strong> ensures that if the key is touched during transmission, Alice and Bob will know instantly."
    },
    financial: {
        alice: "CEO ALICE", bob: "ANALYST BOB", aliceAvatar: '👩‍💼', bobAvatar: '👨‍💼',
        d1Role: "COMPLIANCE OFFICER", d1Class: "military", d1Line: "CEO Alice, we have a $500 million wire transfer ready. The cryptographic key required is too valuable to risk exposure on public networks.",
        d2Role: "CEO ALICE", d2Class: "command", d2Line: "Security is paramount. We will not rely on old protocols. Analyst Bob, prepare the <strong>quantum channel</strong> now. The <strong>transfer key</strong> must be exchanged using <strong>BB84</strong>!",
        insight: "Financial transactions demand keys instantly verifiable as <strong>secret</strong>. <strong>BB84</strong> allows the system to verify that no <strong>eavesdropper</strong> has learned any information about the <strong>final key</strong>."
    },
};

const defaultDialogue = (
    <div className="dialogue-bubble command">
        <div className="dialogue-speaker">MISSION CONTROL:</div>
        <div className="dialogue-text">
            Welcome, operative. The integrity of our sensitive communications rests entirely on the <strong>BB84 quantum key distribution</strong> protocol. Select your mission environment below to begin key preparation.
        </div>
    </div>
);


// --- REACT COMPONENT START ---
const BB84Simulator = () => {
    // State management
    const [BB84State, setBB84State] = useState({
        currentStep: 1,
        missionSelected: null,
        messageText: "",
        messageBinary: "",
        eavesdroppingEnabled: false,
        quantumData: [],
        rawKeyA: [],
        rawKeyB: [],
        finalKey: "",
        ciphertext: "",
        characterInfo: null,
        currentPhotonIndex: 0,
        qberErrors: 0,
        qberMatches: 0,
        qberRate: 0,
        qberSample: 0,
        isModalOpen: false,
        modalType: null, // 'success', 'warning'
        isAnimating: false,
    });

    const [photonData, setPhotonData] = useState(null); // Separate state for the photon being animated
    const photonRef = useRef(null);

    // Destructure for easier access
const {
    currentStep, missionSelected, messageText, messageBinary,
    eavesdroppingEnabled, quantumData, rawKeyA, rawKeyB, finalKey, ciphertext, // <-- rawKeyA ADDED HERE
    characterInfo, currentPhotonIndex, qberErrors, qberMatches, qberRate, qberSample,
    isModalOpen, modalType, isAnimating
} = BB84State;

    // --- UTILITY HANDLERS ---

    const showStep = useCallback((step) => {
        setBB84State(prev => ({ ...prev, currentStep: step }));
    }, []);

    const showModal = (type) => {
        setBB84State(prev => ({ ...prev, isModalOpen: true, modalType: type }));
    };

    const closeModal = () => {
        setBB84State(prev => ({ ...prev, isModalOpen: false, modalType: null }));
    };

    const updateQBER = useCallback((errors, matches) => {
        const rate = matches > 0 ? (errors / matches) * 100 : 0;
        setBB84State(prev => ({
            ...prev,
            qberErrors: errors,
            qberMatches: matches,
            qberRate: parseFloat(rate.toFixed(1)),
        }));
    }, []);

    // --- STEP 1 LOGIC ---

const selectMission = (mission) => {
    const info = themes[mission];
    setBB84State(prev => {
        const newState = {
            ...prev,
            missionSelected: mission,
            characterInfo: info,
        };
        // Use the new state's messageText for the implicit validation/update
        handleMessageInput({ target: { value: newState.messageText } }); 
        return newState;
    });
};

const handleMessageInput = (e) => {
    const text = e.target.value.trim();
    const binary = textToBinary(text);
    setBB84State(prev => ({ // 'prev' is correctly defined here
        ...prev,
        messageText: text,
        messageBinary: binary,
    }));
};

    const toggleEveAttack = () => {
        setBB84State(prev => ({
            ...prev,
            eavesdroppingEnabled: !prev.eavesdroppingEnabled,
        }));
    };

    const startProtocol = () => {
        if (!missionSelected || messageBinary.length === 0) return;
        showStep(2);
    };

    // --- STEP 2 LOGIC (Message Encoding) ---

    const renderConversionTable = () => {
        const text = messageText.substring(0, 2);
        const rows = [];
        let binary_m = '';

        for (let i = 0; i < 2; i++) {
            const char = text[i] || '';
            const charCode = char ? char.charCodeAt(0) : 0;
            let byteBinary = charCode.toString(2).padStart(8, '0');
            let status;

            if (i < text.length) {
                status = <span className="text-success-green font-bold">BYTE KEPT</span>;
                binary_m += byteBinary;
            } else {
                status = <span className="text-danger-red font-bold">BYTE PADDING (00000000)</span>;
                byteBinary = '00000000';
                binary_m += byteBinary;
            }

            rows.push(
                <tr key={i}>
                    <td>{char || 'N/A'}</td>
                    <td>{charCode}</td>
                    <td>{byteBinary}</td>
                    <td>{status}</td>
                </tr>
            );
        }

        return (
            <>
                <table className="conversion-table">
                    <thead><tr><th>CHARACTER</th><th>ASCII CODE</th><th>8 BIT BINARY (BYTE)</th><th>STATUS</th></tr></thead>
                    <tbody>{rows}</tbody>
                </table>
                <div className="mt-4 p-3 bg-gray-100 rounded-lg shadow-inner">
                    <p className="font-bold text-primary-blue text-sm">FINAL MESSAGE BINARY (<strong>M</strong>) = BYTE 1 + BYTE 2</p>
                    <p className="font-mono text-lg break-all text-gray-800">{binary_m.substring(0, 16)}</p>
                </div>
            </>
        );
    };

    const startQKDTransmission = () => {
        let newQuantumData = [];
        let totalQberErrors = 0;
        let totalQberMatches = 0;

        for (let i = 0; i < KEY_LENGTH; i++) {
            const aBit = randomBit();
            const aBasis = randomBasis();
            const bBasis = randomBasis();

            const eBasis = eavesdroppingEnabled ? randomBasis() : null;
            const eMeas = eavesdroppingEnabled ? measureQubit(aBit, aBasis, eBasis) : null;

            // Bob's data generation will be done in sendPhoton/sendBurst
            newQuantumData.push({
                index: i, aBit, aBasis, eBasis, eMeas, bBasis, bMeas: null,
                basisMatch: (aBasis === bBasis), bitError: false, errorSource: null
            });

            // Initial Burst calculation for QBER count (optional, only if skipping animation)
            if (eavesdroppingEnabled && aBasis === bBasis) {
                totalQberMatches++;
                let photonStateAfterEve = measureQubit(aBit, aBasis, eBasis);
                let bobMeasuredBit = measureQubit(photonStateAfterEve, eBasis, bBasis);
                if (aBit !== bobMeasuredBit) {
                    totalQberErrors++;
                }
            } else if (!eavesdroppingEnabled && aBasis === bBasis) {
                totalQberMatches++;
                // No error if no eavesdropper and bases match (ideal simulation)
            }
        }

        setBB84State(prev => ({
            ...prev,
            quantumData: newQuantumData,
            rawKeyA: [], rawKeyB: [], finalKey: "", ciphertext: "",
            currentPhotonIndex: 0,
            qberErrors: 0,
            qberMatches: 0,
        }));
        setPhotonData(null);
        showStep(3);
    };

    // --- STEP 3 LOGIC (Quantum Transmission) ---

    // Utility function to trigger animation via DOM manipulation (necessary for CSS transitions)
    const animatePhoton = (targetLeft, duration) => {
        return new Promise((resolve) => {
            const photonEl = photonRef.current;
            if (photonEl) {
                photonEl.style.transition = `left ${duration}ms linear, background 0.3s ease-out, transform 0.3s ease-out`;
                photonEl.style.left = targetLeft;
                setTimeout(resolve, duration + 50);
            } else {
                resolve();
            }
        });
    };

    const sendPhoton = useCallback(async () => {
        if (currentPhotonIndex >= KEY_LENGTH || isAnimating) return;

        setBB84State(prev => ({ ...prev, isAnimating: true }));

        const data = quantumData[currentPhotonIndex];
        let currentBit = data.aBit;
        let currentBasis = data.aBasis;

        // 1. Setup initial photon data
        setPhotonData({
            index: currentPhotonIndex,
            bit: currentBit,
            basis: currentBasis,
            polarizationState: POLARIZATION_MAP[data.aBasis + data.aBit],
            polarizationAngle: ANGLE_MAP[data.aBasis + data.aBit],
            left: ANIMATION_POSITIONS.ALICE_START,
            background: 'radial-gradient(circle at center, #ffffff, #06b6d4)',
        });

        // Use a small delay to ensure React renders the photon before starting the animation
        await new Promise(resolve => setTimeout(resolve, 50));

        // 2. Animate to Alice Encoder (5% -> 20%)
        document.getElementById('alice-polarizer').setAttribute('data-basis', data.aBasis);
        document.getElementById('bob-polarizer').setAttribute('data-basis', data.bBasis);
        if (eavesdroppingEnabled) {
            document.getElementById('eve-detector-box').setAttribute('data-basis', data.eBasis);
            document.getElementById('eve-reencoder-box').setAttribute('data-basis', data.eBasis);
        }
        document.getElementById('transmission-status').textContent = `PHOTON ${currentPhotonIndex + 1}/${KEY_LENGTH}: PHOTON IS PREPARED AND ENCODED BY ALICE'S ${data.aBasis} POLARIZER.`;
        await animatePhoton(ANIMATION_POSITIONS.ALICE_ENCODER, PHOTON_PREP_TIME_MS);

        // 3. Animate to Eve Detector or Bob Detector
        if (eavesdroppingEnabled) {
            // E -> B Animation
            document.getElementById('transmission-status').textContent = `PHOTON ${currentPhotonIndex + 1}/${KEY_LENGTH}: INTERCEPTED BY EVE. MEASURING WITH ${data.eBasis} BASIS...`;
            await animatePhoton(ANIMATION_POSITIONS.EVE_DETECTOR, DURATION_ALICE_TO_EVE);

            // Eve's Measurement and Re-encoding
            currentBit = data.eMeas;
            currentBasis = data.eBasis;

            setPhotonData(prev => ({
                ...prev,
                bit: currentBit,
                basis: currentBasis,
                polarizationState: POLARIZATION_MAP[currentBasis + currentBit],
                polarizationAngle: ANGLE_MAP[currentBasis + currentBit],
                background: 'radial-gradient(circle at center, #ffffff, #c084fc)', // Purple influence
            }));
            await new Promise(resolve => setTimeout(resolve, 50)); // Wait for visual update

            document.getElementById('transmission-status').textContent = `PHOTON ${currentPhotonIndex + 1}/${KEY_LENGTH}: EVE MEASURED ${data.eMeas} AND RE-ENCODED. TRAVELING TO BOB...`;
            await animatePhoton(ANIMATION_POSITIONS.BOB_DETECTOR, DURATION_EVE_TO_BOB);

        } else {
            // A -> B Animation (Skip Eve)
            document.getElementById('transmission-status').textContent = `PHOTON ${currentPhotonIndex + 1}/${KEY_LENGTH}: TRAVELING THROUGH THE QUANTUM CHANNEL TO BOB...`;
            await animatePhoton(ANIMATION_POSITIONS.BOB_DETECTOR, DURATION_ENCODER_TO_RECEIVER);
        }

        // 4. Bob's Measurement
        const bMeas = measureQubit(currentBit, currentBasis, data.bBasis);
        const isError = data.aBit !== bMeas;

        // Update QBER counter
        if (data.aBasis === data.bBasis) {
            setBB84State(prev => ({
                ...prev,
                qberMatches: prev.qberMatches + 1,
                qberErrors: prev.qberErrors + (isError ? 1 : 0),
            }));
        }

        const measuredState = data.bBasis + bMeas;
        const errorIndicator = isError ? '⚠️' : ' ';
        const statusText = isError ? `ERROR: A BIT NOT EQUAL B BIT` : `SUCCESS: A BIT EQUAL B BIT`;
        document.getElementById('transmission-status').textContent = `PHOTON ${currentPhotonIndex + 1}/${KEY_LENGTH}: BOB MEASURED BIT: ${bMeas} (${statusText}).`;

        setPhotonData(prev => ({
            ...prev,
            bit: bMeas,
            polarizationState: POLARIZATION_MAP[measuredState],
            polarizationAngle: ANGLE_MAP[measuredState],
        }));
        await new Promise(resolve => setTimeout(resolve, 50));

        // 5. Animate to Bob Receiver and remove
        await animatePhoton(ANIMATION_POSITIONS.BOB_RECEIVER, PHOTON_PREP_TIME_MS);

        // 6. Final cleanup and state update
        setBB84State(prev => {
            const updatedData = [...prev.quantumData];
            updatedData[currentPhotonIndex] = {
                ...data,
                bMeas: bMeas,
                bitError: isError,
                errorSource: isError ? (eavesdroppingEnabled ? "EVE INDUCED ERROR..." : "IDEAL SIMULATION: NO NOISE ERRORS APPLIED.") : "NO ERROR RECORDED...",
            };

            const nextIndex = currentPhotonIndex + 1;
            const isComplete = nextIndex >= KEY_LENGTH;

            return {
                ...prev,
                quantumData: updatedData,
                currentPhotonIndex: nextIndex,
                isAnimating: false,
                qberRate: prev.qberMatches > 0 ? ((prev.qberErrors + (data.aBasis === data.bBasis && isError ? 1 : 0)) / (prev.qberMatches + (data.aBasis === data.bBasis ? 1 : 0))) * 100 : 0
            };
        });

        setPhotonData(null); // Hide photon element after measurement

    }, [currentPhotonIndex, quantumData, eavesdroppingEnabled, isAnimating]);


    const sendBurst = () => {
        if (isAnimating) return;
        setBB84State(prev => ({ ...prev, isAnimating: true }));

        const remainingData = quantumData.slice(currentPhotonIndex);
        let currentErrors = qberErrors;
        let currentMatches = qberMatches;

        const updatedData = quantumData.map((data, i) => {
            if (i < currentPhotonIndex) return data; // Keep processed data

            let currentBit = data.aBit;
            let currentBasis = data.aBasis;

            if (eavesdroppingEnabled) {
                // Eve measures
                const eMeas = measureQubit(currentBit, currentBasis, data.eBasis);
                currentBit = eMeas;
                currentBasis = data.eBasis; // Photon is re-encoded in Eve's basis
            }

            // Bob's measurement logic
            const bMeas = measureQubit(currentBit, currentBasis, data.bBasis);
            const bitError = data.aBit !== bMeas;

            // QBER logic
            if (data.aBasis === data.bBasis) {
                currentMatches++;
                if (bitError) {
                    currentErrors++;
                }
            }

            return {
                ...data,
                bMeas: bMeas,
                bitError: bitError,
                errorSource: bitError ? (eavesdroppingEnabled ? "EVE INDUCED ERROR..." : "IDEAL SIMULATION: NO NOISE ERRORS APPLIED.") : "NO ERROR RECORDED...",
            };
        });

        setBB84State(prev => ({
            ...prev,
            quantumData: updatedData,
            currentPhotonIndex: KEY_LENGTH,
            isAnimating: false,
            qberErrors: currentErrors,
            qberMatches: currentMatches,
        }));
    };


    // Side effect to update table instantly in burst mode
    useEffect(() => {
        if (currentPhotonIndex >= KEY_LENGTH && !isAnimating) {
            updateQBER(qberErrors, qberMatches);
            document.getElementById('transmission-status').textContent = 'TRANSMISSION COMPLETE! PROCEED TO STEP 4.';
        }
    }, [currentPhotonIndex, isAnimating, qberErrors, qberMatches, updateQBER]);

    const renderQuantumTable = (burstMode) => {
        const startIndex = burstMode ? 0 : Math.max(0, currentPhotonIndex - 15);
        const displayData = burstMode ? quantumData : quantumData.slice(startIndex, currentPhotonIndex);

        return displayData.map((data, index) => {
            const basisMatch = data.aBasis === data.bBasis;
            const matchColor = basisMatch ? 'text-success-green' : 'text-danger-red';
            const matchText = basisMatch ? '✔' : '✘';

            let rowClass = '';
            if (basisMatch) {
                rowClass = data.bitError ? 'error-red' : 'bg-green-50';
            } else {
                rowClass = 'bg-red-50';
            }

            const eveBasisDisplay = eavesdroppingEnabled ? data.eBasis : '-';
            const eveMeasDisplay = eavesdroppingEnabled ? (data.eMeas !== null ? data.eMeas : '-') : '-';

            const bobMeasDisplay = data.bMeas !== null ? data.bMeas : '-';
            const errorIndicator = data.bitError ? <span className="text-warning-yellow font-extrabold">⚠️</span> : ' ';

            return (
                <tr key={data.index} className={rowClass} title={data.errorSource || ""}>
                    <td>{data.index}</td>
                    <td className="text-red-600">{data.aBit}</td>
                    <td className="text-red-600">{data.aBasis}</td>
                    <td className="text-purple-600">{eveBasisDisplay}</td>
                    <td className="text-purple-600">{eveBasisDisplay}</td>
                    <td className="text-purple-600">{eveMeasDisplay}</td>
                    <td className="text-green-600">{data.bBasis}</td>
                    <td className="text-green-600">{bobMeasDisplay}{errorIndicator}</td>
                    <td className={`${matchColor} font-extrabold`}>{matchText}</td>
                </tr>
            );
        });
    };

    // --- STEP 4 LOGIC (Sifting) ---

    const siftAndGenerateRawKey = () => {
        let newRawKeyA = [];
        let newRawKeyB = [];

        quantumData.forEach(data => {
            if (data.basisMatch) {
                newRawKeyA.push(data.aBit);
                newRawKeyB.push(data.bMeas);
            }
        });

        setBB84State(prev => ({
            ...prev,
            rawKeyA: newRawKeyA,
            rawKeyB: newRawKeyB,
        }));
        showStep(4);
    };

    const renderSiftingTable = () => {
        const rows = [];
        let rawKeyIndex = 0;

        quantumData.forEach((data, index) => {
            const match = data.basisMatch;
            const rowClass = match ? 'bg-green-50' : 'bg-red-50';
            const keepText = match ? <span className="text-success-green font-extrabold">KEEP</span> : <span className="text-danger-red">DISCARD</span>;

            rows.push(
                <tr key={index} className={rowClass}>
                    <td>{index}</td>
                    <td>{data.aBasis}</td>
                    <td>{data.bBasis}</td>
                    <td>{match ? '✔' : '✘'}</td>
                    <td>{match ? data.aBit : '-'}</td>
                    <td>{match ? data.bMeas : '-'}</td>
                    <td>{keepText}</td>
                </tr>
            );
            if (match) rawKeyIndex++;
        });

        return rows;
    };

    // --- STEP 5 LOGIC (QBER Check) ---

    const runQBERCheck = () => {
        const rawKeyLength = rawKeyB.length;
        const messageLength = 16;

        // 1. Determine Sample Size (25% of raw key, minimum 4 bits)
        const checkSampleSize = Math.max(4, Math.floor(rawKeyLength * 0.25));

        if (rawKeyLength < 4) {
            setBB84State(prev => ({ ...prev, finalKey: "", qberSample: 0 }));
            showStep(5);
            return;
        }

        // 2. Randomly select the test indices
        let rawKeyIndicesList = Array.from({ length: rawKeyLength }, (_, i) => i);
        let testIndices = [];

        for (let i = 0; i < checkSampleSize; i++) {
            if (rawKeyIndicesList.length === 0) break;
            const randomIndex = Math.floor(Math.random() * rawKeyIndicesList.length);
            const rawKeyIndex = rawKeyIndicesList.splice(randomIndex, 1)[0];
            testIndices.push(rawKeyIndex);
        }

        // 3. Calculate QBER
        let mismatchCount = 0;
        testIndices.forEach(rawKeyIndex => {
            const aBit = rawKeyA[rawKeyIndex];
            const bBit = rawKeyB[rawKeyIndex];
            if (aBit !== bBit) {
                mismatchCount++;
            }
        });

        const testSampleLength = testIndices.length;
        const qberRateCalculated = testSampleLength > 0 ? (mismatchCount / testSampleLength) * 100 : 0;
        const qberDisplay = qberRateCalculated.toFixed(1) + '%';
        const keySecured = qberRateCalculated < QBER_THRESHOLD;

        // 4. Generate Final Key (K) - Bits NOT used in the sample
        const remainingIndices = rawKeyIndicesList;
        const finalKeyBits = remainingIndices.map(rawKeyIndex => rawKeyB[rawKeyIndex]);
        const finalKeyString = finalKeyBits.join('');

        setBB84State(prev => ({
            ...prev,
            finalKey: finalKeyString,
            qberErrors: mismatchCount,
            qberSample: testSampleLength,
            qberRate: parseFloat(qberRateCalculated.toFixed(1)),
        }));

        if (keySecured) {
            handleKeyFinalization(finalKeyString, messageLength);
            showModal('success');
        } else {
            handleKeyFinalization("", messageLength); // Discard key
            showModal('warning');
        }

        showStep(5);
    };

    const handleKeyFinalization = (key, messageLength) => {
        const keyLength = key.length;
        const keyIsTooShort = keyLength < messageLength && keyLength > 0;

        setBB84State(prev => ({
            ...prev,
            finalKey: key,
        }));
    };

    // --- STEP 6 LOGIC (Encryption) ---

    const proceedToEncryption = () => {
        const key = finalKey;
        const keyLength = key.length;
        const message = messageBinary.substring(0, keyLength); // Truncate to key length
        const newCiphertext = xorEncryptDecrypt(message, key);

        setBB84State(prev => ({ ...prev, ciphertext: newCiphertext }));
        showStep(6);
    };

    const renderXORVisualization = (key, message, result, isDecryption) => {
        const displayLength = key.length;
        const rows = [];

        for (let i = 0; i < displayLength; i++) {
            const bit1 = message[i];
            const bit2 = key[i];
            const finalBit = result[i];

            rows.push(
                <div key={i} className={`grid grid-cols-5 gap-2 py-0.5 text-center font-mono text-xs ${i % 2 === 1 ? 'bg-gray-100 rounded-sm' : ''}`}>
                    <span>{i + 1}</span>
                    <span className={isDecryption ? 'text-yellow-700' : 'text-red-600'}>{bit1}</span>
                    <span className="text-blue-600">{bit2}</span>
                    <span className="font-bold text-lg leading-none">⊕</span>
                    <span className={isDecryption ? 'text-green-700 font-bold' : 'text-yellow-700 font-bold'}>{finalBit}</span>
                </div>
            );
        }

        return (
            <div className="font-mono text-xs space-y-1 mt-4">
                <div className="grid grid-cols-5 gap-2 font-bold text-gray-700 border-b pb-1 mb-1 text-center text-sm">
                    <span>NO.</span>
                    <span>{isDecryption ? 'CIPHERTEXT (C)' : 'MESSAGE (M)'}</span>
                    <span>KEY (K)</span>
                    <span>OPERATOR (⊕)</span>
                    <span>{isDecryption ? 'RESULT (M)' : 'RESULT (C)'}</span>
                </div>
                {rows}
            </div>
        );
    };

    // --- STEP 7 LOGIC (Decryption) ---

    const proceedToDecryption = () => {
        const key = finalKey;
        const decryptedMessage = xorEncryptDecrypt(ciphertext, key);
        const decryptedText = binaryToText(decryptedMessage);

        setBB84State(prev => ({
            ...prev,
            decryptedMessageBinary: decryptedMessage,
            decryptedMessageText: decryptedText,
        }));
        showStep(7);
    };

    // --- RENDER HELPERS ---

    const renderMissionDialogue = () => {
        if (!missionSelected || !characterInfo) return defaultDialogue;

        const theme = themes[missionSelected];
        return (
            <>
                <div className={`dialogue-bubble ${theme.d1Class}`}>
                    <div className={`dialogue-speaker text-danger-red`}>{theme.d1Role}:</div>
                    <div className="dialogue-text" dangerouslySetInnerHTML={{ __html: theme.d1Line }} />
                </div>
                <div className={`dialogue-bubble ${theme.d2Class}`}>
                    <div className={`dialogue-speaker text-success-green`}>{theme.d2Role}:</div>
                    <div className="dialogue-text" dangerouslySetInnerHTML={{ __html: theme.d2Line }} />
                </div>
                <div className="dr-quantum-insight">
                    <div className="dr-quantum-icon">💡</div>
                    <div className="dr-quantum-content">
                        <strong className="text-primary-blue">DR. QUANTUM'S INSIGHT:</strong>
                        <div dangerouslySetInnerHTML={{ __html: theme.insight }} />
                    </div>
                </div>
            </>
        );
    };

    const getEveDialogue = () => {
        if (!eavesdroppingEnabled) return null;
        return (
            <div className="dialogue-bubble eve-attack" id="eve-dialogue-3">
                <div className="dialogue-speaker text-purple-600">EAVESDROPPER EVE:</div>
                <div className="dialogue-text">
                    "Intercepting photon stream... My <strong>reader</strong> device forces a measurement. I will <strong>resend</strong> a new photon based on my result. Alice and Bob won't know my basis choices, but my interference will leave a traceable <strong>quantum error</strong>! Mwahaha!"
                </div>
            </div>
        );
    };


    const renderContent = (step) => {
        // Find the current theme for character names
        const names = characterInfo || { alice: 'Alice', bob: 'Bob' };
        const aliceName = names.alice.toUpperCase();
        const bobName = names.bob.toUpperCase();

        switch (step) {
            case 1:
                return (
                    <div className="step-content active" id="step-1">
                        <div className="step-header">
                            <h1 className="step-title">1. Mission Briefing and Message Input</h1>
                            <p className="step-subtitle">Choose your operational zone and input the vital two character message to be secured.</p>
                        </div>
                        <div className="dialogue-container" id="mission-dialogue">
                            {renderMissionDialogue()}
                        </div>
                        {/* Mission Grid */}
                        <div className="mission-grid">
                            {Object.keys(themes).map(m => (
                                <div
                                    key={m}
                                    className={`mission-card ${missionSelected === m ? 'selected' : ''}`}
                                    onClick={() => selectMission(m)}
                                    id={`mission-${m}`}
                                >
                                    <div className="mission-icon">{themes[m].aliceAvatar}</div>
                                    <div className="mission-title">{themes[m].alice.replace('CAPTAIN ', '').replace('DR. ', '').replace('COMMANDER ', '').replace('CEO ', '')} Mission</div>
                                    <div className="mission-description">Secure communications for {m} operations.</div>
                                </div>
                            ))}
                        </div>

                        {/* Character Section */}
                        {missionSelected && (
                            <>
                                <div className="characters-section" id="characters-section">
                                    <div className="character">
                                        <div className="character-avatar alice-avatar" id="alice-avatar">{characterInfo.aliceAvatar}</div>
                                        <div className="character-name" id="alice-name">{aliceName}</div>
                                        <div className="character-role">Quantum Transmitter</div>
                                    </div>
                                    <div className="character">
                                        <div className="character-avatar bob-avatar" id="bob-avatar">{characterInfo.bobAvatar}</div>
                                        <div className="character-name" id="bob-name">{bobName}</div>
                                        <div className="character-role">Quantum Receiver</div>
                                    </div>
                                    <div className="character">
                                        <div className="character-avatar eve-avatar">😈</div>
                                        <div className="character-name">EAVESDROPPER EVE</div>
                                        <div className="character-role">Adversary</div>
                                    </div>
                                    <div className="character">
                                        <div className="character-avatar quantum-avatar">🧬</div>
                                        <div className="character-name">DR. QUANTUM</div>
                                        <div className="character-role">Navigator</div>
                                    </div>
                                </div>

                                {/* Message Input Section */}
                                <div className="file-upload-section" id="upload-section">
                                    <h3 className="font-bold mb-4 text-primary-blue">
                                        KEY LENGTH (TOTAL TRANSMISSION):
                                        <span id="key-length-display" className="text-xl font-mono text-gray-700">{KEY_LENGTH}</span> BITS
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 font-bold text-danger-red">
                                        EDUCATIONAL NOTE: WE TRANSMIT {KEY_LENGTH} PHOTONS TO YIELD A REALISTIC MINIMUM OF 16 SECURE BITS AFTER THE SIFTING PROCESS (DUE TO 50% BASIS MISMATCH).
                                    </p>

                                    <label htmlFor="message-input" className="block font-bold mb-2 text-gray-700">TYPE YOUR SECRET MESSAGE (MAX 2 CHARS):</label>
                                    <input
                                        type="text"
                                        id="message-input"
                                        maxLength="2"
                                        placeholder="E.G., HY OR GO"
                                        onInput={handleMessageInput}
                                        value={messageText}
                                        className="w-full max-w-sm mx-auto p-3 border-2 border-secondary-blue rounded-lg shadow-inner text-xl font-mono text-center"
                                    />

                                    <div id="message-status" style={{ marginTop: '1rem', fontSize: '0.9rem', color: messageText.length > 0 ? '#10b981' : '#ef4444' }}>
                                        {messageText.length > 0 ? `MESSAGE CAPTURED: "${messageText}". READY TO PROCEED TO ENCODING.` : 'INPUT REQUIRED.'}
                                    </div>
                                    <div className="font-bold text-xs text-primary-blue mt-1" id="binary-preview"></div>

                                    {/* EVE TOGGLE SECTION */}
                                    <div className="mt-6 pt-4 border-t border-gray-300">
                                        <div className="flex items-center justify-center space-x-4">
                                            <span className="font-bold text-lg text-red-600">EVE'S ATTACK STATUS:</span>
                                            <label className="toggle-switch">
                                                <input type="checkbox" id="eve-toggle" checked={eavesdroppingEnabled} onChange={toggleEveAttack} />
                                                <span className="slider"></span>
                                            </label>
                                            <span className={`font-bold text-lg ${eavesdroppingEnabled ? 'text-danger-red font-extrabold' : 'text-gray-500'}`} id="eve-status-text">
                                                {eavesdroppingEnabled ? 'ATTACK ENABLED' : 'DISABLED'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-red-600 mt-2">TOGGLE TO SIMULATE EVE'S INTERCEPT RESEND ATTACK!</p>
                                    </div>

                                    <div className="action-section">
                                        <button className="btn btn-primary" id="start-protocol" onClick={startProtocol} disabled={!messageBinary}>
                                            PROCEED TO STEP 2: ENCODE MESSAGE
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="step-content active" id="step-2">
                        <div className="step-header">
                            <h1 className="step-title">2. Message Encoding: Text to Binary (<strong>M</strong>)</h1>
                            <p className="step-subtitle">WITNESS THE CRITICAL PROCESS: CONVERTING YOUR VITAL TEXT MESSAGE INTO A 16 BIT BINARY SIGNAL.</p>
                        </div>

                        <div className="dialogue-container">
                            <div className="dialogue-bubble command">
                                <div className="dialogue-speaker text-red-600" id="alice-dialogue-2-enc">{aliceName}:</div>
                                <div className="dialogue-text">
                                    "The raw text message is: <span className="font-bold text-xl text-gray-800" id="message-text-display-2">{messageText}</span>. We must convert this into a binary stream, <strong>M</strong>, ready for cryptographic operation. Every character counts for 8 bits! Prepare for quantum transmission."
                                </div>
                            </div>
                        </div>

                        <div className="dr-quantum-insight">
                            <div className="dr-quantum-icon">🧮</div>
                            <div className="dr-quantum-content">
                                <strong className="text-primary-blue">DR. QUANTUM'S INSIGHT:</strong> Data must be converted to a binary stream, <strong>M</strong>. We are set to transmit <strong>{KEY_LENGTH} photons</strong> to ensure we generate a sufficiently long <strong>secure key</strong> to encrypt the user's message.
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <h4 className="text-lg font-bold text-primary-blue mb-3">Message Conversion Detail</h4>
                            <div id="conversion-details">
                                {renderConversionTable()}
                            </div>
                        </div>

                        <div className="action-section">
                            <button className="btn btn-success" id="btn-start-qkd" onClick={startQKDTransmission}>
                                PROCEED TO STEP 3: START QUANTUM KEY DISTRIBUTION
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="step-content active" id="step-3">
                        <div className="step-header">
                            <h1 className="step-title">3. Quantum Transmission <span className="text-xs font-normal text-gray-500">(QUANTUM CHANNEL)</span></h1>
                            <p className="step-subtitle">{aliceName} SENDS <span id="key-length-total-2">{KEY_LENGTH}</span> POLARIZED PHOTONS (QUBITS) TO {bobName}. SENT: <span id="key-length-progress-2">{currentPhotonIndex}</span> / TOTAL: <span id="key-length-total-2-again">{KEY_LENGTH}</span></p>
                        </div>

                        <div className="dialogue-container">
                            <div className="dialogue-bubble military">
                                <div className="dialogue-speaker text-red-600">{aliceName}:</div>
                                <div className="dialogue-text">
                                    "Quantum communication initialized! I'm launching <strong>{KEY_LENGTH} polarized photons</strong> into the quantum channel. My encoding is completely <strong>random</strong>, a secret mix of bits and bases for maximum security. {bobName}, confirm reception!"
                                </div>
                            </div>
                            <div className="dialogue-bubble command">
                                <div className="dialogue-speaker text-green-600">{bobName}:</div>
                                <div className="dialogue-text">
                                    "Receiving quantum pulse now. My detectors are set to make their own <strong>independent, random basis choices</strong> for each photon. This uncertainty is the key to our security! Transmission acknowledged."
                                </div>
                            </div>
                            {getEveDialogue()}
                        </div>

                        <div className="dr-quantum-insight">
                            <div className="dr-quantum-icon">🔑</div>
                            <div className="dr-quantum-content">
                                <strong className="text-primary-blue">DR. QUANTUM'S INSIGHT:</strong> This step is pure quantum physics. Alice and Bob make independent random choices. The <strong>polarizer settings</strong> change for every single photon!
                                <p className="mt-3">Basis Encoding: Alice prepares photons in one of two bases:</p>
                                <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                                    <li><strong>RECTILINEAR BASIS (+)</strong>: A bit 0 is represented by a horizontally polarized photon (0°), and a bit 1 by a vertically polarized photon (90°).</li>
                                    <li><strong>DIAGONAL BASIS (×)</strong>: A bit 0 is a 45° polarized photon, and a bit 1 is a 135° polarized photon.</li>
                                </ul>
                                <p className="mt-3">If <strong>eve attacks</strong>, her tampering introduces an observable <strong>25% error rate</strong> into the final sifted key.</p>
                            </div>
                        </div>

                        <div className="quantum-channel-section">
                            <div className="channel-title">QUANTUM CHANNEL</div>
                            <div className="quantum-channel-container">
                                <div className="quantum-channel-flow" id="quantum-channel-flow">
                                    <div className="flow-station" style={{ left: '5%' }}>
                                        <div className="channel-label-stack">ALICE (SOURCE)</div>
                                        <span className="text-4xl text-red-400">{names.aliceAvatar}</span>
                                    </div>
                                    <div className="polarizer flow-station" id="alice-polarizer" data-basis="+" style={{ left: '20%' }} title="ALICE'S POLARIZER: PREPARES THE PHOTON IN ONE OF FOUR POLARIZATION STATES BASED ON HER RANDOM BIT AND BASIS.">
                                        <div className="channel-label-stack">ALICE'S POLARIZER</div>
                                    </div>
                                    <div className="flow-station" id="eve-station" style={{ left: '50%', width: '220px', flexDirection: 'row', justifyContent: 'space-around', gap: '10px', transform: 'translate(-50%, calc(-50% + 10px))', display: eavesdroppingEnabled ? 'flex' : 'none' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginRight: '20px' }}>
                                            <div className="polarizer eve-device-color" id="eve-detector-box" data-basis="+" title="EVE'S DETECTOR: MEASURES THE INCOMING PHOTON STATE."></div>
                                            <span className="text-sm font-semibold text-gray-700 block" style={{ marginTop: '5px' }}>READER</span>
                                        </div>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                                            <span className="text-4xl text-purple-600">🕵</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginLeft: '20px' }}>
                                            <div className="polarizer eve-device-color" id="eve-reencoder-box" data-basis="X" title="EVE'S RE-ENCODER: RE-PREPARES A NEW PHOTON BASED ON HER MEASUREMENT."></div>
                                            <span className="text-sm font-semibold text-gray-700 block" style={{ marginTop: '5px' }}>RESEND</span>
                                        </div>
                                    </div>
                                    <div className="polarizer flow-station" id="bob-polarizer" data-basis="+" style={{ left: '80%' }} title="BOB'S POLARIZER/DETECTOR: MEASURES THE INCOMING PHOTON USING HIS RANDOMLY CHOSEN BASIS. THIS IS WHERE QUANTUM COLLAPSE OCCURS.">
                                        <div className="channel-label-stack">BOB'S POLARIZER/DETECTOR</div>
                                    </div>
                                    <div className="flow-station" style={{ left: '95%' }}>
                                        <div className="channel-label-stack">BOB (RECEIVER)</div>
                                        <span className="text-4xl text-green-400">{names.bobAvatar}</span>
                                    </div>

                                    <div className="photon-track" id="photon-track">
                                        {photonData && (
                                            <div
                                                ref={photonRef}
                                                className="photon"
                                                style={{ left: photonData.left, background: photonData.background }}
                                            >
                                                {photonData.polarizationState}
                                                <div className="photon-angle">{photonData.polarizationAngle}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div id="transmission-status" style={{ textAlign: 'center', marginTop: '1rem', color: '#1f2937', background: '#f0f0f0', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                {currentPhotonIndex < KEY_LENGTH ?
                                    `READY FOR QUANTUM TRANSMISSION (${currentPhotonIndex} / ${KEY_LENGTH} PHOTONS SENT)...` :
                                    'TRANSMISSION COMPLETE! PROCEED TO STEP 4.'
                                }
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>INDEX</th>
                                        <th>ALICE'S BIT</th>
                                        <th>ALICE'S BASIS (+ / ×)</th>
                                        <th>EVE'S MEASURE BASIS</th>
                                        <th>EVE'S RESEND BASIS</th>
                                        <th>EVE'S MEASUREMENT</th>
                                        <th>BOB'S BASIS (+ / ×)</th>
                                        <th>BOB'S MEASUREMENT</th>
                                        <th>BASIS MATCH? (A VS B)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderQuantumTable(currentPhotonIndex === KEY_LENGTH)}
                                </tbody>
                            </table>
                        </div>

                        <div className="action-section">
                            <button className="btn btn-primary" id="btn-send-photon" onClick={sendPhoton} disabled={currentPhotonIndex >= KEY_LENGTH || isAnimating}>
                                {`SEND NEXT PHOTON (${currentPhotonIndex + 1}/${KEY_LENGTH})`}
                            </button>
                            <button className="btn btn-warning" id="btn-send-burst" onClick={sendBurst} disabled={currentPhotonIndex >= KEY_LENGTH || isAnimating}>
                                SEND ALL PHOTONS ({KEY_LENGTH})
                            </button>
                            <button className="btn btn-success" id="btn-reconcile" onClick={siftAndGenerateRawKey} disabled={currentPhotonIndex < KEY_LENGTH || isAnimating}>
                                PROCEED TO STEP 4: RECONCILE & SIFT
                            </button>
                        </div>
                    </div>
                );
            case 4:
                const siftedLength = rawKeyB.length;
                const canProceed = siftedLength >= 4;
                return (
                    <div className="step-content active" id="step-4">
                        <div className="step-header">
                            <h1 className="step-title">4. Basis Reconciliation & Raw Key Sifting <span className="text-xs font-normal text-gray-500">(CLASSICAL CHANNEL)</span></h1>
                            <p className="step-subtitle">ALICE AND BOB PUBLICLY ANNOUNCE BASES TO DISCARD UNRELIABLE BITS AND FORM THE RAW KEY.</p>
                        </div>

                        <div className="dialogue-container">
                            <div className="dialogue-bubble military">
                                <div className="dialogue-speaker text-red-600">{aliceName}:</div>
                                <div className="dialogue-text">
                                    "The transmission is complete. I'm now broadcasting my <strong>full basis sequence</strong> over the public channel. Compare my '+' and '×' choices against yours, {bobName}, so we can isolate the strong candidates for our <strong>raw key</strong>."
                                </div>
                            </div>
                            <div className="dialogue-bubble command">
                                <div className="dialogue-speaker text-green-600">{bobName}:</div>
                                <div className="dialogue-text">
                                    "Acknowledged. Initiating <strong>sifting protocol</strong>. Only the positions where our random bases matched are considered reliable. Everything else is garbage data and must be discarded immediately."
                                </div>
                            </div>
                            <div className="dr-quantum-insight">
                                <div className="dr-quantum-icon">📡</div>
                                <div className="dr-quantum-content">
                                    <strong className="text-primary-blue">DR. QUANTUM'S INSIGHT:</strong> This step is safe on the public channel because they only reveal the <strong>basis choices</strong>, not the actual measured <strong>bits</strong>. By keeping only the matches (approx. 50% of trials), they establish the <strong>raw key</strong>.
                                </div>
                            </div>
                            <div className="dialogue-bubble command">
                                <div className="dialogue-speaker text-green-600">OPERATOR BOB:</div>
                                <div className="dialogue-text">
                                    "Sifting complete. We started with <strong>{KEY_LENGTH} photons</strong> and successfully generated a <strong>raw key</strong> of <strong id="sifted-key-length-display-1">{siftedLength}</strong> bits. This key is now ready for the critical security check."
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-700 mt-8 mb-4">BASIS COMPARISON AND RAW KEY GENERATION</h2>

                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>INDEX</th>
                                        <th>ALICE'S BASIS</th>
                                        <th>BOB'S BASIS</th>
                                        <th>MATCH?</th>
                                        <th>ALICE'S BIT (RAW KEY A)</th>
                                        <th>BOB'S BIT (RAW KEY B)</th>
                                        <th>KEEP?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderSiftingTable()}
                                </tbody>
                            </table>
                        </div>

                        <div className="action-section">
                            <button className="btn btn-primary" id="btn-proceed-qber-from-sifting" onClick={runQBERCheck} disabled={!canProceed}>
                                {canProceed ? 'PROCEED TO STEP 5: QBER CHECK' : 'RAW KEY TOO SHORT (MIN 4 BITS FOR CHECK)'}
                            </button>
                        </div>
                    </div>
                );
            case 5:
                const keySecured = qberRate < QBER_THRESHOLD && rawKeyB.length >= 4;
                const qberDisplay = qberRate.toFixed(1) + '%';
                const keyIsTooShortForOTP = finalKey.length > 0 && finalKey.length < 16;
                const showSecurityBlock = !keySecured || keyIsTooShortForOTP;
                const encryptionButtonText = keyIsTooShortForOTP ? 'KEY TOO SHORT FOR MESSAGE (OTP BLOCKED)' : 'PROCEED TO STEP 6: ENCRYPTION';

                const breakdownMessage = (
                    <>
                        <p className="mb-2">MISMATCHES (ERRORS): <strong>{qberErrors}</strong></p>
                        <p className="mb-2">TOTAL SAMPLED BITS: <strong>{qberSample}</strong> BITS</p>
                        <div className="mt-6 p-4 bg-gray-200 rounded-lg shadow-inner">
                            <p className="font-bold text-xl text-primary-blue">
                                QBER FORMULA: MISMATCHES / TOTAL SAMPLE
                            </p>
                            <p className="font-mono text-2xl text-red-700 mt-2">
                                {qberErrors} / {qberSample} = <strong>{qberDisplay}</strong>
                            </p>
                        </div>
                        {/* Note: The sampled indices logic is too complex for easy React component state/display. Omitted for simplicity. */}
                    </>
                );

                return (
                    <div className="step-content active" id="step-5">
                        <div className="step-header">
                            <h1 className="step-title">5. QBER Check & Final Key Generation</h1>
                            <p className="step-subtitle">CALCULATING QUANTUM BIT ERROR RATE (QBER) ON THE RAW KEY TO DETECT EAVESDROPPING.</p>
                        </div>

                        <div className="dialogue-container" id="qber-dialogue-container">
                            <div className={`dialogue-bubble ${keySecured ? 'command' : 'eve-attack'}`}>
                                <div className={`dialogue-speaker ${keySecured ? 'text-red-600' : 'text-purple-600'}`}>{keySecured ? aliceName : 'ALERT'}:</div>
                                <div className="dialogue-text">
                                    {keySecured ?
                                        `"QBER calculated: <strong>${qberDisplay}</strong>. This is below the ${QBER_THRESHOLD.toFixed(1)}% threshold! Key integrity is confirmed. We proceed to finalize the key for encryption."` :
                                        `"<strong>SECURITY BREACH!</strong> QBER calculated: <strong>${qberDisplay}</strong>. This high rate confirms an eavesdropping attack! The raw key is compromised and <strong>must be discarded</strong>."`
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="dr-quantum-insight">
                            <div className="dr-quantum-icon">🔬</div>
                            <div className="dr-quantum-content">
                                <strong className="text-primary-blue">DR. QUANTUM'S INSIGHT:</strong> If <strong>eve is absent</strong>, QBER is near <strong>0%</strong>. If <strong>eve performs her attack</strong>, the QBER should be approximately <strong>25%</strong>. If the QBER exceeds the <strong>{QBER_THRESHOLD.toFixed(1)}% threshold</strong>, {aliceName} and {bobName} know the key is compromised and <strong>must abort</strong>.
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-700 mt-8 mb-4">QBER RESULTS AND FINAL SECURE KEY (<strong>K</strong>)</h2>

                        {/* QBER Chart Integration */}
                        <QBERChart
                            qberRate={qberRate}
                            qberThreshold={QBER_THRESHOLD}
                            totalSample={qberSample}
                            errors={qberErrors}
                            keySecured={keySecured}
                        />

                        {/* Final Key Display Section */}
                        <div className="mb-6 p-4 rounded-xl bg-gray-100 border-2 border-green-500">
                            <div className="font-bold text-lg text-green-700 mb-2">FINAL SECURE KEY:</div>
                            <div id="final-key-display" className="break-words font-mono text-xl text-gray-800">
                                {keySecured ? (finalKey.length > 0 ? finalKey : 'NO KEY REMAINING AFTER QBER CHECK') : 'KEY DISCARDED'}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">LENGTH: <span id="final-key-length">{finalKey.length}</span> BITS</p>
                            <p className={`text-sm font-bold ${keySecured ? 'text-red-500' : 'text-danger-red'} mt-2`} id="key-truncation-note">
                                {keySecured ?
                                    (finalKey.length > 0 ? `(NOTE: THIS **${finalKey.length}-BIT SECURE KEY** WILL BE USED FOR ENCRYPTION.)` : '(KEY WAS TOO SHORT AFTER QBER CHECK AND DISCARDED.)') :
                                    '(KEY WAS DISCARDED DUE TO HIGH QBER.)'
                                }
                            </p>
                        </div>

                        {/* New Security Block Message Area */}
                        {showSecurityBlock && keySecured && (
                            <div className="dr-quantum-insight" style={{ borderLeftColor: 'var(--warning-yellow)', background: '#fffde7' }}>
                                <div className="dr-quantum-icon" style={{ color: 'var(--warning-yellow)' }}>⚠️</div>
                                <div className="dr-quantum-content" style={{ textTransform: 'none' }}>
                                    <strong className="text-warning-yellow">CRYPTOGRAPHIC BLOCK: KEY LENGTH CONSTRAINT</strong>
                                    <p className="mt-2">THE GENERATED <strong>SECURE KEY</strong> LENGTH ({finalKey.length} BITS) IS SHORTER THAN THE MESSAGE MINIMUM (16 BITS).</p>
                                    <p className="mt-2">FOR THEORETICAL <strong>ONE TIME PAD</strong> (OTP) SECURITY, KEY LENGTH MUST EQUAL MESSAGE LENGTH. WE WILL ONLY ENCRYPT THE FIRST {finalKey.length} BITS OF THE MESSAGE.</p>
                                    <p className="mt-2 font-bold">EDUCATIONAL CONCLUSION:</p>
                                    <p className="text-sm">IN A REAL WORLD SCENARIO, ALICE WOULD NOW USE THIS {finalKey.length} BIT KEY AS THE <strong>SESSION KEY</strong> FOR A HIGHLY SECURE SYMMETRIC ALGORITHM LIKE <strong>ADVANCED ENCRYPTION STANDARD (AES)</strong> TO ENCRYPT THE FULL MESSAGE.</p>
                                </div>
                            </div>
                        )}


                        <div className="action-section">
                            <button className="btn btn-primary" id="btn-proceed-encryption" onClick={proceedToEncryption} disabled={!keySecured || finalKey.length === 0}>
                                {encryptionButtonText}
                            </button>
                            <button className="btn btn-danger" id="btn-abort-mission" onClick={() => window.location.reload()} style={{ display: keySecured ? 'none' : 'inline-block' }}>
                                ABORT MISSION & RESTART
                            </button>
                        </div>
                    </div>
                );
            case 6:
                const encryptionKey = finalKey;
                const encryptedMessage = messageBinary.substring(0, encryptionKey.length);
                const xorResultEnc = xorEncryptDecrypt(encryptedMessage, encryptionKey);
                return (
                    <div className="step-content active" id="step-6">
                        <div className="step-header">
                            <h1 className="step-title">6. Secure Communication: Encryption: <strong>M</strong> ⊕ <strong>K</strong> = <strong>C</strong></h1>
                            <p className="step-subtitle">{aliceName} APPLIES THE FINAL QUANTUM KEY (<strong>K</strong>) AS A ONE TIME PAD.</p>
                        </div>

                        <div className="dialogue-container">
                            <div className="dialogue-bubble command">
                                <div className="dialogue-speaker text-red-600">{aliceName}:</div>
                                <div className="dialogue-text">
                                    "Key integrity confirmed! We are now using our <strong>provably secret quantum key</strong> (K) as a one time pad. Initiating the XOR operation on the first <strong id="otp-message-length">{encryptionKey.length}</strong> bits of the message. Target locked: transmit ciphertext!"
                                </div>
                            </div>
                        </div>

                        <div className="dr-quantum-insight">
                            <div className="dr-quantum-icon">🔐</div>
                            <div className="dr-quantum-content">
                                <strong className="text-primary-blue">DR. QUANTUM'S INSIGHT:</strong> For true <strong>OTP SECURITY</strong>, the key must be equal to the message length. Since <strong>QKD</strong> yielded a shorter key, we <strong>only encrypt the first portion</strong> of the message to maintain perfect secrecy.
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-red-700 mt-6 mb-3 border-b-2 border-red-400 pb-1">PHASE A: ENCRYPTION BY {aliceName}: <strong>M</strong> ⊕ <strong>K</strong> = <strong>C</strong></h3>
                        <div className="p-4 rounded-xl bg-red-50 border-l-4 border-red-400 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-1">
                                    <p className="text-sm text-gray-600 mb-3">{aliceName} PERFORMS THE XOR (⊕) OPERATION BIT BY BIT:</p>
                                    <div className="font-bold text-red-700 mb-2">1. MESSAGE BINARY (<strong>M</strong>) (TRUNCATED): <span id="alice-message" className="font-mono text-md text-gray-800 break-all">{encryptedMessage}</span></div>
                                    <div className="font-bold text-blue-700 mb-4">2. KEY BINARY (<strong>K</strong>) (SECURE): <span id="alice-encryption-key" className="font-mono text-md text-gray-800 break-all">{encryptionKey}</span></div>
                                </div>
                                <div className="md:col-span-1 border-t md:border-t-0 md:border-l pt-4 md:pl-4">
                                    <div className="font-bold text-yellow-700 mb-2">3. CIPHERTEXT (<strong>C</strong>) (PUBLIC) = XOR RESULT:</div>
                                    <div id="ciphertext-display" className="font-mono text-xl font-bold break-words text-yellow-800">{xorResultEnc}</div>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <h4 className="font-bold text-sm mt-3 mb-2 text-gray-700">BITWISE XOR VISUALIZATION:</h4>
                                <div id="encryption-xor-details">
                                    {renderXORVisualization(encryptionKey, encryptedMessage, xorResultEnc, false)}
                                </div>
                            </div>
                        </div>

                        <div className="action-section">
                            <button className="btn btn-success" id="btn-proceed-decryption" onClick={proceedToDecryption}>
                                SEND CIPHERTEXT TO {bobName} (PROCEED TO STEP 7: DECRYPTION)
                            </button>
                        </div>
                    </div>
                );
            case 7:
                const decryptionKey = finalKey;
                const decryptedMessage = xorEncryptDecrypt(ciphertext, decryptionKey);
                const decryptedText = binaryToText(decryptedMessage);
                return (
                    <div className="step-content active" id="step-7">
                        <div className="step-header">
                            <h1 className="step-title">7. Secure Communication: Decryption: <strong>C</strong> ⊕ <strong>K</strong> = <strong>M</strong></h1>
                            <p className="step-subtitle">{bobName} APPLIES THE IDENTICAL QUANTUM KEY (<strong>K</strong>) TO RECOVER THE ORIGINAL MESSAGE.</p>
                        </div>

                        <div className="dialogue-container">
                            <div className="dialogue-bubble command">
                                <div className="dialogue-speaker text-green-600">{bobName}:</div>
                                <div className="dialogue-text">
                                    "Ciphertext (C) received! The moment of truth. Applying our shared secure key (K) in reverse: C $\oplus$ K. <strong>Message reconstruction commencing!</strong>"
                                </div>
                            </div>
                        </div>

                        <div className="dr-quantum-insight">
                            <div className="dr-quantum-icon">🔑</div>
                            <div className="dr-quantum-content">
                                <strong className="text-primary-blue">DR. QUANTUM'S INSIGHT:</strong> The operation is perfectly reversible. If the key is secret and identical, the original message is recovered. The security of this final message depends on the <strong>QKD PROTOCOL</strong> successfully generating a <strong>SECRET KEY</strong> in Step 5.
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-green-700 mt-6 mb-3 border-b-2 border-green-400 pb-1">PHASE B: DECRYPTION BY {bobName}: <strong>C</strong> ⊕ <strong>K</strong> = <strong>M</strong></h3>
                        <div className="p-4 rounded-xl bg-green-50 border-l-4 border-green-400 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-1">
                                    <p className="text-sm text-gray-600 mb-3">{bobName} USES THE RECEIVED CIPHERTEXT (<strong>C</strong>) AND THE IDENTICAL SHARED SECRET KEY (<strong>K</strong>):</p>
                                    <div className="font-bold text-yellow-700 mb-2">1. CIPHERTEXT (<strong>C</strong>) RECEIVED BY {bobName}: <span id="bob-ciphertext" className="font-mono text-md text-gray-800 break-all">{ciphertext}</span></div>
                                    <div className="font-bold text-blue-700 mb-4">2. KEY BINARY (<strong>K</strong>) (SECURE): <span id="bob-decryption-key" className="font-mono text-md text-gray-800 break-all">{decryptionKey}</span></div>
                                </div>

                                <div className="md:col-span-1 border-t md:border-t-0 md:border-l pt-4 md:pl-4">
                                    <div className="font-bold text-green-700 mb-2">3. DECRYPTED BINARY (<strong>M</strong>):</div>
                                    <div id="decrypted-message-binary" className="font-mono text-xl font-bold break-words text-green-800">{decryptedMessage}</div>
                                    <div className="font-bold text-green-700 mt-4 mb-2">4. DECRYPTED TEXT (<strong>M</strong>):</div>
                                    <div id="decrypted-message-text" className="font-mono text-xl font-bold break-words text-green-800">{decryptedText}</div>
                                </div>
                            </div>

                            <div className="col-span-3">
                                <h4 className="font-bold text-sm mt-3 mb-2 text-gray-700">BITWISE XOR VISUALIZATION:</h4>
                                <div id="decryption-xor-details">
                                    {renderXORVisualization(decryptionKey, ciphertext, decryptedMessage, true)}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 text-center p-4 bg-green-100 rounded-lg shadow-inner mt-4">
                            <h4 className="text-2xl font-bold text-green-700">TRANSMISSION SECURED: MESSAGE RECOVERED</h4>
                            <p className="text-green-600">THE DECRYPTED MESSAGE PERFECTLY MATCHES THE ENCRYPTED PORTION OF THE ORIGINAL MESSAGE.</p>
                        </div>

                        <div className="action-section">
                            <button className="btn btn-primary" onClick={() => window.location.reload()}>START NEW MISSION</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // --- MODAL RENDERING ---

    const renderModal = () => {
        if (!isModalOpen) return null;

        const qberDisplay = qberRate.toFixed(1) + '%';
        const modalContent = modalType === 'success' ? (
            <>
                <div className="modal-header text-success-green">KEY ESTABLISHED! QBER: <span id="qber-success-rate">{qberDisplay}</span></div>
                <div className="modal-body text-center">
                    <p className="text-3xl mb-4">🔐 ATTACK UNDETECTED 🔑</p>
                    <p className="text-lg font-semibold">QBER CALCULATION BREAKDOWN:</p>
                    <div className="font-mono text-base text-gray-700 mx-auto max-w-xs p-3">
                        <p className="mb-2">MISMATCHES (ERRORS): <strong>{qberErrors}</strong></p>
                        <p className="mb-2">TOTAL SAMPLED BITS: <strong>{qberSample}</strong> BITS</p>
                        <div className="mt-6 p-4 bg-gray-200 rounded-lg shadow-inner">
                            <p className="font-bold text-xl text-primary-blue">QBER FORMULA</p>
                            <p className="font-mono text-2xl text-red-700 mt-2">
                                {qberErrors} / {qberSample} = <strong>{qberDisplay}</strong>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-success" onClick={closeModal}>CONTINUE TO FINAL KEY</button>
                </div>
            </>
        ) : (
            <>
                <div className="modal-header text-danger-red">SECURITY ALERT! HIGH QBER: <span id="qber-warning-rate">{qberDisplay}</span></div>
                <div className="modal-body text-center">
                    <p className="text-3xl mb-4"><span className="text-warning-yellow">⚠️</span> EAVESDROPPER DETECTED <span className="text-warning-yellow">⚠️</span></p>
                    <p className="text-lg font-semibold">QBER CALCULATION BREAKDOWN:</p>
                    <div className="font-mono text-base text-gray-700 mx-auto max-w-xs p-3">
                        <p className="mb-2">MISMATCHES (ERRORS): <strong>{qberErrors}</strong></p>
                        <p className="mb-2">TOTAL SAMPLED BITS: <strong>{qberSample}</strong> BITS</p>
                        <div className="mt-6 p-4 bg-gray-200 rounded-lg shadow-inner">
                            <p className="font-bold text-xl text-primary-blue">QBER FORMULA</p>
                            <p className="font-mono text-2xl text-red-700 mt-2">
                                {qberErrors} / {qberSample} = <strong>{qberDisplay}</strong>
                            </p>
                        </div>
                    </div>
                    <p className="mt-4 font-bold text-danger-red text-xl">EAVESDROPPER DETECTED!</p>
                    <p>THE HIGH QUANTUM BIT ERROR RATE PROVES EVE'S INTERCEPTION AND COMPROMISE OF THE KEY. PROTOCOL MUST BE ABORTED IMMEDIATELY.</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-warning" onClick={() => window.location.reload()}>ABORT & RESTART</button>
                </div>
            </>
        );

        return (
            <div className={`modal ${isModalOpen ? 'show' : ''}`} id="qber-modal">
                <div className="modal-content">
                    {modalContent}
                </div>
            </div>
        );
    };

    return (
        <>
            <header className="main-header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="logo">⚛️</div>
                        <div>
                            <div className="title-text">BB84 Quantum Key Distribution</div>
                            <div className="subtitle-text">Protocol Simulator: Integrity Guaranteed by Physics</div>
                        </div>
                    </div>
                    <div className="text-white text-sm">
                        Initiate Secure Key Exchange
                    </div>
                </div>
            </header>

            <div className="main-container">
                <main className="content-area">
                    {renderContent(currentStep)}
                </main>
            </div>
            {renderModal()}
        </>
    );
};

export default BB84Simulator;