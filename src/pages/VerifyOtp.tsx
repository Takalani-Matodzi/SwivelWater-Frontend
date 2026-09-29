import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { verifyOtp } from "../services/api";

function VerifyOtp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    localStorage.getItem("pendingVerificationEmail") ?? "",
  );

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setMessage("");

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (!otp.trim()) {
      setMessage("OTP is required.");
      return;
    }

    if (otp.trim().length !== 6) {
      setMessage("OTP must be 6 digits.");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtp(email.trim(), otp.trim());

      localStorage.removeItem("pendingVerificationEmail");

      navigate("/login", {
        replace: true,
        state: {
          message:
            result.message ||
            "Email verified successfully. You can now log in.",
        },
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "OTP verification failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            min-height: 100%;
          }

          body {
            background: #03141f;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .swivel-verify-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 25px 18px;
            position: relative;
            overflow: hidden;

            background:
              radial-gradient(
                circle at 12% 15%,
                rgba(41, 199, 201, 0.14),
                transparent 28%
              ),
              radial-gradient(
                circle at 88% 85%,
                rgba(0, 119, 190, 0.13),
                transparent 30%
              ),
              linear-gradient(
                135deg,
                #03141f 0%,
                #053f50 48%,
                #118a8c 100%
              );
          }

          .swivel-verify-glow {
            position: absolute;
            width: 440px;
            height: 440px;
            border-radius: 50%;
            background:
              rgba(41, 199, 201, 0.08);
            filter: blur(55px);
            top: -180px;
            right: -150px;
          }

          .swivel-verify-glow-bottom {
            position: absolute;
            width: 340px;
            height: 340px;
            border-radius: 50%;
            background:
              rgba(0, 119, 190, 0.08);
            filter: blur(50px);
            bottom: -150px;
            left: -140px;
          }

          .swivel-verify-card {
            position: relative;
            z-index: 2;

            width: min(920px, 100%);

            display: grid;
            grid-template-columns:
              0.9fr 1.1fr;

            overflow: hidden;

            border:
              1px solid rgba(255, 255, 255, 0.12);

            border-radius: 32px;

            background:
              rgba(3, 20, 31, 0.72);

            box-shadow:
              0 35px 100px rgba(0, 0, 0, 0.32);

            backdrop-filter: blur(22px);
          }

          .swivel-verify-brand {
            padding: 42px;
            display: flex;
            flex-direction: column;
            justify-content: center;

            border-right:
              1px solid rgba(255, 255, 255, 0.08);

            background:
              linear-gradient(
                145deg,
                rgba(41, 199, 201, 0.11),
                rgba(3, 20, 31, 0.12)
              );
          }

          .swivel-verify-brand img {
            width: min(290px, 100%);
            display: block;
            margin: 0 auto 28px;
          }

          .swivel-verify-eyebrow {
            color: #8deff0;
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }

          .swivel-verify-brand h2 {
            margin: 12px 0 0;
            color: white;
            font-size:
              clamp(2rem, 4vw, 3rem);
            line-height: 1.03;
            letter-spacing: -0.04em;
          }

          .swivel-verify-brand p {
            margin-top: 18px;
            color: rgba(255, 255, 255, 0.65);
            line-height: 1.75;
          }

          .swivel-verify-info {
            margin-top: 25px;
            padding: 16px;
            border-radius: 18px;
            background:
              rgba(41, 199, 201, 0.06);
            border:
              1px solid rgba(41, 199, 201, 0.12);
            color: rgba(255, 255, 255, 0.68);
            font-size: 0.84rem;
            line-height: 1.7;
          }

          .swivel-verify-form-panel {
            padding: 42px;
          }

          .swivel-verify-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
          }

          .swivel-verify-header h1 {
            margin: 0;
            color: white;
            font-size: 2rem;
            letter-spacing: -0.03em;
          }

          .swivel-verify-header p {
            margin: 9px 0 0;
            color: rgba(255, 255, 255, 0.52);
            font-size: 0.9rem;
            line-height: 1.6;
          }

          .swivel-verify-home {
            border: none;
            background: transparent;
            color: #8deff0;
            cursor: pointer;
            font-weight: 700;
          }

          .swivel-verify-form {
            margin-top: 30px;
            display: grid;
            gap: 18px;
          }

          .swivel-verify-field {
            display: grid;
            gap: 8px;
          }

          .swivel-verify-field label {
            color: rgba(255, 255, 255, 0.75);
            font-size: 0.86rem;
            font-weight: 700;
          }

          .swivel-verify-input {
            width: 100%;
            border:
              1px solid rgba(255, 255, 255, 0.11);
            border-radius: 14px;
            padding: 14px 15px;
            color: white;
            background:
              rgba(255, 255, 255, 0.05);
            outline: none;
          }

          .swivel-verify-input::placeholder {
            color:
              rgba(255, 255, 255, 0.32);
          }

          .swivel-verify-input:focus {
            border-color: #29c7c9;
            box-shadow:
              0 0 0 3px
                rgba(41, 199, 201, 0.1);
          }

          .swivel-verify-otp {
            text-align: center;
            font-size: 1.55rem;
            font-weight: 800;
            letter-spacing: 0.45em;
          }

          .swivel-verify-submit {
            margin-top: 8px;
            width: 100%;
            border: none;
            border-radius: 14px;
            padding: 15px;
            cursor: pointer;

            color: #03141f;

            background:
              linear-gradient(
                135deg,
                #29c7c9,
                #58e1e2
              );

            font-weight: 800;
            font-size: 1rem;

            box-shadow:
              0 14px 30px
                rgba(41, 199, 201, 0.16);
          }

          .swivel-verify-submit:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }

          .swivel-verify-message {
            padding: 13px 14px;
            border-radius: 14px;
            background:
              rgba(255, 100, 100, 0.08);
            border:
              1px solid rgba(255, 120, 120, 0.18);
            color: #ffd3d3;
            line-height: 1.5;
            font-size: 0.88rem;
          }

          .swivel-verify-back {
            margin-top: 15px;
            width: 100%;
            border:
              1px solid rgba(255, 255, 255, 0.16);
            border-radius: 14px;
            padding: 14px;
            cursor: pointer;
            color: white;
            background:
              rgba(255, 255, 255, 0.05);
            font-weight: 700;
          }

          .swivel-verify-footer {
            margin-top: 24px;
            text-align: center;
            color:
              rgba(255, 255, 255, 0.35);
            font-size: 0.75rem;
          }

          @media (max-width: 800px) {
            .swivel-verify-card {
              grid-template-columns: 1fr;
            }

            .swivel-verify-brand {
              padding: 32px;
              border-right: none;
              border-bottom:
                1px solid rgba(255, 255, 255, 0.08);
            }

            .swivel-verify-brand img {
              width: min(240px, 70vw);
            }

            .swivel-verify-form-panel {
              padding: 32px;
            }
          }

          @media (max-width: 520px) {
            .swivel-verify-page {
              padding: 16px;
            }

            .swivel-verify-brand,
            .swivel-verify-form-panel {
              padding: 24px;
            }

            .swivel-verify-header {
              display: block;
            }

            .swivel-verify-home {
              margin-top: 12px;
            }
          }
        `}
      </style>

      <main className="swivel-verify-page">
        <div className="swivel-verify-glow" />
        <div className="swivel-verify-glow-bottom" />

        <section className="swivel-verify-card">
          {/* BRAND SIDE */}

          <div className="swivel-verify-brand">
            <img src="/swivel-water-logo.png" alt="Swivel Water" />

            <div className="swivel-verify-eyebrow">One more step</div>

            <h2>Verify your email.</h2>

            <p>
              Confirm your email address to activate your Swivel Water customer
              account.
            </p>

            <div className="swivel-verify-info">
              <strong
                style={{
                  color: "#8deff0",
                }}
              >
                Security first
              </strong>
              <br />
              The verification code is valid for 10 minutes. Never share your
              OTP with anyone.
            </div>
          </div>

          {/* OTP FORM */}

          <div className="swivel-verify-form-panel">
            <div className="swivel-verify-header">
              <div>
                <h1>Verify Email</h1>

                <p>Enter the 6-digit code sent to your email address.</p>
              </div>

              <button
                type="button"
                className="swivel-verify-home"
                onClick={() => navigate("/")}
              >
                ← Home
              </button>
            </div>

            <div className="swivel-verify-form">
              <div className="swivel-verify-field">
                <label htmlFor="verify-email">Email Address</label>

                <input
                  id="verify-email"
                  className="swivel-verify-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="swivel-verify-field">
                <label htmlFor="verify-otp">Verification Code</label>

                <input
                  id="verify-otp"
                  className="swivel-verify-input swivel-verify-otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              {message && (
                <div className="swivel-verify-message">{message}</div>
              )}

              <button
                type="button"
                className="swivel-verify-submit"
                disabled={loading}
                onClick={handleVerify}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              <button
                type="button"
                className="swivel-verify-back"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </button>
            </div>

            <div className="swivel-verify-footer">
              Purified through reverse osmosis
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default VerifyOtp;
