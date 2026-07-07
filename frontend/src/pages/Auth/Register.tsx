import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, CheckCircle, Mail, Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface FormData {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
}

interface FormErrors {
  firstName?: string;
  lastName?:  string;
  email?:     string;
  password?:  string;
  api?:       string;
}

type Step = "form" | "success";

// ─── Password strength ───────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  const map = [
    { label: "",         color: "#e2e8f0" },
    { label: "Weak",     color: "#ef4444" },
    { label: "Fair",     color: "#f97316" },
    { label: "Good",     color: "#eab308" },
    { label: "Strong",   color: "#16a34a" },
  ];
  return { score, ...map[score] };
}

// ─── Main Component ──────────────────────────────────────────
export default function Register() {
  const [form, setForm]         = useState<FormData>({ firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors]     = useState<FormErrors>({});
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState<Step>("form");
  const [agreedTos, setAgreedTos] = useState(false);

  const strength = getStrength(form.password);

  // ── Validation ──────────────────────────────────────────────
  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.firstName.trim())               e.firstName = "First name is required.";
    else if (form.firstName.length > 50)      e.firstName = "First name cannot exceed 50 characters.";
    
    if (!form.lastName.trim())                e.lastName  = "Last name is required.";
    else if (form.lastName.length > 50)       e.lastName  = "Last name cannot exceed 50 characters.";
    
    if (!form.email.trim())                   e.email     = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = "Enter a valid email address.";
    else if (form.email.length > 100)         e.email     = "Email cannot exceed 100 characters.";
    
    if (!form.password)                       e.password  = "Password is required.";
    else if (form.password.length < 8)        e.password  = "Password must be at least 8 characters.";
    else if (form.password.length > 32)       e.password  = "Password cannot exceed 32 characters.";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body:    JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // 409 = email already exists (from controller)
        setErrors({ api: data?.message || "Something went wrong. Please try again." });
        return;
      }

      setStep("success");
    } catch {
      setErrors({ api: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field error on edit
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  // ── Success screen ───────────────────────────────────────────
  if (step === "success") {
    return (
      <>
        <style>{STYLES}</style>
        <div className="rg-root">
          <div className="rg-left" aria-hidden="true">
            <Branding />
          </div>
          <div className="rg-right">
            <div className="rg-success">
              <div className="rg-success-icon">
                <Mail size={32} />
              </div>
              <h2 className="rg-success-h2">Check your email</h2>
              <p className="rg-success-p">
                We sent a verification link to <strong>{form.email}</strong>.<br />
                Click the link to activate your account.
              </p>
              <p className="rg-success-note">
                Didn't get it? Check your spam folder, or{" "}
                <button
                  className="rg-resend-btn"
                  onClick={() => setStep("form")}
                >
                  try a different email
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Form screen ──────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div className="rg-root">

        {/* Left panel — brand side */}
        <div className="rg-left" aria-hidden="true">
          <Branding />
        </div>

        {/* Right panel — form */}
        <div className="rg-right">
          <div className="rg-form-wrap">

            {/* Header */}
            <div className="rg-form-header">
              <div className="rg-mobile-logo">Brand<span>AI</span></div>
              <h1 className="rg-h1">Create your account</h1>
              <p className="rg-sub">
                Already have one?{" "}
                <a href="/login" className="rg-link">Sign in</a>
              </p>
            </div>

            {/* API error banner */}
            {errors.api && (
              <div className="rg-api-error" role="alert">
                {errors.api}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Name row */}
              <div className="rg-row">
                <Field
                  label="First name"
                  type="text"
                  placeholder="Prince"
                  value={form.firstName}
                  error={errors.firstName}
                  autoComplete="given-name"
                  maxLength={50}
                  onChange={v => handleChange("firstName", v)}
                />
                <Field
                  label="Last name"
                  type="text"
                  placeholder="Soni"
                  value={form.lastName}
                  error={errors.lastName}
                  autoComplete="family-name"
                  maxLength={50}
                  onChange={v => handleChange("lastName", v)}
                />
              </div>

              {/* Email */}
              <Field
                label="Work email"
                type="email"
                placeholder="prince@gmail.com"
                value={form.email}
                error={errors.email}
                autoComplete="email"
                maxLength={100}
                onChange={v => handleChange("email", v)}
              />

              {/* Password */}
              <div className="rg-field">
                <label className="rg-label">Password</label>
                <div className="rg-pw-wrap">
                  <input
                    className={`rg-input ${errors.password ? "rg-input--err" : ""}`}
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    autoComplete="new-password"
                    maxLength={32}
                    onChange={e => handleChange("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="rg-pw-toggle"
                    onClick={() => setShowPw(s => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength bar — shows only when user starts typing */}
                {form.password && (
                  <div className="rg-strength">
                    <div className="rg-strength-bars">
                      {[1, 2, 3, 4].map(n => (
                        <span
                          key={n}
                          className="rg-strength-bar"
                          style={{ background: n <= strength.score ? strength.color : "#e2e8f0" }}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <span className="rg-strength-label" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    )}
                  </div>
                )}

                {errors.password && <p className="rg-error">{errors.password}</p>}
              </div>

              {/* Terms */}
              <label className="rg-tos">
                <input
                  type="checkbox"
                  className="rg-checkbox"
                  checked={agreedTos}
                  onChange={e => setAgreedTos(e.target.checked)}
                />
                <span>
                  I agree to the{" "}
                  <a href="/terms" className="rg-link">Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy" className="rg-link">Privacy Policy</a>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="rg-submit"
                disabled={loading || !agreedTos}
              >
                {loading ? (
                  <><Loader2 size={16} className="rg-spin" /> Creating account…</>
                ) : (
                  <>Create account <ArrowRight size={16} /></>
                )}
              </button>

            </form>
          </div>
        </div>

      </div>
    </>
  );
}

// ─── Reusable field ──────────────────────────────────────────
function Field({
  label, type, placeholder, value, error, autoComplete, maxLength, onChange,
}: {
  label: string; type: string; placeholder: string; value: string;
  error?: string; autoComplete?: string; maxLength?: number; onChange: (v: string) => void;
}) {
  return (
    <div className="rg-field">
      <label className="rg-label">{label}</label>
      <input
        className={`rg-input ${error ? "rg-input--err" : ""}`}
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
      />
      {error && <p className="rg-error" role="alert">{error}</p>}
    </div>
  );
}

// ─── Left panel branding ─────────────────────────────────────
function Branding() {
  const perks = [
    "AI replies to customers 24/7 on WhatsApp",
    "Broadcast campaigns to thousands in one tap",
    "Full CRM — tags, segments, order history",
    "Live analytics for every conversation",
  ];
  return (
    <div className="rg-brand">
      <div>
        <a href="/" className="rg-brand-logo">Brand<span>AI</span></a>
        <p className="rg-brand-tagline">
          The WhatsApp CRM built<br />for Indian retailers.
        </p>
        <ul className="rg-brand-perks">
          {perks.map((p, i) => (
            <li key={i}>
              <CheckCircle size={16} />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <p className="rg-brand-footer">© 2025 BrandAI · Free 14-day trial</p>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }

.rg-root {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  min-height: 100vh;
  display: flex;
}

/* ── LEFT PANEL ── */
.rg-left {
  width: 420px;
  min-width: 420px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 52px;
}
.rg-brand {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.rg-brand-logo {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  text-decoration: none;
  letter-spacing: -0.5px;
  display: block;
  margin-bottom: 40px;
}
.rg-brand-logo span { color: #4ade80; }
.rg-brand-tagline {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  line-height: 1.25;
  letter-spacing: -0.5px;
  margin-bottom: 32px;
}
.rg-brand-perks {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rg-brand-perks li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.5;
}
.rg-brand-perks li svg { color: #4ade80; flex-shrink: 0; }
.rg-brand-footer {
  font-size: 12px;
  color: #334155;
  margin-top: 60px;
}

/* ── RIGHT PANEL ── */
.rg-right {
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  overflow-y: auto;
}
.rg-form-wrap {
  width: 100%;
  max-width: 460px;
}

/* mobile logo — hidden on desktop */
.rg-mobile-logo {
  display: none;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 28px;
  letter-spacing: -0.5px;
}
.rg-mobile-logo span { color: #16a34a; }

.rg-form-header { margin-bottom: 32px; }
.rg-h1 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}
.rg-sub { font-size: 14px; color: #64748b; }
.rg-link {
  color: #16a34a;
  font-weight: 600;
  text-decoration: none;
}
.rg-link:hover { text-decoration: underline; }

/* ── API ERROR ── */
.rg-api-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  color: #dc2626;
  margin-bottom: 20px;
  line-height: 1.5;
}

/* ── FIELDS ── */
.rg-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.rg-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}
.rg-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.rg-input {
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
.rg-input::placeholder { color: #94a3b8; }
.rg-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.1);
}
.rg-input--err {
  border-color: #ef4444;
}
.rg-input--err:focus {
  box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
}
.rg-error {
  font-size: 12px;
  color: #ef4444;
  line-height: 1.4;
}

/* ── PASSWORD ── */
.rg-pw-wrap { position: relative; }
.rg-pw-wrap .rg-input { padding-right: 44px; }
.rg-pw-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 0.15s;
}
.rg-pw-toggle:hover { color: #475569; }

/* ── STRENGTH BAR ── */
.rg-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.rg-strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}
.rg-strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  transition: background 0.25s;
}
.rg-strength-label {
  font-size: 12px;
  font-weight: 600;
  min-width: 48px;
  text-align: right;
}

/* ── TOS ── */
.rg-tos {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #475569;
  line-height: 1.55;
  margin-bottom: 22px;
  cursor: pointer;
}
.rg-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  accent-color: #16a34a;
  flex-shrink: 0;
  margin-top: 2px;
  cursor: pointer;
}

/* ── SUBMIT ── */
.rg-submit {
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
  transition: background 0.2s, transform 0.15s, opacity 0.2s;
}
.rg-submit:hover:not(:disabled) {
  background: #15803d;
  transform: translateY(-1px);
}
.rg-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes spin { to { transform: rotate(360deg); } }
.rg-spin { animation: spin 0.8s linear infinite; }

/* ── SUCCESS ── */
.rg-success {
  text-align: center;
  max-width: 380px;
}
.rg-success-icon {
  width: 72px;
  height: 72px;
  background: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  margin: 0 auto 24px;
}
.rg-success-h2 {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin-bottom: 12px;
}
.rg-success-p {
  font-size: 15px;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 20px;
}
.rg-success-p strong { color: #0f172a; }
.rg-success-note {
  font-size: 13px;
  color: #94a3b8;
}
.rg-resend-btn {
  background: none;
  border: none;
  color: #16a34a;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}
.rg-resend-btn:hover { text-decoration: underline; }

/* ── RESPONSIVE ── */
@media (max-width: 860px) {
  .rg-left { display: none; }
  .rg-right { background: #fff; padding: 40px 20px; align-items: flex-start; padding-top: 60px; }
  .rg-mobile-logo { display: block; }
}
@media (max-width: 480px) {
  .rg-row { grid-template-columns: 1fr; gap: 0; }
  .rg-h1 { font-size: 24px; }
  .rg-form-wrap { max-width: 100%; }
}
`;