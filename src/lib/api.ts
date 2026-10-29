// Frontend API Client to communicate with FastAPI Backend (which syncs directly with Supabase)

function getApiBase(): string {
  // Always use the production Render backend in production or when accessed via Vercel
  if (typeof window !== "undefined") {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return "https://hackathon-2-harsh-malviya-backend.onrender.com";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
}

const API_BASE = getApiBase();

export interface BackendInvoice {
  id: string;
  client_id: string;
  invoice_number: string;
  amount: string | number;
  currency: string;
  invoice_date: string;
  due_date: string;
  description?: string | null;
  status: string;
  reminder_count: number;
  last_reminder_at?: string | null;
  overdue_days: number;
  client?: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
    phone?: string | null;
  } | null;
}

export interface BackendActivity {
  id: string;
  event_type: string;
  description: string;
  invoice_id?: string | null;
  client_id?: string | null;
  created_at: string;
  event_metadata?: Record<string, any> | null;
}

export const api = {
  // Invoices
  getInvoices: async (): Promise<{ items: BackendInvoice[]; total: number }> => {
    const res = await fetch(`${API_BASE}/api/v1/invoices`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load invoices from database.");
    return res.json();
  },

  // Manual Payment Verification by Freelancer/Owner (Ends reminder pipeline & marks PAID)
  verifyPayment: async (invoiceId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/invoices/${invoiceId}/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Payment verification failed.");
    }
    return res.json();
  },

  // Reminders - Phase 1: AI Generated Draft
  createDraft: async (invoiceId: string, stage: number): Promise<{
    draft_id: string;
    stage: number;
    subject: string;
    body: string;
    invoice_id: string;
    client_name: string;
    client_email: string;
  }> => {
    const res = await fetch(`${API_BASE}/api/v1/invoices/${invoiceId}/reminders/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Could not generate reminder draft.");
    }
    return res.json();
  },

  // Reminders - Phase 2: Dispatch Reminder Email
  sendReminder: async (draftId: string, subject: string, body: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/invoices/reminders/${draftId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to send reminder.");
    }
    return res.json();
  },

  // Activities & Audit History
  getActivities: async (): Promise<BackendActivity[]> => {
    const res = await fetch(`${API_BASE}/api/v1/activities`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load activities.");
    return res.json();
  },

  // Clients
  getClients: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/api/v1/clients`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load clients.");
    return res.json();
  },

  // Create new invoice with Client Email and Name
  createInvoice: async (data: {
    client_id?: string;
    client_name?: string;
    client_email?: string;
    invoice_number: string;
    amount: number;
    currency: string;
    invoice_date: string;
    due_date: string;
    description?: string;
  }): Promise<BackendInvoice> => {
    const res = await fetch(`${API_BASE}/api/v1/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to create invoice.");
    }
    return res.json();
  },

  // Create new client directly
  createClient: async (data: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    notes?: string;
  }): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to create client.");
    }
    return res.json();
  },
};

