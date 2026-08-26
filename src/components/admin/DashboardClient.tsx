"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  MessageSquare,
  Inbox,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  Camera,
  Loader2,
  Send,
  CheckCircle2,
} from "lucide-react";
import type { SubmissionStatus, CourseBooking, ContactInquiry, DashboardCounts } from "@/lib/db-schema";

// ============================================
// Types
// ============================================

type TabType = "course" | "contact";
type AnySubmission = CourseBooking | ContactInquiry;

interface ApiResponse {
  success: boolean;
  submissions: AnySubmission[];
  total: number;
  page: number;
  totalPages: number;
  counts: DashboardCounts;
}

// ============================================
// Status Badge
// ============================================

const STATUS_COLORS: Record<SubmissionStatus, { bg: string; text: string; dot: string }> = {
  New: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  Read: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  Contacted: { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400" },
  Archived: { bg: "bg-white/[0.06]", text: "text-charcoal", dot: "bg-charcoal" },
};

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
}

// ============================================
// Summary Card
// ============================================

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex items-start gap-4">
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-warm-white">{value}</p>
        <p className="text-xs text-charcoal uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ============================================
// Dashboard Client
// ============================================

export function DashboardClient({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("course");
  const [submissions, setSubmissions] = useState<AnySubmission[]>([]);
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "">("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<AnySubmission | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyRequestId, setReplyRequestId] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSubmissions() {
      try {
        const params = new URLSearchParams({ type: tab, page: String(page) });
        if (statusFilter) params.set("status", statusFilter);
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/submissions?${params}`, {
          signal: controller.signal,
        });
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }

        const data = (await res.json()) as Partial<ApiResponse> & {
          message?: string;
        };
        if (
          !res.ok ||
          data.success !== true ||
          !Array.isArray(data.submissions) ||
          !data.counts ||
          typeof data.totalPages !== "number" ||
          typeof data.total !== "number"
        ) {
          throw new Error(data.message || "Unable to load submissions.");
        }

        setSubmissions(data.submissions);
        setCounts(data.counts);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setLoadError("");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Failed to fetch submissions:", error);
        setLoadError(
          error instanceof Error ? error.message : "Unable to load submissions."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadSubmissions();
    return () => controller.abort();
  }, [tab, page, statusFilter, search, refreshKey, router]);

  // Search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput === search) return;
      setLoading(true);
      setPage(1);
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, searchInput]);

  useEffect(() => {
    if (!selectedSubmission) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSubmission(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedSubmission]);

  function changeTab(nextTab: TabType) {
    if (nextTab === tab) return;
    setLoading(true);
    setPage(1);
    setTab(nextTab);
    setSelectedSubmission(null);
  }

  function changeStatusFilter(value: SubmissionStatus | "") {
    setLoading(true);
    setPage(1);
    setStatusFilter(value);
  }

  // Logout
  async function handleLogout() {
    setLoggingOut(true);
    setActionError("");
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error("Unable to sign out. Please try again.");
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to sign out."
      );
      setLoggingOut(false);
    }
  }

  // Open detail
  async function openDetail(submission: AnySubmission) {
    setSelectedSubmission(submission);
    setReplySubject(getDefaultReplySubject(submission, tab));
    setReplyMessage("");
    setReplyRequestId(crypto.randomUUID());
    setReplySuccess("");
    setDetailLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}?type=${tab}`);
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = (await res.json()) as {
        success?: boolean;
        submission?: AnySubmission;
        message?: string;
      };
      if (!res.ok || !data.success || !data.submission) {
        throw new Error(data.message || "Unable to load submission details.");
      }
      setSelectedSubmission(data.submission);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to load submission details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSubmission || replySending) return;

    const subject = replySubject.trim();
    const message = replyMessage.trim();
    if (!subject || !message) {
      setActionError("Enter both a subject and a message before sending.");
      return;
    }

    setReplySending(true);
    setActionError("");
    setReplySuccess("");
    const requestId = replyRequestId || crypto.randomUUID();
    if (!replyRequestId) setReplyRequestId(requestId);

    try {
      const response = await fetch(
        `/api/admin/submissions/${selectedSubmission.id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: tab,
            subject,
            message,
            requestId,
          }),
        }
      );
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = (await response.json()) as {
        success?: boolean;
        submission?: AnySubmission;
        message?: string;
      };
      if (!response.ok || !data.success || !data.submission) {
        throw new Error(data.message || "Unable to send the reply.");
      }

      setSelectedSubmission(data.submission);
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === data.submission?.id && data.submission
            ? data.submission
            : submission
        )
      );
      setReplyMessage("");
      setReplyRequestId(crypto.randomUUID());
      setReplySuccess(`Reply sent to ${data.submission.email}.`);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      console.error("Failed to send reply:", error);
      setActionError(
        error instanceof Error ? error.message : "Unable to send the reply."
      );
    } finally {
      setReplySending(false);
    }
  }

  // Update status
  async function updateStatus(id: number, newStatus: SubmissionStatus) {
    setStatusUpdating(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab, status: newStatus }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to update the status.");
      }

      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
      setRefreshKey((key) => key + 1);
    } catch (error) {
      console.error("Failed to update status:", error);
      setActionError(
        error instanceof Error ? error.message : "Unable to update the status."
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  // Computed values
  const totalAll = counts
    ? counts.totalCourseBookings + counts.totalContactInquiries
    : 0;
  const totalNew = counts
    ? counts.newCourseBookings + counts.newContactInquiries
    : 0;
  const totalContacted = counts
    ? counts.contactedCourseBookings + counts.contactedContactInquiries
    : 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-warm-white tracking-tight">
              Dashboard
            </h1>
            <span className="hidden sm:inline-block text-xs text-charcoal">
              {adminEmail}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/work")}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warm-white-muted hover:text-warm-white transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Work</span>
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warm-white-muted hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard label="Total Submissions" value={totalAll} icon={Inbox} accent="bg-white/[0.06] text-warm-white" />
          <SummaryCard label="New / Unread" value={totalNew} icon={Sparkles} accent="bg-red-500/10 text-red-400" />
          <SummaryCard label="Contacted" value={totalContacted} icon={Phone} accent="bg-green-500/10 text-green-400" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/[0.04]">
          <button
            onClick={() => changeTab("course")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors ${
              tab === "course"
                ? "border-crimson text-warm-white"
                : "border-transparent text-charcoal hover:text-warm-white-muted"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Course Bookings
            {counts && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                tab === "course" ? "bg-crimson/20 text-crimson" : "bg-white/[0.06] text-charcoal"
              }`}>
                {counts.totalCourseBookings}
              </span>
            )}
          </button>
          <button
            onClick={() => changeTab("contact")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors ${
              tab === "contact"
                ? "border-crimson text-warm-white"
                : "border-transparent text-charcoal hover:text-warm-white-muted"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Contact Messages
            {counts && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                tab === "contact" ? "bg-crimson/20 text-crimson" : "bg-white/[0.06] text-charcoal"
              }`}>
                {counts.totalContactInquiries}
              </span>
            )}
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-warm-white placeholder:text-charcoal focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal hover:text-warm-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              changeStatusFilter(e.target.value as SubmissionStatus | "")
            }
            aria-label="Filter submissions by status"
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-warm-white focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Read">Read</option>
            <option value="Contacted">Contacted</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {(loadError || actionError) && (
          <div
            className="mb-6 rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400"
            role="alert"
          >
            {loadError || actionError}
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-crimson" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-charcoal">
              <Inbox className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">No submissions found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.04]">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                        {tab === "course" ? "Name" : "Name"}
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">Email</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                        {tab === "course" ? "Course" : "Shoot Type"}
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">Date</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => {
                      const isNew = s.status === "New";
                      const name = tab === "course" ? (s as CourseBooking).fullName : (s as ContactInquiry).name;
                      const detail = tab === "course" ? (s as CourseBooking).course : (s as ContactInquiry).shootType;

                      return (
                        <tr
                          key={s.id}
                          onClick={() => openDetail(s)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              void openDetail(s);
                            }
                          }}
                          tabIndex={0}
                          aria-label={`Open submission from ${name}`}
                          className={`border-b border-white/[0.03] cursor-pointer transition-colors hover:bg-white/[0.04] ${
                            isNew ? "bg-crimson/[0.03]" : ""
                          }`}
                        >
                          <td className={`px-5 py-4 ${isNew ? "font-semibold text-warm-white" : "text-warm-white-muted"}`}>
                            {name}
                          </td>
                          <td className="px-5 py-4 text-warm-white-muted">{s.email}</td>
                          <td className="px-5 py-4 text-warm-white-muted">{detail || "—"}</td>
                          <td className="px-5 py-4 text-warm-white-muted whitespace-nowrap">
                            {formatDate(s.createdAt)}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={s.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-white/[0.04]">
                {submissions.map((s) => {
                  const isNew = s.status === "New";
                  const name = tab === "course" ? (s as CourseBooking).fullName : (s as ContactInquiry).name;
                  const detail = tab === "course" ? (s as CourseBooking).course : (s as ContactInquiry).shootType;

                  return (
                    <div
                      key={s.id}
                      onClick={() => openDetail(s)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void openDetail(s);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open submission from ${name}`}
                      className={`p-4 cursor-pointer transition-colors hover:bg-white/[0.04] ${
                        isNew ? "bg-crimson/[0.03]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className={`text-sm ${isNew ? "font-semibold text-warm-white" : "text-warm-white-muted"}`}>
                          {name}
                        </p>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="text-xs text-charcoal">{s.email}</p>
                      {detail && <p className="text-xs text-charcoal mt-1">{detail}</p>}
                      <p className="text-xs text-charcoal mt-1">{formatDate(s.createdAt)}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-charcoal">
              Showing page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLoading(true);
                  setPage((p) => Math.max(1, p - 1));
                }}
                disabled={page <= 1}
                aria-label="Previous page"
                className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-warm-white-muted hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setLoading(true);
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                disabled={page >= totalPages}
                aria-label="Next page"
                className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-warm-white-muted hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSubmission(null);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container border border-white/[0.06] p-6 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-dialog-title"
          >
            {/* Close */}
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 right-4 text-charcoal hover:text-warm-white transition-colors"
              aria-label="Close submission details"
              autoFocus
            >
              <X className="w-5 h-5" />
            </button>

            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-crimson" />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h2
                    id="submission-dialog-title"
                    className="text-lg font-bold text-warm-white mb-2"
                  >
                    {tab === "course" ? "Course Booking" : "Contact Inquiry"}
                  </h2>
                  <StatusBadge status={selectedSubmission.status} />
                </div>

                {/* Fields */}
                <div className="space-y-4 mb-8">
                  {tab === "course" ? (
                    <>
                      <DetailField icon={User} label="Full Name" value={(selectedSubmission as CourseBooking).fullName} />
                      <DetailField icon={Mail} label="Email" value={selectedSubmission.email} />
                      <DetailField icon={Phone} label="Phone" value={(selectedSubmission as CourseBooking).phone} />
                      <DetailField icon={BookOpen} label="Course" value={(selectedSubmission as CourseBooking).course} />
                      <DetailField icon={MessageSquare} label="Message" value={(selectedSubmission as CourseBooking).message} multiline />
                    </>
                  ) : (
                    <>
                      <DetailField icon={User} label="Name" value={(selectedSubmission as ContactInquiry).name} />
                      <DetailField icon={Mail} label="Email" value={selectedSubmission.email} />
                      <DetailField icon={Phone} label="Phone" value={(selectedSubmission as ContactInquiry).phone} />
                      <DetailField icon={Camera} label="Shoot Type" value={(selectedSubmission as ContactInquiry).shootType} />
                      <DetailField icon={Calendar} label="Preferred Date" value={(selectedSubmission as ContactInquiry).preferredDate} />
                      <DetailField icon={DollarSign} label="Budget Range" value={(selectedSubmission as ContactInquiry).budgetRange} />
                      <DetailField icon={MessageSquare} label="Message" value={(selectedSubmission as ContactInquiry).message} multiline />
                    </>
                  )}
                  <DetailField icon={Calendar} label="Submitted" value={formatDate(selectedSubmission.createdAt)} />
                </div>

                {/* Email reply */}
                <form
                  onSubmit={sendReply}
                  className="mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5"
                >
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                      Reply by Email
                    </p>
                    <p className="mt-1 text-xs text-warm-white-muted break-all">
                      To: {selectedSubmission.email}
                    </p>
                  </div>

                  <label
                    htmlFor="reply-subject"
                    className="block text-xs font-medium text-warm-white-muted mb-1.5"
                  >
                    Subject
                  </label>
                  <input
                    id="reply-subject"
                    value={replySubject}
                    onChange={(event) => setReplySubject(event.target.value)}
                    maxLength={200}
                    required
                    className="mb-4 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-warm-white focus:border-crimson/40 focus:outline-none focus:ring-1 focus:ring-crimson/20"
                  />

                  <label
                    htmlFor="reply-message"
                    className="block text-xs font-medium text-warm-white-muted mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="reply-message"
                    value={replyMessage}
                    onChange={(event) => setReplyMessage(event.target.value)}
                    rows={6}
                    maxLength={5000}
                    required
                    placeholder="Write your reply..."
                    className="w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-warm-white placeholder:text-charcoal focus:border-crimson/40 focus:outline-none focus:ring-1 focus:ring-crimson/20"
                  />

                  <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div aria-live="polite">
                      {replySuccess && (
                        <p className="flex items-center gap-2 text-xs text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          {replySuccess}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={replySending}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-warm-white transition-colors hover:bg-crimson/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {replySending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {replySending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </form>

                {selectedSubmission.replies.length > 0 && (
                  <div className="mb-8">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                      Reply History
                    </p>
                    <div className="space-y-3">
                      {[...selectedSubmission.replies]
                        .reverse()
                        .map((reply) => (
                          <div
                            key={reply.id}
                            className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <p className="text-sm font-medium text-warm-white">
                                {reply.subject}
                              </p>
                              <p className="text-[11px] text-charcoal whitespace-nowrap">
                                {formatDate(reply.sentAt)}
                              </p>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-warm-white-muted">
                              {reply.message}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Status Changer */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal mb-3">
                    Change Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(["New", "Read", "Contacted", "Archived"] as SubmissionStatus[]).map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedSubmission.id, s)}
                          disabled={statusUpdating || selectedSubmission.status === s}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
                            selectedSubmission.status === s
                              ? `${STATUS_COLORS[s].bg} ${STATUS_COLORS[s].text} border-current`
                              : "bg-white/[0.03] border-white/[0.06] text-warm-white-muted hover:bg-white/[0.06] hover:text-warm-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {statusUpdating ? "..." : s}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function DetailField({
  icon: Icon,
  label,
  value,
  multiline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <Icon className="w-4 h-4 text-charcoal flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal">
          {label}
        </p>
        <p className={`text-sm text-warm-white mt-0.5 ${multiline ? "whitespace-pre-wrap" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getDefaultReplySubject(
  submission: AnySubmission,
  type: TabType
): string {
  if (type === "course") {
    return `Re: ${(submission as CourseBooking).course}`;
  }
  return "Re: Your photography inquiry";
}
