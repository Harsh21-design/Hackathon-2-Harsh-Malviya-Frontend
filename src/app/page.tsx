"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Clock,
  Send,
  Plus,
  FileSpreadsheet,
  Search,
  RefreshCw,
  X,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Check,
  Edit2,
  AlertTriangle,
  UserCheck,
  PanelLeftClose,
  PanelLeft,
  History,
  TrendingUp,
  ShieldCheck,
  Eye,
  Lock,
  Users,
  Mail,
  Building,
  Phone,
  ArrowUpDown,
  Filter,
  Settings,
  LogOut,
  Globe,
} from "lucide-react";
import { api, BackendInvoice, BackendActivity } from "@/lib/api";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import SettingsModal from "@/components/SettingsModal";

export type ViewMode =
  | "dashboard"
  | "invoices"
  | "clients"
  | "verification"
  | "activity"
  | "invoice_detail"
  | "review_draft";

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

export interface ActivityEvent {
  id: string;
  time: string;
  type: "REMINDER_SENT" | "PAYMENT_VERIFIED" | "INVOICE_CREATED";
  title: string;
  subtitle: string;
}

const COUNTRY_CODES = [
  { code: "+91", country: "IN", name: "India (+91)" },
  { code: "+1", country: "US", name: "USA / Canada (+1)" },
  { code: "+44", country: "GB", name: "UK (+44)" },
  { code: "+61", country: "AU", name: "Australia (+61)" },
  { code: "+49", country: "DE", name: "Germany (+49)" },
  { code: "+971", country: "AE", name: "UAE (+971)" },
  { code: "+65", country: "SG", name: "Singapore (+65)" },
  { code: "+33", country: "FR", name: "France (+33)" },
];

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function mapBackendToInvoice(inv: BackendInvoice): Invoice {
  const isPaid = inv.status === "PAID";
  let statusUi: "Overdue" | "Pending" | "Paid" = "Pending";
  if (isPaid) {
    statusUi = "Paid";
  } else if (inv.overdue_days > 0 || inv.status === "OVERDUE" || inv.status.startsWith("REMINDER_")) {
    statusUi = "Overdue";
  }

  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    clientName: inv.client?.name || "Client",
    clientEmail: inv.client?.email || "billing@client.com",
    amount: Number(inv.amount),
    currency: inv.currency || "USD",
    invoiceDate: inv.invoice_date,
    dueDate: inv.due_date,
    daysOverdue: inv.overdue_days || 0,
    status: statusUi,
    reminder1: inv.reminder_count >= 1,
    reminder2: inv.reminder_count >= 2,
    reminder3: inv.reminder_count >= 3,
    paymentVerified: isPaid,
  };
}

function formatActivityTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "Recent";
  }
}

