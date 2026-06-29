import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle, AlertCircle, MailWarning } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface FormData {
  email:    string;
  password: string;
}
interface FormErrors {
  email?:    string;
  password?: string;
  api?:      string;
  apiType?:  "unverified" | "invalid" | "server";
}

// ─── Main Component ──────────────────────────────────────────
export default function Login() {
  const [form, setForm]       = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Validation ──────────────────────────────────────────────
  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.email.trim())                    e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email address.";
    if (!form.password)                        e.password = "Password is required.";
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
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include", // cookies (accessToken, refreshToken) set hone ke liye
        body:        JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Controller ke 3 error cases handle karo:
        // 401 → Invalid email or password
        // 403 → Email not verified
        if (res.status === 403) {
          setErrors({ api: data?.message, apiType: "unverified" });
        } else if (res.status === 401) {
          setErrors({ api: data?.message || "Invalid email or password.", apiType: "invalid" });
        } else {
          setErrors({ api: data?.message || "Something went wrong. Please try again.", apiType: "server" });
        }
        return;
      }

      // 200 success — cookies already set by server, redirect
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);

    } catch {
      setErrors({ api: "Network error. Check your connection and try again.", apiType: "server" });
    } finally {
      setLoading(false);
    }
  }

async function handleResendVerification() {

    try {

        const res = await fetch(
            "http://localhost:5000/api/v1/auth/resend-verification-email",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: form.email,
                }),
            }
        );

        const data = await res.json();

        alert(data.message);

    } catch {

        alert("Unable to resend verification email.");

    }

}  

  function handleChange(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (errors.api)    setErrors(prev => ({ ...prev, api: undefined, apiType: undefined }));
  }

  // ── Success flash ────────────────────────────────────────────
  if (success) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="lg-root">
          <div className="lg-left"><Branding /></div>
          <div className="lg-right">
            <div className="lg-success">
              <div className="lg-success-icon"><CheckCircle size={34} /></div>
              <h2 className="lg-success-h2">Welcome back!</h2>
              <p className="lg-success-p">Login successful. Redirecting to your dashboard…</p>
              <div className="lg-redirect-bar"><span /></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Form ─────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div className="lg-root">

        {/* Left — branding */}
        <div className="lg-left" aria-hidden="true">
          <Branding />
        </div>

        {/* Right — form */}
        <div className="lg-right">
          <div className="lg-form-wrap">

            <div className="lg-mobile-logo">Brand<span>AI</span></div>

            <div className="lg-form-header">
              <h1 className="lg-h1">Sign in to your account</h1>
              <p className="lg-sub">
                Don't have one?{" "}
                <a href="/register" className="lg-link">Create a free account</a>
              </p>
            </div>

            {/* Error banners — 3 types */}
            {errors.api && errors.apiType === "unverified" && (
              <div className="lg-banner lg-banner--warn" role="alert">
                <MailWarning size={18} />
                <div>
                  <strong>Email not verified.</strong>
                  <p>
                    {errors.api} Please check your inbox for the verification link, or{" "}
                    <button
                       className="lg-link"
                          onClick={handleResendVerification}>
                        resend it
                    </button>
                  </p>
                </div>
              </div>
            )}
            {errors.api && errors.apiType === "invalid" && (
              <div className="lg-banner lg-banner--err" role="alert">
                <AlertCircle size={18} />
                <div>
                  <strong>Incorrect credentials.</strong>
                  <p>{errors.api}</p>
                </div>
              </div>
            )}
            {errors.api && errors.apiType === "server" && (
              <div className="lg-banner lg-banner--err" role="alert">
                <AlertCircle size={18} />
                <div><p>{errors.api}</p></div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="lg-field">
                <label className="lg-label" htmlFor="lg-email">Email</label>
                <input
                  id="lg-email"
                  className={`lg-input ${errors.email ? "lg-input--err" : ""}`}
                  type="email"
                  placeholder="princesoni@gmail.com"
                  value={form.email}
                  autoComplete="email"
                  onChange={e => handleChange("email", e.target.value)}
                />
                {errors.email && <p className="lg-error" role="alert">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="lg-field">
                <div className="lg-pw-label-row">
                  <label className="lg-label" htmlFor="lg-pw">Password</label>
                  <a href="/forgot-password" className="lg-link lg-forgot">Forgot password?</a>
                </div>
                <div className="lg-pw-wrap">
                  <input
                    id="lg-pw"
                    className={`lg-input ${errors.password ? "lg-input--err" : ""}`}
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    autoComplete="current-password"
                    onChange={e => handleChange("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="lg-pw-toggle"
                    onClick={() => setShowPw(s => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="lg-error" role="alert">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="lg-submit"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 size={16} className="lg-spin" /> Signing in…</>
                  : <>Sign in <ArrowRight size={16} /></>
                }
              </button>

            </form>

            <p className="lg-register-nudge">
              New to BrandAI?{" "}
              <a href="/register" className="lg-link">Start your free 14-day trial →</a>
            </p>

          </div>
        </div>

      </div>
    </>
  );
}

// ─── Left branding panel ─────────────────────────────────────
function Branding() {
  const points = [
    "AI handles WhatsApp queries 24/7",
    "No manual replies — ever",
    "Campaigns sent in one click",
    "Full CRM for every customer",
  ];
  return (
    <div className="lg-brand">
      <div>
        <a href="/" className="lg-brand-logo">Brand<span>AI</span></a>
        <p className="lg-brand-tagline">
          Your AI sales team<br />on WhatsApp.
        </p>
        <ul className="lg-brand-perks">
          {points.map((p, i) => (
            <li key={i}><CheckCircle size={15} />{p}</li>
          ))}
        </ul>
      </div>
      <p className="lg-brand-footer">Trusted by 500+ Indian retailers</p>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }

.lg-root {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  min-height: 100vh;
  display: flex;
}

/* ── LEFT ── */
.lg-left {
  width: 420px;
  min-width: 420px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 52px;
}
.lg-brand {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.lg-brand-logo {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  text-decoration: none;
  letter-spacing: -0.5px;
  display: block;
  margin-bottom: 44px;
}
.lg-brand-logo span { color: #4ade80; }
.lg-brand-tagline {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  line-height: 1.25;
  letter-spacing: -0.5px;
  margin-bottom: 36px;
}
.lg-brand-perks {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.lg-brand-perks li {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.5;
}
.lg-brand-perks li svg { color: #4ade80; flex-shrink: 0; }
.lg-brand-footer {
  font-size: 12px;
  color: #334155;
  margin-top: 60px;
}

/* ── RIGHT ── */
.lg-right {
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  overflow-y: auto;
}
.lg-form-wrap {
  width: 100%;
  max-width: 420px;
}

.lg-mobile-logo {
  display: none;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin-bottom: 28px;
}
.lg-mobile-logo span { color: #16a34a; }

.lg-form-header { margin-bottom: 28px; }
.lg-h1 {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin-bottom: 6px;
}
.lg-sub { font-size: 14px; color: #64748b; }
.lg-link {
  color: #16a34a;
  font-weight: 600;
  text-decoration: none;
}
.lg-link:hover { text-decoration: underline; }

/* ── BANNERS ── */
.lg-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 22px;
  font-size: 13px;
  line-height: 1.55;
}
.lg-banner strong {
  display: block;
  font-weight: 700;
  margin-bottom: 2px;
}
.lg-banner p { opacity: 0.85; }
.lg-banner svg { flex-shrink: 0; margin-top: 1px; }
.lg-banner--err {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}
.lg-banner--warn {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}
.lg-banner--warn .lg-link { color: #b45309; }

/* ── FIELDS ── */
.lg-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}
.lg-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.lg-pw-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lg-forgot {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}
.lg-forgot:hover { color: #16a34a; text-decoration: underline; }

.lg-input {
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
.lg-input::placeholder { color: #94a3b8; }
.lg-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.1);
}
.lg-input--err { border-color: #ef4444; }
.lg-input--err:focus {
  box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
}
.lg-error {
  font-size: 12px;
  color: #ef4444;
}

/* ── PASSWORD TOGGLE ── */
.lg-pw-wrap { position: relative; }
.lg-pw-wrap .lg-input { padding-right: 44px; }
.lg-pw-toggle {
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
.lg-pw-toggle:hover { color: #475569; }

/* ── SUBMIT ── */
.lg-submit {
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
  margin-bottom: 20px;
  transition: background 0.2s, transform 0.15s, opacity 0.2s;
}
.lg-submit:hover:not(:disabled) {
  background: #15803d;
  transform: translateY(-1px);
}
.lg-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

@keyframes spin { to { transform: rotate(360deg); } }
.lg-spin { animation: spin 0.8s linear infinite; }

.lg-register-nudge {
  font-size: 13px;
  color: #64748b;
  text-align: center;
}

/* ── SUCCESS ── */
.lg-success {
  text-align: center;
  max-width: 360px;
}
.lg-success-icon {
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
.lg-success-h2 {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin-bottom: 10px;
}
.lg-success-p {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 24px;
}
.lg-redirect-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}
.lg-redirect-bar span {
  display: block;
  height: 100%;
  background: #16a34a;
  border-radius: 2px;
  animation: fillBar 1.2s ease forwards;
}
@keyframes fillBar {
  from { width: 0%; }
  to   { width: 100%; }
}

/* ── RESPONSIVE ── */
@media (max-width: 860px) {
  .lg-left { display: none; }
  .lg-right {
    background: #fff;
    padding: 40px 20px;
    align-items: flex-start;
    padding-top: 60px;
  }
  .lg-mobile-logo { display: block; }
}
@media (max-width: 480px) {
  .lg-h1 { font-size: 22px; }
  .lg-form-wrap { max-width: 100%; }
}
`;