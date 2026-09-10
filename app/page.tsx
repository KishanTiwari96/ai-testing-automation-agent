"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Globe,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  ListChecks,
  Coins,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const features = [
    {
      icon: <Bot className="h-6 w-6 text-blue-500" />,
      title: "Context-Aware AI Generation",
      description: "Scans your GitHub repository tree and route components to write precise, production-grade Playwright tests.",
    },
    {
      icon: <Globe className="h-6 w-6 text-indigo-500" />,
      title: "Browserbase Cloud Execution",
      description: "Executes automated tests in isolated remote browsers with live video recordings, logs, and screenshots.",
    },
    {
      icon: <Terminal className="h-6 w-6 text-emerald-500" />,
      title: "Live Execution Telemetry",
      description: "Real-time streaming console logs with step-by-step assertions, timing metrics, and failure diagnostics.",
    },
    {
      icon: <Layers className="h-6 w-6 text-purple-500" />,
      title: "Full Test Suite Management",
      description: "Filter, customize, add custom assertions, and run batch test suites with a single click.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-amber-500" />,
      title: "Zero-Setup Sandbox Mode",
      description: "Test immediately with built-in simulated runners or link your Browserbase credentials for cloud browsers.",
    },
    {
      icon: <Coins className="h-6 w-6 text-cyan-500" />,
      title: "Pay-As-You-Go Credits",
      description: "Transparent credit pricing powered by Stripe. Never pay monthly subscriptions for idle test runs.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Connect Your GitHub Account",
      description: "One-click OAuth authentication lets the agent discover your repositories and inspect file architecture.",
    },
    {
      step: "02",
      title: "AI Scans & Generates Playwright Suites",
      description: "Gemini AI analyzes page routes, form inputs, and components to author comprehensive end-to-end scenarios.",
    },
    {
      step: "03",
      title: "Run in Browserbase & Inspect Results",
      description: "Watch tests execute live, view real-time terminal logs, capture failure snapshots, and export clean Playwright code.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src={"/logo-white.svg"} alt="Logo" width={160} height={40} className="h-8 w-auto" priority />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link href="/workspace" className="hover:text-white transition-colors">Workspace</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/support" className="hover:text-white transition-colors">Documentation</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/workspace">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 gap-1.5">
                <span>Open Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/30 blur-[130px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/70 text-xs font-medium text-blue-400 mb-6 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Next-Gen QA Automation with Browserbase & AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Build & Run Automated Tests with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">AI Agents</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Connect your GitHub repositories. Our AI agent deeply inspects your code, generates production-grade Playwright suites, and executes them in real cloud browsers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/workspace">
              <Button size="lg" className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 gap-2 w-full sm:w-auto">
                <Sparkles className="h-4 w-4" />
                <span>Get Started in Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/support">
              <Button size="lg" variant="outline" className="h-12 px-6 rounded-xl border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white font-medium text-sm w-full sm:w-auto">
                <span>View Documentation</span>
              </Button>
            </Link>
          </div>

          {/* Live Terminal Mockup Preview */}
          <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden text-left backdrop-blur-xl ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">ai-test-agent // live execution runner</span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                BROWSERBASE CLOUD CONNECTED
              </span>
            </div>

            <div className="p-6 font-mono text-xs text-slate-300 space-y-2 select-none overflow-x-auto">
              <div className="text-slate-500">{"// Connecting to GitHub repository structure & pages..."}</div>
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <span>[AI Agent]</span>
                <span>Analyzed 12 routes & generated 4 automated Playwright test cases</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300">
                <span>[Browserbase]</span>
                <span>Created cloud session ID: sess_94f8a29b4e10c7</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span>[Playwright]</span>
                <span>Navigating to https://staging.my-app.vercel.app/</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span>[Assertion]</span>
                <span>✓ Verified header title & brand logo is visible in viewport</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span>[Assertion]</span>
                <span>✓ Interactive form input & search submission completed (200 OK)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold pt-1">
                <span>[PASSED]</span>
                <span>All 4 test cases executed in 2.34s with 100% pass rate!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="border-y border-slate-800/60 bg-slate-900/30 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
            BUILT WITH MODERN CLOUD & AI TECHNOLOGIES
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-2 hover:text-white transition-colors">Next.js 16</span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">Browserbase Cloud</span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">Google Gemini AI</span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">Playwright Engine</span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">Neon Postgres & Drizzle</span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">Stripe Billing</span>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">HOW IT WORKS</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Three steps to autonomous testing</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors">
              <span className="text-4xl font-extrabold text-blue-500/30">{s.step}</span>
              <h4 className="text-lg font-bold text-white mt-3">{s.title}</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">POWERFUL FEATURES</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Everything needed to automate QA</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h4 className="text-base font-bold text-white">{f.title}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <div className="rounded-3xl border border-blue-900/40 bg-gradient-to-b from-blue-950/60 to-slate-900/80 p-10 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to automate your web application testing?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Connect your GitHub account, let the AI agent craft your test suite, and run your first cloud test in under two minutes.
            </p>
            <div className="pt-4">
              <Link href="/workspace">
                <Button size="lg" className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 gap-2">
                  <span>Open Free Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src={"/logo-white.svg"} alt="Logo" width={120} height={30} className="h-6 w-auto opacity-80" />
            <span>© 2026 AgentQA AI Testing Automation. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-slate-400">
            <Link href="/workspace" className="hover:text-white">Workspace</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/support" className="hover:text-white">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
