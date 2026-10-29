"use client";

import React, { useState } from "react";
import {
  Settings,
  X,
  User,
  Building,
  Mail,
  Shield,
  Clock,
  Sparkles,
  Check,
  Save,
  Lock
} from "lucide-react";

interface SettingsModalProps {
  initialProfile: {
    name: string;
    email: string;
    company: string;
  };
  currentTimezone: string;
  onTimezoneChange: (tz: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSave: (updated: { name: string; email: string; company: string }) => void;
  onClose: () => void;
}

export default function SettingsModal({
  initialProfile,
  currentTimezone,
  onTimezoneChange,
  isDarkMode,
  onToggleTheme,
  onSave,
  onClose,
}: SettingsModalProps) {
  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [company, setCompany] = useState(initialProfile.company);
  const [timezone, setTimezone] = useState(currentTimezone);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTimezoneChange(timezone);
    onSave({ name, email, company });
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#161B22] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Recovery & Workspace Settings</h3>
              <p className="text-xs text-slate-400">Manage your sender profile and reminder safeguards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section: Profile */}
          <div className="space-y-3 bg-[#0D1117] p-4 rounded-xl border border-slate-800">
            <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Owner & Sender Profile</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161B22] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Agency / Business Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#161B22] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Reply-To Email (For Client Responses)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161B22] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section: System Preferences (Timezone & Appearance) */}
          <div className="space-y-3 bg-[#0D1117] p-4 rounded-xl border border-slate-800">
            <div className="font-semibold text-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Timezone & Regional Preferences</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label className="text-slate-400">System Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#161B22] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Asia/Kolkata">IST - India Standard Time (UTC +5:30)</option>
                  <option value="UTC">UTC - Coordinated Universal Time</option>
                  <option value="America/New_York">EST - Eastern Time (US/New York)</option>
                  <option value="America/Los_Angeles">PST - Pacific Time (US/LA)</option>
                  <option value="Europe/London">GMT/BST - London (UK)</option>
                  <option value="Asia/Dubai">GST - Dubai / UAE (UTC +4:00)</option>
                  <option value="Asia/Singapore">SGT - Singapore (UTC +8:00)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Theme Appearance</label>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="w-full bg-[#161B22] hover:bg-slate-800 border border-slate-800 rounded-lg p-2 text-white text-left flex items-center justify-between transition"
                >
                  <span>{isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
                  <span className="text-[10px] text-indigo-400 font-bold">Toggle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Escalation Safeguards */}
          <div className="space-y-3 bg-[#0D1117] p-4 rounded-xl border border-slate-800">
            <div className="font-semibold text-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Follow-up Policy & Escalation</span>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                AI Reply-Driven
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#161B22] border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Sequential 3-Stage Pipeline</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    R1 (Friendly) → R2 (Firm Follow-up) → R3 (Final Notice)
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 font-bold bg-slate-800 px-2 py-1 rounded border border-slate-700">
                  Max 3 Reminders
                </span>
              </div>

              <div className="p-2.5 bg-[#161B22] border border-slate-800 rounded-lg space-y-1">
                <div className="text-white font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Client-Reply Adaptive Logic</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Reminders are not sent on a blind timer. When a client replies (e.g. promise to pay, bank delay note, or query), Gemini AI parses their response and prepares the next stage draft accordingly for your review.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

