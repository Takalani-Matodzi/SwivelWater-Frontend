import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerCustomer } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("South Africa");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setMessage("");

    if (!firstName.trim()) {
      setMessage("First name is required.");
      return;
    }

    if (!lastName.trim()) {
      setMessage("Last name is required.");
      return;
    }

    if (!phone.trim()) {
      setMessage("Phone number is required.");
      return;
    }

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (!password) {
      setMessage("Password is required.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!addressLine1.trim()) {
      setMessage("Address is required.");
      return;
    }

    if (!city.trim()) {
      setMessage("City is required.");
      return;
    }

    if (!province.trim()) {
      setMessage("Province is required.");
      return;
    }

    if (!postalCode.trim()) {
      setMessage("Postal code is required.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerCustomer({
        email: email.trim(),
        password,
        confirmPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() ? addressLine2.trim() : undefined,
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      });

      localStorage.setItem("pendingVerificationEmail", email.trim());

      setMessage(
        result.message ||
          "Registration successful. Check your email for the OTP.",
      );

      navigate("/verify-otp");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed.",
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

          .swivel-register-page {
            min-height: 100vh;
            padding: 35px 18px;
            position: relative;
            overflow: hidden;

            background:
              radial-gradient(
                circle at 8% 10%,
                rgba(41, 199, 201, 0.14),
                transparent 28%
              ),
              radial-gradient(
                circle at 92% 90%,
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

          .swivel-register-glow {
            position: absolute;
            width: 450px;
            height: 450px;
            border-radius: 50%;
            background:
              rgba(41, 199, 201, 0.07);
            filter: blur(55px);
            top: -190px;
            right: -160px;
          }

          .swivel-register-glow-bottom {
            position: absolute;
            width: 350px;
            height: 350px;
            border-radius: 50%;
            background:
              rgba(0, 119, 190, 0.08);
            filter: blur(50px);
            bottom: -150px;
            left: -140px;
          }

          .swivel-register-shell {
            position: relative;
            z-index: 2;

            width: min(1120px, 100%);
            margin: 0 auto;

            display: grid;
            grid-template-columns:
              0.78fr 1.22fr;

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

          .swivel-register-brand {
            padding: 44px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            border-right:
              1px solid rgba(255, 255, 255, 0.08);

            background:
              linear-gradient(
                145deg,
                rgba(41, 199, 201, 0.11),
                rgba(3, 20, 31, 0.12)
              );
          }

          .swivel-register-brand img {
            width: min(300px, 100%);
            display: block;
            margin: 0 auto;
          }

          .swivel-register-eyebrow {
            margin-top: 40px;
            color: #8deff0;
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }

          .swivel-register-brand h2 {
            margin: 12px 0 0;
            color: white;
            font-size:
              clamp(2rem, 4vw, 3.2rem);
            line-height: 1.02;
            letter-spacing: -0.04em;
          }

          .swivel-register-brand-text {
            margin-top: 18px;
            color: rgba(255, 255, 255, 0.65);
            line-height: 1.75;
          }

          .swivel-register-benefits {
            margin-top: 28px;
            display: grid;
            gap: 12px;
          }

          .swivel-register-benefit {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            color: rgba(255, 255, 255, 0.72);
            font-size: 0.88rem;
          }

          .swivel-register-benefit strong {
            color: #29c7c9;
          }

          .swivel-register-contact {
            margin-top: 35px;
            padding-top: 20px;
            border-top:
              1px solid rgba(255, 255, 255, 0.09);
            color: rgba(255, 255, 255, 0.48);
            font-size: 0.8rem;
            line-height: 1.7;
          }

          .swivel-register-form-panel {
            padding: 44px;
          }

          .swivel-register-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
          }

          .swivel-register-header h1 {
            margin: 0;
            color: white;
            font-size: 2rem;
            letter-spacing: -0.03em;
          }

          .swivel-register-header p {
            margin: 9px 0 0;
            color: rgba(255, 255, 255, 0.52);
            font-size: 0.9rem;
          }

          .swivel-register-home {
            border: none;
            background: transparent;
            color: #8deff0;
            cursor: pointer;
            font-weight: 700;
          }

          .swivel-register-form {
            margin-top: 28px;
          }

          .swivel-form-section-title {
            margin:
              28px 0 14px;
            color: #8deff0;
            font-size: 0.78rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            font-weight: 800;
          }

          .swivel-register-grid {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap: 15px;
          }

          .swivel-register-field {
            display: grid;
            gap: 7px;
          }

          .swivel-register-field-full {
            grid-column: 1 / -1;
          }

          .swivel-register-field label {
            color: rgba(255, 255, 255, 0.75);
            font-size: 0.84rem;
            font-weight: 700;
          }

          .swivel-register-input {
            width: 100%;
            border:
              1px solid rgba(255, 255, 255, 0.11);
            border-radius: 14px;
            padding: 13px 14px;
            color: white;
            background:
              rgba(255, 255, 255, 0.05);
            outline: none;
          }

          .swivel-register-input::placeholder {
            color:
              rgba(255, 255, 255, 0.32);
          }

          .swivel-register-input:focus {
            border-color: #29c7c9;
            box-shadow:
              0 0 0 3px
                rgba(41, 199, 201, 0.1);
          }

          .swivel-register-actions {
            margin-top: 30px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .swivel-register-submit {
            border: none;
            border-radius: 14px;
            padding: 15px 26px;
            cursor: pointer;
            color: #03141f;
            background:
              linear-gradient(
                135deg,
                #29c7c9,
                #58e1e2
              );
            font-weight: 800;
            box-shadow:
              0 14px 30px
                rgba(41, 199, 201, 0.15);
          }

          .swivel-register-submit:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }

          .swivel-register-cancel {
            border:
              1px solid rgba(255, 255, 255, 0.18);
            border-radius: 14px;
            padding: 15px 24px;
            cursor: pointer;
            color: white;
            background:
              rgba(255, 255, 255, 0.05);
            font-weight: 700;
          }

          .swivel-register-message {
            margin-top: 20px;
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

          .swivel-register-footer {
            margin-top: 24px;
            color:
              rgba(255, 255, 255, 0.34);
            font-size: 0.75rem;
            text-align: center;
          }

          @media (max-width: 850px) {
            .swivel-register-shell {
              grid-template-columns: 1fr;
            }

            .swivel-register-brand {
              padding: 34px;
              border-right: none;
              border-bottom:
                1px solid rgba(255, 255, 255, 0.08);
            }

            .swivel-register-brand img {
              width: min(250px, 75vw);
            }

            .swivel-register-form-panel {
              padding: 34px;
            }
          }

          @media (max-width: 600px) {
            .swivel-register-page {
              padding: 16px;
            }

            .swivel-register-brand,
            .swivel-register-form-panel {
              padding: 24px;
            }

            .swivel-register-grid {
              grid-template-columns: 1fr;
            }

            .swivel-register-field-full {
              grid-column: auto;
            }

            .swivel-register-header {
              display: block;
            }

            .swivel-register-home {
              margin-top: 12px;
            }
          }
        `}
      </style>

      <main className="swivel-register-page">
        <div className="swivel-register-glow" />
        <div className="swivel-register-glow-bottom" />

        <section className="swivel-register-shell">
          {/* BRAND PANEL */}

          <div className="swivel-register-brand">
            <div>
              <img src="/swivel-water-logo.png" alt="Swivel Water" />

              <div className="swivel-register-eyebrow">Join Swivel Water</div>

              <h2>
                Your water.
                <br />
                Your dashboard.
              </h2>

              <p className="swivel-register-brand-text">
                Create your Swivel Water customer account and make ordering
                purified water simple.
              </p>

              <div className="swivel-register-benefits">
                <div className="swivel-register-benefit">
                  <strong>01</strong>
                  <span>Order purified water online.</span>
                </div>

                <div className="swivel-register-benefit">
                  <strong>02</strong>
                  <span>Choose collection or delivery.</span>
                </div>

                <div className="swivel-register-benefit">
                  <strong>03</strong>
                  <span>Track your orders and payments.</span>
                </div>
              </div>
            </div>

            <div className="swivel-register-contact">
              <strong
                style={{
                  color: "#8deff0",
                }}
              >
                Swivel Water
              </strong>
              <br />
              9 Garden Street, Southernwood, East London
              <br />
              water@swivelec.co.za
            </div>
          </div>

          {/* REGISTRATION FORM */}

          <div className="swivel-register-form-panel">
            <div className="swivel-register-header">
              <div>
                <h1>Create Account</h1>

                <p>Enter your details to get started.</p>
              </div>

              <button
                type="button"
                className="swivel-register-home"
                onClick={() => navigate("/")}
              >
                ← Home
              </button>
            </div>

            <div className="swivel-register-form">
              <div className="swivel-form-section-title">
                Personal Information
              </div>

              <div className="swivel-register-grid">
                <div className="swivel-register-field">
                  <label htmlFor="firstName">First Name</label>

                  <input
                    id="firstName"
                    className="swivel-register-input"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field">
                  <label htmlFor="lastName">Last Name</label>

                  <input
                    id="lastName"
                    className="swivel-register-input"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field">
                  <label htmlFor="phone">Phone Number</label>

                  <input
                    id="phone"
                    className="swivel-register-input"
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field">
                  <label htmlFor="email">Email Address</label>

                  <input
                    id="email"
                    className="swivel-register-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field">
                  <label htmlFor="password">Password</label>

                  <input
                    id="password"
                    className="swivel-register-input"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>

                  <input
                    id="confirmPassword"
                    className="swivel-register-input"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="swivel-form-section-title">
                Delivery / Collection Address
              </div>

              <div className="swivel-register-grid">
                <div className="swivel-register-field swivel-register-field-full">
                  <label htmlFor="addressLine1">Address Line 1</label>

                  <input
                    id="addressLine1"
                    className="swivel-register-input"
                    type="text"
                    placeholder="Street address"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field swivel-register-field-full">
                  <label htmlFor="addressLine2">Address Line 2</label>

                  <input
                    id="addressLine2"
                    className="swivel-register-input"
                    type="text"
                    placeholder="Apartment, unit, complex (optional)"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field">
                  <label htmlFor="city">City</label>

                  <input
                    id="city"
                    className="swivel-register-input"
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field">
                  <label htmlFor="province">Province</label>

                  <input
                    id="province"
                    className="swivel-register-input"
                    type="text"
                    placeholder="Province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field">
                  <label htmlFor="postalCode">Postal Code</label>

                  <input
                    id="postalCode"
                    className="swivel-register-input"
                    type="text"
                    placeholder="Postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>

                <div className="swivel-register-field">
                  <label htmlFor="country">Country</label>

                  <input
                    id="country"
                    className="swivel-register-input"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              {message && (
                <div className="swivel-register-message">{message}</div>
              )}

              <div className="swivel-register-actions">
                <button
                  type="button"
                  className="swivel-register-submit"
                  disabled={loading}
                  onClick={handleRegister}
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Swivel Water Account"}
                </button>

                <button
                  type="button"
                  className="swivel-register-cancel"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </button>
              </div>
            </div>

            <div className="swivel-register-footer">
              Purified through reverse osmosis
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Register;
