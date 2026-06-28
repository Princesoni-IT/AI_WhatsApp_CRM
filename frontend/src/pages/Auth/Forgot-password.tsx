import React, { useState, useEffect } from "react";
import {
  ArrowRight, Loader2, Mail, CheckCircle,
  Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound, ShieldCheck
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
type ForgotStep = "request" | "sent";
type ResetStep  = "reset"   | "done";
type PageMode   = "forgot"  | "reset";

// ─── Password strength ───────────────────────────────────────
function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  const map = [
    { label: "",        color: "#e2e8f0" },
    { label: "Weak",    color: "#ef4444" },
    { label: "Fair",    color: "#f97316" },
    { label: "Good",    color: "#eab308" },
    { label: "Strong",  color: "#16a34a" },
  ];
  return { score: s, ...map[s] };
}

// ─── Read token from URL (?token=xxx) ────────────────────────
function getTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("token");
}

// ══════════════════════════════════════════════════════════════
//  FORGOT PASSWORD FORM  (step 1 of the flow)
// ══════════════════════════════════════════════════════════════
function ForgotForm() {
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep]     = useState<ForgotStep>("request");

  function validate() {
    if (!email.trim())                    { setError("Email is required."); return false; }
    if (!/\S+@\S+\.\S+/.test(email))     { setError("Enter a valid email address."); return false; }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });

      // Controller always returns 200 (even if email not found — security by design)
      // So we always show the "sent" screen
      if (res.ok || res.status === 200) {
        setStep("sent");
        return;
      }

      const data = await res.json();
      setError(data?.message || "Something went wrong. Please try again.");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Sent screen ──────────────────────────────────────────────
  if (step === "sent") {
    return (
      <div className="fp-card">
        <div className="fp-success-icon fp-icon--mail">
          <Mail size={30} />
        </div>
        <h2 className="fp-card-h2">Check your inbox</h2>
        <p className="fp-card-desc">
          If <strong>{email}</strong> is linked to an account, we've sent a
          password reset link. The link expires in <strong>15 minutes</strong>.
        </p>
        <p className="fp-hint">Didn't get it? Check your spam folder.</p>
        <button
          className="fp-ghost-btn"
          onClick={() => { setStep("request"); setEmail(""); }}
        >
          <ArrowLeft size={15} /> Try a different email
        </button>
        <a href="/login" className="fp-back-login">Back to Sign in</a>
      </div>
    );
  }

  // ── Request form ─────────────────────────────────────────────
  return (
    <div className="fp-card">
      <div className="fp-card-icon">
        <KeyRound size={26} />
      </div>
      <h2 className="fp-card-h2">Forgot your password?</h2>
      <p className="fp-card-desc">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="fp-banner fp-banner--err" role="alert">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="fp-field">
          <label className="fp-label" htmlFor="fp-email">Email address</label>
          <input
            id="fp-email"
            className={`fp-input ${error ? "fp-input--err" : ""}`}
            type="email"
            placeholder="princesoni@gmail.com"
            value={email}
            autoComplete="email"
            onChange={e => { setEmail(e.target.value); setError(""); }}
          />
        </div>

        <button type="submit" className="fp-submit" disabled={loading}>
          {loading
            ? <><Loader2 size={16} className="fp-spin" /> Sending link…</>
            : <>Send reset link <ArrowRight size={15} /></>
          }
        </button>
      </form>

      <a href="/login" className="fp-back-login">
        <ArrowLeft size={14} /> Back to Sign in
      </a>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  RESET PASSWORD FORM  (user came from email link)
// ══════════════════════════════════════════════════════════════
function ResetForm({ token }: { token: string }) {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [errors, setErrors]       = useState<{ password?: string; confirm?: string; api?: string }>({});
  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState<ResetStep>("reset");

  const strength = getStrength(password);

  function validate() {
    const e: typeof errors = {};
    if (!password)              e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!confirm)               e.confirm  = "Please confirm your password.";
    else if (confirm !== password) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        // Controller expects: { token, password }
        body:    JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 400 → Invalid or expired reset token
        setErrors({ api: data?.message || "Reset link is invalid or has expired." });
        return;
      }

      // 200 → Password reset successfully
      setStep("done");
    } catch {
      setErrors({ api: "Network error. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ───────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="fp-card">
        <div className="fp-success-icon fp-icon--green">
          <ShieldCheck size={30} />
        </div>
        <h2 className="fp-card-h2">Password updated</h2>
        <p className="fp-card-desc">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <a href="/login" className="fp-submit fp-submit--link">
          Go to Sign in <ArrowRight size={15} />
        </a>
      </div>
    );
  }

  // ── Reset form ───────────────────────────────────────────────
  return (
    <div className="fp-card">
      <div className="fp-card-icon">
        <KeyRound size={26} />
      </div>
      <h2 className="fp-card-h2">Set a new password</h2>
      <p className="fp-card-desc">
        Choose a strong password. The link expires in <strong>15 minutes</strong>.
      </p>

      {errors.api && (
        <div className="fp-banner fp-banner--err" role="alert">
          <AlertCircle size={15} />
          <span>
            {errors.api}{" "}
            <a href="/forgot-password" className="fp-inline-link">Request a new link →</a>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* New password */}
        <div className="fp-field">
          <label className="fp-label" htmlFor="rp-pw">New password</label>
          <div className="fp-pw-wrap">
            <input
              id="rp-pw"
              className={`fp-input ${errors.password ? "fp-input--err" : ""}`}
              type={showPw ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              autoComplete="new-password"
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
            />
            <button
              type="button" className="fp-pw-toggle"
              onClick={() => setShowPw(s => !s)}
              aria-label={showPw ? "Hide" : "Show"}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Strength bar */}
          {password && (
            <div className="fp-strength">
              <div className="fp-strength-bars">
                {[1,2,3,4].map(n => (
                  <span
                    key={n}
                    className="fp-strength-bar"
                    style={{ background: n <= strength.score ? strength.color : "#e2e8f0" }}
                  />
                ))}
              </div>
              {strength.label && (
                <span className="fp-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              )}
            </div>
          )}

          {errors.password && <p className="fp-error" role="alert">{errors.password}</p>}
        </div>

        {/* Confirm password */}
        <div className="fp-field">
          <label className="fp-label" htmlFor="rp-cf">Confirm new password</label>
          <div className="fp-pw-wrap">
            <input
              id="rp-cf"
              className={`fp-input ${errors.confirm ? "fp-input--err" : ""}`}
              type={showCf ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirm}
              autoComplete="new-password"
              onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })); }}
            />
            <button
              type="button" className="fp-pw-toggle"
              onClick={() => setShowCf(s => !s)}
              aria-label={showCf ? "Hide" : "Show"}
            >
              {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Match indicator */}
          {confirm && password && (
            <p className={`fp-match ${confirm === password ? "fp-match--ok" : "fp-match--no"}`}>
              {confirm === password
                ? <><CheckCircle size={13} /> Passwords match</>
                : <><AlertCircle size={13} /> Passwords don't match</>
              }
            </p>
          )}

          {errors.confirm && <p className="fp-error" role="alert">{errors.confirm}</p>}
        </div>

        <button type="submit" className="fp-submit" disabled={loading}>
          {loading
            ? <><Loader2 size={16} className="fp-spin" /> Updating password…</>
            : <>Update password <ArrowRight size={15} /></>
          }
        </button>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT — decides which mode to render
