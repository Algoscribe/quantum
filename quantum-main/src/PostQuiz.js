import React from "react";
import "./PostQuiz.css";
import QuantumBackground from "./QuantumBackground";

const PostQuizPage = () => {
  const postQuizUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLSf7HSPHCi85AIDvLmMYWM5LucmmGyQPRAdp2TEpz31-S5FFSw/viewform?usp=dialog";

  return (
    <div className="quiz-page">   {/* ✅ ADD THIS */}
      <div className="quiz-hero">
        <QuantumBackground />

        <div className="quiz-hero-content">
          <div className="quiz-orbit" />

          <p className="quiz-hero-kicker">POST-ASSESSMENT • BB84</p>

          <h1 className="quiz-hero-title">HAVE YOU MASTERED BB84?</h1>

          <p className="quiz-hero-body">
            You explored the full BB84 protocol. This post-quiz shows how your
            understanding evolved.
          </p>

          <ul className="quiz-hero-points">
            <li>Basis matching & valid qubits</li>
            <li>No-cloning → detect intruders</li>
            <li>QBER thresholds = keep or discard</li>
          </ul>

          <a
            href={postQuizUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="quiz-hero-btn"
          >
            START POST-QUIZ
          </a>

          <p className="quiz-hero-meta">
            Compare your score and celebrate progress
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostQuizPage;
