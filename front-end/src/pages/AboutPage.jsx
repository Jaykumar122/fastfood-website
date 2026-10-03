import {
  Award,
  CheckCircle2,
  Clock3,
  Code2,
  Cpu,
  Database,
  HeartHandshake,
  Layers,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Users,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

function GithubIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function AboutPage() {
  const pillars = [
    {
      icon: UtensilsCrossed,
      title: "For Diners & Food Lovers",
      badge: "Customer First",
      tone: "bg-leaf/10 text-leaf border-leaf/20",
      description:
        "Instant discovery of neighborhood kitchens with rich dietary filters, photo-rich menus, 3D dish showcases, and live WebSocket delivery tracking straight to your doorstep.",
      highlights: [
        "15+ Curated local restaurants & 50+ dishes",
        "Sub-second catalog search & cuisine filters",
        "Transparent fee breakdown & promo engine",
        "Real-time STOMP WebSocket order tracking",
      ],
    },
    {
      icon: Store,
      title: "For Restaurant Partners",
      badge: "Kitchen OS",
      tone: "bg-tangerine/10 text-tangerine border-tangerine/20",
      description:
        "A zero-friction kitchen dispatch station. Manage incoming live orders, adjust menu availability in real time, configure opening hours, and respond directly to customer reviews.",
      highlights: [
        "One-click order progress (Accept, Prepare, Dispatch)",
        "Live Menu CRUD with instant stock toggles",
        "Operating hours & kitchen prep time controls",
        "Customer review feedback and reputation hub",
      ],
    },
    {
      icon: Truck,
      title: "For Delivery Partners",
      badge: "Rider Hub",
      tone: "bg-sun/20 text-ink border-sun/40",
      description:
        "Empowering riders with automated delivery matching, countdown pickup timers, navigation shortcuts, and transparent compensation including 100% of customer tips.",
      highlights: [
        "Live dispatch feed with estimated earnings",
        "Step-by-step navigation & customer calling",
        "Real-time earnings ledger & instant cashout",
        "Verified onboarding with license validation",
      ],
    },
    {
      icon: ShieldCheck,
      title: "For Platform Administrators",
      badge: "Command Center",
      tone: "bg-ink/5 text-ink border-ink/15",
      description:
        "Full operational governance. Monitor real-time Gross Merchandise Value (GMV), inspect rider and kitchen compliance documents, manage accounts, and export analytics.",
      highlights: [
        "Real-time KPI metrics & active order pipeline",
        "Multi-document compliance review workflow",
        "Role-based user management with instant controls",
        "One-click CSV exports of restaurants, orders & users",
      ],
    },
  ];

  const stats = [
    { label: "Partner Kitchens", value: "15+", sub: "Verified & approved" },
    { label: "Average Delivery", value: "25 min", sub: "Hot & fresh to door" },
    { label: "Platform Roles", value: "4", sub: "Diner, Owner, Rider, Admin" },
    { label: "Data Mocking", value: "0%", sub: "100% real Spring & MySQL" },
  ];

  const techStack = [
    { category: "Frontend", tech: "React 19, Vite 8, Tailwind CSS v4, Zustand, TanStack Query" },
    { category: "Backend", tech: "Spring Boot 3.4, Java 21/23, Spring Security 6 (Stateless JWT)" },
    { category: "Database", tech: "MySQL 8 with Hibernate ORM & Spring Data JPA" },
    { category: "Realtime", tech: "Spring WebSocket with STOMP message broker (/ws)" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-ink via-emerald-950 to-ink p-8 text-white sm:p-14 lg:p-20 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={14} className="text-sun" />
            About FastFood Platform
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
            Connecting food lovers, <span className="text-tangerine">neighborhood kitchens</span>, & riders.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-white/75 sm:text-xl">
            FastFood is a full-stack, enterprise-grade food ordering and delivery ecosystem built to provide end-to-end transparency, reactive speed, and seamless operations across 4 distinct stakeholders.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 rounded-2xl bg-tangerine px-6 py-3.5 font-display text-base font-bold text-white shadow-lg transition hover:bg-tangerine/90 hover:scale-[1.02]"
            >
              <UtensilsCrossed size={18} />
              Explore Restaurants
            </Link>
            <a
              href="https://github.com/Jaykumar122/fastfood-website"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 font-display text-base font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <GithubIcon size={18} />
              GitHub Repository
            </a>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-tangerine/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-80 w-80 rounded-full bg-leaf/30 blur-3xl" />
      </section>

      {/* Stats Counter */}
      <section className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-ink/8 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="font-display text-3xl font-extrabold text-ink sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm font-bold text-ink">{s.label}</p>
            <p className="mt-0.5 text-xs text-ink/50">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* Mission & Problem Statement */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-tangerine">Our Purpose</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Why we built FastFood from the ground up
          </h2>
          <p className="mt-4 text-base leading-7 text-ink/70">
            Traditional food delivery applications often suffer from high merchant commissions, opaque driver payouts, and clunky user experiences. We engineered <strong>FastFood</strong> as a modern blueprint for how local food logistics should operate in 2026:
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Real-time event architecture powered by WebSocket STOMP dispatch.",
              "Complete role segregation: Diner, Restaurant Kitchen, Delivery Rider, and Platform Admin.",
              "Strict database integrity backed by MySQL 8 and Hibernate transactions.",
              "Mobile-first, lightning-fast reactive user experience built with React 19 & Tailwind CSS v4.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink/80">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-leaf" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-ink/8 bg-leaf p-8 text-white sm:p-10 shadow-lg">
          <Layers size={36} className="text-sun" />
          <h3 className="mt-4 font-display text-2xl font-bold">Full-Stack Architecture</h3>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            FastFood is not just a UI prototype — every action flows through a production-ready pipeline:
          </p>
          <div className="mt-6 space-y-4">
            {techStack.map((item) => (
              <div key={item.category} className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-sun">{item.category}</p>
                <p className="mt-0.5 text-sm font-medium text-white">{item.tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 4 Platform Pillars */}
      <section className="mt-20">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-tangerine">Ecosystem</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Four Dedicated Portals. One Unified Platform.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-ink/65">
            Every user receives a specialized workspace engineered specifically for their role in the delivery journey.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex flex-col justify-between rounded-3xl border border-ink/8 bg-white p-7 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink/5 text-ink">
                      <Icon size={24} />
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${pillar.tone}`}>
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-ink">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{pillar.description}</p>

                  <ul className="mt-5 space-y-2 border-t border-ink/8 pt-5">
                    {pillar.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-ink/75">
                        <span className="h-1.5 w-1.5 rounded-full bg-tangerine" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Creator & Project Info */}
      <section className="mt-20 rounded-3xl border border-ink/8 bg-white p-8 sm:p-12 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-leaf/10 px-3.5 py-1 text-xs font-bold text-leaf">
              <Code2 size={14} />
              Open Source Engineering
            </div>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Crafted by Jaykumar
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              Developed and maintained by <strong>Jaykumar</strong> (<a href="https://github.com/Jaykumar122" target="_blank" rel="noreferrer" className="text-leaf font-bold hover:underline">@Jaykumar122</a>). FastFood was created to demonstrate modern, reactive full-stack web architecture, clean multi-tenant domain models, and resilient real-time WebSocket communications.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="https://github.com/Jaykumar122"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ink/80"
              >
                <GithubIcon size={16} />
                GitHub Profile (@Jaykumar122)
              </a>
              <a
                href="https://github.com/Jaykumar122/fastfood-website"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-ink/5"
              >
                <Code2 size={16} />
                View Repository
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-ink/5 p-6 border border-ink/8">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink/60">Repository Info</h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <span className="text-ink/60">Repository</span>
                <span className="font-mono font-bold text-ink">Jaykumar122/fastfood-website</span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <span className="text-ink/60">License</span>
                <span className="font-bold text-leaf">MIT</span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <span className="text-ink/60">Architecture</span>
                <span className="font-bold text-ink">React 19 + Spring Boot 3 + MySQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Status</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-leaf">
                  <span className="h-2 w-2 rounded-full bg-leaf animate-pulse" />
                  Active & Production Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