// ══════════════════════════════════════════════════════════════
export default function ForgotPassword() {
  const [mode, setMode]   = useState<PageMode>("forgot");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = getTokenFromUrl();
    if (t) { setToken(t); setMode("reset"); }
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div className="fp-root">

        {/* Left branding panel */}
        <div className="fp-left" aria-hidden="true">
          <div className="fp-brand">
            <div>
              <a href="/" className="fp-brand-logo">Brand<span>AI</span></a>
              <p className="fp-brand-tagline">
                WhatsApp CRM<br />for Indian retailers.
              </p>
              <div className="fp-brand-info">
                <div className="fp-info-item">
                  <span className="fp-info-dot fp-dot--green" />
                  <span>Reset link expires in 15 minutes</span>
                </div>
                <div className="fp-info-item">
                  <span className="fp-info-dot fp-dot--blue" />
                  <span>Token is securely hashed — never stored in plain text</span>
                </div>
                <div className="fp-info-item">
                  <span className="fp-info-dot fp-dot--purple" />
                  <span>Link is one-time use and invalidated after reset</span>
                </div>
              </div>
            </div>
            <p className="fp-brand-footer">© 2025 BrandAI</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="fp-right">
          {mode === "forgot"
            ? <ForgotForm />
            : token
              ? <ResetForm token={token} />
              : (
                  // Token missing from URL — show error
                  <div className="fp-card">
                    <div className="fp-success-icon fp-icon--red">
                      <AlertCircle size={28} />
                    </div>
                    <h2 className="fp-card-h2">Invalid reset link</h2>
                    <p className="fp-card-desc">
                      This link is missing a reset token. Please request a new one.
                    </p>
                    <a href="/forgot-password" className="fp-submit fp-submit--link">
                      Request new link <ArrowRight size={15} />
                    </a>
                  </div>
                )
          }
        </div>

      </div>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }

.fp-root {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  min-height: 100vh;
  display: flex;
}

