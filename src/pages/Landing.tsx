import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Headset,
  Lock,
  ReceiptText,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brand, BrandMark } from "@/components/bank/Brand";
import { WalletCard } from "@/components/bank/WalletCard";
import { formatMoney } from "@/components/bank/format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

const features = [
  {
    icon: Zap,
    title: "Instant transfers",
    body: "Send money to anyone on Meridian in seconds — no routing numbers, no waiting on the weekend.",
  },
  {
    icon: Wallet,
    title: "One smart wallet",
    body: "Every dollar in one place. Track your balance, add funds, and withdraw whenever life moves.",
  },
  {
    icon: ReceiptText,
    title: "Effortless bill pay",
    body: "Pay electricity, internet, rent, and more straight from your wallet with a single tap.",
  },
  {
    icon: BarChart3,
    title: "Clear insights",
    body: "See where money comes and goes with a clean, day-by-day view of your spending.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade security",
    body: "Encrypted sessions, biometric-friendly sign-in, and real-time balance checks on every move.",
  },
  {
    icon: Headset,
    title: "Humans, not hold music",
    body: "Real support from real people, 24/7, whenever you need a hand with your money.",
  },
];

const steps = [
  {
    n: "01",
    title: "Create your account",
    body: "Sign up with your email in under a minute. No credit checks, no paperwork, no minimums.",
  },
  {
    n: "02",
    title: "Fund your wallet",
    body: "Add money to your Meridian wallet and see your balance update instantly.",
  },
  {
    n: "03",
    title: "Move at your pace",
    body: "Send to friends, pay bills, and withdraw — every transaction recorded with total clarity.",
  },
];

const demoFeed = [
  { title: "To Ava Chen", sub: "Rent split · Instant", amount: -128.5 },
  { title: "From Daniel Okafor", sub: "Dinner reimbursement", amount: 46.0 },
  { title: "City Power Co.", sub: "Electricity · Bill pay", amount: -72.4 },
  { title: "From Northwind Labs", sub: "Freelance invoice", amount: 320.0 },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Security", href: "#security" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ============ Nav ============ */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="Meridian home">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">
                Open account
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 45% at 50% -5%, oklch(0.9 0.05 178 / 0.5), transparent 70%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            >
              <Sparkles className="size-3.5 text-primary" />
              Modern mobile banking, minus the friction
            </Badge>
            <h1 className="max-w-xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Your money, moving at the speed of now.
            </h1>
            <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Meridian is a mobile bank for people who expect more from their
              money — instant transfers, effortless bill pay, and total clarity
              on every single cent.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-xl px-7 text-[15px]">
                <Link to="/auth">
                  Open your account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-7 text-[15px]">
                <Link to="/auth">Try the live demo</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
              {["No hidden fees", "No minimums", "Bank-grade security"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="size-4 text-primary" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </motion.div>

          {/* Hero mock */}
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative mx-auto w-full max-w-md"
          >
            <div
              aria-hidden
              className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/15 via-transparent to-primary/10 blur-2xl"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <WalletCard
                balanceCents={846250}
                accountNumber="4821937705"
                holder="Alex Morgan"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute -right-4 -top-8 hidden rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:block"
            >
              <p className="text-xs font-medium text-muted-foreground">Sent just now</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold tabular-nums">
                <span className="flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ArrowUpRight className="size-3.5" />
                </span>
                {formatMoney(-12850)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="absolute -bottom-6 -left-4 hidden items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:flex"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Send className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Instant transfer</p>
                <p className="text-xs text-muted-foreground">Arrives in seconds</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ Stats strip ============ */}
      <section className="border-y border-border/60 bg-card/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 py-10 sm:px-8 lg:grid-cols-4">
          {[
            { value: "2.4M+", label: "Active members" },
            { value: "$180M+", label: "Moved monthly" },
            { value: "< 2 sec", label: "Average transfer" },
            { value: "4.9/5", label: "App store rating" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="px-2 py-2 text-center sm:px-6"
            >
              <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ Features ============ */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Why Meridian
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything your money needs, nothing it doesn&apos;t
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
            A calm, considered bank built for the way you actually live — from
            coffee runs to rent day.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: (i % 3) * 0.08 }}
              className="group rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ How it works ============ */}
      <section id="how" className="border-y border-border/60 bg-card/60">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Banking set up in the time it takes to make coffee
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="relative rounded-2xl border border-border/70 bg-card p-7 shadow-card"
              >
                <span className="font-mono text-sm font-medium text-primary">
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
                {i < steps.length - 1 && (
                  <ArrowRight
                    aria-hidden
                    className="absolute -right-4 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-border md:block"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Showcase band ============ */}
      <section id="security" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Total clarity
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Every cent, accounted for. Every move, secure.
            </h2>
            <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              Your wallet updates in real time, and every transfer, bill, and
              top-up lands in a clean ledger — protected by encrypted sessions
              and continuous monitoring.
            </p>
            <ul className="mt-8 space-y-3.5">
              {[
                "Real-time balance updates on every transaction",
                "Recipient verification before money moves",
                "Instant notifications the moment anything changes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" />
                  </span>
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary/12 via-transparent to-primary/8 blur-xl"
            />
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-lift">
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <div className="flex items-center gap-2">
                  <BrandMark className="size-5" />
                  <span className="text-sm font-semibold tracking-tight">
                    Recent activity
                  </span>
                </div>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Lock className="size-3" />
                  Secure
                </Badge>
              </div>
              <ul className="divide-y divide-border/60 px-6">
                {demoFeed.map((item) => (
                  <li key={item.title} className="flex items-center gap-3.5 py-4">
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl ${
                        item.amount > 0
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.amount > 0 ? (
                        <ArrowUpRight className="size-4" />
                      ) : (
                        <ArrowUpRight className="size-4 rotate-90" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.sub}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold tabular-nums ${
                        item.amount > 0 ? "text-primary" : ""
                      }`}
                    >
                      {item.amount > 0 ? "+" : "−"}
                      {formatMoney(Math.abs(item.amount) * 100)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border/60 px-6 py-4 text-center">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">
                    See it live
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[2rem] bg-[#0c2322] px-6 py-16 text-center text-white shadow-lift sm:px-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 100% at 50% 0%, oklch(0.6 0.12 178 / 0.4), transparent 60%)",
            }}
          />
          <div className="relative">
            <Badge className="mb-5 border-white/15 bg-white/10 text-white">
              <CircleDollarSign className="size-3.5" />
              Free to open, free to use
            </Badge>
            <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to move your money forward?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-white/70 sm:text-lg">
              Join Meridian today. Your account takes about a minute — the
              freedom lasts as long as you want it to.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-white px-7 text-[15px] text-[#0c2322] hover:bg-white/90"
              >
                <Link to="/auth">
                  Open your account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/25 bg-transparent px-7 text-[15px] text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/auth">Continue as guest</Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/50">
              <Smartphone className="size-3.5" />
              Works beautifully on any device — no app download required
            </p>
          </div>
        </motion.div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="border-t border-border/60 bg-card/60">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
            <div className="max-w-xs">
              <Brand />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Modern mobile banking for people who expect more from their
                money.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              {[
                {
                  title: "Product",
                  links: ["Features", "Transfers", "Bill pay", "Wallet"],
                },
                {
                  title: "Company",
                  links: ["About", "Careers", "Press", "Contact"],
                },
                {
                  title: "Legal",
                  links: ["Privacy", "Terms", "Security", "Disclosures"],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {col.title}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} Meridian Financial. Demo product — not a real bank.</p>
            <p className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              256-bit encrypted · SOC 2 aligned
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
