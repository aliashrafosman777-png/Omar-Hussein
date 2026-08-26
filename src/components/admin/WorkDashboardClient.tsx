"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  ImageIcon,
  LayoutDashboard,
  Eye,
  EyeOff,
} from "lucide-react";
import type { WorkItem, WorkCategory } from "@/lib/db-schema";

// ============================================
// Types
// ============================================

type CategoryFilter = WorkCategory | "";

interface WorkCounts {
  total: number;
  published: number;
  draft: number;
}

interface WorkApiResponse {
  success: boolean;
  items: WorkItem[];
  total: number;
  page: number;
  totalPages: number;
  counts: WorkCounts;
}

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "ARTISTIC", label: "Artistic" },
  { value: "BRIDAL", label: "Bridal" },
  { value: "FASHION", label: "Fashion" },
  { value: "PRODUCTS", label: "Products" },
];

const CATEGORY_LABELS: Record<WorkCategory, string> = {
  ARTISTIC: "Artistic",
  BRIDAL: "Bridal",
  FASHION: "Fashion",
  PRODUCTS: "Products",
};

const CATEGORY_COLORS: Record<WorkCategory, { bg: string; text: string }> = {
  ARTISTIC: { bg: "bg-purple-500/10", text: "text-purple-400" },
  BRIDAL: { bg: "bg-pink-500/10", text: "text-pink-400" },
  FASHION: { bg: "bg-blue-500/10", text: "text-blue-400" },
  PRODUCTS: { bg: "bg-amber-500/10", text: "text-amber-400" },
};

// ============================================
// Category Badge
// ============================================

function CategoryBadge({ category }: { category: WorkCategory }) {
  const colors = CATEGORY_COLORS[category];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}
    >
      {CATEGORY_LABELS[category]}
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
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-xl ${accent}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-warm-white">{value}</p>
        <p className="text-xs text-charcoal uppercase tracking-wider mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Work Form Modal
// ============================================

