import React, { useState } from 'react';
import './Certification.css';
import QuantumBackground from './QuantumBackground';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CertificatePage = () => {
    const [userName, setUserName] = useState('');
    const [instructorName, setInstructorName] = useState('');

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleDownloadPdf = () => {
        const certificateElement = document.getElementById('certificate-template');

        if (certificateElement && userName && instructorName) {
            certificateElement.style.display = 'block';

            html2canvas(certificateElement, { scale: 3 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('l', 'mm', 'a4');

                const imgWidth = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(`BB84_Certificate_${userName.replace(/\s/g, '_')}.pdf`);

                certificateElement.style.display = 'none';
            }).catch(error => {
                console.error("PDF Generation Error:", error);
                alert("Failed to generate PDF.");
            });
        } else {
            alert("Please enter both your name and instructor name.");
        }
    };

    return (
        <div className="certificate-wrapper">
            <QuantumBackground />

            <div className="certificate-input-card">
                <h1 className="cert-title">Generate Your Certificate</h1>
                <p className="cert-intro">
                    Enter the details below to receive your certificate for completing the
                    BB84 Quantum Key Distribution Protocol Simulation.
                </p>

                <input
                    type="text"
                    placeholder="Enter Your Full Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="name-input"
                />

                <input
                    type="text"
                    placeholder="Enter Instructor Name"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="name-input"
                />

                <button
                    onClick={handleDownloadPdf}
                    disabled={!userName || !instructorName}
                    className="download-button"
                >
                    Download PDF Certificate
                </button>
            </div>

            {/* -------- Certificate Template -------- */}
            <div id="certificate-template" className="certificate-template">
                <div className="certificate-border">
                    <p className="cert-header">Certificate of Successful Completion</p>
                    <p className="cert-awarded-to">This Certificate Is Awarded To</p>


                    <p className="cert-user-name">
                        {userName || "Recipient Name"}
                    </p>

                    <div className="cert-line"></div>

                    <p className="cert-recognition-text">
                        For successfully completing the interactive simulation of the
                        <span className="cert-highlight">
                            {" "}BB84 Quantum Key Distribution Protocol
                        </span>,
                        demonstrating proficiency in quantum state encoding, key sifting,
                        and Quantum Bit Error Rate (QBER) analysis.
                    </p>

                    <div className="cert-footers">
                        <div className="cert-signature-block">
                            <p className="cert-date">{currentDate}</p>
                            <div className="cert-signature-line"></div>
                            <p className="cert-label">Date of Completion</p>
                        </div>

                        <div className="cert-signature-block">
                            <p className="cert-signature-placeholder">
                                {instructorName || "Instructor Name"}
                            </p>
                            <div className="cert-signature-line"></div>
                            <p className="cert-label">Instructor</p>
                        </div>
                    </div>

                    <p className="cert-footer-text">
                        QKD_Xplore Virtual Lab © 2025
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CertificatePage;
