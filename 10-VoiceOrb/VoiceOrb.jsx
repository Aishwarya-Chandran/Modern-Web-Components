import React, { useState } from "react";


export default function VoiceOrb() {
  
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => setIsListening((prev) => !prev);

  const statusText = isListening ? "Listening…" : "Tap to speak";

  return (
    <div className="vo-root" data-state={isListening ? "listening" : "idle"}>
      <style>{`
        .vo-root {
          --vo-bg-1: #0b0d12;
          --vo-bg-2: #12151d;
          --vo-ink: #eef0f4;
          --vo-muted: #8890a0;
          --vo-idle-a: #6b7280;
          --vo-idle-b: #444a58;
          --vo-active-a: #8b7bff;
          --vo-active-b: #48c6d6;
          --vo-ring: rgba(139, 123, 255, 0.35);

          box-sizing: border-box;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          background:
            radial-gradient(ellipse at 50% 35%, var(--vo-bg-2) 0%, var(--vo-bg-1) 65%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter,
            Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .vo-root *,
        .vo-root *::before,
        .vo-root *::after {
          box-sizing: border-box;
        }

        .vo-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .vo-orb-wrap {
          position: relative;
          width: 260px;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vo-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid var(--vo-ring);
          opacity: 0;
          width: 140px;
          height: 140px;
        }

        .vo-root[data-state="listening"] .vo-ring {
          animation: vo-pulse 2.6s cubic-bezier(0.2, 0.7, 0.3, 1) infinite;
        }

        .vo-ring:nth-child(1) { animation-delay: 0s; }
        .vo-ring:nth-child(2) { animation-delay: 0.85s; }
        .vo-ring:nth-child(3) { animation-delay: 1.7s; }

        @keyframes vo-pulse {
          0% {
            transform: scale(1);
            opacity: 0.45;
          }
          100% {
            transform: scale(1.85);
            opacity: 0;
          }
        }

        .vo-glow {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          filter: blur(38px);
          background: radial-gradient(
            circle,
            var(--vo-idle-a) 0%,
            transparent 70%
          );
          opacity: 0.35;
          transition: background 0.6s ease, opacity 0.6s ease;
        }

        .vo-root[data-state="listening"] .vo-glow {
          background: radial-gradient(
            circle,
            var(--vo-active-a) 0%,
            transparent 70%
          );
          opacity: 0.6;
          animation: vo-glow-breathe 2.6s ease-in-out infinite;
        }

        @keyframes vo-glow-breathe {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.12); opacity: 0.75; }
        }

        .vo-orb {
          position: relative;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            160deg,
            var(--vo-idle-a) 0%,
            var(--vo-idle-b) 100%
          );
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.25),
            inset 0 -12px 20px rgba(0, 0, 0, 0.25),
            0 8px 30px rgba(0, 0, 0, 0.45);
          animation: vo-breathe 4.5s ease-in-out infinite;
          transition: background 0.6s ease, transform 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          outline-offset: 6px;
        }

        .vo-orb:focus-visible {
          outline: 2px solid var(--vo-active-a);
        }

        .vo-orb:active {
          transform: scale(0.96);
        }

        .vo-root[data-state="listening"] .vo-orb {
          background: linear-gradient(
            160deg,
            var(--vo-active-a) 0%,
            var(--vo-active-b) 100%
          );
          animation: vo-breathe-active 1.8s ease-in-out infinite;
        }

        @keyframes vo-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }

        @keyframes vo-breathe-active {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }

     
        .vo-mic {
          width: 42px;
          height: 42px;
          position: relative;
          z-index: 1;
        }

       .vo-status {
          margin: 0;
          font-size: 15px;
          letter-spacing: 0.01em;
          color: var(--vo-muted);
          min-height: 20px;
          transition: color 0.4s ease;
        }

        .vo-root[data-state="listening"] .vo-status {
          color: var(--vo-ink);
        }

        .vo-hint {
          margin: 0;
          font-size: 12.5px;
          color: #4c5262;
          text-align: center;
          max-width: 220px;
          line-height: 1.5;
        }

       
        @media (prefers-reduced-motion: reduce) {
          .vo-orb,
          .vo-ring,
          .vo-glow {
            animation: none !important;
          }
        }

        @media (max-width: 420px) {
          .vo-orb-wrap {
            width: 220px;
            height: 220px;
          }
          .vo-orb {
            width: 116px;
            height: 116px;
          }
          .vo-mic {
            width: 34px;
            height: 34px;
          }
        }
      `}</style>

      <div className="vo-stage">
        
        <div className="vo-orb-wrap">
          <span className="vo-glow" aria-hidden="true" />
          <span className="vo-ring" aria-hidden="true" />
          <span className="vo-ring" aria-hidden="true" />
          <span className="vo-ring" aria-hidden="true" />

          <button
            type="button"
            className="vo-orb"
            onClick={toggleListening}
            aria-pressed={isListening}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            
            <svg
              className="vo-mic"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15.5c1.93 0 3.5-1.57 3.5-3.5V6a3.5 3.5 0 1 0-7 0v6c0 1.93 1.57 3.5 3.5 3.5Z"
                stroke="#f5f6fa"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 11a5.5 5.5 0 0 0 11 0"
                stroke="#f5f6fa"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 18.5V21"
                stroke="#f5f6fa"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M9 21h6"
                stroke="#f5f6fa"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

       
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <p className="vo-status">{statusText}</p>
          <p className="vo-hint">
            {isListening
              ? "Speak now — tap the orb again to stop."
              : "Tap the orb to begin."}
          </p>
        </div>
      </div>
    </div>
  );
}