/* ── LEFT ── */
.fp-left {
  width: 400px;
  min-width: 400px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 48px;
}
.fp-brand {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.fp-brand-logo {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  text-decoration: none;
  letter-spacing: -0.5px;
  display: block;
  margin-bottom: 40px;
}
.fp-brand-logo span { color: #4ade80; }
.fp-brand-tagline {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  line-height: 1.25;
  letter-spacing: -0.4px;
  margin-bottom: 40px;
}
.fp-brand-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.fp-info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.55;
}
.fp-info-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}
.fp-dot--green  { background: #4ade80; }
.fp-dot--blue   { background: #60a5fa; }
.fp-dot--purple { background: #a78bfa; }
.fp-brand-footer {
  font-size: 12px;
  color: #334155;
  margin-top: 60px;
}

/* ── RIGHT ── */
.fp-right {
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  overflow-y: auto;
}

/* ── CARD ── */
.fp-card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.fp-card-icon {
  width: 52px; height: 52px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  margin-bottom: 20px;
}
.fp-card-h2 {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin-bottom: 8px;
}
.fp-card-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 24px;
}
.fp-card-desc strong { color: #0f172a; }

/* success icon variants */
.fp-success-icon {
  width: 68px; height: 68px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}
.fp-card:has(.fp-success-icon) { align-items: center; text-align: center; }
.fp-icon--mail   { background: #e0f2fe; color: #0284c7; }
.fp-icon--green  { background: #dcfce7; color: #16a34a; }
.fp-icon--red    { background: #fef2f2; color: #dc2626; }

/* ── BANNER ── */
.fp-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  margin-bottom: 20px;
  line-height: 1.5;
}
.fp-banner svg { flex-shrink: 0; margin-top: 1px; }
.fp-banner--err { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
.fp-inline-link { color: #b91c1c; font-weight: 600; text-decoration: underline; }

/* ── FIELDS ── */
.fp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}
.fp-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.fp-input {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 11px 14px;
  font-size: 14px;
  color: #0f172a;
  font-family: inherit;
  outline: none;
  width: 100%;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.fp-input::placeholder { color: #94a3b8; }
.fp-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.1);
}
.fp-input--err { border-color: #ef4444; }
.fp-input--err:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
.fp-error { font-size: 12px; color: #ef4444; }
.fp-hint  { font-size: 12px; color: #94a3b8; margin-bottom: 20px; }

/* ── PASSWORD ── */
.fp-pw-wrap { position: relative; }
.fp-pw-wrap .fp-input { padding-right: 42px; }
.fp-pw-toggle {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  cursor: pointer; color: #94a3b8;
  display: flex; align-items: center;
  padding: 4px;
  transition: color 0.15s;
}
.fp-pw-toggle:hover { color: #475569; }

/* strength */
.fp-strength {
  display: flex; align-items: center;
  gap: 8px; margin-top: 8px;
}
.fp-strength-bars { display: flex; gap: 4px; flex: 1; }
.fp-strength-bar  { height: 4px; flex: 1; border-radius: 2px; transition: background 0.25s; }
.fp-strength-label { font-size: 12px; font-weight: 600; min-width: 48px; text-align: right; }

/* match indicator */
.fp-match {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 500; margin-top: 4px;
}
.fp-match--ok { color: #16a34a; }
.fp-match--no { color: #ef4444; }

/* ── SUBMIT ── */
.fp-submit {
  width: 100%;
  background: #16a34a; color: #fff;
  font-family: inherit;
  font-size: 14px; font-weight: 700;
  padding: 13px 20px;
  border-radius: 8px; border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  transition: background 0.2s, transform 0.15s, opacity 0.2s;
  text-decoration: none;
}
.fp-submit:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); }
.fp-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.fp-submit--link { margin-top: 8px; }

.fp-ghost-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; width: 100%;
  background: #f1f5f9; color: #475569;
  font-family: inherit;
  font-size: 14px; font-weight: 600;
  padding: 11px 20px;
  border-radius: 8px; border: 1.5px solid #e2e8f0;
  cursor: pointer;
  margin-bottom: 16px;
  transition: background 0.2s, border-color 0.2s;
}
.fp-ghost-btn:hover { background: #e2e8f0; border-color: #cbd5e1; }

.fp-back-login {
  display: flex; align-items: center; justify-content: center;
  gap: 5px;
  font-size: 13px; color: #64748b; font-weight: 500;
  text-decoration: none; text-align: center;
  transition: color 0.2s;
}
.fp-back-login:hover { color: #16a34a; }

@keyframes spin { to { transform: rotate(360deg); } }
.fp-spin { animation: spin 0.8s linear infinite; }

/* ── RESPONSIVE ── */
@media (max-width: 860px) {
  .fp-left { display: none; }
  .fp-right { background: #fff; padding: 48px 20px; align-items: flex-start; }
}
@media (max-width: 480px) {
  .fp-card-h2 { font-size: 20px; }
  .fp-card { max-width: 100%; }
}
`;