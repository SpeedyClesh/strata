import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Clock,
  Info,
  Settings,
  Grid3x3,
  Mail,
  MousePointerClick,
  Bell,
  BadgeCheck,
  Globe,
  ShieldQuestion,
  LifeBuoy,
  CreditCard,
  Zap,
  UserRound,
  Trophy,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TrustStripe />
        <FeatureGrid />
        <WhyChoose />
        <ServicesGrid />
        <Achievements />
        <MobileBanking />
        <Careers />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-strata-green text-primary-foreground">
      <div className="absolute inset-0 opacity-25 mix-blend-overlay">
        <div className="h-full w-full bg-gradient-to-br from-strata-green-deep via-strata-green to-strata-green-deep" />
      </div>
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_30%,white,transparent_50%),radial-gradient(circle_at_80%_60%,white,transparent_50%)]" />

      <div className="container relative flex flex-col items-center gap-6 py-28 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-strata-amber/60 bg-strata-amber/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-strata-amber">
          <Trophy className="h-3.5 w-3.5" />
          Trusted by over 2 million customers worldwide
        </span>
        <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Credible, Innovative
          <br />
          and Secured Banking
        </h1>
        <p className="max-w-2xl text-balance text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
          Experience banking excellence with industry-leading security, personalized service, and
          global financial solutions. Whether you&apos;re saving for tomorrow or investing for the
          future, Strata gives you the tools, expertise, and support you need to reach your goals.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="gap-2 rounded-full bg-strata-amber px-8 text-strata-green-deep hover:bg-strata-amber-deep hover:text-primary-foreground"
          >
            <Link href="/login">
              <UserRound className="h-4 w-4" />
              Open Account — It&apos;s Free
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2 rounded-full border-primary-foreground/40 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/login">
              Access Your Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, top: "Bank-Grade", bottom: "Security", tone: "amber" },
            { icon: Lock, top: "256-bit", bottom: "Encryption", tone: "amber" },
            { icon: Clock, top: "24/7", bottom: "Support", tone: "amber" },
          ].map((t) => (
            <div key={t.top} className="flex items-center justify-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-strata-amber/20 text-strata-amber">
                <t.icon className="h-5 w-5" />
              </span>
              <div className="text-left">
                <p className="font-semibold leading-tight">{t.top}</p>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/70">
                  {t.bottom}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustStripe() {
  return null;
}

const featurePrimary = [
  {
    icon: Info,
    title: "Strata Personal",
    body:
      "With a tradition of complete financial care, we deliver flexible and premium personal banking built around how you live.",
    tone: "green",
  },
  {
    icon: Lock,
    title: "Fully Encrypted",
    body:
      "Send, receive, and control funds from anywhere in the world with the convenience of your mobile devices — encrypted end to end.",
    tone: "amber",
  },
  {
    icon: Settings,
    title: "Credit Advance",
    body:
      "Loan applications are reviewed and extended to customers who meet our lending criteria with clear, competitive terms.",
    tone: "green",
  },
  {
    icon: ShieldCheck,
    title: "Safe and Secure",
    body:
      "Every online banking transaction is encrypted and secured on independent cloud infrastructure, monitored around the clock.",
    tone: "amber",
  },
];

function FeatureGrid() {
  return (
    <section className="py-20">
      <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featurePrimary.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border/60 bg-card p-6 shadow-card"
          >
            <span
              className={
                "mb-6 flex h-12 w-12 items-center justify-center rounded-2xl " +
                (f.tone === "amber"
                  ? "bg-strata-amber-soft text-strata-amber-deep"
                  : "bg-strata-green-soft text-strata-green")
              }
            >
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mb-3 font-serif text-xl font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const whyItems = [
  { icon: BadgeCheck, title: "Professional Service", body: "Expert guidance every step" },
  { icon: Globe, title: "Global Access", body: "Banking without borders" },
  { icon: ShieldQuestion, title: "Secure Transactions", body: "Bank-grade encryption" },
  { icon: LifeBuoy, title: "24/7 Support", body: "Always here to help" },
  { icon: CreditCard, title: "Virtual Cards", body: "Issue in seconds" },
  { icon: Zap, title: "Instant Transfers", body: "No waiting, no friction" },
];

function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-background stripes-cream py-24">
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full bg-strata-green-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-green">
            Why Choose Us
          </span>
          <h2 className="mt-4 amber-underline font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Choose What&apos;s
            <br />
            Right for You
          </h2>
          <p className="mt-8 max-w-lg text-muted-foreground">
            We go to great lengths to source, attract, develop, and retain the best talent —
            wherever they may be — so your banking is always in expert hands.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {whyItems.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-strata-green text-primary-foreground">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold leading-tight">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-first h-72 rounded-3xl bg-gradient-to-br from-strata-green-soft to-strata-amber-soft lg:order-last lg:h-[28rem]">
          <div className="absolute inset-6 rounded-2xl bg-card shadow-card" />
          <div className="absolute inset-x-10 top-14 rounded-2xl bg-card p-6 shadow-card">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Available Balance</p>
            <p className="mt-2 font-serif text-3xl font-semibold">$24,580.50</p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-strata-green px-3 py-1 text-xs font-medium text-primary-foreground">Transfer</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">Deposit</span>
            </div>
          </div>
          <div className="absolute right-8 bottom-8 flex items-center gap-2 rounded-full bg-strata-green px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-card">
            <Zap className="h-3.5 w-3.5" /> Fast &amp; Secure
          </div>
        </div>
      </div>
    </section>
  );
}

const services = [
  { icon: Info, title: "Corporate Banking", body: "Our experienced corporate team works closely with clients to identify their financing needs and craft tailored solutions.", tone: "green" },
  { icon: Settings, title: "Personal Banking", body: "Reliable, high-quality banking products and solutions that create value for individuals and families.", tone: "amber" },
  { icon: Grid3x3, title: "International Banking", body: "An International Banking Unit dedicated to global clients — from foreign residents to overseas businesses.", tone: "green" },
  { icon: Mail, title: "Email Notifications", body: "Instant, responsive email alerts for every account activity — keeping you informed and in control.", tone: "amber" },
  { icon: MousePointerClick, title: "Remote Access", body: "Access to your funds anywhere with complete security and convenience across all your devices.", tone: "green" },
  { icon: Bell, title: "Instant Notifications", body: "Real-time alerts for every transaction so you stay informed about your account activity instantly.", tone: "amber" },
];

function ServicesGrid() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex rounded-full bg-strata-amber-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-amber-deep">
            Comprehensive Solutions
          </span>
          <h2 className="amber-underline amber-underline-center font-serif text-4xl font-semibold sm:text-5xl">
            Our Features
          </h2>
          <p className="mt-6 max-w-xl text-muted-foreground">
            Tailored banking solutions designed to meet your personal and business financial goals.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
              <span
                className={
                  "mb-6 flex h-12 w-12 items-center justify-center rounded-2xl " +
                  (f.tone === "amber"
                    ? "bg-strata-amber-soft text-strata-amber-deep"
                    : "bg-strata-green-soft text-strata-green")
                }
              >
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mb-3 font-serif text-xl font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [
  { number: "21+", label: "Years Of Experience" },
  { number: "150K", label: "Approved Loans" },
  { number: "320+", label: "Existing Customers" },
  { number: "58+", label: "Awards" },
];

function Achievements() {
  return (
    <section className="relative overflow-hidden stripes-green py-24 text-primary-foreground">
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex rounded-full border border-strata-amber/60 bg-strata-amber/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-amber">
            Our Achievements
          </span>
          <h2 className="amber-underline amber-underline-center font-serif text-4xl font-semibold sm:text-5xl">
            Strata Over The Years
          </h2>
          <p className="mt-6 max-w-xl text-primary-foreground/70">
            Our statistics are 100% accurate.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-8 text-center backdrop-blur"
            >
              <p className="font-serif text-5xl font-semibold text-strata-amber">{s.number}</p>
              <p className="mt-3 text-sm uppercase tracking-widest text-primary-foreground/80">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileBanking() {
  return (
    <section className="relative overflow-hidden stripes-green py-24 text-primary-foreground">
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-strata-amber/60 bg-strata-amber/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-amber">
            Mobile Banking
          </span>
          <h2 className="mt-4 amber-underline font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Bank On The Go
            <br />
            From Anywhere
          </h2>
          <p className="mt-8 max-w-lg text-primary-foreground/85">
            Experience seamless banking from your device. Access your accounts, make transfers, and
            manage your finances anytime, anywhere with Strata.
          </p>

          <ul className="mt-8 flex flex-col gap-5">
            <MobileFeature
              icon={ShieldCheck}
              title="Bank-Grade Security"
              body="256-bit encryption & biometric authentication"
            />
            <MobileFeature
              icon={Clock}
              title="Real-Time Alerts"
              body="Instant notifications for every transaction"
            />
            <MobileFeature
              icon={Globe}
              title="Global Reach"
              body="Move money across borders with a tap"
            />
          </ul>
        </div>

        <div className="relative mx-auto flex h-[36rem] w-[19rem] items-center justify-center rounded-[2.5rem] border border-primary-foreground/10 bg-strata-green-deep p-4 shadow-card">
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-strata-green-deep to-strata-green">
            <div className="absolute inset-x-6 top-8 flex flex-col items-center gap-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-strata-green text-strata-amber">
                <StrataWordmark />
              </span>
              <p className="mt-2 font-serif text-xl">Strata Bank</p>
              <p className="text-xs uppercase tracking-widest text-primary-foreground/70">
                Mobile Banking
              </p>
            </div>
            <div className="absolute inset-x-6 top-52 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-primary-foreground/70">
                Available Balance
              </p>
              <p className="mt-2 font-serif text-3xl font-semibold">$24,580.50</p>
            </div>
            <div className="absolute inset-x-6 bottom-16 flex gap-2">
              <button className="flex-1 rounded-xl bg-strata-green-deep py-3 text-sm font-medium ring-1 ring-primary-foreground/10">
                Transfer
              </button>
              <button className="flex-1 rounded-xl bg-strata-green-deep py-3 text-sm font-medium ring-1 ring-primary-foreground/10">
                Deposit
              </button>
            </div>
            <div className="absolute right-4 top-40 flex items-center gap-1.5 rounded-full bg-primary-foreground px-2.5 py-1 text-[10px] font-semibold text-strata-green shadow">
              <Zap className="h-3 w-3 text-strata-amber-deep" />
              Fast &amp; Secure
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StrataWordmark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L21 7v6c0 5-3.5 8.5-9 10-5.5-1.5-9-5-9-10V7l9-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

function MobileFeature({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10 text-strata-amber ring-1 ring-primary-foreground/10">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="font-semibold leading-tight">{title}</p>
        <p className="text-sm text-primary-foreground/70">{body}</p>
      </div>
    </li>
  );
}

function Careers() {
  return (
    <section className="relative overflow-hidden stripes-cream py-24">
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <div className="relative h-72 rounded-3xl bg-gradient-to-br from-strata-green-soft/60 to-strata-amber-soft lg:h-[28rem]">
          <div className="absolute left-8 top-12 h-52 w-32 rotate-[-6deg] rounded-2xl bg-card shadow-card" />
          <div className="absolute left-32 bottom-8 h-52 w-32 rotate-[3deg] rounded-2xl bg-card shadow-card" />
          <div className="absolute right-12 top-14 h-52 w-32 rotate-[7deg] rounded-2xl bg-card shadow-card" />
        </div>
        <div>
          <span className="inline-flex rounded-full bg-strata-green-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-green">
            Join Our Team
          </span>
          <h2 className="mt-4 amber-underline font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Careers at Strata
          </h2>
          <p className="mt-8 max-w-lg text-muted-foreground">
            Strata welcomes talented professionals to join our young and dynamic team. We&apos;re
            looking for financial specialists and graduates who share our values of integrity and
            excellence — and want to grow with us.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <p className="font-serif text-4xl font-semibold text-strata-amber-deep">500+</p>
              <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
                Team Members
              </p>
            </div>
            <div>
              <p className="font-serif text-4xl font-semibold text-strata-amber-deep">50+</p>
              <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
                Open Positions
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="mt-8 gap-2 rounded-full bg-strata-green px-8 text-primary-foreground hover:bg-strata-green-deep"
          >
            <Link href="/login">Apply Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden stripes-green py-24 text-primary-foreground">
      <div className="container flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
          Apply for an Account in Minutes
        </h2>
        <p className="max-w-xl text-primary-foreground/85">
          Get your Strata account today and experience banking excellence.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-4 gap-2 rounded-full bg-strata-amber px-10 text-strata-green-deep hover:bg-strata-amber-deep hover:text-primary-foreground"
        >
          <Link href="/login">Get Your Strata Account</Link>
        </Button>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-strata-green-deep text-primary-foreground/80">
      <div className="container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-strata-amber text-strata-green-deep">
              <StrataWordmark />
            </span>
            <div className="leading-tight">
              <p className="font-serif text-xl text-primary-foreground">Strata</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-primary-foreground/50">
                Trust · Belief · Reliability
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            Strata is a modern digital bank offering personal, corporate, and international banking
            products for individuals, SMEs, and premier customers.
          </p>
        </div>
        <FooterCol title="Company" links={[
          { label: "About Us", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Contact Us", href: "/contact" },
        ]} />
        <FooterCol title="Financial Services" links={[
          { label: "Corporate Banking", href: "/services" },
          { label: "Personal Banking", href: "/services" },
          { label: "International Banking", href: "/services" },
          { label: "Contact Us", href: "/contact" },
        ]} />
        <div>
          <h4 className="amber-underline font-serif text-lg text-primary-foreground">Contact Info</h4>
          <div className="mt-6 space-y-3 text-sm">
            <p className="text-primary-foreground/70">301 East Water Street, Charlottesville, VA 22904</p>
            <p className="text-primary-foreground/70">hello@strata.bank</p>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Strata. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="amber-underline font-serif text-lg text-primary-foreground">{title}</h4>
      <ul className="mt-6 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="transition-colors hover:text-strata-amber">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
