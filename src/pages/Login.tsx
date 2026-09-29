import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { adminLogin, customerLogin, employeeLogin } from "../services/api";

import { useAuth } from "../auth/AuthContext";

type LoginType = "CUSTOMER" | "EMPLOYEE" | "ADMIN";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loginType, setLoginType] = useState<LoginType>("CUSTOMER");

  const [email, setEmail] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [staffNumber, setStaffNumber] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState(location.state?.message ?? "");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setMessage("");

    if (loginType === "CUSTOMER" && !email) {
      setMessage("Email is required.");
      return;
    }

    if (loginType === "EMPLOYEE" && !employeeNumber) {
      setMessage("Employee number is required.");
      return;
    }

    if (loginType === "ADMIN" && (!email || !staffNumber)) {
      setMessage("Admin email and staff number are required.");
      return;
    }

    if (!password) {
      setMessage("Password is required.");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (loginType === "CUSTOMER") {
        result = await customerLogin(email, password);
      } else if (loginType === "EMPLOYEE") {
        result = await employeeLogin(employeeNumber, password);
      } else {
        result = await adminLogin(email, staffNumber, password);
      }

      login(result.token, {
        userId: result.userId,
        email: result.email,
        role: result.role,
        employeeRole: result.employeeRole,
        employeeNumber: result.employeeNumber,
      });

      if (result.role === "ADMIN") {
        navigate("/admin", {
          replace: true,
        });
      } else if (
        result.role === "EMPLOYEE" &&
        result.employeeRole === "DRIVER"
      ) {
        navigate("/driver", {
          replace: true,
        });
      } else if (result.role === "EMPLOYEE") {
        navigate("/employee", {
          replace: true,
        });
      } else {
        navigate("/customer", {
          replace: true,
        });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function selectLoginType(type: LoginType) {
    setLoginType(type);
    setMessage("");
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

          .swivel-login-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px 18px;
            position: relative;
            overflow: hidden;

            background:
              radial-gradient(
                circle at 10% 15%,
                rgba(41, 199, 201, 0.13),
                transparent 28%
              ),
              radial-gradient(
                circle at 90% 85%,
                rgba(0, 119, 190, 0.15),
                transparent 30%
              ),
              linear-gradient(
                135deg,
                #03141f 0%,
                #053f50 50%,
                #118a8c 100%
              );
          }

          .swivel-login-glow {
            position: absolute;
            width: 420px;
            height: 420px;
            border-radius: 50%;
            background:
              rgba(41, 199, 201, 0.08);
            filter: blur(50px);
            top: -180px;
            right: -140px;
          }

          .swivel-login-glow-bottom {
            position: absolute;
            width: 360px;
            height: 360px;
            border-radius: 50%;
            background:
              rgba(0, 119, 190, 0.08);
            filter: blur(45px);
            bottom: -150px;
            left: -140px;
          }

          .swivel-login-shell {
            position: relative;
            z-index: 2;
            width: min(1050px, 100%);
            display: grid;
            grid-template-columns:
              0.9fr 1.1fr;
            overflow: hidden;

            border:
              1px solid rgba(255, 255, 255, 0.12);

            border-radius: 32px;

            background:
              rgba(3, 20, 31, 0.68);

            box-shadow:
              0 35px 100px rgba(0, 0, 0, 0.32);

            backdrop-filter: blur(22px);
          }

          .swivel-login-brand {
            padding: 45px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            background:
              linear-gradient(
                145deg,
                rgba(41, 199, 201, 0.12),
                rgba(3, 20, 31, 0.18)
              );

            border-right:
              1px solid rgba(255, 255, 255, 0.08);
          }

          .swivel-login-brand img {
            width: min(330px, 100%);
            height: auto;
            margin: 0 auto;
          }

          .swivel-login-brand-copy {
            margin-top: 35px;
          }

          .swivel-login-eyebrow {
            color: #8deff0;
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }

          .swivel-login-brand-copy h2 {
            margin: 12px 0 0;
            color: white;
            font-size: clamp(2rem, 4vw, 3.3rem);
            line-height: 1.02;
            letter-spacing: -0.04em;
          }

          .swivel-login-brand-copy p {
            margin-top: 18px;
            color: rgba(255, 255, 255, 0.67);
            line-height: 1.75;
          }

          .swivel-login-contact {
            margin-top: 35px;
            padding-top: 20px;
            border-top:
              1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.55);
            font-size: 0.82rem;
            line-height: 1.7;
          }

          .swivel-login-form-panel {
            padding: 45px;
            background:
              rgba(255, 255, 255, 0.025);
          }

          .swivel-login-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
          }

          .swivel-login-top h1 {
            margin: 0;
            color: white;
            font-size: 2rem;
            letter-spacing: -0.03em;
          }

          .swivel-login-top p {
            margin: 9px 0 0;
            color: rgba(255, 255, 255, 0.55);
            font-size: 0.9rem;
          }

          .swivel-login-back {
            border: none;
            background: transparent;
            color: #8deff0;
            cursor: pointer;
            font-weight: 700;
          }

          .swivel-login-tabs {
            margin-top: 30px;
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 8px;
            padding: 6px;
            border-radius: 16px;
            background:
              rgba(255, 255, 255, 0.05);
          }

          .swivel-login-tab {
            border: none;
            border-radius: 12px;
            padding: 12px 10px;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.62);
            background: transparent;
            font-weight: 700;
            transition: all 0.2s ease;
          }

          .swivel-login-tab.active {
            color: #03141f;
            background: #29c7c9;
            box-shadow:
              0 8px 20px rgba(41, 199, 201, 0.15);
          }

          .swivel-login-form {
            margin-top: 28px;
            display: grid;
            gap: 18px;
          }

          .swivel-login-field {
            display: grid;
            gap: 8px;
          }

          .swivel-login-field label {
            color: rgba(255, 255, 255, 0.76);
            font-size: 0.88rem;
            font-weight: 700;
          }

          .swivel-login-input {
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

          .swivel-login-input::placeholder {
            color:
              rgba(255, 255, 255, 0.36);
          }

          .swivel-login-input:focus {
            border-color: #29c7c9;
            box-shadow:
              0 0 0 3px
                rgba(41, 199, 201, 0.1);
          }

          .swivel-login-submit {
            margin-top: 6px;
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

          .swivel-login-submit:disabled {
            cursor: not-allowed;
            opacity: 0.65;
          }

          .swivel-login-register {
            margin-top: 18px;
            text-align: center;
            color: rgba(255, 255, 255, 0.48);
            font-size: 0.88rem;
          }

          .swivel-login-register button {
            border: none;
            background: transparent;
            color: #8deff0;
            cursor: pointer;
            font-weight: 700;
          }

          .swivel-login-message {
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

          .swivel-login-footer {
            margin-top: 24px;
            text-align: center;
            color:
              rgba(255, 255, 255, 0.35);
            font-size: 0.75rem;
          }

          @media (max-width: 850px) {
            .swivel-login-shell {
              grid-template-columns: 1fr;
            }

            .swivel-login-brand {
              padding: 35px;
              border-right: none;
              border-bottom:
                1px solid rgba(255, 255, 255, 0.08);
            }

            .swivel-login-brand img {
              width: min(260px, 75vw);
            }

            .swivel-login-form-panel {
              padding: 35px;
            }
          }

          @media (max-width: 520px) {
            .swivel-login-page {
              padding: 16px;
            }

            .swivel-login-brand,
            .swivel-login-form-panel {
              padding: 24px;
            }

            .swivel-login-tabs {
              grid-template-columns: 1fr;
            }

            .swivel-login-top {
              display: block;
            }

            .swivel-login-back {
              margin-top: 12px;
            }
          }
        `}
      </style>

      <main className="swivel-login-page">
        <div className="swivel-login-glow" />
        <div className="swivel-login-glow-bottom" />

        <section className="swivel-login-shell">
          {/* BRAND PANEL */}

          <div className="swivel-login-brand">
            <div>
              <img src="/swivel-water-logo.png" alt="Swivel Water" />

              <div className="swivel-login-brand-copy">
                <div className="swivel-login-eyebrow">Welcome back</div>

                <h2>
                  Stay refreshed.
                  <br />
                  Stay connected.
                </h2>

                <p>
                  Sign in to manage your Swivel Water orders, products,
                  payments, and deliveries.
                </p>
              </div>
            </div>

            <div className="swivel-login-contact">
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
              066 24 222 41
            </div>
          </div>

          {/* LOGIN FORM */}

          <div className="swivel-login-form-panel">
            <div className="swivel-login-top">
              <div>
                <h1>Sign In</h1>

                <p>Choose your account type to continue.</p>
              </div>

              <button
                type="button"
                className="swivel-login-back"
                onClick={() => navigate("/")}
              >
                ← Home
              </button>
            </div>

            <div className="swivel-login-tabs">
              <button
                type="button"
                className={`swivel-login-tab ${
                  loginType === "CUSTOMER" ? "active" : ""
                }`}
                onClick={() => selectLoginType("CUSTOMER")}
              >
                Customer
              </button>

              <button
                type="button"
                className={`swivel-login-tab ${
                  loginType === "EMPLOYEE" ? "active" : ""
                }`}
                onClick={() => selectLoginType("EMPLOYEE")}
              >
                Employee / Driver
              </button>

              <button
                type="button"
                className={`swivel-login-tab ${
                  loginType === "ADMIN" ? "active" : ""
                }`}
                onClick={() => selectLoginType("ADMIN")}
              >
                Admin
              </button>
            </div>

            <div className="swivel-login-form">
              {loginType === "CUSTOMER" && (
                <div className="swivel-login-field">
                  <label htmlFor="customer-email">Customer Email</label>

                  <input
                    id="customer-email"
                    className="swivel-login-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              {loginType === "ADMIN" && (
                <>
                  <div className="swivel-login-field">
                    <label htmlFor="admin-email">Admin Email</label>

                    <input
                      id="admin-email"
                      className="swivel-login-input"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="swivel-login-field">
                    <label htmlFor="staff-number">Staff Number</label>

                    <input
                      id="staff-number"
                      className="swivel-login-input"
                      type="text"
                      placeholder="Enter staff number"
                      value={staffNumber}
                      onChange={(e) => setStaffNumber(e.target.value)}
                    />
                  </div>
                </>
              )}

              {loginType === "EMPLOYEE" && (
                <div className="swivel-login-field">
                  <label htmlFor="employee-number">Employee Number</label>

                  <input
                    id="employee-number"
                    className="swivel-login-input"
                    type="text"
                    placeholder="Enter employee number"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                  />
                </div>
              )}

              <div className="swivel-login-field">
                <label htmlFor="login-password">Password</label>

                <input
                  id="login-password"
                  className="swivel-login-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {message && <div className="swivel-login-message">{message}</div>}

              <button
                type="button"
                className="swivel-login-submit"
                disabled={loading}
                onClick={handleLogin}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>

            <div className="swivel-login-register">
              New to Swivel Water?{" "}
              <button type="button" onClick={() => navigate("/register")}>
                Create a customer account
              </button>
            </div>

            <div className="swivel-login-footer">
              Purified through reverse osmosis
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Login;
