import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowRight, AlertTriangle } from "lucide-react";

// ─── Main Component ──────────────────────────────────────────
const VerifyEmail = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Verifying your email…");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/v1/auth/verify-email",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Email verification failed.");
        }

        setSuccess(true);
        setMessage("Your email has been verified successfully!");

        // Start countdown and redirect
        let secs = 3;
        const interval = setInterval(() => {
          secs--;
          setCountdown(secs);
          if (secs <= 0) {
            clearInterval(interval);
            navigate("/login");
          }
        }, 1000);

        return () => clearInterval(interval);
      } catch (error) {
        setSuccess(false);
        setMessage(
          error instanceof Error ? error.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [navigate]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div className="ve-root">

        {/* Left — branding */}
        <div className="ve-left" aria-hidden="true">
          <Branding />
        </div>

        {/* Right — verification status */}
        <div className="ve-right">
          <div className="ve-card">

            {/* ── LOADING state ── */}
            {loading && (
              <div className="ve-state ve-fade-in">
                <div className="ve-icon ve-icon--loading">
                  <Loader2 size={32} className="ve-spin" />
                </div>
                <h2 className="ve-h2">Verifying your email</h2>
                <p className="ve-p">
                  Please wait while we verify your email address…
                </p>
                <div className="ve-progress-bar">
                  <span className="ve-progress-fill" />
                </div>
              </div>
            )}

            {/* ── SUCCESS state ── */}
            {!loading && success && (
              <div className="ve-state ve-fade-in">
                <div className="ve-icon ve-icon--success">
                  <CheckCircle size={34} />
                </div>
                <h2 className="ve-h2">Email verified!</h2>
                <p className="ve-p">{message}</p>
                <p className="ve-redirect-note">
                  Redirecting to login in <strong>{countdown}s</strong>…
                </p>
                <div className="ve-redirect-bar">
                  <span />
                </div>
                <button
                  className="ve-btn"
                  onClick={() => navigate("/login")}
                >
                  Go to Login now <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ── ERROR state ── */}
            {!loading && !success && (
              <div className="ve-state ve-fade-in">
                <div className="ve-icon ve-icon--error">
                  <XCircle size={34} />
                </div>
                <h2 className="ve-h2">Verification failed</h2>
                <p className="ve-p">{message}</p>

                <div className="ve-error-hint">
                  <AlertTriangle size={14} />
                  <span>The link may have expired or already been used.</span>
                </div>

                <button
                  className="ve-btn"
                  onClick={() => navigate("/login")}
                >
                  Go to Login <ArrowRight size={16} />
                </button>
                <p className="ve-sub-note">
                  You can request a new verification link from the login page.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </>
  );
};

// ─── Left branding panel (matches Login/Register) ────────────
function Branding() {
  const points = [
    "AI handles WhatsApp queries 24/7",
    "No manual replies — ever",
    "Campaigns sent in one click",
    "Full CRM for every customer",
  ];
  return (
    <div className="ve-brand">
      <div>
        <a href="/" className="ve-brand-logo">Brand<span>AI</span></a>
        <p className="ve-brand-tagline">
          Your AI sales team<br />on WhatsApp.
        </p>
        <ul className="ve-brand-perks">
          {points.map((p, i) => (
            <li key={i}><CheckCircle size={15} />{p}</li>
          ))}
        </ul>
      </div>
      <p className="ve-brand-footer">Trusted by 500+ Indian retailers</p>
    </div>
  );
}

export default VerifyEmail;

// ─── Styles ──────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }

.ve-root {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  min-height: 100vh;
  display: flex;
}

/* ── LEFT PANEL ── */
.ve-left {
  width: 420px;
  min-width: 420px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 52px;
}
.ve-brand {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.ve-brand-logo {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  text-decoration: none;
  letter-spacing: -0.5px;
  display: block;
  margin-bottom: 44px;
}
.ve-brand-logo span { color: #4ade80; }
.ve-brand-tagline {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  line-height: 1.25;
  letter-spacing: -0.5px;
  margin-bottom: 36px;
}
.ve-brand-perks {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ve-brand-perks li {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.5;
}
.ve-brand-perks li svg { color: #4ade80; flex-shrink: 0; }
.ve-brand-footer {
  font-size: 12px;
  color: #334155;
  margin-top: 60px;
}

/* ── RIGHT PANEL ── */
.ve-right {
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  overflow-y: auto;
}

/* ── CARD ── */
.ve-card {
  width: 100%;
  max-width: 440px;
}

/* ── STATE CONTAINER ── */
.ve-state {
  text-align: center;
}

/* ── FADE IN ── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ve-fade-in {
  animation: fadeInUp 0.5s ease-out;
}

/* ── ICONS ── */
.ve-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}
.ve-icon--loading {
  background: #eff6ff;
  color: #3b82f6;
}
.ve-icon--success {
  background: #dcfce7;
  color: #16a34a;
}
.ve-icon--error {
  background: #fef2f2;
  color: #dc2626;
}

/* ── TYPOGRAPHY ── */
.ve-h2 {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin-bottom: 10px;
}
.ve-p {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* ── LOADING PROGRESS BAR ── */
@keyframes indeterminate {
  0%   { left: -30%; width: 30%; }
  50%  { left: 30%;  width: 40%; }
  100% { left: 100%; width: 30%; }
}
.ve-progress-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  max-width: 200px;
  margin: 0 auto;
  position: relative;
}
.ve-progress-fill {
  position: absolute;
  top: 0;
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
  animation: indeterminate 1.5s ease-in-out infinite;
}

/* ── REDIRECT NOTE ── */
.ve-redirect-note {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 16px;
}
.ve-redirect-note strong {
  color: #16a34a;
  font-weight: 700;
}

/* ── REDIRECT BAR (success) ── */
.ve-redirect-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 24px;
}
.ve-redirect-bar span {
  display: block;
  height: 100%;
  background: #16a34a;
  border-radius: 2px;
  animation: fillBar 3s ease forwards;
}
@keyframes fillBar {
  from { width: 0%; }
  to   { width: 100%; }
}

/* ── ERROR HINT ── */
.ve-error-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
  margin-bottom: 24px;
  line-height: 1.4;
}

/* ── BUTTON ── */
.ve-btn {
  width: 100%;
  background: #16a34a;
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  padding: 13px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  transition: background 0.2s, transform 0.15s;
}
.ve-btn:hover {
  background: #15803d;
  transform: translateY(-1px);
}

/* ── SUB NOTE ── */
.ve-sub-note {
  font-size: 13px;
  color: #94a3b8;
}

/* ── SPINNER ── */
@keyframes spin { to { transform: rotate(360deg); } }
.ve-spin { animation: spin 0.8s linear infinite; }

/* ── RESPONSIVE ── */
@media (max-width: 860px) {
  .ve-left { display: none; }
  .ve-right {
    background: #fff;
    padding: 40px 20px;
    align-items: flex-start;
    padding-top: 80px;
  }
}
@media (max-width: 480px) {
  .ve-h2 { font-size: 22px; }
  .ve-card { max-width: 100%; }
}
`;