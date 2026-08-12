import type { Metadata } from "next";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { CONTACT_CONTENT } from "@/lib/content";
import { Mail, Phone, MapPin, Camera, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Omar Hussein Photography. Book a shoot, discuss a creative project, or inquire about services.",
  openGraph: {
    title: "Contact | Omar Hussein Photography",
    description:
      "Book a shoot or inquire about photography services with Omar Hussein.",
  },
};

export default function ContactPage() {
  return (
    <section className="relative pt-32 md:pt-40 pb-section overflow-hidden">
      {/* Atmospheric glows */}
      <div className="glow-crimson absolute top-20 -left-32 opacity-15" aria-hidden="true" />
      <div className="glow-blue absolute bottom-0 -right-48 opacity-10" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8">
        <AnimatedSection>
          <SectionHeading
            label="Contact"
            title={CONTACT_CONTENT.headline}
            description={CONTACT_CONTENT.intro}
          />
        </AnimatedSection>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Form */}
          <AnimatedSection className="lg:col-span-7" delay={0.1}>
            <ContactForm />
          </AnimatedSection>

          {/* Contact Details — Cretoify-style glass card */}
          <AnimatedSection className="lg:col-span-5" delay={0.2}>
            <div className="contact-details-card p-8">
              {/* Card heading */}
              <h3 className="text-xl font-bold text-warm-white tracking-tight mb-6">
                Contact Details
              </h3>

              {/* Detail rows */}
              <div>
                {/* Email */}
                <a
                  href={`mailto:${CONTACT_CONTENT.email}`}
                  className="contact-detail-row group"
                >
                  <span className="contact-detail-icon contact-detail-icon-crimson group-hover:scale-105">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal">
                      Email
                    </span>
                    <span className="block text-sm font-medium text-warm-white mt-0.5">
                      {CONTACT_CONTENT.email}
                    </span>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href={`tel:${CONTACT_CONTENT.phone}`}
                  className="contact-detail-row group"
                >
                  <span className="contact-detail-icon contact-detail-icon-blue group-hover:scale-105">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal">
                      Phone
                    </span>
                    <span className="block text-sm font-medium text-warm-white mt-0.5">
                      {CONTACT_CONTENT.phone}
                    </span>
                  </div>
                </a>

                {/* Location */}
                <div className="contact-detail-row group">
                  <span className="contact-detail-icon contact-detail-icon-burgundy group-hover:scale-105">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal">
                      Location
                    </span>
                    <span className="block text-sm font-medium text-warm-white mt-0.5">
                      {CONTACT_CONTENT.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability note */}
              <p className="mt-6 text-sm text-warm-white-muted leading-relaxed border-t border-white/[0.04] pt-6">
                Available for freelance photography and creative collaborations. Whether you need portraits, editorial, commercial, or event coverage — let&apos;s make it happen.
              </p>

              {/* Social icons row */}
              <div className="mt-6 flex items-center gap-3">
                {CONTACT_CONTENT.socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] text-warm-white-muted hover:text-warm-white hover:bg-white/[0.08] hover:border-white/[0.1] transition-all duration-300"
                    aria-label={social.platform}
                    title={social.platform}
                  >
                    {social.platform === "Instagram" ? (
                      <Camera className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
