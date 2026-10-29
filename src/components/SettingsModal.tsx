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
  onSave: (updated: { name: string; email: string; company: string }) => void;
  onClose: () => void;
}

export default function SettingsModal({
  initialProfile,
  onSave,
  onClose,
}: SettingsModalProps) {
  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [company, setCompany] = useState(initialProfile.company);
  const [cooldownDays, setCooldownDays] = useState(5);
  const [maxReminders, setMaxReminders] = useState(3);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

          {/* Section: Escalation Safeguards */}
          <div className="space-y-3 bg-[#0D1117] p-4 rounded-xl border border-slate-800">
            <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Escalation Safeguards & Cooldowns</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Cooldown Between Reminders</label>
                <select
                  value={cooldownDays}
                  onChange={(e) => setCooldownDays(Number(e.target.value))}
                  className="w-full bg-[#161B22] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={3}>3 Days Minimum</option>
                  <option value={5}>5 Days (Recommended)</option>
                  <option value={7}>7 Days Weekly</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Maximum Reminders Limit</label>
                <div className="p-2 bg-[#161B22] border border-slate-800 rounded-lg text-slate-300 font-mono flex items-center justify-between">
                  <span>3 Reminders Max</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Rule 4 Enforced
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              Guarantees your clients are never spammed. Reminders permanently stop after Level 3.
            </p>
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
