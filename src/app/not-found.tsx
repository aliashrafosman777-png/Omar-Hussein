import { OHMonogram } from "@/components/icons/OHMonogram";
import { GlassButton } from "@/components/ui/GlassButton";

export default function NotFound() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Atmospheric lighting */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(148,35,34,0.25) 0%, transparent 70%)",
            top: "30%",
            left: "20%",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(5,52,95,0.2) 0%, transparent 70%)",
            bottom: "10%",
            right: "10%",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6">
        <OHMonogram variant="colored" size={64} className="mx-auto mb-8 opacity-60" />
        <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight text-warm-white">
          404
        </h1>
        <p className="mt-4 text-lg text-warm-white-muted max-w-md mx-auto">
          This page doesn&apos;t exist — but your next great photograph does. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <GlassButton href="/" variant="primary" showArrow>
            Back to Home
          </GlassButton>
          <GlassButton href="/work" variant="secondary">
            View Work
          </GlassButton>
        </div>
      </div>
    </section>
  );
}
