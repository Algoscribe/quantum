// src/Credits.js
import React from "react";
import "./Credits.css";
import QuantumBackground from "./QuantumBackground";

export default function Credits() {
  return (
    <main className="credits-page">
      {/* Background */}
      <QuantumBackground />

      {/* Content */}
      <section className="credits-section">
        {/* Header */}
        <div className="credits-header">
          <div className="header-line"></div>
          <h1 className="credits-title">QKD-Xplore</h1>
          <div className="credits-subtitle-main">About the Project</div>
        </div>

        {/* Intro */}
        <div className="credits-intro">
          <div className="intro-line"></div>
          <p className="credits-text">
            <strong>QKD-Xplore</strong> is an interactive Quantum Key
            Distribution E-Laboratory developed for the{" "}
            <strong>Amravati Quantum Valley Hackathon 2025</strong>, organized
            under <strong>IIC Andhra Pradesh</strong> by{" "}
            <strong>Team QuSec</strong>.
          </p>
          <p className="credits-text">
            The laboratory provides a hands-on platform to understand and
            experiment with the <strong>BB84 protocol</strong> a foundational
            quantum cryptography protocol by{" "}
            <strong>Charles Bennett</strong> and{" "}
            <strong>Gilles Brassard</strong> (1984).
          </p>
        </div>

        {/* Divider */}
        <div className="credits-divider"></div>

        {/* Mentors Section */}
        <div className="credits-block">
          <h2 className="credits-subtitle">
            Developed Under the Guidance of
          </h2>
          <div className="mentors-grid">
            <div className="mentor-card">Dr. Ranjan Bala Jain</div>
            <div className="mentor-card">Mrs. Anuradha Jadiya</div>
          </div>
          <p className="credits-institution">
            Department of Electronics and Telecommunication Engineering
            <br />
            Vivekanand Education Society's Institute of Technology
          </p>
        </div>

        {/* Divider */}
        <div className="credits-divider"></div>

        {/* Team Section */}
        <div className="credits-block">
          <h2 className="credits-subtitle">Team QuSec Contributors</h2>
          <div className="team-grid">
            <div className="team-card">Aniruddha Gharat</div>
            <div className="team-card">Arundhati Nair</div>
            <div className="team-card">Harsh Mhadgut</div>
            <div className="team-card">Shantaram Chari</div>
            <div className="team-card">Sharavani Kale</div>
            <div className="team-card">Tejas Naringrekar</div>
          </div>
        </div>

        {/* Divider */}
        <div className="credits-divider"></div>

        {/* Feedback Section */}
        <div className="credits-block feedback-block">
          <h2 className="credits-subtitle">Suggestions & Feedback</h2>
          <p className="feedback-text">
            We welcome your suggestions and feedback to continuously improve
            this quantum laboratory.
          </p>
          <div className="contact-cta">
            <span className="cta-text">CONTACT US</span>
          </div>
        </div>

        {/* Footer Spacing */}
        <div className="credits-footer"></div>
      </section>
    </main>
  );
}