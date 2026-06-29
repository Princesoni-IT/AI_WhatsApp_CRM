import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowRight, Bot, Send, Users, BarChart3,
  Shield, Zap, MessageSquare, CheckCircle,
  Menu, X, Star, TrendingUp, Clock
} from 'lucide-react';
import { Link } from "react-router-dom";

/* ── Scroll-reveal hook ── */
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible, delay };
}

/* ── Animated counter ── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal();
  useEffect(() => {
    if (!visible) return;
    let cur = 0;
    const step = to / 50;
    const id = setInterval(() => {
      cur += step;
      if (cur >= to) { setVal(to); clearInterval(id); }
      else setVal(Math.floor(cur));
    }, 20);
    return () => clearInterval(id);
  }, [visible, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Live chat mockup ── */
function ChatDemo() {
  const msgs = [
    { side: 'left',  text: 'Do you have Oud perfumes?' },
    { side: 'right', text: '✨ Yes! We have 12 Oud variants in stock. Want bestsellers?' },
    { side: 'left',  text: 'Yes please!' },
    { side: 'right', text: '🌹 Al Haramain Amber Oud, Swiss Arabian Shaghaf — all available. Shall I place an order?' },
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= msgs.length) return;
    const t = setTimeout(() => setShown(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div className="crm-chat-shell">
      <div className="crm-chat-header">
        <div className="crm-chat-avatar">AI</div>
        <div>
          <p className="crm-chat-name">Scent Studio</p>
          <p className="crm-chat-status">● AI is online</p>
        </div>
      </div>
      <div className="crm-chat-body">
        {msgs.slice(0, shown).map((m, i) => (
          <div key={i} className={`crm-msg crm-msg-${m.side}`}>
            <span className={`crm-bubble crm-bubble-${m.side}`}>{m.text}</span>
          </div>
        ))}
        {shown < msgs.length && (
          <div className="crm-msg crm-msg-right">
            <span className="crm-bubble crm-bubble-right crm-typing">
              <span /><span /><span />
            </span>
          </div>
        )}
      </div>
      <div className="crm-chat-footer">
        <span className="crm-chat-input">Message…</span>
        <div className="crm-chat-send"><Send size={13} /></div>
      </div>
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  const { ref, visible } = useReveal(delay);
  return (
    <div
      ref={ref}
      className="crm-feature-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div className="crm-feature-icon">{icon}</div>
      <h3 className="crm-feature-title">{title}</h3>
      <p className="crm-feature-desc">{desc}</p>
    </div>
  );
}

/* ── Pricing card ── */
function PricingCard({
  name, price, desc, features, cta, highlight, delay
}: {
  name: string; price: string; desc: string;
  features: string[]; cta: string; highlight: boolean; delay: number;
}) {
  const { ref, visible } = useReveal(delay);
  return (
    <div
      ref={ref}
      className={`crm-price-card ${highlight ? 'crm-price-card--hi' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {highlight && <div className="crm-popular-badge">Most Popular</div>}
      <p className="crm-plan-name">{name}</p>
      <p className="crm-plan-price">{price}<span className="crm-plan-mo">/mo</span></p>
      <p className="crm-plan-desc">{desc}</p>
      <ul className="crm-plan-features">
        {features.map((f, i) => (
          <li key={i}><CheckCircle size={14} />{f}</li>
        ))}
      </ul>
      <Link to="/register" className={`crm-plan-cta ${highlight ? 'crm-plan-cta--hi' : ''}`}>{cta}</Link>
    </div>
  );
}

/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const nav = ['Features', 'Pricing', 'About', 'Contact'];

  const features = [
    { icon: <Bot size={22} />,          title: 'AI Auto-Reply',        desc: 'GPT-powered replies handle customer queries, product questions, and follow-ups around the clock.' },
    { icon: <Send size={22} />,         title: 'Broadcast Campaigns',  desc: 'Send personalised WhatsApp messages to thousands of customers with one tap.' },
    { icon: <Users size={22} />,        title: 'Customer CRM',         desc: 'Tag, segment, and track every customer across their full purchase history.' },
    { icon: <BarChart3 size={22} />,    title: 'Live Analytics',       desc: 'Real-time dashboards for open rates, reply rates, and revenue per campaign.' },
    { icon: <Shield size={22} />,       title: 'Secure & Compliant',   desc: 'Built on Meta Cloud API. End-to-end encrypted. Fully WhatsApp TOS compliant.' },
    { icon: <Zap size={22} />,          title: 'Instant Setup',        desc: 'Connect your WhatsApp number and go live in under 10 minutes. No code needed.' },
  ];

  const plans = [
    {
      name: 'Starter', price: '₹999',
      desc: 'For solo retailers just getting started.',
      features: ['500 AI replies/month', '1 WhatsApp number', 'Basic CRM', 'Email support'],
      cta: 'Start Free Trial', highlight: false,
    },
    {
      name: 'Growth', price: '₹2,499',
      desc: 'For active stores with a growing customer base.',
      features: ['5,000 AI replies/month', '3 WhatsApp numbers', 'Full CRM + Segments', 'Campaigns', 'Priority support'],
      cta: 'Get Started', highlight: true,
    },
    {
      name: 'Scale', price: '₹5,999',
      desc: 'For high-volume businesses and multi-brand operations.',
      features: ['Unlimited AI replies', 'Unlimited numbers', 'Advanced analytics', 'Custom AI training', 'Dedicated manager'],
      cta: 'Contact Sales', highlight: false,
    },
  ];

  return (
    <>
      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }

        body, .crm-root {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: #f8fafc;
          color: #0f172a;
          line-height: 1.6;
        }

        /* ── NAV ── */
        .crm-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .crm-nav--scrolled {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 #e2e8f0;
        }
        .crm-nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 24px;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .crm-logo {
          font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
          color: #0f172a; text-decoration: none;
        }
        .crm-logo span { color: #16a34a; }
        .crm-nav-links {
          display: flex; gap: 32px;
          list-style: none;
        }
        .crm-nav-links a {
          font-size: 14px; font-weight: 500; color: #475569;
          text-decoration: none; transition: color 0.2s;
        }
        .crm-nav-links a:hover { color: #0f172a; }
        .crm-nav-actions { display: flex; align-items: center; gap: 16px; }
        .crm-nav-login {
          font-size: 14px; font-weight: 500; color: #475569;
          text-decoration: none; transition: color 0.2s;
        }
        .crm-nav-login:hover { color: #0f172a; }
        .crm-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #16a34a; color: #fff;
          font-size: 14px; font-weight: 600;
          padding: 10px 22px; border-radius: 8px;
          text-decoration: none; border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .crm-btn-primary:hover { background: #15803d; transform: translateY(-1px); }
        .crm-btn-outline {
          display: inline-flex; align-items: center; gap: 7px;
          background: transparent; color: #334155;
          font-size: 14px; font-weight: 600;
          padding: 10px 22px; border-radius: 8px;
          text-decoration: none; border: 1.5px solid #cbd5e1;
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .crm-btn-outline:hover { border-color: #94a3b8; color: #0f172a; }
        .crm-burger {
          display: none; background: none; border: none;
          cursor: pointer; color: #334155; padding: 4px;
        }
        .crm-mobile-menu {
          display: flex; flex-direction: column; gap: 4px;
          background: #fff; border-top: 1px solid #e2e8f0;
          padding: 16px 24px 20px;
        }
        .crm-mobile-menu a {
          font-size: 15px; font-weight: 500; color: #334155;
          text-decoration: none; padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .crm-mobile-menu a:last-child { border-bottom: none; }
        .crm-mobile-cta {
          margin-top: 12px;
          display: block; text-align: center;
          background: #16a34a; color: #fff !important;
          border-radius: 8px; padding: 12px 0 !important;
          font-weight: 700 !important; border-bottom: none !important;
        }

        /* ── HERO ── */
        .crm-hero {
          max-width: 1200px; margin: 0 auto;
          padding: 140px 24px 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 64px;
        }
        .crm-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #dcfce7; color: #15803d;
          font-size: 13px; font-weight: 600;
          padding: 6px 14px; border-radius: 100px;
          margin-bottom: 24px;
        }
        .crm-hero-h1 {
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -1.5px; color: #0f172a;
          margin-bottom: 20px;
        }
        .crm-hero-h1 .crm-accent { color: #16a34a; }
        .crm-hero-sub {
          font-size: 17px; color: #64748b; line-height: 1.7;
          max-width: 460px; margin-bottom: 36px;
        }
        .crm-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 44px; }
        .crm-hero-trust { display: flex; align-items: center; gap: 12px; }
        .crm-avatars { display: flex; }
        .crm-avatars span {
          width: 34px; height: 34px; border-radius: 50%;
          border: 2px solid #f8fafc;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
          margin-left: -8px;
        }
        .crm-avatars span:first-child { margin-left: 0; }
        .crm-trust-text { font-size: 13px; color: #64748b; }
        .crm-trust-text strong { color: #0f172a; }
        .crm-stars { color: #f59e0b; display: flex; gap: 2px; margin-bottom: 3px; }

        /* hero right */
        .crm-hero-right { position: relative; }
        .crm-hero-right-inner {
          position: relative;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        }
        .crm-hero-label {
          font-size: 11px; font-weight: 600; color: #94a3b8;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 16px;
        }
        .crm-stat-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          margin-bottom: 24px;
        }
        .crm-stat-box {
          background: #f8fafc; border-radius: 12px; padding: 16px;
          border: 1px solid #f1f5f9;
        }
        .crm-stat-box--green { background: #16a34a; border-color: #16a34a; }
        .crm-stat-box p:first-child { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
        .crm-stat-box--green p:first-child { color: rgba(255,255,255,0.7); }
        .crm-stat-box p:last-child { font-size: 26px; font-weight: 800; color: #0f172a; }
        .crm-stat-box--green p:last-child { color: #fff; }

        /* floating pill */
        .crm-pill {
          position: absolute;
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 10px 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #0f172a;
          white-space: nowrap;
        }
        .crm-pill--tl { top: -18px; left: -18px; }
        .crm-pill--br { bottom: -18px; right: -18px; }
        .crm-pill-dot { width: 8px; height: 8px; border-radius: 50%; }

        /* ── STATS BAR ── */
        .crm-stats-bar {
          background: #0f172a;
        }
        .crm-stats-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 40px 24px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px; text-align: center;
        }
        .crm-stat-num {
          font-size: 36px; font-weight: 800;
          color: #fff; letter-spacing: -1px; margin-bottom: 4px;
        }
        .crm-stat-num span { color: #4ade80; }
        .crm-stat-lbl { font-size: 13px; color: #94a3b8; }

        /* ── SECTION SHELL ── */
        .crm-section {
          max-width: 1200px; margin: 0 auto;
          padding: 96px 24px;
        }
        .crm-section-label {
          font-size: 12px; font-weight: 700; color: #16a34a;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 12px;
        }
        .crm-section-h2 {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800; letter-spacing: -1px;
          color: #0f172a; margin-bottom: 12px; line-height: 1.15;
        }
        .crm-section-sub {
          font-size: 16px; color: #64748b; max-width: 520px;
          line-height: 1.7;
        }
        .crm-section-hdr { margin-bottom: 56px; }

        /* ── FEATURES ── */
        .crm-features-bg { background: #fff; }
        .crm-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .crm-feature-card {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 28px;
          transition: border-color 0.2s, box-shadow 0.2s, opacity 0.5s, transform 0.5s;
        }
        .crm-feature-card:hover {
          border-color: #bbf7d0; box-shadow: 0 8px 30px rgba(22,163,74,0.08);
        }
        .crm-feature-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: #dcfce7; color: #16a34a;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .crm-feature-title {
          font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;
        }
        .crm-feature-desc { font-size: 14px; color: #64748b; line-height: 1.65; }

        /* ── HOW IT WORKS ── */
        .crm-how-bg { background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .crm-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; position: relative; }
        .crm-step-line {
          position: absolute; top: 22px; left: calc(16.6% + 8px); right: calc(16.6% + 8px);
          height: 1px; background: #e2e8f0;
          display: block;
        }
        .crm-step { text-align: center; padding: 0 16px; }
        .crm-step-num {
          width: 44px; height: 44px; border-radius: 50%;
          background: #fff; border: 2px solid #e2e8f0;
          font-size: 15px; font-weight: 700; color: #0f172a;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; position: relative; z-index: 1;
        }
        .crm-step h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .crm-step p { font-size: 14px; color: #64748b; line-height: 1.65; }

        /* ── CHAT + STEPS TWO-COL ── */
        .crm-chat-section {
          max-width: 1200px; margin: 0 auto; padding: 96px 24px;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; gap: 64px;
        }

        /* chat shell */
        .crm-chat-shell {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.07);
          max-width: 360px;
        }
        .crm-chat-header {
          background: #0f172a; padding: 16px 20px;
          display: flex; align-items: center; gap: 12px;
        }
        .crm-chat-avatar {
          width: 36px; height: 36px; background: #16a34a;
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 12px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .crm-chat-name { font-size: 14px; font-weight: 600; color: #fff; }
        .crm-chat-status { font-size: 11px; color: #4ade80; margin-top: 1px; }
        .crm-chat-body {
          padding: 20px; min-height: 260px; background: #f8fafc;
          display: flex; flex-direction: column; gap: 10px;
        }
        .crm-msg { display: flex; }
        .crm-msg-left { justify-content: flex-start; }
        .crm-msg-right { justify-content: flex-end; }
        .crm-bubble {
          max-width: 78%; padding: 10px 14px;
          font-size: 13px; line-height: 1.5; border-radius: 16px;
          animation: fadeUp 0.3s ease;
        }
        .crm-bubble-left {
          background: #fff; color: #1e293b;
          border: 1px solid #e2e8f0; border-bottom-left-radius: 4px;
        }
        .crm-bubble-right {
          background: #16a34a; color: #fff;
          border-bottom-right-radius: 4px;
        }
        .crm-typing { display: flex; align-items: center; gap: 4px; padding: 12px 16px; }
        .crm-typing span {
          width: 6px; height: 6px; background: rgba(255,255,255,0.7);
          border-radius: 50%; animation: bounce 1.2s ease infinite;
        }
        .crm-typing span:nth-child(2) { animation-delay: 0.2s; }
        .crm-typing span:nth-child(3) { animation-delay: 0.4s; }
        .crm-chat-footer {
          background: #fff; border-top: 1px solid #e2e8f0;
          padding: 12px 16px; display: flex; align-items: center; gap: 10px;
        }
        .crm-chat-input {
          flex: 1; background: #f1f5f9; border-radius: 100px;
          padding: 8px 14px; font-size: 13px; color: #94a3b8;
        }
        .crm-chat-send {
          width: 32px; height: 32px; background: #16a34a; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;
        }
        .crm-chat-right h2 {
          font-size: clamp(26px, 3.5vw, 38px); font-weight: 800;
          letter-spacing: -0.8px; color: #0f172a;
          line-height: 1.15; margin-bottom: 16px;
        }
        .crm-chat-right p { font-size: 15px; color: #64748b; line-height: 1.7; margin-bottom: 28px; }
        .crm-chat-perks { display: flex; flex-direction: column; gap: 12px; }
        .crm-perk {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 14px; color: #334155;
        }
        .crm-perk svg { color: #16a34a; flex-shrink: 0; margin-top: 2px; }

        /* ── PRICING ── */
        .crm-pricing-bg { background: #fff; border-top: 1px solid #e2e8f0; }
        .crm-pricing-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
          align-items: start;
        }
        .crm-price-card {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 20px; padding: 32px 28px;
          display: flex; flex-direction: column; gap: 0;
          position: relative;
        }
        .crm-price-card--hi {
          background: #0f172a; border-color: #0f172a;
          box-shadow: 0 20px 60px rgba(15,23,42,0.2);
          transform: scale(1.04);
        }
        .crm-popular-badge {
          position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
          background: #16a34a; color: #fff;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 4px 14px; border-radius: 100px;
          white-space: nowrap;
        }
        .crm-plan-name { font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; }
        .crm-price-card--hi .crm-plan-name { color: #64748b; }
        .crm-plan-price {
          font-size: 42px; font-weight: 800; color: #0f172a;
          letter-spacing: -1.5px; margin-bottom: 6px;
        }
        .crm-price-card--hi .crm-plan-price { color: #fff; }
        .crm-plan-mo { font-size: 16px; font-weight: 500; color: #94a3b8; }
        .crm-price-card--hi .crm-plan-mo { color: #64748b; }
        .crm-plan-desc { font-size: 13px; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
        .crm-price-card--hi .crm-plan-desc { color: #94a3b8; }
        .crm-plan-features {
          list-style: none; display: flex; flex-direction: column;
          gap: 11px; margin-bottom: 28px; flex: 1;
        }
        .crm-plan-features li {
          display: flex; align-items: center; gap: 9px;
          font-size: 13px; color: #475569;
        }
        .crm-price-card--hi .crm-plan-features li { color: #cbd5e1; }
        .crm-plan-features li svg { color: #16a34a; flex-shrink: 0; }
        .crm-price-card--hi .crm-plan-features li svg { color: #4ade80; }
        .crm-plan-cta {
          display: block; text-align: center;
          padding: 13px 0; border-radius: 10px;
          font-size: 14px; font-weight: 700;
          text-decoration: none;
          background: #fff; color: #0f172a;
          border: 1.5px solid #e2e8f0;
          transition: background 0.2s, border-color 0.2s;
        }
        .crm-plan-cta:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .crm-plan-cta--hi {
          background: #16a34a; color: #fff; border-color: #16a34a;
        }
        .crm-plan-cta--hi:hover { background: #15803d; border-color: #15803d; }

        /* ── ABOUT ── */
        .crm-about-bg { background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .crm-about-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
        }
        .crm-about-left h2 {
          font-size: clamp(26px, 3.5vw, 38px); font-weight: 800;
          letter-spacing: -0.8px; color: #0f172a;
          line-height: 1.15; margin-bottom: 20px;
        }
        .crm-about-left p {
          font-size: 15px; color: #64748b; line-height: 1.75; margin-bottom: 16px;
        }
        .crm-about-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: #16a34a; font-size: 14px; font-weight: 600;
          text-decoration: none; transition: gap 0.2s;
        }
        .crm-about-link:hover { gap: 10px; }
        .crm-about-tiles {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .crm-about-tile {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 14px; padding: 20px;
        }
        .crm-about-tile-icon { color: #16a34a; margin-bottom: 10px; }
        .crm-about-tile h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .crm-about-tile p { font-size: 12px; color: #94a3b8; }

        /* ── CTA BANNER ── */
        .crm-cta-bg { background: #0f172a; }
        .crm-cta-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 100px 24px; text-align: center;
        }
        .crm-cta-inner h2 {
          font-size: clamp(30px, 5vw, 54px); font-weight: 800;
          color: #fff; letter-spacing: -1.5px; line-height: 1.1;
          margin-bottom: 16px;
        }
        .crm-cta-inner h2 span { color: #4ade80; }
        .crm-cta-inner p { font-size: 16px; color: #94a3b8; margin-bottom: 36px; }
        .crm-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .crm-btn-primary-lg {
          display: inline-flex; align-items: center; gap: 8px;
          background: #16a34a; color: #fff;
          font-size: 15px; font-weight: 700;
          padding: 14px 28px; border-radius: 10px;
          text-decoration: none; transition: background 0.2s, transform 0.15s;
        }
        .crm-btn-primary-lg:hover { background: #15803d; transform: translateY(-1px); }
        .crm-btn-ghost-lg {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #e2e8f0;
          font-size: 15px; font-weight: 600;
          padding: 14px 28px; border-radius: 10px;
          text-decoration: none; border: 1.5px solid #334155;
          transition: border-color 0.2s, color 0.2s;
        }
        .crm-btn-ghost-lg:hover { border-color: #64748b; color: #fff; }

        /* ── CONTACT ── */
        .crm-contact-bg { background: #fff; border-top: 1px solid #e2e8f0; }
        .crm-contact-grid {
          max-width: 1200px; margin: 0 auto; padding: 96px 24px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start;
        }
        .crm-contact-left h2 {
          font-size: clamp(26px, 3.5vw, 38px); font-weight: 800;
          letter-spacing: -0.8px; color: #0f172a;
          margin-bottom: 12px; line-height: 1.2;
        }
        .crm-contact-left p { font-size: 15px; color: #64748b; margin-bottom: 32px; line-height: 1.7; }
        .crm-contact-items { display: flex; flex-direction: column; gap: 16px; }
        .crm-contact-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #475569; }
        .crm-contact-item-icon {
          width: 36px; height: 36px; background: #dcfce7;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          color: #16a34a; flex-shrink: 0;
        }
        .crm-form { display: flex; flex-direction: column; gap: 16px; }
        .crm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .crm-field { display: flex; flex-direction: column; gap: 6px; }
        .crm-field label { font-size: 13px; font-weight: 600; color: #374151; }
        .crm-field input, .crm-field textarea, .crm-field select {
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 8px; padding: 11px 14px;
          font-size: 14px; color: #0f172a;
          font-family: inherit; outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .crm-field input:focus, .crm-field textarea:focus, .crm-field select:focus {
          border-color: #16a34a;
        }
        .crm-field textarea { resize: vertical; min-height: 110px; }
        .crm-form-submit {
          background: #16a34a; color: #fff;
          font-size: 14px; font-weight: 700;
          padding: 13px 28px; border-radius: 8px;
          border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s; width: fit-content;
        }
        .crm-form-submit:hover { background: #15803d; }

        /* ── FOOTER ── */
        .crm-footer {
          background: #0f172a; border-top: 1px solid #1e293b;
        }
        .crm-footer-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 24px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .crm-footer-logo { font-size: 18px; font-weight: 800; color: #fff; }
        .crm-footer-logo span { color: #4ade80; }
        .crm-footer-copy { font-size: 13px; color: #64748b; }
        .crm-footer-links { display: flex; gap: 20px; }
        .crm-footer-links a { font-size: 13px; color: #64748b; text-decoration: none; transition: color 0.2s; }
        .crm-footer-links a:hover { color: #cbd5e1; }

        /* ── KEYFRAMES ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40%         { transform: translateY(-5px); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        .crm-float { animation: floatY 4s ease-in-out infinite; }

        /* ════ RESPONSIVE ════ */

        /* tablet */
        @media (max-width: 1024px) {
          .crm-hero { grid-template-columns: 1fr; padding-top: 110px; gap: 48px; }
          .crm-hero-right { display: flex; justify-content: center; }
          .crm-hero-right-inner { max-width: 440px; width: 100%; }
          .crm-features-grid { grid-template-columns: 1fr 1fr; }
          .crm-steps { grid-template-columns: 1fr; gap: 32px; }
          .crm-step-line { display: none; }
          .crm-step { text-align: left; display: flex; align-items: flex-start; gap: 16px; padding: 0; }
          .crm-step-num { margin: 0; flex-shrink: 0; }
          .crm-step-text { flex: 1; }
          .crm-chat-section { grid-template-columns: 1fr; gap: 40px; }
          .crm-chat-shell { max-width: 100%; }
          .crm-pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
          .crm-price-card--hi { transform: none; }
          .crm-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .crm-contact-grid { grid-template-columns: 1fr; gap: 48px; }
          .crm-stats-inner { grid-template-columns: repeat(2, 1fr); }
        }

        /* mobile */
        @media (max-width: 640px) {
          .crm-nav-links, .crm-nav-actions { display: none; }
          .crm-burger { display: flex; }
          .crm-hero { padding: 100px 20px 60px; }
          .crm-hero-h1 { font-size: 34px; letter-spacing: -1px; }
          .crm-hero-sub { font-size: 15px; }
          .crm-hero-ctas { gap: 10px; }
          .crm-btn-primary, .crm-btn-outline { padding: 11px 18px; font-size: 13px; }
          .crm-stat-grid { grid-template-columns: 1fr 1fr; }
          .crm-features-grid { grid-template-columns: 1fr; }
          .crm-section { padding: 64px 20px; }
          .crm-chat-section { padding: 64px 20px; }
          .crm-cta-inner { padding: 72px 20px; }
          .crm-cta-btns { flex-direction: column; align-items: center; }
          .crm-btn-primary-lg, .crm-btn-ghost-lg { width: 100%; justify-content: center; }
          .crm-contact-grid { padding: 64px 20px; }
          .crm-form-row { grid-template-columns: 1fr; }
          .crm-about-tiles { grid-template-columns: 1fr; }
          .crm-stats-inner { grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 32px 20px; }
          .crm-stat-num { font-size: 28px; }
          .crm-pill--tl { display: none; }
          .crm-pill--br { display: none; }
          .crm-pricing-grid { max-width: 100%; }
          .crm-footer-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      <div className="crm-root">

        {/* ── NAV ── */}
        <nav className={`crm-nav ${scrolled ? 'crm-nav--scrolled' : ''}`}>
          <div className="crm-nav-inner">
            <a href="/" className="crm-logo">Brand<span>AI</span></a>
            <ul className="crm-nav-links">
              {nav.map(l => (
                <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
              ))}
            </ul>
            <div className="crm-nav-actions">
              <Link to="/login" className="crm-nav-login">Login</Link>
              <Link to="/register" className="crm-btn-primary">Get Started <ArrowRight size={15} /></Link>
            </div>
            <button className="crm-burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          {menuOpen && (
            <div className="crm-mobile-menu">
              {nav.map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{l}</a>
              ))}
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="crm-mobile-cta" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <div className="crm-hero">
          {/* Left */}
          <div>
            <div className="crm-hero-badge">
              <Bot size={14} /> AI-Powered WhatsApp CRM
            </div>
            <h1 className="crm-hero-h1">
              Automate Your<br />
              <span className="crm-accent">WhatsApp Sales</span><br />
              With AI
            </h1>
            <p className="crm-hero-sub">
              Let AI handle customer queries, follow-ups, and campaigns on WhatsApp — while you focus on growing your perfume business.
            </p>
            <div className="crm-hero-ctas">
              <Link to="/register" className="crm-btn-primary">Start Free Trial <ArrowRight size={15} /></Link>
              <a href="#features" className="crm-btn-outline">See Features</a>
            </div>
            <div className="crm-hero-trust">
              <div className="crm-avatars">
                {[['#16a34a','R'],['#0284c7','S'],['#7c3aed','A'],['#d97706','M']].map(([bg,l],i) => (
                  <span key={i} style={{ background: bg }}>{l}</span>
                ))}
              </div>
              <div>
                <div className="crm-stars">
                  {[...Array(5)].map((_,i) => <Star key={i} size={13} fill="currentColor" />)}
                </div>
                <p className="crm-trust-text"><strong>500+</strong> retailers trust BrandAI</p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="crm-hero-right">
            <div className="crm-hero-right-inner crm-float">
              <div className="crm-pill crm-pill--tl">
                <span className="crm-pill-dot" style={{ background: '#4ade80' }}></span>
                AI is online
              </div>
              <p className="crm-hero-label">Dashboard Overview</p>
              <div className="crm-stat-grid">
                <div className="crm-stat-box">
                  <p>Contacts</p>
                  <p>1,250</p>
                </div>
                <div className="crm-stat-box">
                  <p>Active Chats</p>
                  <p>94</p>
                </div>
                <div className="crm-stat-box">
                  <p>Campaigns</p>
                  <p>18</p>
                </div>
                <div className="crm-stat-box crm-stat-box--green">
                  <p>AI Replies</p>
                  <p>8,420</p>
                </div>
              </div>
              <div className="crm-pill crm-pill--br">
                <TrendingUp size={14} style={{ color: '#16a34a' }} />
                +340% more conversions
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="crm-stats-bar">
          <div className="crm-stats-inner">
            {[
              { label: 'AI Replies Sent',    to: 8420, suffix: '+' },
              { label: 'Retailers Onboarded',to: 500,  suffix: '+' },
              { label: 'Avg Response Time',  to: 2,    suffix: 's' },
              { label: 'Campaigns Launched', to: 1200, suffix: '+' },
            ].map((s, i) => (
              <div key={i}>
                <p className="crm-stat-num"><Counter to={s.to} suffix={s.suffix} /></p>
                <p className="crm-stat-lbl">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div id="features" className="crm-features-bg">
          <div className="crm-section">
            <div className="crm-section-hdr">
              <p className="crm-section-label">What You Get</p>
              <h2 className="crm-section-h2">Everything your store needs</h2>
              <p className="crm-section-sub">One platform to run WhatsApp sales on autopilot — from first message to closed order.</p>
            </div>
            <div className="crm-features-grid">
              {features.map((f, i) => (
                <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} delay={i * 80} />
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="crm-how-bg">
          <div className="crm-section">
            <div className="crm-section-hdr">
              <p className="crm-section-label">Simple Process</p>
              <h2 className="crm-section-h2">Go live in 3 steps</h2>
              <p className="crm-section-sub">No technical setup. No developer needed. Just connect and sell.</p>
            </div>
            <div className="crm-steps">
              <span className="crm-step-line" aria-hidden="true"></span>
              {[
                { n: '1', title: 'Connect WhatsApp',  desc: 'Link your business number via Meta Cloud API. Takes under 5 minutes with our guided setup.' },
                { n: '2', title: 'Train Your AI',     desc: 'Upload your product catalog, FAQs, and brand tone. The AI learns to reply like your best salesperson.' },
                { n: '3', title: 'Watch It Sell',     desc: 'AI handles queries, sends follow-ups, and runs campaigns — you track revenue on the dashboard.' },
              ].map((s, i) => {
                const { ref, visible } = useReveal(i * 120);
                return (
                  <div
                    key={i} ref={ref}
                    className="crm-step"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0)' : 'translateY(20px)',
                      transition: `opacity 0.5s ease ${i * 120}ms, transform 0.5s ease ${i * 120}ms`,
                    }}
                  >
                    <div className="crm-step-num">{s.n}</div>
                    <div className="crm-step-text">
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── LIVE DEMO ── */}
        <div className="crm-chat-section">
          <ChatDemo />
          <div className="crm-chat-right">
            <h2>Watch AI reply to<br />customers in real time</h2>
            <p>Your AI assistant handles product questions, price queries, and order confirmations — instantly, 24 hours a day, in the customer's preferred language.</p>
            <div className="crm-chat-perks">
              {[
                'Replies in under 2 seconds, any time of day',
                'Understands Hindi, Hinglish, and English naturally',
                'Recommends products and nudges customers to buy',
                'Escalates complex queries to you when needed',
              ].map((p, i) => (
                <div key={i} className="crm-perk">
                  <CheckCircle size={16} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRICING ── */}
        <div id="pricing" className="crm-pricing-bg">
          <div className="crm-section">
            <div className="crm-section-hdr">
              <p className="crm-section-label">Pricing</p>
              <h2 className="crm-section-h2">Simple, transparent pricing</h2>
              <p className="crm-section-sub">No hidden fees. Start free for 14 days. Cancel any time.</p>
            </div>
            <div className="crm-pricing-grid">
              {plans.map((p, i) => (
                <PricingCard key={i} {...p} delay={i * 100} />
              ))}
            </div>
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div id="about" className="crm-about-bg">
          <div className="crm-section">
            <div className="crm-about-grid">
              <div className="crm-about-left">
                <p className="crm-section-label">Our Mission</p>
                <h2>Built for Indian retailers who hustle on WhatsApp</h2>
                <p>We started BrandAI after watching small perfume and retail businesses spend hours manually answering the same customer questions every day. That time should go into growing — not copy-pasting replies.</p>
                <p>Our AI is trained to understand Indian customers, regional buying habits, and the way business actually happens on WhatsApp in India.</p>
                <a href="/about" className="crm-about-link">Read our story <ArrowRight size={15} /></a>
              </div>
              <div className="crm-about-tiles">
                {[
                  { icon: <Bot size={20} />,         label: 'AI-First',      val: 'Built around modern LLMs' },
                  { icon: <Shield size={20} />,       label: 'Privacy Safe',  val: 'Zero data selling, ever' },
                  { icon: <Zap size={20} />,          label: 'Fast Setup',    val: 'Live in under 10 minutes' },
                  { icon: <MessageSquare size={20} />,label: 'India-Focused', val: 'Desi customer mindset built-in' },
                ].map((t, i) => (
                  <div key={i} className="crm-about-tile">
                    <div className="crm-about-tile-icon">{t.icon}</div>
                    <h4>{t.label}</h4>
                    <p>{t.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA BANNER ── */}
        <div className="crm-cta-bg">
          <div className="crm-cta-inner">
            <h2>Ready to automate your<br /><span>WhatsApp sales?</span></h2>
            <p>Start your 14-day free trial. No credit card required.</p>
            <div className="crm-cta-btns">
              <Link to="/register" className="crm-btn-primary-lg">Start Free Trial <ArrowRight size={17} /></Link>
              <a href="#contact" className="crm-btn-ghost-lg">Talk to us</a>
            </div>
          </div>
        </div>

        {/* ── CONTACT ── */}
        <div id="contact" className="crm-contact-bg">
          <div className="crm-contact-grid">
            <div className="crm-contact-left">
              <p className="crm-section-label">Contact</p>
              <h2>Let's get you started</h2>
              <p>Have questions about BrandAI? Our team typically responds within a few hours on business days.</p>
              <div className="crm-contact-items">
                {[
                  { icon: <MessageSquare size={16} />, text: 'hello@brandai.in' },
                  { icon: <Clock size={16} />,         text: 'Mon – Sat, 10am – 7pm IST' },
                  { icon: <Users size={16} />,         text: 'Support for all plan tiers' },
                ].map((item, i) => (
                  <div key={i} className="crm-contact-item">
                    <div className="crm-contact-item-icon">{item.icon}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <form className="crm-form" onSubmit={e => e.preventDefault()}>
              <div className="crm-form-row">
                <div className="crm-field">
                  <label>First Name</label>
                  <input type="text" placeholder="Prince" />
                </div>
                <div className="crm-field">
                  <label>Last Name</label>
                  <input type="text" placeholder="Soni" />
                </div>
              </div>
              <div className="crm-field">
                <label>Email</label>
                <input type="email" placeholder="princesoni@gmail.com" />
              </div>
              <div className="crm-field">
                <label>Business Type</label>
                <select defaultValue="">
                  <option value="" disabled>Select…</option>
                  <option>Perfume Retailer</option>
                  <option>Fashion & Apparel</option>
                  <option>Electronics</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="crm-field">
                <label>Message</label>
                <textarea placeholder="Tell us about your business…" />
              </div>
              <button type="submit" className="crm-form-submit">
                Send Message <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="crm-footer">
          <div className="crm-footer-inner">
            <span className="crm-footer-logo">Brand<span>AI</span></span>
            <p className="crm-footer-copy">© 2025 BrandAI. Built for Indian retailers.</p>
            <div className="crm-footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}