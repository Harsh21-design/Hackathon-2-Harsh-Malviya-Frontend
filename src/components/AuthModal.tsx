"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  X,
  CheckCircle2
} from "lucide-react";

interface AuthModalProps {
  initialMode?: "login" | "signup";
  onSuccess: (user: { name: string; email: string; company: string }) => void;
  onCancel: () => void;
}

export default function AuthModal({
  initialMode = "login",
  onSuccess,
  onCancel,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Verify credentials or register account
    setTimeout(() => {
      setLoading(false);
      // If logging in with the predefined primary account
      if (email.toLowerCase() === "malviyahars210903@gmail.com") {
        if (password !== "harsh1234") {
          setError("Invalid password. Please enter the correct password.");
          return;
        }
        onSuccess({
          name: "Harsh Malviya",
          email: "malviyahars210903@gmail.com",
          company: "Nexus Digital Studio",
        });
        return;
      }

      // For any new freelancer account creation
      onSuccess({
        name: name || (email.split("@")[0].toUpperCase()),
        email: email,
        company: company || "Independent Studio",
      });
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#161B22] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Close / Back button */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === "login" ? "Welcome Back to RecoverAgent" : "Create Your Account"}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === "login"
              ? "Sign in to manage invoices and automated follow-ups"
              : "Start recovering overdue payments in under 2 minutes"}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-[#0D1117] p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === "login"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === "signup"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === "signup" && (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Business / Agency Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Morgan Design Studio"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D1117] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0D1117] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 pt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In to Dashboard" : "Create Account & Start"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500">
          By signing in, you agree to our relationship-safe reminder policies.
        </p>
      </div>
    </div>
  );
}

