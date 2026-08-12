"use client";

import React, { useState } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { GlassButton } from "@/components/ui/GlassButton";
import { CONTACT_CONTENT } from "@/lib/content";
import { CheckCircle, AlertCircle, ChevronDown } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  shootType: string;
  preferredDate: string;
  budgetRange: string;
  message: string;
  consent: boolean;
  _honey: string;
}

interface FormErrors {
  [key: string]: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

/**
 * Contact form with inline validation, accessible labels, and submission handling.
 */
export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    shootType: "",
    preferredDate: "",
    budgetRange: "",
    message: "",
    consent: false,
    _honey: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = "Name is required.";
    if (!formData.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim()) errs.message = "Message is required.";
    if (!formData.consent) errs.consent = "You must agree to be contacted.";
    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("loading");
    setErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setStatusMessage(data.message || "Thank you! Your inquiry has been sent.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          shootType: "",
          preferredDate: "",
          budgetRange: "",
          message: "",
          consent: false,
          _honey: "",
        });
      } else {
        setStatus("error");
        setStatusMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setStatusMessage("Network error. Please check your connection and try again.");
    }
  }

  const inputBase =
    "w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-warm-white placeholder:text-charcoal focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors";
  const labelBase = "block text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-white-muted mb-2";
  const errorBase = "text-xs text-red-400 mt-1";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot — hidden from real users */}
      <div className="absolute opacity-0 -z-10 pointer-events-none" aria-hidden="true">
        <input
          type="text"
          name="_honey"
          tabIndex={-1}
          autoComplete="off"
          value={formData._honey}
          onChange={handleChange}
        />
      </div>
      {/* Error summary */}
      {Object.keys(errors).length > 0 && status !== "loading" && (
        <div className="glass-card rounded-xl p-4 border-red-400/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-red-400">
              Please fix the following errors:
            </p>
            <ul className="mt-1 text-xs text-red-400/80 list-disc list-inside">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Success message */}
      {status === "success" && (
        <AnimatedSection>
          <div className="glass-card rounded-xl p-6 border-green-400/20 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-green-400">{statusMessage}</p>
              <p className="text-xs text-warm-white-muted mt-1">
                I will get back to you as soon as possible.
              </p>
            </div>
          </div>
        </AnimatedSection>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className={labelBase}>
            Name <span className="text-crimson">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`${inputBase} ${errors.name ? "!border-red-400/40" : ""}`}
            placeholder="Your full name"
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && <p id="name-error" className={errorBase}>{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelBase}>
            Email <span className="text-crimson">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${inputBase} ${errors.email ? "!border-red-400/40" : ""}`}
            placeholder="your@email.com"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && <p id="email-error" className={errorBase}>{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className={labelBase}>Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputBase}
            placeholder="+1 (000) 000-0000"
          />
        </div>

        {/* Shoot Type */}
        <div>
          <label htmlFor="shootType" className={labelBase}>Shoot Type</label>
          <div className="relative">
            <select
              id="shootType"
              name="shootType"
              value={formData.shootType}
              onChange={handleChange}
              className={`${inputBase} appearance-none pr-10 border-crimson/30 hover:border-crimson/60 focus:border-crimson bg-[#180809]/60 ${
                !formData.shootType ? "text-[#e05452]" : "text-warm-white"
              }`}
            >
              <option value="" className="bg-[#1c0809] text-[#e05452] font-semibold py-2">Select a type...</option>
              {CONTACT_CONTENT.shootTypes.map((type) => (
                <option key={type} value={type} className="bg-[#1c0809] text-warm-white py-2">{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-crimson">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Preferred Date */}
        <div>
          <label htmlFor="preferredDate" className={labelBase}>Preferred Date</label>
          <input
            type="date"
            id="preferredDate"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            className={inputBase}
          />
        </div>

        {/* Budget Range */}
        <div>
          <label htmlFor="budgetRange" className={labelBase}>Budget Range</label>
          <div className="relative">
            <select
              id="budgetRange"
              name="budgetRange"
              value={formData.budgetRange}
              onChange={handleChange}
              className={`${inputBase} appearance-none pr-10 border-crimson/30 hover:border-crimson/60 focus:border-crimson bg-[#180809]/60 ${
                !formData.budgetRange ? "text-[#e05452]" : "text-warm-white"
              }`}
            >
              <option value="" className="bg-[#1c0809] text-[#e05452] font-semibold py-2">Select a range...</option>
              {CONTACT_CONTENT.budgetRanges.map((range) => (
                <option key={range} value={range} className="bg-[#1c0809] text-warm-white py-2">{range}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-crimson">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelBase}>
          Message <span className="text-crimson">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className={`${inputBase} resize-none ${errors.message ? "!border-red-400/40" : ""}`}
          placeholder="Tell me about your project, vision, or idea..."
          required
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && <p id="message-error" className={errorBase}>{errors.message}</p>}
      </div>

      {/* Consent */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-white/10 bg-white/[0.03] text-crimson focus:ring-crimson/30 accent-[#942322]"
            required
            aria-invalid={!!errors.consent}
          />
          <span className="text-sm text-warm-white-muted leading-relaxed group-hover:text-warm-white transition-colors">
            I agree to be contacted regarding my inquiry and understand that my information will be handled respectfully.
          </span>
        </label>
        {errors.consent && <p className={`${errorBase} ml-7`}>{errors.consent}</p>}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <GlassButton
          type="submit"
          variant="primary"
          loading={status === "loading"}
          disabled={status === "loading"}
          showArrow={status !== "loading"}
        >
          {status === "loading" ? "Sending..." : "Send Inquiry"}
        </GlassButton>
      </div>

      {/* Error status */}
      {status === "error" && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {statusMessage}
        </p>
      )}
    </form>
  );
}
