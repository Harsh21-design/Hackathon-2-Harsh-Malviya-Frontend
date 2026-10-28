"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Clock,
  Send,
  Plus,
  FileSpreadsheet,
  Search,
  Bot,
  RefreshCw,
  X,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Check,
  UserCheck,
  Lock
} from "lucide-react";

export type ViewMode = "dashboard" | "invoice" | "review" | "verify";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  remindersUsed: number; // 0, 1, 2, 3
  remindersMax: number;
  status: "OVERDUE" | "PROMISED" | "CLAIMED_PAID" | "RECOVERED";
  r1SentDate?: string;
  r2SentDate?: string;
  r3SentDate?: string;
  clientReply?: {
    date: string;
    text: string;
    aiIntent: "PAYMENT_PROMISE" | "CLAIMED_PAID" | "GENERAL";
    promisedDate?: string;
  };
}

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-101",
    invoiceNumber: "INV-101",
    clientName: "Rahul Sharma",
    clientEmail: "rahul@sharmamedia.in",
    amount: 50000,
    currency: "INR",
    dueDate: "2026-10-10",
    daysOverdue: 18,
    remindersUsed: 1,
    remindersMax: 3,
    status: "OVERDUE",
    r1SentDate: "12 Oct, 10:14 AM",
    clientReply: {
      date: "13 Oct, 09:02 AM",
      text: "Okay, I will make the payment in five days.",
      aiIntent: "PAYMENT_PROMISE",
      promisedDate: "18 Oct",
    },
  },
  {
    id: "inv-102",
    invoiceNumber: "INV-102",
    clientName: "ABC Agency",
    clientEmail: "accounts@abcagency.co",
    amount: 30000,
    currency: "INR",
    dueDate: "2026-10-15",
    daysOverdue: 13,
    remindersUsed: 1,
    remindersMax: 3,
    status: "PROMISED",
    r1SentDate: "16 Oct, 11:30 AM",
    clientReply: {
      date: "17 Oct, 02:15 PM",
      text: "Waiting for client clearance, will clear by 30 Oct.",
      aiIntent: "PAYMENT_PROMISE",
      promisedDate: "30 Oct",
    },
  },
  {
    id: "inv-104",
    invoiceNumber: "INV-104",
    clientName: "Kiran Textiles",
    clientEmail: "finance@kirantextiles.com",
    amount: 45000,
    currency: "INR",
    dueDate: "2026-10-12",
    daysOverdue: 16,
    remindersUsed: 1,
    remindersMax: 3,
    status: "CLAIMED_PAID",
    r1SentDate: "14 Oct, 02:00 PM",
    clientReply: {
      date: "20 Oct, 11:10 AM",
      text: "I already paid this last week via bank transfer.",
      aiIntent: "CLAIMED_PAID",
    },
  },
  {
    id: "inv-099",
    invoiceNumber: "INV-099",
    clientName: "Priya Mehta",
    clientEmail: "priya@mehtadesign.com",
    amount: 25000,
    currency: "INR",
    dueDate: "2026-10-01",
    daysOverdue: 0,
    remindersUsed: 1,
    remindersMax: 3,
    status: "RECOVERED",
    r1SentDate: "02 Oct, 10:00 AM",
  },
];

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function CRMDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>("inv-101");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Review Draft State
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Add A Invoice Form (No payment link)
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    dueDate: "",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const activeInvoice = invoices.find((inv) => inv.id === activeInvoiceId) || invoices[0];

  const openInvoiceDetail = (invId: string) => {
    setActiveInvoiceId(invId);
    setCurrentView("invoice");
  };

  const openReviewDraft = (invId: string) => {
    setActiveInvoiceId(invId);
    const target = invoices.find((i) => i.id === invId) || invoices[0];
    const nextNum = Math.min(3, target.remindersUsed + 1);

    setDraftSubject(`Follow-up: Invoice ${target.invoiceNumber} (₹${formatNumber(target.amount)})`);

    if (target.clientReply?.promisedDate) {
      setDraftBody(
        `Hi ${target.clientName},\n\nI'm following up on invoice ${target.invoiceNumber} for ₹${formatNumber(target.amount)}, which was due on ${target.dueDate}.\n\nYou mentioned payment would be made by ${target.clientReply.promisedDate}, and we have not yet received it. Could you please confirm when the payment will be processed?\n\nThank you,\nHarsh`
      );
    } else {
      setDraftBody(
        `Hi ${target.clientName},\n\nThis is a follow-up reminder regarding invoice ${target.invoiceNumber} for ₹${formatNumber(target.amount)}, due on ${target.dueDate} (${target.daysOverdue} days overdue).\n\nPlease let us know when we can expect payment.\n\nThank you,\nHarsh`
      );
    }
    setCurrentView("review");
  };

  const openVerifyPayment = (invId: string) => {
    setActiveInvoiceId(invId);
    setCurrentView("verify");
  };

  const handleSendReminder = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setInvoices((prev) =>
        prev.map((item) =>
          item.id === activeInvoice.id
            ? {
                ...item,
                remindersUsed: Math.min(item.remindersMax, item.remindersUsed + 1),
                r2SentDate: item.remindersUsed === 1 ? "Today, Just now" : item.r2SentDate,
                r3SentDate: item.remindersUsed === 2 ? "Today, Just now" : item.r3SentDate,
              }
            : item
        )
      );
      showToast(`Reminder R${activeInvoice.remindersUsed + 1} sent to ${activeInvoice.clientEmail}`);
      setCurrentView("invoice");
    }, 600);
  };

  const handleVerifyPaid = () => {
    setInvoices((prev) =>
      prev.map((item) =>
        item.id === activeInvoice.id
          ? {
              ...item,
              status: "RECOVERED",
              daysOverdue: 0,
            }
          : item
      )
    );
    showToast(`Invoice ${activeInvoice.invoiceNumber} verified and marked as PAID!`);
    setCurrentView("dashboard");
  };

  const handleVerifyReject = () => {
    showToast(`Payment not received. Reminders remain paused and requested proof from ${activeInvoice.clientName}.`);
    setCurrentView("invoice");
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.invoiceNumber || !newInvoice.clientName || !newInvoice.amount) return;

    const days = Math.floor(
      (new Date().getTime() - new Date(newInvoice.dueDate || new Date()).getTime()) /
        (1000 * 3600 * 24)
    );

    const created: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvoice.invoiceNumber,
      clientName: newInvoice.clientName,
      clientEmail: newInvoice.clientEmail,
      amount: parseFloat(newInvoice.amount),
      currency: "INR",
      dueDate: newInvoice.dueDate || new Date().toISOString().split("T")[0],
      daysOverdue: Math.max(0, days),
      remindersUsed: 0,
      remindersMax: 3,
      status: "OVERDUE",
    };

    setInvoices([created, ...invoices]);
    setIsAddModalOpen(false);
    showToast(`Invoice ${created.invoiceNumber} added.`);
    setNewInvoice({
      invoiceNumber: "",
      clientName: "",
      clientEmail: "",
      amount: "",
      dueDate: "",
    });
  };

  // Filter
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "OVERDUE"
        ? inv.status === "OVERDUE"
        : statusFilter === "PROMISED"
        ? inv.status === "PROMISED"
        : statusFilter === "CLAIMED_PAID"
        ? inv.status === "CLAIMED_PAID"
        : inv.status === "RECOVERED";

    const matchesSearch =
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalOverdueAmount = invoices
    .filter((i) => i.status === "OVERDUE" || i.status === "PROMISED" || i.status === "CLAIMED_PAID")
    .reduce((sum, i) => sum + i.amount, 0);

  const actionCount = invoices.filter((i) => i.status === "OVERDUE" || i.status === "CLAIMED_PAID").length;

  return (
    <div className="flex h-screen bg-[#0D1117] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased overflow-hidden">
      {/* ========================================================= */}
      {/* CRM SIDEBAR WITH THE 4 CORE WORKFLOWS                     */}
      {/* ========================================================= */}
      <aside className="w-60 border-r border-slate-800 bg-[#161B22] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header (NO GREEN DOT) */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-white tracking-tight">
                RecoverAgent
              </div>
              <div className="text-[11px] text-slate-400">Payment Recovery</div>
            </div>
          </div>

          {/* Core 4 Navigation Views */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "dashboard"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
              {actionCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {actionCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView("invoice")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "invoice"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Invoice Detail</span>
            </button>

            <button
              onClick={() => setCurrentView("review")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "review"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Review Draft</span>
            </button>

            <button
              onClick={() => setCurrentView("verify")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "verify"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Verify Payment</span>
            </button>
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800/60 transition">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
              HM
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-slate-200 truncate">Harsh Malviya</div>
              <div className="text-[10px] text-slate-500 truncate">Freelancer Account</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN VIEW CONTAINER                                       */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-8 space-y-6 max-w-5xl w-full mx-auto">

          {/* ========================================================= */}
          {/* VIEW 1: DASHBOARD                                         */}
          {/* ========================================================= */}
          {currentView === "dashboard" && (
            <div className="space-y-6">
              {/* Header Info */}
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Overview</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Needs your attention</h1>
                <p className="text-xs text-slate-400 mt-0.5">Aaj kya karna hai, sirf wahi yahan dikhta hai.</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">₹{formatNumber(totalOverdueAmount)}</div>
                  <div className="text-xs text-slate-400 mt-1">Total overdue across {invoices.length} invoices</div>
                </div>
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-amber-400">{actionCount}</div>
                  <div className="text-xs text-slate-400 mt-1">Need your action today</div>
                </div>
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-slate-200">1</div>
                  <div className="text-xs text-slate-400 mt-1">Promise due this week</div>
                </div>
              </div>

              {/* Invoices Card */}
              <div className="bg-[#161B22] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {/* Search & Actions directly inside invoice table */}
                <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
                  {/* Status Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                    {(["ALL", "OVERDUE", "PROMISED", "CLAIMED_PAID", "RECOVERED"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          statusFilter === tab
                            ? "bg-slate-800 text-white border border-slate-700"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tab === "ALL" ? "All Invoices" : tab.replace("_", " ")}
                      </button>
                    ))}
                  </div>

                  {/* Search + Import CSV + Add A Invoice */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <div className="relative w-full md:w-56">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search client, invoice #..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0D1117] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                      />
                    </div>

                    <button
                      onClick={() => setIsCsvModalOpen(true)}
                      className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Import CSV</span>
                    </button>

                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add A Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-800/80">
                  {filteredInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-white">
                          {inv.clientName} · {inv.invoiceNumber}
                        </div>
                        <div className="text-xs text-slate-400">
                          ₹{formatNumber(inv.amount)} · Due {inv.dueDate}
                          {inv.status === "OVERDUE" && ` · ${inv.daysOverdue} days late`}
                          {inv.status === "PROMISED" && ` · Promise: pay by ${inv.clientReply?.promisedDate}`}
                          {inv.status === "CLAIMED_PAID" && ` · Client says paid, needs verification`}
                          {inv.status === "RECOVERED" && ` · Payment verified`}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {inv.status === "OVERDUE" && (
                          <>
                            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              R{inv.remindersUsed} SENT
                            </span>
                            <button
                              onClick={() => openInvoiceDetail(inv.id)}
                              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg transition"
                            >
                              Open invoice
                            </button>
                          </>
                        )}

                        {inv.status === "PROMISED" && (
                          <>
                            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              PROMISED
                            </span>
                            <button
                              onClick={() => openInvoiceDetail(inv.id)}
                              className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition"
                            >
                              View
                            </button>
                          </>
                        )}

                        {inv.status === "CLAIMED_PAID" && (
                          <>
                            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              CLAIMED PAID
                            </span>
                            <button
                              onClick={() => openVerifyPayment(inv.id)}
                              className="text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg transition"
                            >
                              Verify
                            </button>
                          </>
                        )}

                        {inv.status === "RECOVERED" && (
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            PAID
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: INVOICE DETAIL                                    */}
          {/* ========================================================= */}
          {currentView === "invoice" && (
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Dashboard
                </button>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Invoice</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {activeInvoice.invoiceNumber} · {activeInvoice.clientName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  ₹{formatNumber(activeInvoice.amount)} · Due {activeInvoice.dueDate} · {activeInvoice.daysOverdue} days overdue · Reminders used {activeInvoice.remindersUsed} of {activeInvoice.remindersMax}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reminder History */}
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="font-semibold text-white text-sm">Reminder history</div>
                  
                  <div className="relative border-l-2 border-slate-800 ml-2 space-y-6 pl-4 py-1">
                    <div className="relative">
                      <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${activeInvoice.remindersUsed >= 1 ? "bg-indigo-600 border-indigo-400" : "bg-slate-900 border-slate-700"}`}></div>
                      <div className="font-semibold text-xs text-white">R1 sent</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {activeInvoice.remindersUsed >= 1 ? `${activeInvoice.r1SentDate || "12 Oct"} · Delivered` : "Not sent"}
                      </div>
                    </div>

                    <div className="relative">
                      <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${activeInvoice.remindersUsed >= 2 ? "bg-indigo-600 border-indigo-400" : activeInvoice.remindersUsed === 1 ? "bg-amber-400 border-amber-300 animate-pulse" : "bg-slate-900 border-slate-700"}`}></div>
                      <div className="font-semibold text-xs text-white">R2 · {activeInvoice.remindersUsed >= 2 ? "sent" : "not sent"}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {activeInvoice.remindersUsed >= 2 ? "Delivered" : "Available after your review"}
                      </div>
                      {activeInvoice.remindersUsed === 1 && activeInvoice.status !== "RECOVERED" && (
                        <div className="mt-2.5">
                          <button
                            onClick={() => openReviewDraft(activeInvoice.id)}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            Review R2 draft
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${activeInvoice.remindersUsed >= 3 ? "bg-indigo-600 border-indigo-400" : "bg-slate-900 border-slate-700"}`}></div>
                      <div className="font-semibold text-xs text-white">R3 · not sent</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Only after R2</div>
                    </div>
                  </div>
                </div>

                {/* Client Reply & AI Reading */}
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="font-semibold text-white text-sm">Client reply</div>
                  {activeInvoice.clientReply ? (
                    <div className="space-y-3">
                      <div className="text-[11px] text-slate-400">{activeInvoice.clientReply.date}</div>
                      <div className="p-3 rounded-lg bg-amber-500/10 border-l-4 border-amber-500 text-amber-200 text-xs italic font-serif">
                        "{activeInvoice.clientReply.text}"
                      </div>

                      <div className="border border-dashed border-slate-700 bg-[#0D1117] rounded-xl p-4 space-y-2">
                        <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          AI READING
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 inline-block">
                          {activeInvoice.clientReply.aiIntent.replace("_", " ")}
                        </span>
                        {activeInvoice.clientReply.promisedDate && (
                          <div className="text-xs text-slate-200">
                            Promised date: <b>{activeInvoice.clientReply.promisedDate}</b>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Reminders are paused until {activeInvoice.clientReply.promisedDate}.
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => showToast("Promise confirmed")}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg transition"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => showToast("Correction opened")}
                            className="text-xs text-slate-400 hover:text-white px-2 py-1"
                          >
                            Correct
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        A promise is not payment. This invoice stays unpaid until you verify a payment.
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-6 text-center">
                      No reply recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: REVIEW DRAFT                                      */}
          {/* ========================================================= */}
          {currentView === "review" && (
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => setCurrentView("invoice")}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Invoice
                </button>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Review before sending</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Review R{activeInvoice.remindersUsed + 1} draft</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeInvoice.invoiceNumber} · {activeInvoice.clientName} · AI ne ye draft banaya hai. Bhejne se pehle aap edit kar sakte hain.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="p-3 bg-[#0D1117] border border-slate-800 rounded-lg text-xs text-slate-300">
                    <b>Why this message:</b> R{activeInvoice.remindersUsed} was sent earlier and no payment has been received. {activeInvoice.clientReply?.promisedDate ? `The client promised payment, but that date has passed.` : `Scheduled follow-up cooldown elapsed.`}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Subject</label>
                    <input
                      type="text"
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      className="w-full bg-[#0D1117] text-xs text-white px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Message</label>
                    <textarea
                      rows={8}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      className="w-full bg-[#0D1117] text-xs text-slate-200 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleSendReminder}
                      disabled={isSending}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send R{activeInvoice.remindersUsed + 1}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => showToast("Draft saved locally")}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-lg transition"
                    >
                      Save draft
                    </button>
                    <button
                      onClick={() => setCurrentView("invoice")}
                      className="text-xs text-slate-400 hover:text-white px-2 py-2"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Ye R{activeInvoice.remindersUsed + 1} hai. R3 ke baad koi automatic reminder nahi jayega.
                  </div>
                </div>

                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-3 h-fit">
                  <div className="font-semibold text-white text-sm">Checks before sending</div>
                  <div className="space-y-2 text-xs divide-y divide-slate-800">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Invoice is overdue</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OK</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Not paid</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OK</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Promise date passed</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OK</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Reminders used</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {activeInvoice.remindersUsed} of 3
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: VERIFY PAYMENT                                    */}
          {/* ========================================================= */}
          {currentView === "verify" && (
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Dashboard
                </button>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Payment verification</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Verify payment</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeInvoice.invoiceNumber} · {activeInvoice.clientName} · ₹{formatNumber(activeInvoice.amount)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-800 bg-[#161B22] rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-white text-base">Client says payment is done</h3>
                  <div className="text-xs text-slate-400">
                    Client reply: "{activeInvoice.clientReply?.text || "I already paid this last week."}"
                  </div>

                  <div className="p-3.5 bg-[#0D1117] border border-slate-800 rounded-lg text-xs text-slate-300">
                    Invoice will be marked <b>PAID</b> only after you verify the payment yourself, for example in your bank account or UPI app. Ye claim ko system automatically paid nahi maanega.
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      onClick={handleVerifyPaid}
                      className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg transition"
                    >
                      I verified the payment
                    </button>
                    <button
                      onClick={handleVerifyReject}
                      className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-lg transition"
                    >
                      Payment not received
                    </button>
                  </div>
                </div>

                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-3 h-fit">
                  <div className="font-semibold text-white text-sm">While this is pending</div>
                  <div className="space-y-2 text-xs divide-y divide-slate-800">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Normal reminders</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">PAUSED</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Status</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">CLAIMED PAID</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Marked paid</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">NO</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Client ka claim sirf ek signal hai, proof nahi.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* ADD A INVOICE MODAL                                       */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Add A Invoice</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter invoice details for automated follow-up.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddInvoice} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Invoice Number *</label>
                <input
                  type="text"
                  required
                  placeholder="INV-107"
                  value={newInvoice.invoiceNumber}
                  onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                  className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Client Name"
                    value={newInvoice.clientName}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Client Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@company.com"
                    value={newInvoice.clientEmail}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientEmail: e.target.value })}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="40000"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg transition"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CSV IMPORT MODAL                                          */}
      {/* ========================================================= */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Import Invoices (CSV)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload unpaid invoices via CSV file.</p>
              </div>
              <button onClick={() => setIsCsvModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center space-y-2 hover:border-indigo-500 transition cursor-pointer">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs text-slate-300">Click to upload CSV file</div>
              <div className="text-[10px] text-slate-500">Columns: invoice_id, client_name, email, amount, due_date</div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <button
                type="button"
                onClick={() => {
                  const sample: Invoice = {
                    id: `csv-${Date.now()}`,
                    invoiceNumber: "INV-108",
                    clientName: "Alpha Logistics",
                    clientEmail: "billing@alphalogistics.com",
                    amount: 55000,
                    currency: "INR",
                    dueDate: "2026-10-18",
                    daysOverdue: 10,
                    remindersUsed: 1,
                    remindersMax: 3,
                    status: "OVERDUE",
                    r1SentDate: "20 Oct 2026",
                  };
                  setInvoices([sample, ...invoices]);
                  setIsCsvModalOpen(false);
                  showToast("Sample invoice imported!");
                }}
                className="text-indigo-400 hover:underline"
              >
                Insert sample data
              </button>
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161B22] border border-indigo-500/30 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
