"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

type FormStatus = "idle" | "loading" | "error";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin/dashboard");
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Invalid credentials.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glows */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #942322 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #05345F 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-5">
            <Lock className="w-7 h-7 text-crimson" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-warm-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-warm-white-muted mt-2">
            Sign in to manage submissions
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm p-8">
          {/* Error message */}
          {status === "error" && errorMessage && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-400/20">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-white-muted mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal" />
                <input
                  type="email"
                  id="admin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-sm text-warm-white placeholder:text-charcoal focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors"
                  placeholder="admin@OmarHussein.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-white-muted mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-12 py-3 text-sm text-warm-white placeholder:text-charcoal focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal hover:text-warm-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 bg-crimson hover:bg-crimson/90 disabled:bg-crimson/50 text-warm-white font-semibold text-sm uppercase tracking-[0.1em] px-6 py-3.5 rounded-xl transition-all duration-300"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Back to site */}
        <p className="text-center text-xs text-charcoal mt-6">
          <Link
            href="/"
            className="hover:text-warm-white-muted transition-colors"
          >
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
