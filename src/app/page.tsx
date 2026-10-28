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
  Edit2,
  AlertTriangle,
  UserCheck
} from "lucide-react";

export type ViewMode = "dashboard" | "invoices" | "verification" | "invoice_detail" | "review_draft";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  daysOverdue: number;
  status: "Overdue" | "Pending" | "Paid";
  reminder1: boolean;
  reminder2: boolean;
  reminder3: boolean;
  paymentVerified: boolean;
  verifiedAt?: string;
}

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-103",
    invoiceNumber: "INV-103",
    clientName: "Riley Johnson",
    clientEmail: "harshmal82260@gmail.com",
    amount: 2900,
    currency: "USD",
    invoiceDate: "01-10-2026",
    dueDate: "22-10-2026",
    daysOverdue: 6,
    status: "Overdue",
    reminder1: true,
    reminder2: false,
    reminder3: false,
    paymentVerified: false,
  },
  {
    id: "inv-105",
    invoiceNumber: "INV-105",
    clientName: "Jamie Brown",
    clientEmail: "harsh.malviya@vkaps.com",
    amount: 4400,
    currency: "USD",
    invoiceDate: "25-09-2026",
    dueDate: "15-10-2026",
    daysOverdue: 13,
    status: "Overdue",
    reminder1: true,
    reminder2: true,
    reminder3: false,
    paymentVerified: false,
  },
  {
    id: "inv-108",
    invoiceNumber: "INV-108",
    clientName: "Avery Taylor",
    clientEmail: "malviyaharsh500@gmail.com",
    amount: 2500,
    currency: "USD",
    invoiceDate: "05-10-2026",
    dueDate: "20-10-2026",
    daysOverdue: 8,
    status: "Overdue",
    reminder1: true,
    reminder2: false,
    reminder3: false,
    paymentVerified: false,
  },
  {
    id: "inv-102",
    invoiceNumber: "INV-102",
    clientName: "Casey Wilson",
    clientEmail: "futuretechdotcodotin@gmail.com",
    amount: 7000,
    currency: "USD",
    invoiceDate: "12-10-2026",
    dueDate: "28-10-2026",
    daysOverdue: 0,
    status: "Pending",
    reminder1: false,
    reminder2: false,
    reminder3: false,
    paymentVerified: false,
  },
];

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function CRMDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("inv-103");
  const [statusFilter, setStatusFilter] = useState<string>("All Invoices");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [invoiceToVerify, setInvoiceToVerify] = useState<Invoice | null>(null);

  // Edit / Add Form State
  const [formData, setFormData] = useState({
    id: "",
    invoiceNumber: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    dueDate: "",
  });

  // Review Draft State
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  const getNextReminderNumber = (inv: Invoice): 1 | 2 | 3 => {
    if (!inv.reminder1) return 1;
    if (!inv.reminder2) return 2;
    return 3;
  };

  const openInvoiceDetail = (invId: string) => {
    setSelectedInvoiceId(invId);
    setCurrentView("invoice_detail");
  };

  const openReviewDraft = (invId: string) => {
    setSelectedInvoiceId(invId);
    const target = invoices.find((i) => i.id === invId) || invoices[0];
    const nextR = getNextReminderNumber(target);

    setDraftSubject(`Follow-up: Invoice ${target.invoiceNumber} ($${formatNumber(target.amount)})`);

    if (nextR === 1) {
      setDraftBody(
        `Hi ${target.clientName},\n\nHope you're having a productive week! Just following up on invoice ${target.invoiceNumber} for $${formatNumber(target.amount)}, which was due on ${target.dueDate}.\n\nPlease let me know once the payment is initiated.\n\nBest regards,\nHarsh Malviya`
      );
    } else if (nextR === 2) {
      setDraftBody(
        `Dear ${target.clientName},\n\nWe haven't received payment for invoice ${target.invoiceNumber} ($${formatNumber(target.amount)}), which is now ${target.daysOverdue} days past due.\n\nCould you please confirm when the transfer will be completed today?\n\nSincerely,\nHarsh Malviya`
      );
    } else {
      setDraftBody(
        `ATTN: ${target.clientName},\n\nInvoice ${target.invoiceNumber} for $${formatNumber(target.amount)} is significantly overdue by ${target.daysOverdue} days.\n\nThis is our final reminder before formal follow-up. Please process payment immediately.\n\nAccounts Receivable`
      );
    }
    setCurrentView("review_draft");
  };

  const handleSendReminder = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const nextR = getNextReminderNumber(selectedInvoice);

      setInvoices((prev) =>
        prev.map((item) => {
          if (item.id !== selectedInvoice.id) return item;
          if (nextR === 1) return { ...item, reminder1: true };
          if (nextR === 2) return { ...item, reminder2: true };
          return { ...item, reminder3: true };
        })
      );
      showToast(`Reminder R${nextR} sent to ${selectedInvoice.clientEmail}`);
      setCurrentView("invoice_detail");
    }, 600);
  };

  const handleOpenEdit = (inv: Invoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormData({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail,
      amount: inv.amount.toString(),
      dueDate: inv.dueDate,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === formData.id
          ? {
              ...inv,
              invoiceNumber: formData.invoiceNumber,
              clientName: formData.clientName,
              clientEmail: formData.clientEmail,
              amount: parseFloat(formData.amount) || inv.amount,
              dueDate: formData.dueDate,
            }
          : inv
      )
    );
    setIsEditModalOpen(false);
    showToast(`Invoice ${formData.invoiceNumber} updated.`);
  };

  const handleConfirmVerification = () => {
    if (!invoiceToVerify) return;

    setInvoices((prev) =>
      prev.map((item) =>
        item.id === invoiceToVerify.id
          ? {
              ...item,
              paymentVerified: true,
              status: "Paid",
              verifiedAt: new Date().toLocaleDateString("en-GB"),
            }
          : item
      )
    );
    showToast(`Payment of $${formatNumber(invoiceToVerify.amount)} verified for ${invoiceToVerify.invoiceNumber}. Final status updated.`);
    setInvoiceToVerify(null);
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceNumber || !formData.clientName || !formData.amount) return;

    const days = Math.floor(
      (new Date().getTime() - new Date(formData.dueDate || new Date()).getTime()) /
        (1000 * 3600 * 24)
    );

    const created: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: formData.invoiceNumber,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      amount: parseFloat(formData.amount),
      currency: "USD",
      invoiceDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
      dueDate: formData.dueDate || new Date().toISOString().split("T")[0],
      daysOverdue: Math.max(0, days),
      status: days > 0 ? "Overdue" : "Pending",
      reminder1: false,
      reminder2: false,
      reminder3: false,
      paymentVerified: false,
    };

    setInvoices([created, ...invoices]);
    setIsAddModalOpen(false);
    showToast(`Invoice ${created.invoiceNumber} added.`);
    setFormData({
      id: "",
      invoiceNumber: "",
      clientName: "",
      clientEmail: "",
      amount: "",
      dueDate: "",
    });
  };

  // Filters
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === "All Invoices"
        ? true
        : statusFilter === "Overdue"
        ? inv.status === "Overdue"
        : statusFilter === "Pending"
        ? inv.status === "Pending"
        : inv.status === "Paid";

    const matchesSearch =
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalOverdueAmount = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;
  const pendingVerificationCount = invoices.filter((i) => !i.paymentVerified).length;

  return (
    <div className="flex h-screen bg-[#0D1117] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased overflow-hidden">
      {/* ========================================================= */}
      {/* SIDEBAR NAVIGATION                                        */}
      {/* ========================================================= */}
      <aside className="w-60 border-r border-slate-800 bg-[#161B22] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-white tracking-tight">
                RecoverAgent
              </div>
              <div className="text-[11px] text-slate-400">Payment Follow-up</div>
            </div>
          </div>

          {/* Navigation Links */}
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
            </button>

            <button
              onClick={() => setCurrentView("invoices")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "invoices" || currentView === "invoice_detail" || currentView === "review_draft"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Invoices</span>
              {overdueCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {overdueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView("verification")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "verification"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Payment Verification</span>
              {pendingVerificationCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  {pendingVerificationCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* User Workspace Profile Footer */}
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
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-8 space-y-6 max-w-5xl w-full mx-auto">

          {/* ========================================================= */}
          {/* VIEW 1: DASHBOARD (Overview)                              */}
          {/* ========================================================= */}
          {currentView === "dashboard" && (
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Overview</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Recovery Dashboard</h1>
                <p className="text-xs text-slate-400 mt-0.5">High level summary of outstanding receivables and follow-up activities.</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">${formatNumber(totalOverdueAmount)}</div>
                  <div className="text-xs text-slate-400 mt-1">Total overdue receivables</div>
                </div>
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-amber-400">{overdueCount}</div>
                  <div className="text-xs text-slate-400 mt-1">Active overdue follow-ups</div>
                </div>
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-emerald-400">
                    {invoices.filter((i) => i.status === "Paid").length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Payments verified & settled</div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-[#161B22] border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Manage & Track Invoices</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    View complete invoice registry, edit records, send automated follow-up drafts, or verify incoming credits.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView("invoices")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  Go to Invoices
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: INVOICES REGISTRY (With Search, Edit & Add)      */}
          {/* ========================================================= */}
          {currentView === "invoices" && (
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Registry</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Invoices</h1>
                <p className="text-xs text-slate-400 mt-0.5">Manage invoices, edit details, and trigger follow-up reminders.</p>
              </div>

              {/* Table Card */}
              <div className="bg-[#161B22] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {/* Header with Search and Actions */}
                <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
                  {/* Clean Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                    {(["All Invoices", "Overdue", "Pending", "Paid"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          statusFilter === tab
                            ? "bg-slate-800 text-white border border-slate-700"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Search + Import CSV + Add A Invoice */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <div className="relative w-full md:w-52">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search invoice or client..."
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
                      onClick={() => {
                        setFormData({
                          id: "",
                          invoiceNumber: "",
                          clientName: "",
                          clientEmail: "",
                          amount: "",
                          dueDate: "",
                        });
                        setIsAddModalOpen(true);
                      }}
                      className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 transition"
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
                      {/* Left: Client Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">{inv.clientName}</span>
                          <span className="text-slate-500 text-xs">·</span>
                          <span className="font-mono text-xs text-slate-300 font-medium">{inv.invoiceNumber}</span>
                          <span className="text-xs text-slate-500 font-mono">({inv.clientEmail})</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-200">${formatNumber(inv.amount)}</span>
                          <span>·</span>
                          <span>Due {inv.dueDate}</span>
                          {inv.status === "Overdue" && (
                            <>
                              <span>·</span>
                              <span className="text-amber-400 font-medium">{inv.daysOverdue} days late</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Reminders, Status & Actions (NO raw tickbox) */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* 3-Tier Reminder Badges */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            inv.reminder1
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}>
                            R1 {inv.reminder1 ? "✓" : ""}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            inv.reminder2
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}>
                            R2 {inv.reminder2 ? "✓" : ""}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            inv.reminder3
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}>
                            R3 {inv.reminder3 ? "✓" : ""}
                          </span>
                        </div>

                        {/* Status Pill */}
                        {inv.status === "Paid" ? (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Paid
                          </span>
                        ) : inv.status === "Overdue" ? (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Overdue
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            Pending
                          </span>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={(e) => handleOpenEdit(inv, e)}
                          title="Edit Invoice"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Open Detail Action */}
                        <button
                          onClick={() => openInvoiceDetail(inv.id)}
                          className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg transition"
                        >
                          Open Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: PAYMENT VERIFICATION                              */}
          {/* ========================================================= */}
          {currentView === "verification" && (
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Settlement</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Payment Verification</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm receipt of payment in your bank or payment gateway. Once verified, follow-ups permanently stop.
                </p>
              </div>

              <div className="bg-[#161B22] border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 font-semibold text-xs text-slate-300">
                  Pending Verification Invoices
                </div>

                <div className="divide-y divide-slate-800/80">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-sm text-white">
                          {inv.clientName} · {inv.invoiceNumber}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Amount: <strong className="text-slate-200">${formatNumber(inv.amount)}</strong> · Due {inv.dueDate} · Status:{" "}
                          <span className={inv.status === "Paid" ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                            {inv.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        {inv.paymentVerified ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            <span>Payment Verified (Final)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setInvoiceToVerify(inv)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify Payment Received</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: INVOICE DETAIL (Opened directly from an invoice)  */}
          {/* ========================================================= */}
          {currentView === "invoice_detail" && (
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => setCurrentView("invoices")}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Invoices
                </button>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Invoice Detail</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {selectedInvoice.invoiceNumber} · {selectedInvoice.clientName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  ${formatNumber(selectedInvoice.amount)} · Due {selectedInvoice.dueDate} · {selectedInvoice.daysOverdue} days overdue · Contact: {selectedInvoice.clientEmail}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3-Step Reminder History */}
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="font-semibold text-white text-sm">Reminder History</div>
                  
                  <div className="relative border-l-2 border-slate-800 ml-2 space-y-6 pl-4 py-1">
                    {/* R1 */}
                    <div className="relative">
                      <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${selectedInvoice.reminder1 ? "bg-indigo-600 border-indigo-400" : "bg-slate-900 border-slate-700"}`}></div>
                      <div className="font-semibold text-xs text-white">R1 (Friendly Reminder)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {selectedInvoice.reminder1 ? "Sent · Delivered" : "Not sent yet"}
                      </div>
                      {!selectedInvoice.reminder1 && selectedInvoice.status !== "Paid" && (
                        <div className="mt-2">
                          <button
                            onClick={() => openReviewDraft(selectedInvoice.id)}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            Review R1 Draft
                          </button>
                        </div>
                      )}
                    </div>

                    {/* R2 */}
                    <div className="relative">
                      <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${selectedInvoice.reminder2 ? "bg-indigo-600 border-indigo-400" : selectedInvoice.reminder1 ? "bg-amber-400 border-amber-300 animate-pulse" : "bg-slate-900 border-slate-700"}`}></div>
                      <div className="font-semibold text-xs text-white">R2 (Firm Follow-up)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {selectedInvoice.reminder2 ? "Sent · Delivered" : selectedInvoice.reminder1 ? "Ready after cooldown" : "Locked until R1"}
                      </div>
                      {selectedInvoice.reminder1 && !selectedInvoice.reminder2 && selectedInvoice.status !== "Paid" && (
                        <div className="mt-2">
                          <button
                            onClick={() => openReviewDraft(selectedInvoice.id)}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            Review R2 Draft
                          </button>
                        </div>
                      )}
                    </div>

                    {/* R3 */}
                    <div className="relative">
                      <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${selectedInvoice.reminder3 ? "bg-indigo-600 border-indigo-400" : "bg-slate-900 border-slate-700"}`}></div>
                      <div className="font-semibold text-xs text-white">R3 (Final Notice)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {selectedInvoice.reminder3 ? "Sent · Delivered" : "Only unlocks after R2"}
                      </div>
                      {selectedInvoice.reminder2 && !selectedInvoice.reminder3 && selectedInvoice.status !== "Paid" && (
                        <div className="mt-2">
                          <button
                            onClick={() => openReviewDraft(selectedInvoice.id)}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            Review Final R3 Draft
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Edit & Actions */}
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="font-semibold text-white text-sm">Invoice Status & Edit</div>
                  
                  <div className="p-4 bg-[#0D1117] border border-slate-800 rounded-xl space-y-3">
                    <div className="text-xs text-slate-300">
                      Payment Verification:{" "}
                      <strong className={selectedInvoice.paymentVerified ? "text-emerald-400" : "text-amber-400"}>
                        {selectedInvoice.paymentVerified ? "Verified (Paid)" : "Unverified (Outstanding)"}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleOpenEdit(selectedInvoice)}
                        className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>

                      {!selectedInvoice.paymentVerified && (
                        <button
                          onClick={() => setInvoiceToVerify(selectedInvoice)}
                          className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verify Payment</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: REVIEW DRAFT                                      */}
          {/* ========================================================= */}
          {currentView === "review_draft" && (
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => setCurrentView("invoice_detail")}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Invoice
                </button>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Review Reminder Draft</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Review R{getNextReminderNumber(selectedInvoice)} Draft
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedInvoice.invoiceNumber} · {selectedInvoice.clientName} · AI generated personalized reminder.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="p-3 bg-[#0D1117] border border-slate-800 rounded-lg text-xs text-slate-300">
                    <b>Why this message:</b> Invoice is overdue by {selectedInvoice.daysOverdue} days. Next follow-up is Reminder {getNextReminderNumber(selectedInvoice)}.
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
                    <label className="text-xs text-slate-400">Message Body</label>
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
                          <span>Send R{getNextReminderNumber(selectedInvoice)}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => showToast("Draft saved")}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-lg transition"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={() => setCurrentView("invoice_detail")}
                      className="text-xs text-slate-400 hover:text-white px-2 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-3 h-fit">
                  <div className="font-semibold text-white text-sm">Status Checks</div>
                  <div className="space-y-2 text-xs divide-y divide-slate-800">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Invoice is overdue</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OK</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Not verified paid</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OK</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Next Stage</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        R{getNextReminderNumber(selectedInvoice)} of 3
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* CONFIRM PAYMENT VERIFICATION MODAL ("ARE YOU SURE?")      */}
      {/* ========================================================= */}
      {invoiceToVerify && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Payment Verification</h3>
                <p className="text-xs text-slate-400">{invoiceToVerify.invoiceNumber} · {invoiceToVerify.clientName}</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#0D1117] border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
              Are you sure you want to verify payment of <strong className="text-white">${formatNumber(invoiceToVerify.amount)}</strong>?
              <br /><br />
              <span className="text-amber-400/90 font-medium">Important:</span> Once marked as verified, this action is final and all future automated follow-up reminders will be permanently stopped.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceToVerify(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
              >
                Yes, Verify & Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT INVOICE MODAL                                  */}
      {/* ========================================================= */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {isEditModalOpen ? "Edit Invoice" : "Add A Invoice"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEditModalOpen ? "Update details for this invoice." : "Enter invoice details for automated follow-up."}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleSaveEdit : handleAddInvoice} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Invoice Number *</label>
                <input
                  type="text"
                  required
                  placeholder="INV-109"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
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
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Client Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@gmail.com"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg transition"
                >
                  {isEditModalOpen ? "Save Changes" : "Save Invoice"}
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
              <div className="text-[10px] text-slate-500">Columns: Client_Name, Email_Address, Invoice_ID, Due_Date, Payment</div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-xs"
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
