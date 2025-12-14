import React, { useState } from 'react';
import './Certification.css';
import QuantumBackground from './QuantumBackground';
// Import required PDF generation libraries
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CertificatePage = () => {
    const [userName, setUserName] = useState('');
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleDownloadPdf = () => {
        const certificateElement = document.getElementById('certificate-template');
        
        if (certificateElement && userName) {
            // Temporarily make the certificate visible for high-quality rendering
            certificateElement.style.display = 'block';

            // Use html2canvas to render the HTML element as a canvas image
            html2canvas(certificateElement, { scale: 3 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape, A4 size

                const imgWidth = 297; // A4 width in mm (landscape)
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(`BB84_Certificate_${userName.replace(/\s/g, '_')}.pdf`);

                // Hide the certificate template again
                certificateElement.style.display = 'none';
            }).catch(error => {
                console.error("PDF Generation Error:", error);
                alert("Failed to generate PDF. Check console for details.");
            });
        } else if (!userName) {
             alert("Please enter your name to generate the certificate.");
        }
    };

    return (
        <div className="certificate-wrapper">
            <QuantumBackground />
            
            <div className="certificate-input-card">
                <h1 className="cert-title">Generate Your Certificate</h1>
                <p className="cert-intro">
                    Enter your name below to receive your official certificate of completion for the BB84 Quantum Key Distribution Protocol Simulation.
                </p>
                
                <input
                    type="text"
                    placeholder="Enter Full Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="name-input"
                />

                <button 
                    onClick={handleDownloadPdf} 
                    disabled={!userName}
                    className="download-button"
                >
                    Download PDF Certificate
                </button>
            </div>

            {/* --- Certificate Template (Hidden by Default) --- */}
            {/* This is the element that will be captured by html2canvas */}
            <div id="certificate-template" className="certificate-template">
                <div className="certificate-border">
                    <p className="cert-header">Certificate of Achievement</p>
                    <p className="cert-awarded-to">This Certificate is Proudly Awarded To</p>
                    
                    {/* Display the user-entered name */}
                    <p className="cert-user-name">{userName || "Recipient Name"}</p> 
                    
                    <div className="cert-line"></div>
                    
                    <p className="cert-recognition-text">
                        For successfully completing the interactive simulation of the 
                        <span className="cert-highlight"> BB84 Quantum Key Distribution Protocol</span>, demonstrating proficiency in quantum state encoding, key sifting, and Quantum Bit Error Rate (QBER) analysis.
                    </p>

                    <div className="cert-footers">
                        <div className="cert-signature-block">
                            <p className="cert-date">{currentDate}</p>
                            <div className="cert-signature-line"></div>
                            <p className="cert-label">Date of Completion</p>
                        </div>
                        <div className="cert-signature-block">
                            <p className="cert-signature-placeholder">A. I. Generator</p>
                            <div className="cert-signature-line"></div>
                            <p className="cert-label">Instructor / Project Lead</p>
                        </div>
                    </div>
                    
                    <p className="cert-footer-text">Quantum Simulations &copy; 2025</p>
                </div>
            </div>
            {/* --- End Certificate Template --- */}
        </div>
    );
};

export default CertificatePage;