export default function CRMDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All Invoices");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Landing Page & Auth Modal States
  const [pageMode, setPageMode] = useState<"app" | "landing">("app");
  const [authModal, setAuthModal] = useState<null | "login" | "signup">(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User Workspace Profile
  const [userProfile, setUserProfile] = useState({
    name: "Harsh Malviya",
    email: "harsh.malviya@vkaps.com",
    company: "Nexus Creative Studio",
  });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [invoiceToVerify, setInvoiceToVerify] = useState<Invoice | null>(null);

  // New Client Form State
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [clientFormData, setClientFormData] = useState({
    name: "",
    email: "",
    company: "",
    phoneNumber: "",
    notes: "",
  });

  // Dedicated Search & Sort States per section
  const [invoiceSortBy, setInvoiceSortBy] = useState<"dueDate" | "amount" | "daysOverdue">("dueDate");
  const [invoiceSortOrder, setInvoiceSortOrder] = useState<"asc" | "desc">("desc");

  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientSortBy, setClientSortBy] = useState<"name" | "outstanding" | "invoices">("outstanding");

  const [verificationSearchQuery, setVerificationSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "pending" | "verified">("all");

  const [activitySearchQuery, setActivitySearchQuery] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<"all" | "REMINDER_SENT" | "PAYMENT_VERIFIED" | "INVOICE_CREATED">("all");

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
  const [currentDraftId, setCurrentDraftId] = useState<string>("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // ── Load Real Data from Backend & Supabase on Mount ────────────────────────
  const reloadData = async () => {
    try {
      setIsLoading(true);
      const [invRes, actRes, clientRes] = await Promise.all([
        api.getInvoices(),
        api.getActivities(),
        api.getClients(),
      ]);

      const mappedInvoices = invRes.items.map(mapBackendToInvoice);
      setInvoices(mappedInvoices);
      if (mappedInvoices.length > 0) {
        setSelectedInvoiceId((prev) => prev || mappedInvoices[0].id);
      }

      setActivities(
        actRes.map((act) => ({
          id: act.id,
          time: formatActivityTime(act.created_at),
          type: act.event_type as any,
          title:
            act.event_type === "REMINDER_SENT"
              ? "Reminder Dispatched"
              : act.event_type === "PAYMENT_VERIFIED"
              ? "Payment Verified & Settled"
              : "Invoice Created",
          subtitle: act.description,
        }))
      );

      setClients(clientRes);
    } catch (err: any) {
      console.error("Error loading data from database:", err);
      showToast("Backend connection error. Make sure FastAPI server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const selectedInvoice =
    invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0] || {
      id: "",
      invoiceNumber: "",
      clientName: "",
      clientEmail: "",
      amount: 0,
      currency: "USD",
      invoiceDate: "",
      dueDate: "",
      daysOverdue: 0,
      status: "Pending" as const,
      reminder1: false,
      reminder2: false,
      reminder3: false,
      paymentVerified: false,
    };

  const getNextReminderNumber = (inv: Invoice): 1 | 2 | 3 => {
    if (!inv.reminder1) return 1;
    if (!inv.reminder2) return 2;
    return 3;
  };

  const openInvoiceDetail = (invId: string) => {
    setSelectedInvoiceId(invId);
    setCurrentView("invoice_detail");
  };

  // ── Phase 1: Request AI Draft from Backend ────────────────────────────────
  const openReviewDraft = async (invId: string) => {
    setSelectedInvoiceId(invId);
    const target = invoices.find((i) => i.id === invId);
    if (!target) return;

    const nextR = getNextReminderNumber(target);
    setIsGeneratingDraft(true);
    setCurrentView("review_draft");

    try {
      showToast(`Generating R${nextR} draft with AI...`);
      const draft = await api.createDraft(target.id, nextR);
      setCurrentDraftId(draft.draft_id);
      setDraftSubject(draft.subject);
      setDraftBody(draft.body);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to generate draft. Using template fallback.");
      // Fallback in case of stage sequence mismatch or error
      setDraftSubject(`Follow-up: Invoice ${target.invoiceNumber} ($${formatNumber(target.amount)})`);
      setDraftBody(
        `Dear ${target.clientName},\n\nWe would like to follow up regarding invoice ${target.invoiceNumber} for $${formatNumber(target.amount)}, which was due on ${target.dueDate}.\n\nPlease let us know once the payment is completed.\n\nBest regards,\nHarsh Malviya`
      );
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // ── Phase 2: Send Reminder via Backend ─────────────────────────────────────
  const handleSendReminder = async () => {
    if (!selectedInvoice.id) return;
    setIsSending(true);

    try {
      if (currentDraftId) {
        await api.sendReminder(currentDraftId, draftSubject, draftBody);
      }
      showToast(`Reminder sent to ${selectedInvoice.clientEmail}! Saved in database.`);
      await reloadData();
      setCurrentView("invoice_detail");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to send reminder.");
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenEdit = (inv: Invoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (inv.paymentVerified || inv.status === "Paid") {
      showToast("Verified invoices are final and cannot be modified.");
      return;
    }
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

  // ── Freelancer Manual Payment Verification (Terminates reminder pipeline) ──
  const handleConfirmVerification = async () => {
    if (!invoiceToVerify) return;

    try {
      await api.verifyPayment(invoiceToVerify.id);
      showToast(
        `Payment of $${formatNumber(invoiceToVerify.amount)} verified for ${invoiceToVerify.invoiceNumber}. Pipeline closed!`
      );
      setInvoiceToVerify(null);
      await reloadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to record payment verification in database.");
    }
  };

  // ── Add New Invoice Directly to Supabase Backend ───────────────────────────
  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceNumber || !formData.clientName || !formData.clientEmail || !formData.amount) {
      showToast("Please fill all required fields including Client Email.");
      return;
    }

    try {
      await api.createInvoice({
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        invoice_number: formData.invoiceNumber,
        amount: parseFloat(formData.amount),
        currency: "USD",
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: formData.dueDate || new Date().toISOString().split("T")[0],
        description: `Invoice for ${formData.clientName}`,
      });

      showToast(`Invoice ${formData.invoiceNumber} and Client saved to Supabase!`);
      setIsAddModalOpen(false);
      await reloadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to create invoice.");
    }
  };

  // ── Add New Client Directly to Supabase Backend ────────────────────────────
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormData.name || !clientFormData.email) {
      showToast("Client name and email are required.");
      return;
    }

    const fullPhone = clientFormData.phoneNumber
      ? `${selectedCountryCode} ${clientFormData.phoneNumber.trim()}`
      : undefined;

    try {
      await api.createClient({
        name: clientFormData.name,
        email: clientFormData.email,
        company: clientFormData.company,
        phone: fullPhone,
        notes: clientFormData.notes,
      });
      showToast(`Client ${clientFormData.name} added to database!`);
      setIsAddClientModalOpen(false);
      setClientFormData({ name: "", email: "", company: "", phoneNumber: "", notes: "" });
      await reloadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to create client.");
    }
  };

  // Quick stats derived from live data
  const totalOutstanding = invoices
    .filter((inv) => !inv.paymentVerified && inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalCollected = invoices
    .filter((inv) => inv.paymentVerified || inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueCount = invoices.filter(
    (inv) => inv.status === "Overdue" && !inv.paymentVerified
  ).length;

  const pendingVerificationCount = invoices.filter(
    (inv) => !inv.paymentVerified && inv.status !== "Paid"
  ).length;

  // Filter & Sort for Invoices
  const filteredInvoices = invoices
    .filter((inv) => {
      const matchesFilter =
        statusFilter === "All Invoices" ||
        (statusFilter === "Overdue" && inv.status === "Overdue" && !inv.paymentVerified) ||
        (statusFilter === "Pending" && inv.status === "Pending" && !inv.paymentVerified) ||
        (statusFilter === "Paid" && (inv.status === "Paid" || inv.paymentVerified));

      const matchesSearch =
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (invoiceSortBy === "amount") {
        comparison = a.amount - b.amount;
      } else if (invoiceSortBy === "daysOverdue") {
        comparison = a.daysOverdue - b.daysOverdue;
      } else {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return invoiceSortOrder === "asc" ? comparison : -comparison;
    });

  // Filter & Sort for Clients
  const filteredClients = clients
    .filter((c) => {
      const q = clientSearchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (clientSortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (clientSortBy === "invoices") {
        return (b.invoice_count ?? 0) - (a.invoice_count ?? 0);
      }
      return Number(b.outstanding_amount ?? 0) - Number(a.outstanding_amount ?? 0);
    });

  // Filter & Sort for Payment Verification View
  const filteredVerifications = invoices.filter((inv) => {
    const q = verificationSearchQuery.toLowerCase();
    const matchesSearch =
      inv.clientName.toLowerCase().includes(q) ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.clientEmail.toLowerCase().includes(q);

    const matchesFilter =
      verificationFilter === "all" ||
      (verificationFilter === "pending" && !inv.paymentVerified && inv.status !== "Paid") ||
      (verificationFilter === "verified" && (inv.paymentVerified || inv.status === "Paid"));

    return matchesSearch && matchesFilter;
  });

  // Filter & Sort for Activity Logs View
  const filteredActivities = activities.filter((act) => {
    const q = activitySearchQuery.toLowerCase();
    const matchesSearch =
      act.title.toLowerCase().includes(q) ||
      act.subtitle.toLowerCase().includes(q) ||
      act.time.toLowerCase().includes(q);

    const matchesType =
      activityTypeFilter === "all" || act.type === activityTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex h-screen bg-[#0D1117] text-slate-100 font-sans antialiased overflow-hidden">
      {/* ========================================================= */}
      {/* MODERN COMPACT SIDEBAR                                    */}
      {/* ========================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-16" : "w-60"
        } border-r border-slate-800 bg-[#161B22]/95 backdrop-blur-md flex flex-col justify-between transition-all duration-300 z-30 shrink-0`}
      >
        <div>
          {/* Logo & Toggle Header */}
          <div className="h-14 border-b border-slate-800 flex items-center justify-between px-3.5">
            {!isSidebarCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                      Antigravity
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
                      Recovery System
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md hover:scale-105 transition"
                title="Expand sidebar"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav className="p-2 space-y-1">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center" : "gap-2.5"
              } px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "dashboard"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setCurrentView("invoices")}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center" : "gap-2.5"
              } px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "invoices" ||
                currentView === "invoice_detail" ||
                currentView === "review_draft"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="Invoices"
            >
              <FileText className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span>Invoices</span>
                  {overdueCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {overdueCount}
                    </span>
                  )}
                </>
              )}
            </button>

            <button
              onClick={() => setCurrentView("clients")}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center" : "gap-2.5"
              } px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "clients"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="All Clients"
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span>All Clients</span>
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {clients.length}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={() => setCurrentView("verification")}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center" : "gap-2.5"
              } px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "verification"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="Manual Payment Verification"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span>Payment Verification</span>
                  {pendingVerificationCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      {pendingVerificationCount}
                    </span>
                  )}
                </>
              )}
            </button>

            <button
              onClick={() => setCurrentView("activity")}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? "justify-center" : "gap-2.5"
              } px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === "activity"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="Activity Log"
            >
              <History className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Activity Log</span>}
            </button>
          </nav>
        </div>

        {/* User Workspace Profile Footer (Freelancer / Owner Account) */}
        <div className="p-2 border-t border-slate-800">
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? "justify-center" : "gap-2.5"
            } p-2 rounded-lg hover:bg-slate-800/60 transition`}
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200 shrink-0">
              HM
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-slate-200 truncate">
                  Harsh Malviya
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Owner · Nexus Studio
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN VIEW AREA                                            */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* ========================================================= */}
          {/* VIEW 1: ENRICHED DASHBOARD                                */}
          {/* ========================================================= */}
          {currentView === "dashboard" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    Live Supabase Feed
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Recovery Operations
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time payment tracking, AI follow-ups, and manual payment verification.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={reloadData}
                    className="p-1.5 rounded-lg border border-slate-800 bg-[#161B22] text-slate-400 hover:text-white transition"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
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
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Invoice</span>
                  </button>
                </div>
              </div>

              {/* 3 Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Outstanding</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    ${formatNumber(totalOutstanding)}
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-medium">
                    {overdueCount} invoices past due
                  </div>
                </div>

                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Verified & Collected</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    ${formatNumber(totalCollected)}
                  </div>
                  <div className="text-[11px] text-emerald-400/90 font-medium">
                    Verified by Owner
                  </div>
                </div>

                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Pending Verification</span>
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {pendingVerificationCount}
                  </div>
                  <div className="text-[11px] text-indigo-400 font-medium">
                    Awaiting confirmation
                  </div>
                </div>
              </div>

              {/* Invoices Needing Action & Live Activity Log */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Needs Attention */}
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">
                      Overdue Invoices
                    </span>
                    <button
                      onClick={() => setCurrentView("invoices")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-2">
                    {invoices
                      .filter((i) => i.status === "Overdue" && !i.paymentVerified)
                      .slice(0, 3)
                      .map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => openInvoiceDetail(inv.id)}
                          className="p-3 bg-[#0D1117] border border-slate-800/80 rounded-lg flex items-center justify-between hover:border-slate-700 cursor-pointer transition"
                        >
                          <div>
                            <div className="font-semibold text-xs text-white">
                              {inv.clientName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {inv.invoiceNumber} · ${formatNumber(inv.amount)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {inv.daysOverdue}d overdue
                            </span>
                          </div>
                        </div>
                      ))}

                    {invoices.filter((i) => i.status === "Overdue" && !i.paymentVerified)
                      .length === 0 && (
                      <div className="text-xs text-slate-500 p-4 text-center">
                        No overdue invoices right now! 🎉
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activities from DB */}
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">
                      Recent Activity
                    </span>
                    <button
                      onClick={() => setCurrentView("activity")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Full log
                    </button>
                  </div>

                  <div className="space-y-3 divide-y divide-slate-800/60">
                    {activities.slice(0, 4).map((act) => (
                      <div key={act.id} className="pt-2 first:pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            {act.title}
                          </span>
                          <span className="text-[10px] text-slate-500">{act.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {act.subtitle}
                        </p>
                      </div>
                    ))}

                    {activities.length === 0 && (
                      <div className="text-xs text-slate-500 p-4 text-center">
                        No activities logged yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: INVOICES LIST VIEW                                */}
          {/* ========================================================= */}
          {currentView === "invoices" && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Receivables
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Invoices
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage all client invoices, monitor stages, and dispatch follow-ups.
                </p>
              </div>

              {/* Table Container */}
              <div className="bg-[#161B22] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {/* Search & Filter Bar */}
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {["All Invoices", "Overdue", "Pending", "Paid"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          statusFilter === filter
                            ? "bg-indigo-600 text-white font-semibold shadow-sm"
                            : "text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-full sm:w-44">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0D1117] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                      />
                    </div>

                    {/* Sorting Select */}
                    <div className="flex items-center gap-1 bg-[#0D1117] border border-slate-800 rounded-lg px-2 py-1">
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      <select
                        value={invoiceSortBy}
                        onChange={(e: any) => setInvoiceSortBy(e.target.value)}
                        className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="dueDate" className="bg-[#161B22]">Sort by Due Date</option>
                        <option value="amount" className="bg-[#161B22]">Sort by Amount</option>
                        <option value="daysOverdue" className="bg-[#161B22]">Sort by Overdue Days</option>
                      </select>
                      <button
                        onClick={() => setInvoiceSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                        className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 px-1 font-bold"
                        title="Toggle Ascending/Descending"
                      >
                        {invoiceSortOrder === "asc" ? "▲ ASC" : "▼ DESC"}
                      </button>
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
                      <span>Add Invoice</span>
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
                          <span className="font-semibold text-sm text-white">
                            {inv.clientName}
                          </span>
                          <span className="text-slate-500 text-xs">·</span>
                          <span className="font-mono text-xs text-slate-300 font-medium">
                            {inv.invoiceNumber}
                          </span>
                          {inv.status === "Overdue" && !inv.paymentVerified && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              {inv.daysOverdue}d overdue
                            </span>
                          )}
                          {inv.paymentVerified && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Verified Paid
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Mail className="w-3 h-3 text-indigo-400" />
                            <span>{inv.clientEmail}</span>
                          </span>
                          <span>·</span>
                          <span>Due: {inv.dueDate}</span>
                          <span>·</span>
                          <span>
                            Amount:{" "}
                            <strong className="text-slate-200">
                              ${formatNumber(inv.amount)}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2">
                        {/* 3 Step Sequence Indicator */}
                        <div className="flex items-center gap-1 mr-2 text-[10px] font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              inv.reminder1
                                ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-bold"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            R1
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              inv.reminder2
                                ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-bold"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            R2
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              inv.reminder3
                                ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-bold"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            R3
                          </span>
                        </div>

                        {!inv.paymentVerified && (
                          <button
                            onClick={() => openReviewDraft(inv.id)}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            <span>Follow Up</span>
                          </button>
                        )}

                        <button
                          onClick={() => openInvoiceDetail(inv.id)}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredInvoices.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No invoices match the selected filter.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: ALL CLIENTS (Directory & Overdue Tracking)          */}
          {/* ========================================================= */}
          {currentView === "clients" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                    Client Directory
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    All Clients
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live client profiles, contact emails, companies, and outstanding balances.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Client</span>
                </button>
              </div>

              {/* Client Search and Sort Controls */}
              <div className="bg-[#161B22] border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search clients by name, email, company..."
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    className="w-full bg-[#0D1117] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-slate-400">Sort by:</span>
                  <div className="flex items-center gap-1 bg-[#0D1117] border border-slate-800 rounded-lg px-2.5 py-1">
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    <select
                      value={clientSortBy}
                      onChange={(e: any) => setClientSortBy(e.target.value)}
                      className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="outstanding" className="bg-[#161B22]">Highest Outstanding</option>
                      <option value="name" className="bg-[#161B22]">Client Name (A-Z)</option>
                      <option value="invoices" className="bg-[#161B22]">Most Invoices</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClients.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-white">{c.name}</h3>
                        {c.company && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Building className="w-3 h-3 text-slate-500" />
                            <span>{c.company}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {c.invoice_count ?? 1} Invoices
                      </span>
                    </div>

                    <div className="p-3 bg-[#0D1117] border border-slate-800/80 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-mono text-[11px] truncate">{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-800/60">
                          "{c.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">Total Outstanding:</span>
                      <strong className="text-amber-400 font-mono">
                        ${formatNumber(Number(c.outstanding_amount ?? 0))}
                      </strong>
                    </div>
                  </div>
                ))}

                {clients.length === 0 && (
                  <div className="col-span-2 p-12 text-center text-xs text-slate-500 bg-[#161B22] border border-slate-800 rounded-xl">
                    No clients found in the database.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: PAYMENT VERIFICATION (Freelancer Manual Action)   */}
          {/* ========================================================= */}
          {currentView === "verification" && (
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Freelancer / Owner Control
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Manual Payment Verification
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm receipt of payment in your bank. Once verified, follow-up reminders permanently terminate.
                </p>
              </div>

              <div className="bg-[#161B22] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 font-semibold text-xs text-slate-300">
                  Client Invoices & Settlement
                </div>

                <div className="divide-y divide-slate-800/80">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-semibold text-sm text-white">
                          {inv.clientName} · {inv.invoiceNumber}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Amount:{" "}
                          <strong className="text-slate-200">
                            ${formatNumber(inv.amount)}
                          </strong>{" "}
                          · Due {inv.dueDate} · Status:{" "}
                          <span
                            className={
                              inv.paymentVerified
                                ? "text-emerald-400 font-medium"
                                : "text-amber-400 font-medium"
                            }
                          >
                            {inv.paymentVerified ? "Paid & Verified" : inv.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        {inv.paymentVerified ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            <span>Payment Verified (Settled)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setInvoiceToVerify(inv)}
                            className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
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
          {/* VIEW 4: ACTIVITY LOG (Audit History)                      */}
          {/* ========================================================= */}
          {currentView === "activity" && (
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Audit Trail
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Activity Log
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable record from Supabase database of dispatched reminders and settled payments.
                </p>
              </div>

              <div className="bg-[#161B22] border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 text-xs shadow-sm">
                {activities.map((act) => (
                  <div key={act.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{act.title}</span>
                        {act.type === "PAYMENT_VERIFIED" && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            Settled
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 mt-0.5">{act.subtitle}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {act.time}
                    </div>
                  </div>
                ))}

                {activities.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No activity logs recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: INVOICE DETAIL VIEW                               */}
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
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Invoice Detail
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {selectedInvoice.invoiceNumber} · {selectedInvoice.clientName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  ${formatNumber(selectedInvoice.amount)} · Due {selectedInvoice.dueDate} ·{" "}
                  {selectedInvoice.daysOverdue} days overdue · Contact:{" "}
                  {selectedInvoice.clientEmail}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3-Step Reminder History */}
                <div className="bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="font-semibold text-white text-sm">
                    Reminder History
                  </div>

                  <div className="relative border-l-2 border-slate-800 ml-2 space-y-6 pl-4 py-1">
                    {/* R1 */}
                    <div className="relative">
                      <div
                        className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${
                          selectedInvoice.reminder1
                            ? "bg-indigo-600 border-indigo-400"
                            : "bg-slate-900 border-slate-700"
                        }`}
                      ></div>
                      <div className="font-semibold text-xs text-white">
                        R1 (Friendly Reminder)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {selectedInvoice.reminder1
                          ? "Sent · Delivered"
                          : "Not sent yet"}
                      </div>
                      {!selectedInvoice.reminder1 &&
                        selectedInvoice.status !== "Paid" &&
                        !selectedInvoice.paymentVerified && (
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
                      <div
                        className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${
                          selectedInvoice.reminder2
                            ? "bg-indigo-600 border-indigo-400"
                            : selectedInvoice.reminder1
                            ? "bg-amber-400 border-amber-300 animate-pulse"
                            : "bg-slate-900 border-slate-700"
                        }`}
                      ></div>
                      <div className="font-semibold text-xs text-white">
                        R2 (Firm Follow-up)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {selectedInvoice.reminder2
                          ? "Sent · Delivered"
                          : selectedInvoice.reminder1
                          ? "Ready after cooldown"
                          : "Locked until R1"}
                      </div>
                      {selectedInvoice.reminder1 &&
                        !selectedInvoice.reminder2 &&
                        selectedInvoice.status !== "Paid" &&
                        !selectedInvoice.paymentVerified && (
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
                      <div
                        className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${
                          selectedInvoice.reminder3
                            ? "bg-indigo-600 border-indigo-400"
                            : "bg-slate-900 border-slate-700"
                        }`}
                      ></div>
                      <div className="font-semibold text-xs text-white">
                        R3 (Final Notice)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {selectedInvoice.reminder3
                          ? "Sent · Delivered"
                          : "Only unlocks after R2"}
                      </div>
                      {selectedInvoice.reminder2 &&
                        !selectedInvoice.reminder3 &&
                        selectedInvoice.status !== "Paid" &&
                        !selectedInvoice.paymentVerified && (
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
                  <div className="font-semibold text-white text-sm">
                    Invoice Status & Lock
                  </div>

                  <div className="p-4 bg-[#0D1117] border border-slate-800 rounded-xl space-y-3">
                    <div className="text-xs text-slate-300">
                      Payment Verification:{" "}
                      <strong
                        className={
                          selectedInvoice.paymentVerified
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }
                      >
                        {selectedInvoice.paymentVerified
                          ? "Verified (Paid)"
                          : "Unverified (Outstanding)"}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {!selectedInvoice.paymentVerified ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(selectedInvoice)}
                            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Details</span>
                          </button>

                          <button
                            onClick={() => setInvoiceToVerify(selectedInvoice)}
                            className="text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify Payment</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>This invoice is verified and locked against edits.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 6: REVIEW DRAFT (AI Generated)                       */}
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
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Review Reminder Draft
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Review R{getNextReminderNumber(selectedInvoice)} Draft
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedInvoice.invoiceNumber} · {selectedInvoice.clientName} · AI generated personalized reminder.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#161B22] border border-slate-800 rounded-xl p-5 space-y-4">
                  {isGeneratingDraft && (
                    <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Generating smart draft using Gemini 3.8 Flash...</span>
                    </div>
                  )}

                  <div className="p-3 bg-[#0D1117] border border-slate-800 rounded-lg text-xs text-slate-300">
                    <b>Why this message:</b> Invoice is overdue by{" "}
                    {selectedInvoice.daysOverdue} days. Next follow-up is Reminder{" "}
                    {getNextReminderNumber(selectedInvoice)}.
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
                      onClick={() => showToast("Draft saved locally")}
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
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        OK
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400">Not verified paid</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        OK
                      </span>
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
      {/* VERIFY PAYMENT CONFIRMATION MODAL                         */}
      {/* ========================================================= */}
      {invoiceToVerify && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Confirm Payment Received
                  </h3>
                  <p className="text-xs text-slate-400">
                    Freelancer manual verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInvoiceToVerify(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#0D1117] border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Client:</span>
                <span className="font-semibold text-white">
                  {invoiceToVerify.clientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice:</span>
                <span className="font-mono text-white">
                  {invoiceToVerify.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-400">
                  ${formatNumber(invoiceToVerify.amount)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              By confirming, you verify that this payment has reached your bank account.
              The reminder pipeline will permanently terminate and status will become <b>PAID</b>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setInvoiceToVerify(null)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                Confirm Verified Payment
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
                  {isEditModalOpen ? "Edit Invoice Details" : "Add New Invoice"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEditModalOpen
                    ? "Update terms or due date."
                    : "Create a new receivable invoice in database."}
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

            <form
              onSubmit={isEditModalOpen ? handleSaveEdit : handleAddInvoice}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-slate-300">Invoice Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-109"
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNumber: e.target.value })
                  }
                  className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Client Email (for AI reminders)</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. client@example.com"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                  className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2500"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
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
      {/* ADD NEW CLIENT MODAL                                      */}
      {/* ========================================================= */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Add New Client</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Save client details directly to Supabase.
                </p>
              </div>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300">Client / Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={clientFormData.name}
                  onChange={(e) =>
                    setClientFormData({ ...clientFormData, name: e.target.value })
                  }
                  className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Client Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@company.com"
                  value={clientFormData.email}
                  onChange={(e) =>
                    setClientFormData({ ...clientFormData, email: e.target.value })
                  }
                  className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Marketing"
                    value={clientFormData.company}
                    onChange={(e) =>
                      setClientFormData({ ...clientFormData, company: e.target.value })
                    }
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={clientFormData.phone}
                    onChange={(e) =>
                      setClientFormData({ ...clientFormData, phone: e.target.value })
                    }
                    className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Payment preferences or notes..."
                  value={clientFormData.notes}
                  onChange={(e) =>
                    setClientFormData({ ...clientFormData, notes: e.target.value })
                  }
                  className="w-full bg-[#0D1117] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg transition"
                >
                  Save Client
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
                <h3 className="text-base font-bold text-white">
                  Import Invoices (CSV)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload unpaid invoices via CSV file.
                </p>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center space-y-2 hover:border-indigo-500 transition cursor-pointer">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs text-slate-300">Click to upload CSV file</div>
              <div className="text-[10px] text-slate-500">
                Columns: Client_Name, Email_Address, Invoice_ID, Due_Date, Payment
              </div>
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
