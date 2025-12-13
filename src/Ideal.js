import React, { useState, useRef, useCallback, useEffect } from 'react';
// Import the separate CSS file for use in your local project
// import './Ideal.css'; 

// --- CORE BB84 LOGIC & CONSTANTS ---
const BASES = ['+', '×'];
const KEY_LENGTH = 16; // Fixed key length for simplicity

// Map qubit bit and basis to visual direction arrows (UNICODE)
const POLARIZATION_MAP = {
    '+0': '→',
    '+1': '↑',
    '×0': '↗',
    '×1': '↖',
};

// Map qubit state to angle (for display on photon)
const ANGLE_MAP = {
    '+0': '0°',
    '+1': '90°',
    '×0': '45°',
    '×1': '135°',
};

// Timing constants for smoother, deliberate animation
const PHOTON_PREP_TIME_MS = 750;
const DURATION_ENCODER_TO_RECEIVER = 5250;
const DISTANCE_RATIO_E_TO_D = 50 / 70;
const DELAY_TO_BOB_DETECTOR = DURATION_ENCODER_TO_RECEIVER * DISTANCE_RATIO_E_TO_D;

// Define Key positions for animation (as percentages of container width)
const ANIMATION_POSITIONS = {
    ALICE_START: '5%',
    ALICE_ENCODER: '25%',
    BOB_DETECTOR: '75%',
    BOB_RECEIVER: '95%',
};

/** Generates a random bit (0 or 1) */
const randomBit = () => Math.floor(Math.random() * 2);

/** Generates a random basis ('+' or '×') */
const randomBasis = () => BASES[Math.floor(Math.random() * 2)];

/** Simulates Bob's measurement outcome based on Alice's state and Bob's basis (Forced match version). */
const measureQubit = (aliceBit, aliceBasis, bobBasis) => {
    // We enforce basis match in the preparation phase (startQKDTransmission),
    // so here we just implement the standard logic:
    if (aliceBasis === bobBasis) {
        return aliceBit;
    }
    // If mismatch (should not happen in this simplified simulation, but kept for logic integrity)
    return randomBit();
};

/** Simple XOR encryption/decryption function using a binary key (One Time Pad) */
const xorEncryptDecrypt = (binaryMessage, binaryKey) => {
    let result = '';
    const messageLength = binaryMessage.length;
    const keyLength = binaryKey.length;

    for (let i = 0; i < messageLength; i++) {
        const messageBit = parseInt(binaryMessage[i]);
        // Use the key bit, cycling if the key is too short
        const keyBit = parseInt(binaryKey[i % keyLength]);
        // XOR operation
        result += (messageBit ^ keyBit);
    }
    return result;
};

/** Converts text to a fixed 16 bit binary string (8 bits per character, max 2 chars) */
const textToBinary = (text, length) => {
    text = text.substring(0, 2);
    let binary = '';

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        binary += charCode.toString(2).padStart(8, '0');
    }

    return binary.padEnd(length, '0').substring(0, length);
};

/** Converts a 16 bit binary string back to text (assuming 8 bits per ASCII char) */
const binaryToText = (binary) => {
    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
        const chunk = binary.substring(i, i + 8);
        if (chunk.length === 8) {
            const charCode = parseInt(chunk, 2);
            if (charCode > 0 || (i === 0 && text.length === 0)) {
                text += String.fromCharCode(charCode);
            }
        }
    }
    return text.trim();
};

// --- REACT COMPONENT ---

const initialCharacterInfo = {
    naval: { alice: "Captain Alice", bob: "Operator Bob", aliceAvatar: '👩‍✈️', bobAvatar: '👨‍💻' },
    space: { alice: "Dr. Evelyn Reed", bob: "Pilot Zeta", aliceAvatar: '👩‍🔬', bobAvatar: '🛰️' },
    ground: { alice: "Commander Red", bob: "Specialist Green", aliceAvatar: '🪖', bobAvatar: '💂' },
    financial: { alice: "CEO Alice", bob: "Analyst Bob", aliceAvatar: '👩‍💼', bobAvatar: '👨‍💼' }
};

const initialBB84State = {
    currentStep: 1,
    missionSelected: null,
    messageBinary: "",
    messageText: "",
    quantumData: [], // [{index, aBit, aBasis, bBasis, bMeas, match}]
    finalKey: "",
    ciphertext: "",
    decryptedMessageBinary: "",
    decryptedMessageText: "",
    characterInfo: initialCharacterInfo['naval'], // Default info
    missionDialogue: null,
    photonIndex: 0,
    currentStatus: null,
};

