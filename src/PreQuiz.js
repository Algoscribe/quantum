import React from "react";
import "./PreQuiz.css";
import QuantumBackground from "./QuantumBackground";

const PreQuizPage = () => {
  // Put your actual Google Form link here
  const preQuizUrl =
    "https://docs.google.com/forms/d/XXXXXXXXXXXXXXX/viewform";

  return (
    <div className="quiz-hero">
      <QuantumBackground />

      {/* Main hero content */}
      <div className="quiz-hero-content">
        <div className="quiz-orbit" />

        <p className="quiz-hero-kicker">PRE-ASSESSMENT • BB84</p>
        <h1 className="quiz-hero-title">ARE YOU QUANTUM-READY?</h1>

        <p className="quiz-hero-body">
          Before we dive into BB84 and quantum-safe encryption, this short
          pre-quiz maps where you are right now. No grades, no pressure—just a
          snapshot of your intuition about qubits, randomness, and security.
        </p>

        <ul className="quiz-hero-points">
          <li>Gauge your comfort with basic cryptography concepts.</li>
          <li>
            Reveal how you think about randomness, noise, and “secure” channels.
          </li>
          <li>
            Compare your score with the post-quiz to see real learning gain.
          </li>
        </ul>

        <a
          href={preQuizUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="quiz-hero-btn"
        >
          START PRE-QUIZ
        </a>

        <p className="quiz-hero-meta">
          ~5 minutes • 10 questions • Answer honestly—this is for you, not your
          marks.
        </p>
      </div>

      {/* Optional scroll hint / cinematic detail */}
      <div className="quiz-scroll-indicator">
        <span className="quiz-scroll-dot" />
      </div>
    </div>
  );
};

export default PreQuizPage;
