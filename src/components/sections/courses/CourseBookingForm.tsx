"use client";

import React, { useState } from "react";
import { COURSES_CONTENT, CONTACT_CONTENT } from "@/lib/content";
import { GlassButton } from "@/components/ui/GlassButton";
import { CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  _honey: string;
}

interface FormErrors {
  [key: string]: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

/**
 * Course booking form — styled to match the walidooo.com reference.
 * Includes Full Name, Email, Phone, Course selector, Message, and Send button.
 * Also includes social media links below the form.
 */
export function CourseBookingForm() {
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    email: "",
    phone: "",
    course: "",
    message: "",
    _honey: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.fullName.trim()) errs.fullName = "Name is required.";
    if (!formData.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.course) errs.course = "Please select a course.";
    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setStatusMessage(data.message || "Thank you! Your booking request has been sent.");
        setFormData({ fullName: "", email: "", phone: "", course: "", message: "", _honey: "" });
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
    "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-warm-white placeholder:text-charcoal focus:outline-none focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-all duration-300";
  const errorBase = "text-xs text-red-400 mt-1";

  return (
    <div className="contact-details-card p-6 md:p-8">
      {/* Heading */}
      <h3 className="text-xl md:text-2xl font-bold text-warm-white tracking-tight mb-8 text-center uppercase">
        Book Your Course Now
      </h3>

      {/* Success message */}
      {status === "success" && (
        <AnimatedSection>
          <div className="glass-card rounded-xl p-5 border-green-400/20 flex items-start gap-3 mb-6">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-green-400">{statusMessage}</p>
              <p className="text-xs text-warm-white-muted mt-1">
                We&apos;ll get back to you with course details soon.
              </p>
            </div>
          </div>
        </AnimatedSection>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
        {/* Full Name */}
        <div>
          <input
            type="text"
            id="booking-fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`${inputBase} ${errors.fullName ? "!border-red-400/40" : ""}`}
            placeholder="Full Name"
            required
            aria-label="Full Name"
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && <p className={errorBase}>{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            id="booking-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${inputBase} ${errors.email ? "!border-red-400/40" : ""}`}
            placeholder="Email"
            required
            aria-label="Email"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className={errorBase}>{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            id="booking-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputBase}
            placeholder="Phone Number"
            aria-label="Phone Number"
          />
        </div>

        {/* Course Select */}
        <div>
          <div className="relative">
            <select
              id="booking-course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className={`${inputBase} appearance-none cursor-pointer pr-10 border-crimson/40 hover:border-crimson/70 focus:border-crimson bg-[#180809]/80 shadow-[0_0_15px_rgba(148,35,34,0.12)] ${
                errors.course ? "!border-red-400" : ""
              } ${!formData.course ? "text-[#e05452] font-semibold" : "text-warm-white font-medium"}`}
              required
              aria-label="Select Course"
              aria-invalid={!!errors.course}
            >
              <option value="" className="bg-[#1c0809] text-[#e05452] font-semibold py-2">
                Select Course
              </option>
              {COURSES_CONTENT.courses.map((c) => (
                <option key={c.title} value={c.title} className="bg-[#1c0809] text-warm-white font-medium py-2">
                  {c.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-crimson">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          {errors.course && <p className={errorBase}>{errors.course}</p>}
        </div>

        {/* Message */}
        <div>
          <textarea
            id="booking-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className={`${inputBase} resize-none`}
            placeholder="Message"
            aria-label="Message"
          />
        </div>

        {/* Submit */}
        <div className="pt-1">
          <GlassButton
            type="submit"
            variant="primary"
            loading={status === "loading"}
            disabled={status === "loading"}
            className="w-full justify-center py-4 text-sm"
          >
            {status === "loading" ? "Sending..." : "Send"}
          </GlassButton>
        </div>

        {/* Error status */}
        {status === "error" && (
          <p className="text-sm text-red-400 flex items-center gap-2 justify-center">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {statusMessage}
          </p>
        )}
      </form>

      {/* Social icons */}
      <div className="mt-6 flex items-center justify-center gap-3">
        {CONTACT_CONTENT.socials.map((social) => (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] text-warm-white-muted hover:text-warm-white hover:bg-white/[0.12] hover:border-white/[0.15] transition-all duration-300 hover:scale-110"
            aria-label={social.platform}
            title={social.platform}
          >
            {social.platform === "Instagram" && (
              <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            )}
            {social.platform === "Behance" && (
              <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
              </svg>
            )}
            {social.platform === "LinkedIn" && (
              <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