interface WorkFormModalProps {
  mode: "create" | "edit";
  item?: WorkItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function WorkFormModal({ mode, item, onClose, onSaved }: WorkFormModalProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [category, setCategory] = useState<WorkCategory | "">(
    item?.category || ""
  );
  const [altText, setAltText] = useState(item?.altText || "");
  const [displayOrder, setDisplayOrder] = useState(
    String(item?.displayOrder || "")
  );
  const [isPublished, setIsPublished] = useState(item?.isPublished ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.imageUrl || null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreview(url);
      }
    },
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (mode === "create" && !imageFile) {
      setError("Please select an image.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      if (imageFile) formData.append("image", imageFile);
      formData.append("title", title.trim() || "Untitled");
      formData.append("category", category);
      formData.append("altText", altText.trim());
      formData.append("displayOrder", displayOrder || "0");
      formData.append("isPublished", String(isPublished));

      const url =
        mode === "create"
          ? "/api/admin/work"
          : `/api/admin/work/${item?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to save.");
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container border border-white/[0.06] p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal hover:text-warm-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-warm-white mb-6">
          {mode === "create" ? "Add Work" : "Edit Work"}
        </h2>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-white-muted mb-2">
              Image *
            </label>
            <div
              className="relative rounded-xl border-2 border-dashed border-white/[0.1] hover:border-crimson/30 transition-colors cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative aspect-[3/4] max-h-[300px] w-full">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={imagePreview.startsWith("blob:")}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="w-8 h-8 text-warm-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-charcoal">
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-sm">Click to upload image</p>
                  <p className="text-xs mt-1">JPEG, PNG, or WebP • Max 30MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="work-title"
              className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-white-muted mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="work-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-warm-white placeholder:text-charcoal focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors"
              placeholder="e.g., Bridal Portrait"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="work-category"
              className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-white-muted mb-2"
            >
              Category *
            </label>
            <select
              id="work-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as WorkCategory | "")}
              required
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select Category</option>
              <option value="ARTISTIC">Artistic</option>
              <option value="BRIDAL">Bridal</option>
              <option value="FASHION">Fashion</option>
              <option value="PRODUCTS">Products</option>
            </select>
          </div>

          {/* Alt Text */}
          <div>
            <label
              htmlFor="work-alt"
              className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-white-muted mb-2"
            >
              Alt Text
            </label>
            <input
              type="text"
              id="work-alt"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-warm-white placeholder:text-charcoal focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors"
              placeholder="Descriptive text for accessibility"
            />
          </div>

          {/* Display Order */}
          <div>
            <label
              htmlFor="work-order"
              className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-white-muted mb-2"
            >
              Display Order
            </label>
            <input
              type="number"
              id="work-order"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-warm-white placeholder:text-charcoal focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors"
              placeholder="1"
              min="0"
            />
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-white-muted">
              Status
            </label>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                isPublished
                  ? "bg-green-500/10 text-green-400 border border-green-400/20"
                  : "bg-white/[0.06] text-charcoal border border-white/[0.06]"
              }`}
            >
              {isPublished ? (
                <>
                  <Eye className="w-3.5 h-3.5" /> Published
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Draft
                </>
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-semibold text-warm-white-muted hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-crimson hover:bg-crimson/90 disabled:bg-crimson/50 text-warm-white text-sm font-semibold uppercase tracking-wider transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : mode === "create" ? (
                "Add Work"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Delete Confirmation Modal
// ============================================

function DeleteModal({
  item,
  onClose,
  onDeleted,
}: {
  item: WorkItem;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/work/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to delete.");
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete.");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-surface-container border border-white/[0.06] p-6 sm:p-8">
        <h2 className="text-lg font-bold text-warm-white mb-2">
          Delete Work Item
        </h2>
        <p className="text-sm text-warm-white-muted mb-6">
          Are you sure you want to delete{" "}
          <span className="text-warm-white font-semibold">
            &ldquo;{item.title}&rdquo;
          </span>
          ? This action cannot be undone.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-semibold text-warm-white-muted hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-warm-white text-sm font-semibold uppercase tracking-wider transition-all"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Work Dashboard Client
// ============================================

export function WorkDashboardClient({
  adminEmail,
}: {
  adminEmail: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [counts, setCounts] = useState<WorkCounts | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editItem, setEditItem] = useState<WorkItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<WorkItem | null>(null);

  // Fetch work items
  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (categoryFilter) params.set("category", categoryFilter);
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/work?${params}`, {
          signal: controller.signal,
        });
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }

        const data = (await res.json()) as Partial<WorkApiResponse> & {
          message?: string;
        };
        if (
          !res.ok ||
          data.success !== true ||
          !Array.isArray(data.items) ||
          !data.counts
        ) {
          throw new Error(data.message || "Unable to load work items.");
        }

        setItems(data.items);
        setCounts(data.counts);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? 0);
        setLoadError("");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        console.error("Failed to fetch work items:", error);
        setLoadError(
          error instanceof Error ? error.message : "Unable to load work items."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadItems();
    return () => controller.abort();
  }, [page, categoryFilter, search, refreshKey, router]);

  // Search debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput === search) return;
      setLoading(true);
      setPage(1);
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, searchInput]);

  function changeCategoryFilter(value: CategoryFilter) {
    setLoading(true);
    setPage(1);
    setCategoryFilter(value);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error("Unable to sign out.");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  function handleSaved() {
    setShowCreateModal(false);
    setEditItem(null);
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }

  function handleDeleted() {
    setDeleteItem(null);
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-warm-white tracking-tight">
              Work Portfolio
            </h1>
            <span className="hidden sm:inline-block text-xs text-charcoal">
              {adminEmail}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warm-white-muted hover:text-warm-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
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
          <SummaryCard
            label="Total Images"
            value={counts?.total ?? 0}
            icon={ImageIcon}
            accent="bg-white/[0.06] text-warm-white"
          />
          <SummaryCard
            label="Published"
            value={counts?.published ?? 0}
            icon={Eye}
            accent="bg-green-500/10 text-green-400"
          />
          <SummaryCard
            label="Draft"
            value={counts?.draft ?? 0}
            icon={EyeOff}
            accent="bg-white/[0.06] text-charcoal"
          />
        </div>

        {/* Category filter tabs + Add button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => changeCategoryFilter(cat.value)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border transition-all whitespace-nowrap ${
                  categoryFilter === cat.value
                    ? "border-crimson/30 bg-crimson/15 text-warm-white"
                    : "border-white/[0.06] bg-white/[0.03] text-charcoal hover:text-warm-white-muted hover:bg-white/[0.06]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson/90 text-warm-white text-xs font-semibold uppercase tracking-wider transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Work
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, category..."
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

        {loadError && (
          <div
            className="mb-6 rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400"
            role="alert"
          >
            {loadError}
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-crimson" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-charcoal">
              <ImageIcon className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">No work items found.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-crimson/10 text-crimson text-xs font-semibold uppercase tracking-wider hover:bg-crimson/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add your first work item
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.04]">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                        Image
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                        Title
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                        Category
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                        Order
                      </th>
                      <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-white/[0.03]">
                            <Image
                              src={item.imageUrl}
                              alt={item.altText || item.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3 text-warm-white font-medium">
                          {item.title}
                        </td>
                        <td className="px-5 py-3">
                          <CategoryBadge category={item.category} />
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                              item.isPublished
                                ? "bg-green-500/10 text-green-400"
                                : "bg-white/[0.06] text-charcoal"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isPublished
                                  ? "bg-green-400"
                                  : "bg-charcoal"
                              }`}
                            />
                            {item.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-warm-white-muted">
                          {item.displayOrder}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditItem(item)}
                              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-warm-white-muted hover:text-warm-white hover:bg-white/[0.06] transition-colors"
                              aria-label={`Edit ${item.title}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteItem(item)}
                              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-warm-white-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              aria-label={`Delete ${item.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-white/[0.04]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex gap-4 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-white/[0.03] shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.altText || item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-warm-white truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryBadge category={item.category} />
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            item.isPublished
                              ? "text-green-400"
                              : "text-charcoal"
                          }`}
                        >
                          {item.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => setEditItem(item)}
                          className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-warm-white-muted hover:text-warm-white transition-colors"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-warm-white-muted hover:text-red-400 transition-colors"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* Modals */}
      {showCreateModal && (
        <WorkFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSaved={handleSaved}
        />
      )}

      {editItem && (
        <WorkFormModal
          mode="edit"
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
