"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Bot,
  Zap,
  Lock,
  ChevronRight,
  Star,
  Users,
  FileText,
  Mail,
  Send,
  Building,
  Check,
  FileSpreadsheet
} from "lucide-react";

interface LandingPageProps {
  onOpenApp: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export default function LandingPage({
  onOpenApp,
  onOpenLogin,
  onOpenSignup,
}: LandingPageProps) {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased overflow-x-hidden">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#161B22]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                RecoverAgent
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wide">
                Autonomous Payment Follow-ups
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="#preview" className="hover:text-white transition">Escalation Demo</a>
            <a href="#pricing" className="hover:text-white transition">For Freelancers</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="text-xs text-slate-300 hover:text-white font-medium px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              Sign In
            </button>
            <button
              onClick={onOpenSignup}
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-sm shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden border-b border-slate-800/60">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built for Freelancers, Agencies & Small Businesses</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Recover Overdue Invoices{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
              Without Awkward Conversations.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop wasting hours chasing clients or feeling uncomfortable asking for payment.
            RecoverAgent tracks due dates, understands client replies, and sends contextual 3-tier follow-ups that preserve your relationships.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onOpenSignup}
              className="w-full sm:w-auto text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <span>Start Recovering Invoices</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenApp}
              className="w-full sm:w-auto text-sm font-medium bg-[#161B22] hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-6 py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Explore Live Demo App</span>
            </button>
          </div>

          {/* Social Proof metrics */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800/80 text-left">
            <div>
              <div className="text-2xl font-bold text-white">$480K+</div>
              <div className="text-xs text-slate-400">Total payments tracked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">88.4%</div>
              <div className="text-xs text-slate-400">Recovery success rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">5.2 Days</div>
              <div className="text-xs text-slate-400">Avg. days to settle</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">3-Tier Max</div>
              <div className="text-xs text-slate-400">Relationship-safe safeguard</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3-Tier Escalation Preview */}
      <section id="preview" className="py-20 px-6 bg-[#0E131A] border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Relationship-Preserving Intelligence
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              3 Progressive Stages. Always in Your Control.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Never send an aggressive email too early, and never let overdue payments slip through the cracks.
            </p>
          </div>

          {/* Escalation Tier Selector Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-[#161B22] border border-slate-800 rounded-xl gap-1">
              <button
                onClick={() => setActiveTier(1)}
                className={`text-xs px-4 py-2 rounded-lg font-medium transition ${
                  activeTier === 1
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Level 1 · Friendly Nudge (1–7 Days)
              </button>
              <button
                onClick={() => setActiveTier(2)}
                className={`text-xs px-4 py-2 rounded-lg font-medium transition ${
                  activeTier === 2
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Level 2 · Firm Follow-up (8–14 Days)
              </button>
              <button
                onClick={() => setActiveTier(3)}
                className={`text-xs px-4 py-2 rounded-lg font-medium transition ${
                  activeTier === 3
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Level 3 · Final Notice (15+ Days)
              </button>
            </div>
          </div>

          {/* Preview Box */}
          <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono">To:</span>
                <span className="text-slate-300 font-mono">client@company.com</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                activeTier === 1
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : activeTier === 2
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {activeTier === 1 ? "Friendly Courtesy" : activeTier === 2 ? "Firm Overdue" : "Final Demand"}
              </span>
            </div>

            <div className="text-xs text-slate-300 font-mono space-y-1">
              <span className="text-slate-500">Subject:</span>{" "}
              <strong>
                {activeTier === 1
                  ? "Quick reminder: Invoice INV-103 is ready for settlement"
                  : activeTier === 2
                  ? "Second Follow-up: Overdue Invoice INV-103 ($2,900)"
                  : "URGENT / FINAL NOTICE: Unpaid Invoice INV-103 ($2,900)"}
              </strong>
            </div>

            <div className="p-4 bg-[#0D1117] rounded-xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-line">
              {activeTier === 1 &&
                `Hi Riley,\n\nHope you're having a productive week! Just following up on invoice INV-103 for $2,900, which was due on 22-10-2026.\n\nCould you please let me know once you initiate the transfer or if you need an updated copy?\n\nBest regards,\nYour Team`}
              {activeTier === 2 &&
                `Dear Riley,\n\nWe haven't received payment for invoice INV-103 ($2,900), which is now 8 days past due.\n\nPlease process this transfer today or confirm the expected settlement date so we can keep your file up to date.\n\nThank you,\nAccounts Department`}
              {activeTier === 3 &&
                `ATTN: Accounts Payable,\n\nInvoice INV-103 for $2,900 is significantly past due (15+ days). This is our final automated reminder before we must escalate this matter for formal collection review.\n\nPlease confirm same-day wire transfer.\n\nFinance Office`}
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Never sent automatically without your pre-flight confirmation.
              </span>
              <button
                onClick={onOpenApp}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <span>Try in App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features for Freelancers & Agencies */}
      <section id="features" className="py-20 px-6 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Designed For How Real Work Gets Paid
            </h2>
            <p className="text-sm text-slate-400">
              Everything independent professionals need to eliminate late payment stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#161B22] border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Client Reply Understanding</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a client says "I'll pay this Friday", AI understands the intent and automatically pauses reminders until Friday.
              </p>
            </div>

            <div className="bg-[#161B22] border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Human Bank Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A client claiming "I paid yesterday" does not fool the system. The invoice is only marked paid when you verify receipt in your account.
              </p>
            </div>

            <div className="bg-[#161B22] border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Stripe & CSV Ready</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No need to recreate billing forms. Quick add existing invoices or upload CSV exports from Stripe, QuickBooks, or PayPal in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Plan for Freelancers */}
      <section id="pricing" className="py-20 px-6 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto space-y-10 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm text-slate-400">
              Recover one invoice and the system pays for itself 100x over.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            {/* Free Starter */}
            <div className="bg-[#161B22] border border-slate-800 p-6 rounded-2xl space-y-4">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider font-mono">
                  Freelancer Starter
                </span>
                <div className="text-3xl font-extrabold text-white mt-1">$0</div>
                <div className="text-xs text-slate-400">Free forever during hackathon preview</div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Up to 10 active tracked invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Full 3-Tier AI Follow-up Drafts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payment verification & Audit trail</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV bulk import</span>
                </li>
              </ul>

              <button
                onClick={onOpenSignup}
                className="w-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl border border-slate-700 transition"
              >
                Sign Up Free
              </button>
            </div>

            {/* Pro Agency */}
            <div className="bg-gradient-to-b from-indigo-950/40 to-[#161B22] border-2 border-indigo-500/40 p-6 rounded-2xl space-y-4 relative">
              <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                Most Popular
              </span>

              <div>
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider font-mono">
                  Agency & Studio Pro
                </span>
                <div className="text-3xl font-extrabold text-white mt-1">$19 <span className="text-sm font-normal text-slate-400">/mo</span></div>
                <div className="text-xs text-slate-400">For agencies managing high invoice volume</div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unlimited tracked invoices & clients</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Custom company sender domain</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Direct Resend & Stripe webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Multi-seat agency team login</span>
                </li>
              </ul>

              <button
                onClick={onOpenSignup}
                className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                Start 14-Day Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center text-xs text-slate-500 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">RecoverAgent</span>
            <span>· Built for Hackathon 2</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={onOpenLogin} className="hover:text-white transition">Sign In</button>
            <button onClick={onOpenSignup} className="hover:text-white transition">Sign Up</button>
            <button onClick={onOpenApp} className="text-indigo-400 hover:underline">Demo App</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