const Ideal = () => {
    const [state, setState] = useState(initialBB84State);
    const [isAnimating, setIsAnimating] = useState(false);
    const photonRef = useRef(null); // Ref for the photon element for direct animation

    // --- UI/MODAL HANDLERS ---
    const showModal = (id) => document.getElementById(id)?.classList.add('show');
    const closeModal = (id) => document.getElementById(id)?.classList.remove('show');

    // --- DIALOGUE & MISSION LOGIC ---
    const getMissionDialogue = useCallback((mission) => {
        const themes = {
            naval: {
                speaker1: { role: "Communications Officer", avatar: "📞", class: "military", color: "text-danger-red" },
                line1: "Captain, incoming alert! Fleet Command's top secret orders are ready, but traditional transmission is a guaranteed risk. Hostile signals intelligence is active.",
                speaker2: { role: "Captain Alice", avatar: "👩‍✈️", class: "command", color: "text-success-green" },
                line2: "No traditional cryptography is safe enough! We need uncrackable security, immediately. Initiate BB84 protocol for key exchange now!",
                insight: "This naval operation demands <strong>absolute key secrecy</strong> against advanced cyber espionage. Only quantum mechanics guarantees the integrity of the key before the orders are sent."
            },
            space: {
                speaker1: { role: "Engineer", avatar: "🛰️", class: "military", color: "text-danger-red" },
                line1: "Dr. Reed, the Mars data package is ready for download, but the cosmic distance makes the key vulnerable to interception during the classical handshake.",
                speaker2: { role: "Dr. Evelyn Reed", avatar: "👩‍🔬", class: "command", color: "text-success-green" },
                line2: "The time delay is too great for conventional countermeasures. Bob, we are switching to BB84 for quantum key generation! Physics must secure this key!",
                insight: "In deep space, intercepted keys give adversaries too much time. BB84 ensures that if the key is touched during transmission, Alice and Bob will know instantly."
            },
            ground: {
                speaker1: { role: "Soldier (Urgent)", avatar: "🪖", class: "military", color: "text-danger-red" },
                line1: "Sir, I have crucial intelligence on enemy movements coordinates and vectors I need to send them to HQ immediately! Transmission standing by!",
                speaker2: { role: "Commander Red", avatar: "🪖", class: "command", color: "text-success-green" },
                line2: "HOLD! The standard classical channel is compromised. We cannot risk interception. Abandon the conventional method, Soldier. Initiate the BB84 Quantum Key Distribution protocol!",
                insight: "The threat is immediate. Standard keys can be cracked eventually. We use BB84 to generate a truly secret key guaranteed by physics, providing the only secure method for this critical mission data."
            },
            financial: {
                speaker1: { role: "Compliance Officer", avatar: "🏦", class: "military", color: "text-danger-red" },
                line1: "CEO Alice, we have a $500 million wire transfer ready. The cryptographic key required is too valuable to risk exposure on public networks.",
                speaker2: { role: "CEO Alice", avatar: "👩‍💼", class: "command", color: "text-success-green" },
                line2: "Security is paramount. We will not rely on old protocols. Analyst Bob, prepare the quantum channel now. The transfer key must be exchanged using BB84!",
                insight: "Financial transactions demand keys instantly verifiable as secret. BB84 allows the system to verify that no eavesdropper has learned any information about the final key."
            },
        };

        const defaultDialogue = `
            <div class="dialogue-bubble command">
                <div class="dialogue-speaker">Mission Control:</div>
                <div class="dialogue-text">
                    Welcome, Operative. The integrity of our sensitive communications rests entirely on the <strong>BB84 Quantum Key Distribution</strong> protocol. Select your mission environment below to begin key preparation.
                </div>
            </div>
            <div class="dr-quantum-insight">
                <div class="dr-quantum-icon">⚛️</div>
                <div class="dr-quantum-content">
                    <strong class="text-primary-blue">Dr. Quantum's Insight:</strong> Our goal is to generate a final, secure key between Alice and Bob that <strong>no eavesdropper can obtain undetected</strong>. The security is fundamentally guaranteed by the laws of quantum physics!
                </div>
            </div>
        `;

        if (mission && themes[mission]) {
            const currentTheme = themes[mission];
            return `
                <div class="dialogue-bubble ${currentTheme.speaker1.class}">
                    <div class="dialogue-speaker ${currentTheme.speaker1.color}">${currentTheme.speaker1.role}:</div>
                    <div class="dialogue-text">${currentTheme.line1}</div>
                </div>
                <div class="dialogue-bubble ${currentTheme.speaker2.class}">
                    <div class="dialogue-speaker ${currentTheme.speaker2.color}">${currentTheme.speaker2.role}:</div>
                    <div class="dialogue-text">${currentTheme.line2}</div>
                </div>
                <div class="dr-quantum-insight">
                    <div class="dr-quantum-icon">💡</div>
                    <div class="dr-quantum-content">
                        <strong class="text-primary-blue">Dr. Quantum's Insight:</strong> ${currentTheme.insight}
                    </div>
                </div>
            `;
        }
        return defaultDialogue;
    }, []);

    const selectMission = (mission) => {
        const charInfo = initialCharacterInfo[mission];
        const dialogue = getMissionDialogue(mission);

        setState(prev => ({
            ...prev,
            missionSelected: mission,
            characterInfo: charInfo,
            missionDialogue: dialogue
        }));
    };

    const handleMessageInput = useCallback((e) => {
        const text = e ? e.target.value.trim() : state.messageText;
        const binary = textToBinary(text, KEY_LENGTH);

        setState(prev => ({
            ...prev,
            messageText: text,
            messageBinary: binary,
        }));
    }, [state.messageText]);


    // --- STEP TRANSITION FUNCTIONS ---

    const startProtocol = () => {
        if (!state.missionSelected || state.messageBinary.length === 0) return;
        setState(prev => ({ ...prev, currentStep: 2 }));
    };

    const startQKDTransmission = () => {
        // Alice's Preparation: Generate all initial bits and bases
        const newQuantumData = [];
        for (let i = 0; i < KEY_LENGTH; i++) {
            const aBit = randomBit();
            const aBasis = randomBasis();
            // --- USER REQUEST: FORCE 100% BASIS MATCH (IDEAL SCENARIO) ---
            const bBasis = aBasis;

            newQuantumData.push({
                index: i,
                aBit: aBit,
                aBasis: aBasis,
                bBasis: bBasis,
                bMeas: null,
                match: null,
            });
        }

        setState(prev => ({
            ...prev,
            quantumData: newQuantumData,
            photonIndex: 0,
            currentStep: 3,
            currentStatus: `Ready for quantum transmission (0 / ${KEY_LENGTH} photons sent)...`,
        }));
    };

    // Helper to animate the photon using refs for imperative style updates
    const animatePhoton = useCallback((photonElement, targetLeft, duration) => {
        return new Promise((resolve) => {
            if (!photonElement) return resolve();
            photonElement.style.transition = `left ${duration}ms linear, background 0.3s ease-out, transform 0.3s ease-out`;
            photonElement.style.left = targetLeft;
            setTimeout(resolve, duration + 50);
        });
    }, []);

    const sendPhoton = useCallback(async (burst = false) => {
        if (state.photonIndex >= KEY_LENGTH || isAnimating) return;

        setIsAnimating(true);
        let currentIndex = state.photonIndex;

        do {
            const data = state.quantumData[currentIndex];
            const polarizationState = POLARIZATION_MAP[data.aBasis + data.aBit];
            const polarizationAngle = ANGLE_MAP[data.aBasis + data.aBit];

            // 1. Prepare/Reset Photon Element
            const photonElement = photonRef.current;
            if (photonElement) {
                photonElement.textContent = polarizationState;
                photonElement.style.left = ANIMATION_POSITIONS.ALICE_START;
                photonElement.style.opacity = '1';
                photonElement.style.transform = 'translateY(-50%) scale(1)';

                // Update Alice/Bob polarizer visualization
                document.getElementById('alice-polarizer').setAttribute('data-basis', data.aBasis);
                document.getElementById('bob-polarizer').setAttribute('data-basis', data.bBasis);
                
                // Update angle display
                const angleDisplay = photonElement.querySelector('.photon-angle');
                if (angleDisplay) angleDisplay.textContent = polarizationAngle;

                // 2. Start to Alice Encoder
                if (!burst) {
                    await animatePhoton(photonElement, ANIMATION_POSITIONS.ALICE_ENCODER, PHOTON_PREP_TIME_MS);
                    // Update status
                    setState(prev => ({ ...prev, currentStatus: `Photon ${currentIndex + 1}/${KEY_LENGTH}: Photon is prepared and encoded by Alice's ${data.aBasis} polarizer.` }));
                }

                // 3. Encoder to Bob Receiver
                if (!burst) {
                    // Start smooth transit animation
                    const transitPromise = animatePhoton(photonElement, ANIMATION_POSITIONS.BOB_RECEIVER, DURATION_ENCODER_TO_RECEIVER);
                    setState(prev => ({ ...prev, currentStatus: `Photon ${currentIndex + 1}/${KEY_LENGTH}: Traveling through the Quantum Channel to Bob...` }));

                    // Trigger quantum measurement logic mid-transit (at Bob's detector)
                    setTimeout(() => {
                        const finalMeasurement = measureQubit(data.aBit, data.aBasis, data.bBasis);
                        data.bMeas = finalMeasurement;

                        const isError = data.aBit !== finalMeasurement;
                        const statusText = isError
                            ? `Photon ${currentIndex + 1}/${KEY_LENGTH}: Measurement at Bob's ${data.bBasis} detector causes quantum collapse. Result: ${finalMeasurement} (Mismatch!).`
                            : `Photon ${currentIndex + 1}/${KEY_LENGTH}: Bob measures with matching ${data.bBasis} basis. Result: ${finalMeasurement} (Certain).`;
                        setState(prev => ({ ...prev, currentStatus: statusText }));

                        // Update the polarization icon and angle to reflect the measured state
                        const measuredState = data.bBasis + data.bMeas;
                        photonElement.textContent = POLARIZATION_MAP[measuredState];
                        if (angleDisplay) angleDisplay.textContent = ANGLE_MAP[measuredState];

                    }, DELAY_TO_BOB_DETECTOR);

                    await transitPromise;

                } else {
                    // Burst Mode: Skip animation, just calculate results immediately
                    data.bMeas = measureQubit(data.aBit, data.aBasis, data.bBasis);
                }

                // 4. Final step: Update state/table
                data.match = (data.aBasis === data.bBasis);
                state.quantumData[currentIndex] = data;

                if (!burst) {
                    // Hide the photon
                    photonElement.style.transition = 'opacity 0.3s ease-out';
                    photonElement.style.opacity = '0';
                    await new Promise(r => setTimeout(r, 300));
                }

                currentIndex++;
                setState(prev => ({ ...prev, quantumData: [...prev.quantumData], photonIndex: currentIndex }));
            }
        } while (burst && currentIndex < KEY_LENGTH);

        if (currentIndex >= KEY_LENGTH) {
            setState(prev => ({ ...prev, currentStatus: 'Transmission complete! Proceed to classical channel.' }));
        }

        setIsAnimating(false);
    }, [state.quantumData, state.photonIndex, isAnimating, animatePhoton]);


    // --- Step 4: Reconciliation (Basis comparison) ---
    const reconcileBases = () => {
        setState(prev => ({ ...prev, currentStep: 4 }));
    };

    // --- Step 5: Key Finalization (Skipping security checks for OTP length) ---
    const siftKey = () => {
        // Collect all Bob's measurements as the Raw Key (which is also the Final Key K)
        const rawKeyBits = state.quantumData.map(data => data.bMeas).join('');
        const finalKeyLength = rawKeyBits.length;

        setState(prev => ({
            ...prev,
            finalKey: rawKeyBits,
            currentStep: 5,
        }));
    };

    // --- Step 7: Encryption (M XOR K = C) ---
    const proceedToEncryption = () => {
        const key = state.finalKey;
        const message = state.messageBinary;

        // Encryption (Alice)
        const ciphertext = xorEncryptDecrypt(message, key);

        setState(prev => ({
            ...prev,
            ciphertext: ciphertext,
            currentStep: 7,
        }));
    };

    // --- Step 8: Decryption (C XOR K = M) ---
    const proceedToDecryption = () => {
        const key = state.finalKey;
        const ciphertext = state.ciphertext;

        // Decryption (Bob)
        const decryptedMessage = xorEncryptDecrypt(ciphertext, key);
        const decryptedText = binaryToText(decryptedMessage);

        setState(prev => ({
            ...prev,
            decryptedMessageBinary: decryptedMessage,
            decryptedMessageText: decryptedText,
            currentStep: 8,
        }));
    };

    // --- DYNAMIC RENDER HELPERS ---

    const renderMissionDialogue = () => (
        <div className="dialogue-container" dangerouslySetInnerHTML={{ __html: state.missionDialogue || getMissionDialogue(null) }} />
    );

    const renderConversionDetails = () => {
        const text = state.messageText.substring(0, 2);
        const binaryM = textToBinary(text, KEY_LENGTH);
        const requiredLength = KEY_LENGTH;

        const charDetails = [];
        let runningBinary = '';

        for (let i = 0; i < 2; i++) {
            const char = text[i] || '';
            const charCode = char ? char.charCodeAt(0) : 0;
            const byteBinary = charCode.toString(2).padStart(8, '0');
            let status = '';

            if (i < text.length) {
                status = <span className="text-success-green font-bold">BYTE KEPT</span>;
                runningBinary += byteBinary;
            } else {
                status = <span className="text-danger-red font-bold">BYTE PADDING (00000000)</span>;
                runningBinary += '00000000';
            }

            charDetails.push(
                <tr key={i}>
                    <td>{char || 'N/A'}</td>
                    <td>{charCode}</td>
                    <td>{byteBinary}</td>
                    <td>{status}</td>
                </tr>
            );
        }

        return (
            <div>
                <table className="conversion-table">
                    <thead><tr><th>Character</th><th>ASCII Code</th><th>8 bit Binary (Byte)</th><th>Status</th></tr></thead>
                    <tbody>{charDetails}</tbody>
                </table >
                <div className="mt-4 p-3 bg-gray-100 rounded-lg shadow-inner">
                    <p className="font-bold text-primary-blue text-sm">Final Message Binary (<strong>M</strong>) = Byte 1 + Byte 2</p>
                    <p className="font-mono text-lg break-all text-gray-800">{binaryM.substring(0, requiredLength)}</p>
                </div>
            </div >
        );
    };

    const renderQuantumTableBody = () => {
        return state.quantumData.map((data) => {
            const matchColor = data.match ? 'text-success-green' : 'text-danger-red';
            const matchText = data.match ? '✔' : '✘';
            const rowClass = data.match ? 'bg-green-50' : 'bg-red-50';

            return (
                <tr key={data.index} className={rowClass}>
                    <td>{data.index}</td>
                    <td className="text-red-600">{data.aBit}</td>
                    <td className="text-red-600">{data.aBasis}</td>
                    <td className="text-green-600">{data.bBasis}</td>
                    <td className="text-green-600">{data.bMeas === null ? '...' : data.bMeas}</td>
                    <td className={matchColor}>{data.match === null ? '...' : matchText}</td>
                </tr>
            );
        });
    };

    const renderBasisTableBody = () => {
        return state.quantumData.map((data) => {
            const match = data.aBasis === data.bBasis;
            const matchIcon = match ? <span className="text-success-green">✔ Match</span> : <span className="text-danger-red">✘ No Match</span>;
            const rowClass = match ? 'bg-green-50' : 'bg-red-50';

            return (
                <tr key={data.index} className={rowClass}>
                    <td>{data.index}</td>
                    <td>{data.aBasis}</td>
                    <td>{data.bBasis}</td>
                    <td>{matchIcon}</td>
                </tr>
            );
        });
    };

    const renderXORVisualization = (key, message, result, isDecryption) => {
        if (!key || !message || key.length !== message.length) return null;

        const displayLength = key.length;
        const rows = [];

        for (let i = 0; i < displayLength; i++) {
            const bit1 = message[i];
            const bit2 = key[i];
            const finalBit = result[i];

            rows.push(
                <div key={i} className={`grid grid-cols-5 gap-2 py-0.5 text-center ${i % 2 === 1 ? 'bg-gray-100 rounded-sm' : ''}`}>
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
                <div className="grid grid-cols-5 gap-2 font-bold text-gray-700 border-b pb-1 mb-1 text-center">
                    <span>No.</span>
                    <span>{isDecryption ? 'Ciphertext (C)' : 'Message (M)'}</span>
                    <span>Key (K)</span>
                    <span>Operator (⊕)</span>
                    <span>{isDecryption ? 'Result (M)' : 'Result (C)'}</span>
                </div>
                {rows}
            </div>
        );
    };

    // Function to generate content for the Dr. Quantum Guide modal
    const getGuideContent = (step) => {
        let content = '';
        let title = 'BB84 Protocol Guide';

        switch(step) {
            case 1:
                title = "Step 1: Mission Briefing and Input";
                content = `
                    <p class="mb-3">This is the non quantum setup phase. We select a mission scenario and enter the short message (<strong>M</strong>) we want to secure. The message length must match the key length (${KEY_LENGTH} bits) for a truly unbreakable <strong>One Time Pad (OTP)</strong>.</p>
                    <p class="font-bold text-gray-700">Next Step: Encoding.</p>
                `;
                break;
            case 2:
                title = "Step 2: Message Encoding (Text → Binary)";
                content = `
                    <p class="mb-3">The message must be converted into a raw binary string (<strong>M</strong>) before encryption can occur. This is done using <strong>ASCII encoding</strong>, where every character is represented by 8 bits (one byte).</p>
                    <p class="font-bold text-gray-700">Message (<strong>M</strong>):</p>
                    <p>Text $\\rightarrow$ ASCII Code $\\rightarrow$ 8 bit Binary. Two characters yield our required 16 bit message.</p>
                `;
                break;
            case 3:
                title = "Step 3: Quantum Key Generation (Quantum Channel)";
                content = `
                    <p class="mb-3">Alice sends single photon qubits and Bob measures them. <strong>Alice</strong> uses the polarizer on the left, and <strong>Bob</strong> uses the detector on the right.</p>
                    <p class="font-bold text-gray-700">The Measurement Rule:</p>
                    <ul class="list-disc list-inside ml-4 text-sm space-y-1">
                        <li><span class="font-bold">Bases Match:</span> The result is correct (100% certainty).</li>
                        <li><span class="font-bold">Bases Mismatch:</span> The result is <span class="font-bold">completely random (50/50)</span>, demonstrating quantum uncertainty.</li>
                    </ul>
                `;
                break;
            case 4:
                title = "Step 4: Basis Reconciliation (Classical Channel)";
                content = `
                    <p class="mb-3">Alice and Bob openly communicate their <strong>basis choices</strong> (but NOT the bits) over the public Classical Channel to identify indices where their filters matched.</p>
                    <p class="font-bold text-gray-700">Sifting:</p>
                    <p>Only the bits corresponding to matching bases are kept to form the <strong>Raw Key</strong>. The random results from mismatched bases are discarded.</p>
                `;
                break;
            case 5:
                title = "Step 5: Key Finalization (OTP Constraint)";
                content = `
                    <p class="mb-3">Since the channel was ideal (100% match) and the key needs to be ${KEY_LENGTH} bits long for the <strong>One Time Pad (OTP)</strong> to work, we are <strong>skipping the security check</strong>.</p>
                    <p class="font-bold text-gray-700">OTP Requirement:</p>
                    <p>The principle of the <strong>One Time Pad (OTP)</strong> demands the key (<strong>K</strong>) must be equal in length to the message (<strong>M</strong>). Since a normal QKD process would shorten the key by half, we adopt the full Raw Key to maintain this essential cryptographic integrity.</p>
                `;
                break;
            case 7:
                title = "Step 7: Encryption (<strong>M</strong> ⊕ <strong>K</strong> = <strong>C</strong>)";
                content = `
                    <p class="mb-3">Alice uses the final secure key (<strong>K</strong>) as a <strong>One Time Pad (OTP)</strong> to encrypt her message (<strong>M</strong>).</p>
                    <p class="mt-3">The encryption method is a simple <strong>XOR</strong> (⊕) operation: Message (<strong>M</strong>) ⊕ Key (<strong>K</strong>) = Ciphertext (<strong>C</strong>). The resulting Ciphertext is sent publicly to Bob.</p>
                `;
                break;
            case 8:
                title = "Step 8: Decryption (<strong>C</strong> ⊕ <strong>K</strong> = <strong>M</strong>)";
                content = `
                    <p class="mb-3">Bob receives the Ciphertext (<strong>C</strong>) and uses the identical secure key (<strong>K</strong>) generated by <strong>QKD</strong> to decrypt the message.</p>
                    <p class="mt-3">The decryption method uses the same simple <strong>XOR</strong> (⊕) operation: Ciphertext (<strong>C</strong>) ⊕ Key (<strong>K</strong>) = Message (<strong>M</strong>). This successfully retrieves the original message.</p>
                    <p class="mt-3">The underlying principle is: <strong>M</strong> ⊕ <strong>K</strong> ⊕ <strong>K</strong> = <strong>M</strong>.</p>
                `;
                break;
            default:
                content = "Detailed information for this step is available here. Click 'Navigator' on the characters bar for a quick overview.";
                break;
        }

        document.getElementById('modal-header').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        showModal('guide-modal');
    };

    // Ensure initial state runs on mount
    useEffect(() => {
        // Set initial dialogue and character info
        selectMission('naval'); 
    }, []);

    // Helper for rendering steps
    const renderStepContent = (stepNum, content) => (
        <div 
            className={`step-content ${state.currentStep === stepNum ? 'active' : ''}`} 
            id={`step-${stepNum}`}
        >
            {content}
        </div>
    );

    const char = state.characterInfo;

    return (
        <>
            {/* Main Header */}
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

            {/* Main Container */}
            <div className="main-container">
                <main className="content-area">

                    {/* Step 1: Mission Selection & Message Input */}
                    {renderStepContent(1, (
                        <>
                            <div className="step-header">
                                <h1 className="step-title">1. Mission Briefing and Message Input</h1>
                                <p className="step-subtitle">Choose your operational zone and input the vital two character message to be secured.</p>
                            </div>

                            {renderMissionDialogue()}

                            <div className="mission-grid">
                                <div className={`mission-card ${state.missionSelected === 'naval' ? 'selected' : ''}`} onClick={() => selectMission('naval')}>
                                    <div className="mission-icon">🌊</div>
                                    <div className="mission-title">Naval Operations</div>
                                    <div className="mission-description">Secure satellite communications for naval fleet operations.</div>
                                </div>
                                <div className={`mission-card ${state.missionSelected === 'space' ? 'selected' : ''}`} onClick={() => selectMission('space')}>
                                    <div className="mission-icon">🛰️</div>
                                    <div className="mission-title">Space Mission</div>
                                    <div className="mission-description">Deep space communication with Mars base station.</div>
                                </div>
                                <div className={`mission-card ${state.missionSelected === 'ground' ? 'selected' : ''}`} onClick={() => selectMission('ground')}>
                                    <div className="mission-icon">🛡️</div>
                                    <div className="mission-title">Ground Forces</div>
                                    <div className="mission-description">Military field operations secure key exchange.</div>
                                </div>
                                <div className={`mission-card ${state.missionSelected === 'financial' ? 'selected' : ''}`} onClick={() => selectMission('financial')}>
                                    <div className="mission-icon">🏦</div>
                                    <div className="mission-title">Financial Data Exchange</div>
                                    <div className="mission-description">Secure high value bank transaction data transfer.</div>
                                </div>
                            </div>

                            <div className="characters-section" style={{ display: state.missionSelected ? 'flex' : 'none' }}>
                                <div className="character">
                                    <div className="character-avatar alice-avatar">{char.aliceAvatar}</div>
                                    <div className="character-name">{char.alice}</div>
                                    <div className="character-role">Quantum Transmitter</div>
                                </div>
                                <div className="character">
                                    <div className="character-avatar bob-avatar">{char.bobAvatar}</div>
                                    <div className="character-name">{char.bob}</div>
                                    <div className="character-role">Quantum Receiver</div>
                                </div>
                                <div className="character" onClick={() => getGuideContent(1)}>
                                    <div className="character-avatar quantum-avatar">🧬</div>
                                    <div className="character-name">Dr. Quantum</div>
                                    <div className="character-role">Navigator</div>
                                </div>
                            </div>

                            {/* Message Input Section */}
                            <div className="file-upload-section" style={{ display: state.missionSelected ? 'block' : 'none' }}>
                                <h3 className="font-bold mb-4 text-primary-blue">
                                    Key Length (Required for OTP):
                                    <span id="key-length-display" className="text-xl font-mono text-gray-700">{KEY_LENGTH}</span> bits
                                </h3>

                                <p className="text-sm text-gray-500 mb-4 font-bold text-danger-red">
                                    CRITICAL CONSTRAINT: 16 bits allows only for a <span className="font-bold">2 character text message</span>. The message will be truncated/padded to fit this size.
                                </p>

                                <label htmlFor="message-input" className="block font-bold mb-2 text-gray-700">Type Your Secret Message (Max 2 chars):</label>
                                <input
                                    type="text"
                                    id="message-input"
                                    maxLength="2"
                                    placeholder="e.g., HI or GO"
                                    onInput={handleMessageInput}
                                    value={state.messageText}
                                    className="w-full max-w-sm mx-auto p-3 border-2 border-secondary-blue rounded-lg shadow-inner text-xl font-mono text-center"
                                />

                                <div style={{ margin: '1rem 0', fontSize: '0.9rem' }} className={`font-bold ${state.messageText.length > 0 ? 'text-green-700' : 'text-danger-red'}`}>
                                    {state.messageText.length > 0
                                        ? `Message captured: "${state.messageText}". Ready to proceed to Encoding.`
                                        : "Please enter a short text message (max 2 characters)."}
                                </div>

                                <div className="action-section">
                                    <button
                                        className="btn btn-primary"
                                        onClick={startProtocol}
                                        disabled={state.messageText.length === 0}
                                    >
                                        Proceed to Step 2: Encode Message
                                    </button>
                                </div>
                            </div>
                        </>
                    ))}

                    {/* Step 2: Message Encoding Detail */}
                    {renderStepContent(2, (
                        <>
                            <div className="step-header">
                                <h1 className="step-title">2. Message Encoding: Text to Binary (<strong>M</strong>)</h1>
                                <p className="step-subtitle">Witness the critical process: converting your vital text message into a 16 bit binary signal.</p>
                            </div>

                            <div className="dialogue-container">
                                <div className="dialogue-bubble command">
                                    <div className="dialogue-speaker text-red-600">{char.alice}:</div>
                                    <div className="dialogue-text">
                                        "The raw text message is: <span className="font-bold text-xl text-gray-800">"{state.messageText}"</span>. We must convert this into a binary stream, <strong>M</strong>, ready for cryptographic operation. Every character counts for 8 bits!"
                                    </div>
                                </div>
                            </div>

                            <div className="dr-quantum-insight" onClick={() => getGuideContent(2)}>
                                <div className="dr-quantum-icon">🧮</div>
                                <div className="dr-quantum-content">
                                    <strong className="text-primary-blue">Dr. Quantum's Insight:</strong> All data must be converted into digital bits before it can be secured. We use <strong>ASCII encoding</strong>, the standard way computers understand letters, to change each character into its precise 8 bit code. This 16 bit sequence, <strong>M</strong>, is the secret message the quantum key must protect.
                                </div>
                            </div>

                            {/* Message Conversion Table */}
                            <div className="mt-8 pt-4 border-t border-gray-300">
                                <h4 className="text-lg font-bold text-primary-blue mb-3">Message Conversion Detail</h4>
                                {renderConversionDetails()}
                            </div>

                            <div className="action-section">
                                <button className="btn btn-success" onClick={startQKDTransmission}>
                                    Proceed to Step 3: Start Quantum Key Distribution
                                </button>
                            </div>
                        </>
                    ))}

                    {/* Step 3: Quantum Transmission (Sending the photons) */}
                    {renderStepContent(3, (
                        <>
                            <div className="step-header">
                                <h1 className="step-title">3. Quantum Key Generation <span className="text-xs font-normal text-gray-500">(Quantum Channel)</span></h1>
                                <p className="step-subtitle">Alice sends <span id="key-length-total-2">{KEY_LENGTH}</span> polarized photons (qubits) to Bob. Sent: <span id="key-length-progress-2">{state.photonIndex}</span> / Total: <span>{KEY_LENGTH}</span></p>
                            </div>

                            <div className="dialogue-container">
                                <div className="dialogue-bubble command">
                                    <div className="dialogue-speaker text-red-600">{char.alice}:</div>
                                    <div className="dialogue-text">
                                        "Key transmission initiated! I'm sending <strong>{KEY_LENGTH} polarized photons</strong>, each representing a random bit and basis choice, across the channel now. Bob, ready your receivers!"
                                    </div>
                                </div>
                                <div className="dialogue-bubble military">
                                    <div className="dialogue-speaker text-green-600">{char.bob}:</div>
                                    <div className="dialogue-text">
                                        "Photons received! My detectors are set to randomly measure each one, collapsing its quantum state. We're generating our shared key based on physics, Captain."
                                    </div>
                                </div>
                            </div>

                            <div className="dr-quantum-insight" onClick={() => getGuideContent(3)}>
                                <div className="dr-quantum-icon">🔑</div>
                                <div className="dr-quantum-content">
                                    <strong className="text-primary-blue">Dr. Quantum's Insight:</strong> The process begins by Alice generating {KEY_LENGTH} <strong>random bits</strong> (0s and 1s) and {KEY_LENGTH} random bases (+ or ×). These randomized choices determine the polarization of each photon. The final key, once established, will be used to <strong>encrypt and decrypt</strong> the text message <strong>M</strong> you entered.
                                </div>
                            </div>

                            <div className="quantum-channel-section">
                                <div className="channel-title">QUANTUM CHANNEL</div>
                                <div className="quantum-channel-container">
                                    <div className="quantum-channel-flow" id="quantum-channel-flow">
                                        {/* Alice Source */}
                                        <div className="flow-station" style={{ left: ANIMATION_POSITIONS.ALICE_START }}>
                                            <div className="channel-label-stack">ALICE (Source)</div>
                                            <span className="text-4xl text-red-400">{char.aliceAvatar}</span>
                                        </div>

                                        {/* Alice Polarizer */}
                                        <div className="polarizer flow-station" id="alice-polarizer" data-basis="+" style={{ left: ANIMATION_POSITIONS.ALICE_ENCODER }} title="Alice's Polarizer: Prepares the photon in one of four polarization states based on her random bit and basis.">
                                            <div className="channel-label-stack">Alice's Polarizer</div>
                                        </div>

                                        {/* Bob Detector */}
                                        <div className="polarizer flow-station" id="bob-polarizer" data-basis="+" style={{ left: ANIMATION_POSITIONS.BOB_DETECTOR }} title="Bob's Polarizer/Detector: Measures the incoming photon using his randomly chosen basis. This is where quantum collapse occurs.">
                                            <div className="channel-label-stack">Bob's Polarizer/Detector</div>
                                        </div>

                                        {/* Bob Receiver */}
                                        <div className="flow-station" style={{ left: ANIMATION_POSITIONS.BOB_RECEIVER }}>
                                            <div className="channel-label-stack">BOB (Receiver)</div>
                                            <span className="text-4xl text-green-400">{char.bobAvatar}</span>
                                        </div>

                                        {/* Photon Path/Particle */}
                                        <div className="photon-track" id="photon-track">
                                            {/* Photon element for imperative animation */}
                                            <div className="photon" ref={photonRef} style={{ opacity: state.photonIndex >= KEY_LENGTH ? 0 : 1 }}>
                                                {/* Angle display is inside photon */}
                                                <div className="photon-angle">...</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="transmission-status" style={{ textAlign: 'center', marginTop: '1rem', color: '#1f2937', background: '#f0f0f0', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                    {state.currentStatus}
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Index</th>
                                            <th>Alice's Bit</th>
                                            <th>Alice's Basis (<span className="font-bold">+ / ×</span>)</th>
                                            <th>Bob's Basis (<span className="font-bold">+ / ×</span>)</th>
                                            <th>Bob's Measurement</th>
                                            <th>Match?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderQuantumTableBody()}
                                    </tbody>
                                </table>
                            </div>

                            <div className="action-section">
                                <button className="btn btn-primary" onClick={() => sendPhoton(false)} disabled={isAnimating || state.photonIndex >= KEY_LENGTH}>
                                    Send Next Photon ({state.photonIndex + 1}/{KEY_LENGTH})
                                </button>
                                <button className="btn btn-warning" onClick={() => sendPhoton(true)} disabled={isAnimating || state.photonIndex >= KEY_LENGTH}>
                                    Send All Photons ({KEY_LENGTH})
                                </button>
                                <button className="btn btn-success" onClick={reconcileBases} disabled={state.photonIndex < KEY_LENGTH}>
                                    Proceed to Step 4
                                </button>
                            </div>
                        </>
                    ))}

                    {/* Step 4: Classical Reconciliation (Basis Publication) */}
                    {renderStepContent(4, (
                        <>
                            <div className="step-header">
                                <h1 className="step-title">4. Basis Reconciliation <span className="text-xs font-normal text-gray-500">(Classical Channel)</span></h1>
                                <p className="step-subtitle">Alice and Bob publicly announce their filter choices to determine key candidates.</p>
                            </div>

                            <div className="dialogue-container">
                                <div className="dialogue-bubble command">
                                    <div className="dialogue-speaker text-red-600">{char.alice}:</div>
                                    <div className="dialogue-text">
                                        "Public channel secured! Bob, I'm broadcasting the basis sequence I used: + or ×. Compare them against your measurement sequence."
                                    </div>
                                </div>
                                <div className="dialogue-bubble military">
                                    <div className="dialogue-speaker text-green-600">{char.bob}:</div>
                                    <div className="dialogue-text">
                                        "Understood, Alice. <strong>Any mismatch means that quantum uncertainty corrupted the result, and we must discard the corresponding bit.</strong> We only keep the indices where our filters aligned."
                                    </div>
                                </div>
                            </div>

                            <div className="dr-quantum-insight" onClick={() => getGuideContent(4)}>
                                <div className="dr-quantum-icon">📡</div>
                                <div className="dr-quantum-content">
                                    <strong className="text-primary-blue">Dr. Quantum's Insight:</strong> We are now on the <strong>classical channel</strong>. Basis choices are public information and safe to share. Crucially, we are <strong>not</strong> sharing the actual bits. This sifting process eliminates unreliable data, resulting in the Raw Key.
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Index</th>
                                            <th>Alice's Basis (<span className="font-bold">+ / ×</span>)</th>
                                            <th>Bob's Basis (<span className="font-bold">+ / ×</span>)</th>
                                            <th>Match?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderBasisTableBody()}
                                    </tbody>
                                </table>
                            </div>

                            <div className="action-section">
                                <button className="btn btn-success" onClick={siftKey}>
                                    Proceed to Step 5: Finalize Key
                                </button>
                            </div>
                        </>
                    ))}

                    {/* Step 5: Key Finalization: Skipping Security Check */}
                    {renderStepContent(5, (
                        <>
                            <div className="step-header">
                                <h1 className="step-title">5. Key Finalization: Skipping Security Check</h1>
                                <p className="step-subtitle">The Raw Key is perfectly matched, allowing us to skip sifting and checking to maintain the 16 bit length.</p>
                            </div>

                            <div className="dialogue-container">
                                <div className="dialogue-bubble command">
                                    <div className="dialogue-speaker text-red-600">{char.alice}:</div>
                                    <div className="dialogue-text">
                                        "Raw Key compilation complete! All {KEY_LENGTH} indices matched perfectly. We <strong>must skip the normal QKD security steps (sifting/checking)</strong> to keep the full {KEY_LENGTH} bits needed for our One Time Pad. Full key secured!"
                                    </div>
                                </div>
                                <div className="dialogue-bubble military">
                                    <div className="dialogue-speaker text-green-600">{char.bob}:</div>
                                    <div className="dialogue-text">
                                        "Affirmative. The cryptographic integrity of the One Time Pad demands the key length equals the message length. We are using the entire {KEY_LENGTH}-bit Raw Key as our Final Secure Key <strong>K</strong>."
                                    </div>
                                </div>
                            </div>

                            <div className="dr-quantum-insight" onClick={() => getGuideContent(5)}>
                                <div className="dr-quantum-icon">🔑</div>
                                <div className="dr-quantum-content">
                                    <strong className="text-primary-blue">Dr. Quantum's Insight:</strong> In a real BB84 deployment, you would <strong>always</strong> perform Sifting and the QBER check, which reduces the key length by half or more. However, to meet the strict requirement that the <strong>Key length must equal the Message length</strong> for a perfect <strong>One Time Pad (OTP)</strong>, we are using the full {KEY_LENGTH}-bit Raw Key as our Final Secure Key <strong>K</strong>.
                                </div>
                            </div>

                            {/* Simplified Key Display reflecting the FULL key */}
                            <h2 className="text-xl font-bold text-gray-700 mt-8 mb-4">Final Secure Key (<strong>K</strong>) [Full {KEY_LENGTH} Bits]</h2>

                            <div className="mb-6 p-4 rounded-xl bg-gray-100 border-2 border-green-500">
                                <div className="font-bold text-lg text-green-700 mb-2">FINAL SECURE KEY:</div>
                                <div id="final-key-display" className="break-words font-mono text-2xl text-gray-800">{state.finalKey}</div>
                                <p className="text-sm text-gray-500 mt-2">Length: <span id="final-key-length">{state.finalKey.length}</span> bits</p>
                            </div>

                            <div className="action-section">
                                <button className="btn btn-primary" onClick={proceedToEncryption} disabled={state.finalKey.length !== KEY_LENGTH}>
                                    Proceed to Step 7: Encryption
                                </button>
                            </div>
                        </>
                    ))}

                    {/* Step 7: Secure Communication - ENCRYPTION */}
                    {renderStepContent(7, (
                        <>
                            <div className="step-header">
                                <h1 className="step-title">7. Secure Communication: Encryption: <strong>M</strong> ⊕ <strong>K</strong> = <strong>C</strong></h1>
                                <p className="step-subtitle">Alice applies the final Quantum Key (<strong>K</strong>) as a One Time Pad.</p>
                            </div>

                            <div className="dialogue-container">
                                <div className="dialogue-bubble command">
                                    <div className="dialogue-speaker text-red-600">{char.alice}:</div>
                                    <div className="dialogue-text">
                                        "Key integrity confirmed. Initiating <strong>One Time Pad (OTP)</strong> encryption. Your binary message (<strong>M</strong>) XORed (⊕) with the secret key (<strong>K</strong>) produces the scrambled ciphertext (<strong>C</strong>)."
                                    </div>
                                </div>
                            </div>

                            <div className="dr-quantum-insight" onClick={() => getGuideContent(7)}>
                                <div className="dr-quantum-icon">🔐</div>
                                <div className="dr-quantum-content">
                                    <strong className="text-primary-blue">Dr. Quantum's Insight:</strong> The <strong>One Time Pad (OTP)</strong> is the perfect cipher. Because the quantum key <strong>K</strong> is provably secret and never reused, the resulting <strong>Ciphertext (C) is theoretically uncrackable</strong> even by a quantum computer.
                                    <p className="mt-2 text-warning-yellow font-bold text-sm">NOTE ON KEY LENGTH: The key (K) length must equal the message (M) length for true OTP security. By using the full {KEY_LENGTH}-bit Raw Key, we meet this requirement, making our encryption mathematically perfect.</p>
                                </div>
                            </div>

                            {/* Encryption Block (ALICE) */}
                            <h3 className="text-xl font-bold text-red-700 mt-6 mb-3 border-b-2 border-red-400 pb-1">Phase A: Encryption by Alice: <strong>M</strong> ⊕ <strong>K</strong> = <strong>C</strong></h3>
                            <div className="p-4 rounded-xl bg-red-50 border-l-4 border-red-400 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-1">
                                        <p className="text-sm text-gray-600 mb-3">Alice performs the XOR (⊕) operation bit by bit:</p>
                                        <div className="font-bold text-red-700 mb-2">1. Original Text (M): <span className="font-mono text-md text-gray-800 break-all">{state.messageText}</span></div>
                                        <div className="font-bold text-red-700 mb-2">2. Message Binary (<strong>M</strong>): <span className="font-mono text-md text-gray-800 break-all">{state.messageBinary}</span></div>
                                        <div className="font-bold text-blue-700 mb-4">3. Key Binary (<strong>K</strong>) (Secret): <span className="font-mono text-md text-gray-800 break-all">{state.finalKey}</span></div>
                                    </div>
                                    <div className="md:col-span-1 border-t md:border-t-0 md:border-l pt-4 md:pl-4">
                                        <div className="font-bold text-yellow-700 mb-2">4. Ciphertext (<strong>C</strong>) (Public) = XOR Result:</div>
                                        <div className="font-mono text-xl font-bold break-words text-yellow-800">{state.ciphertext}</div>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <h4 className="font-bold text-sm mt-3 mb-2 text-gray-700">Bitwise XOR Visualization:</h4>
                                    {renderXORVisualization(state.finalKey, state.messageBinary, state.ciphertext, false)}
                                </div>
                            </div>

                            <div className="action-section">
                                <button className="btn btn-success" onClick={proceedToDecryption}>
                                    Send Ciphertext to Bob (Proceed to Step 8: Decryption)
                                </button>
                            </div>
                        </>
                    ))}

                    {/* Step 8: Secure Communication - DECRYPTION */}
                    {renderStepContent(8, (
                        <>
                            <div className="step-header">
                                <h1 className="step-title">8. Secure Communication: Decryption: <strong>C</strong> ⊕ <strong>K</strong> = <strong>M</strong></h1>
                                <p className="step-subtitle">Bob applies the identical Quantum Key (<strong>K</strong>) to recover the original message.</p>
                            </div>

                            <div className="dialogue-container">
                                <div className="dialogue-bubble military">
                                    <div className="dialogue-speaker text-green-600">{char.bob}:</div>
                                    <div className="dialogue-text">
                                        "Ciphertext <strong>C</strong> received and authenticated. Applying our shared quantum key <strong>K</strong> in reverse: <strong>C</strong> ⊕ <strong>K</strong>. Message reconstruction commencing!"
                                    </div>
                                </div>
                            </div>

                            <div className="dr-quantum-insight" onClick={() => getGuideContent(8)}>
                                <div className="dr-quantum-icon">🔑</div>
                                <div className="dr-quantum-content">
                                    <strong className="text-primary-blue">Dr. Quantum's Insight:</strong> The operation is symmetric: <strong>M</strong> ⊕ <strong>K</strong> = <strong>C</strong> and <strong>C</strong> ⊕ <strong>K</strong> = <strong>M</strong>. This means Bob can successfully recover the message (<strong>M</strong>) only if his key <strong>K</strong> is perfectly identical to Alice's key. The QKD protocol makes this possible.
                                </div>
                            </div>

                            {/* Decryption Block (BOB) */}
                            <h3 className="text-xl font-bold text-green-700 mt-6 mb-3 border-b-2 border-green-400 pb-1">Phase B: Decryption by Bob: <strong>C</strong> ⊕ <strong>K</strong> = <strong>M</strong></h3>
                            <div className="p-4 rounded-xl bg-green-50 border-l-4 border-green-400 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="md:col-span-1">
                                        <p className="text-sm text-gray-600 mb-3">Bob uses the received Ciphertext (<strong>C</strong>) and the identical shared secret key (<strong>K</strong>):</p>
                                        <div className="font-bold text-yellow-700 mb-2">1. Ciphertext (<strong>C</strong>) Received by Bob: <span className="font-mono text-md text-gray-800 break-all">{state.ciphertext}</span></div>
                                        <div className="font-bold text-blue-700 mb-4">2. Key Binary (<strong>K</strong>) (Secret): <span className="font-mono text-md text-gray-800 break-all">{state.finalKey}</span></div>
                                    </div>

                                    <div className="md:col-span-1 border-t md:border-t-0 md:border-l pt-4 md:pl-4">
                                        <div className="font-bold text-green-700 mb-2">3. Decrypted Binary (<strong>M</strong>):</div>
                                        <div className="font-mono text-xl font-bold break-words text-green-800">{state.decryptedMessageBinary}</div>

                                        <div className="font-bold text-green-700 mt-4 mb-2">4. Decrypted Text (<strong>M</strong>):</div>
                                        <div className="font-mono text-xl font-bold break-words text-green-800">{state.decryptedMessageText}</div>
                                    </div>
                                </div>

                                {/* XOR Visualization (Full Width) */}
                                <div className="col-span-3">
                                    <h4 className="font-bold text-sm mt-3 mb-2 text-gray-700">Bitwise XOR Visualization:</h4>
                                    {renderXORVisualization(state.finalKey, state.ciphertext, state.decryptedMessageBinary, true)}
                                </div>
                            </div>

                            <div className="col-span-3 text-center p-4 bg-green-100 rounded-lg shadow-inner mt-4">
                                <h4 className="text-2xl font-bold text-green-700">TRANSMISSION SECURED: MESSAGE RECOVERED</h4>
                                <p className="text-green-600">The decrypted message perfectly matches the original. Quantum Key Distribution succeeded in securing the communication.</p>
                            </div>


                            <div className="action-section">
                                <button className="btn btn-primary" onClick={() => window.location.reload()}>Start New Mission</button>
                            </div>
                        </>
                    ))}

                </main>
            </div>

            {/* The Guide Modal */}
            <div className="modal" id="guide-modal">
                <div className="modal-content">
                    <div className="modal-header" id="modal-header">BB84 Protocol Guide</div>
                    <div className="modal-body" id="modal-body"></div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={() => closeModal('guide-modal')}>Close</button>
                    </div>
                </div>
            </div>
            {/* Other Modals (omitted for brevity) */}
        </>
    );
};

export default Ideal;