import { Mail, MapPin, Phone, Clock, Headphones } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { ContactForm } from "@/components/contact/contact-form";

const CHANNELS = [
  { icon: Mail, title: "Email", value: "hello@strata.bank", note: "We reply within one business day." },
  { icon: Phone, title: "Phone", value: "+1 (434) 555-0142", note: "Mon–Fri, 8am–8pm ET." },
  { icon: Headphones, title: "24/7 Support", value: "Live chat in your dashboard", note: "For account-related help." },
  { icon: MapPin, title: "Headquarters", value: "301 East Water Street, Charlottesville, VA 22904", note: "Visits by appointment." },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-strata-green stripes-green py-24 text-primary-foreground">
          <div className="container flex flex-col items-center gap-4 text-center">
            <span className="inline-flex rounded-full border border-strata-amber/60 bg-strata-amber/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-amber">
              Contact Us
            </span>
            <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              We&apos;d love to hear from you.
            </h1>
            <p className="max-w-2xl text-primary-foreground/80 sm:text-lg">
              Sales questions, product feedback, or something we should look into — reach us any of these ways.
            </p>
          </div>
        </section>

        <section className="container grid gap-14 py-24 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex rounded-full bg-strata-green-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-green">
              Send us a message
            </span>
            <h2 className="mt-4 amber-underline font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Tell us what&apos;s on your mind
            </h2>
            <p className="mt-6 max-w-lg text-muted-foreground">
              Fill in the form and we&apos;ll get back to you within one business day. If this is an urgent
              account issue, please sign in and message support directly for the fastest response.
            </p>
            <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-card">
              <ContactForm />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {CHANNELS.map((c) => (
              <div key={c.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-strata-green-soft text-strata-green">
                    <c.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{c.title}</p>
                    <p className="mt-1 font-semibold">{c.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-border/60 bg-strata-green-soft p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-strata-green text-primary-foreground">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-strata-green">Hours</p>
                  <p className="mt-1 text-sm font-semibold text-strata-green">Mon–Fri · 8am – 8pm ET</p>
                  <p className="text-sm text-strata-green/80">Sat–Sun · 10am – 6pm ET</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-strata-green-deep py-10 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Strata. All rights reserved.
      </footer>
    </div>
  );
}
