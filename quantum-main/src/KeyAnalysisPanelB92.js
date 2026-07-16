import React, { useMemo } from "react";

/**
 * Reusable BB84 Key Analysis Panel
 * Safe to use in ALL experiments
 */
export default function KeyAnalysisPanelB92({
    transmissions = [],
    stats = {},
    truncateLength = 32,
}) {

    const analysis = useMemo(() => {

        const sifted = transmissions.filter(
            (t) =>
                t.bMeas !== null &&
                t.bMeas !== "Lost" &&
                t.bMeas !== "Erasure"
        );

        const siftedKey = sifted
            .slice(0, stats.siftedKeyLength)
            .map((t) => t.bMeas)
            .join("");

        const truncatedKey =
            siftedKey.length > truncateLength
                ? siftedKey.slice(0, truncateLength) + "…"
                : siftedKey || "—";

        let status = "SAFE";
        let statusColor = "#22c55e";
        let statusText = "Channel secure, proceed";

        if (stats.qberPercent > 25) {
            status = "DANGER";
            statusColor = "#ef4444";
            statusText = "Channel compromised, abort protocol";
        }
        else if (stats.qberPercent >= 11) {
            status = "BEWARE";
            statusColor = "#eab308";
            statusText = "Elevated error rate detected";
        }

        return {
            totalTransmissions: transmissions.length,

            siftedLength: stats.siftedKeyLength,

            errors: stats.errorCount,

            qber: stats.qberPercent,

            status,

            statusColor,

            statusText,

            siftedKey,

            truncatedKey,
        };

    }, [transmissions, stats, truncateLength]);

    return (
        <div className="key-analysis-container">
            <div className="key-analysis-wrapper">
                <div className="key-analysis-header">
                    <h1 className="key-analysis-title">
                        Key Analysis & Security Verification
                    </h1>
                </div>

                {/* FORMULAS SECTION */}
                <div className="formula-section">
                    <h2 className="section-title">Mathematical Formulas</h2>

                    <div className="formula-grid">
                        {/* Sifted Key Length */}
                        <div className="formula-item">
                            <div className="formula-label">
                                1. Sifted Key Length
                            </div>
                            <div className="formula-box">
                                <span className="italic">n</span><sub>sifted</sub> = |{'{conclusive detector clicks}'}|
                            </div>
                            <div className="calculation-box">
                                <span className="italic">n</span><sub>sifted</sub> = {analysis.siftedLength} bits
                            </div>
                        </div>

                        {/* QBER Formula */}
                        <div className="formula-item">
                            <div className="formula-label">
                                2. Quantum Bit Error Rate (QBER)
                            </div>
                            <div className="formula-box qber-formula">
                                <span>QBER =</span>
                                <div className="fraction">
                                    <div className="numerator">
                                        Number of erroneous bits
                                    </div>
                                    <div className="denominator">
                                        Total number of bits compared
                                    </div>
                                </div>
                            </div>
                            <div className="calculation-box">
                                QBER = ({analysis.errors} / {analysis.siftedLength}) = <strong>{analysis.qber}%</strong>
                            </div>
                        </div>

                        {/* Security Thresholds */}
                        <div className="formula-item">
                            <div className="formula-label">
                                3. Security Thresholds
                            </div>
                            <div className="threshold-box">
                                • QBER &lt; 11% → SAFE<br />
                                • 11% ≤ QBER ≤ 25% → BEWARE<br />
                                • QBER &gt; 25% → DANGER
                            </div>
                            <div className="calculation-box">
                                Current Status: {analysis.qber}% → <strong>{analysis.status}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RESULTS TABLE */}
                <div className="results-section">
                    <h2 className="section-title">Analysis Results</h2>

                    <div className="table-wrapper">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="metric-name">Total Transmissions</td>
                                    <td className="metric-value">{analysis.totalTransmissions}</td>
                                    <td className="metric-desc">Photons transmitted by Alice</td>
                                </tr>
                                <tr>
                                    <td className="metric-name">Sifted Key Length</td>
                                    <td className="metric-value">{analysis.siftedLength}</td>
                                    <td className="metric-desc">Conclusive detector clicks retained</td>
                                </tr>
                                <tr>
                                    <td className="metric-name">Detected Errors</td>
                                    <td className="metric-value">{analysis.errors}</td>
                                    <td className="metric-desc">Errors introduced by Eve</td>
                                </tr>
                                <tr>
                                    <td className="metric-name">QBER</td>
                                    <td className="metric-value">{analysis.qber}%</td>
                                    <td className="metric-desc">Quantum Bit Error Rate</td>
                                </tr>
                                <tr>
                                    <td className="metric-name">Abort Threshold</td>
                                    <td className="metric-value">11%</td>
                                    <td className="metric-desc">Maximum acceptable QBER</td>
                                </tr>
                                <tr className="status-row" style={{ background: analysis.statusColor + '15' }}>
                                    <td className="metric-name status-label">Security Status</td>
                                    <td className="metric-value status-value" style={{ color: analysis.statusColor }}>
                                        {analysis.status}
                                    </td>
                                    <td className="metric-desc status-desc" style={{ color: analysis.statusColor }}>
                                        {analysis.status === 'SAFE' && 'No eavesdropping signature detected'}
                                        {analysis.status === 'BEWARE' && 'Potential Eve activity detected'}
                                        {analysis.status === 'DANGER' && 'Privacy leak detected — Abort key generation'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* KEY DISPLAY */}
                <div className="key-section">
                    <h2 className="section-title">Generated Sifted Key</h2>

                    {/* Full Key */}
                    <div className="key-display-group">
                        <div className="key-label">
                            Full Key ({analysis.siftedLength} bits)
                        </div>
                        <div className="key-box">
                            <div className="key-value">
                                {analysis.siftedKey}
                            </div>
                        </div>
                    </div>

                    {/* Truncated Key for Safety */}
                    <div className="key-display-group">
                        <div className="key-label">
                            Truncated Key (For Safety - First {truncateLength} bits)
                        </div>
                        <div className="key-box">
                            <div className="key-value">
                                {analysis.truncatedKey}
                            </div>
                        </div>
                        <div className="key-note">
                            <strong>Note:</strong> In production systems, the full key undergoes error correction and privacy amplification. Only a truncated portion is shown here for safety and display purposes.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}