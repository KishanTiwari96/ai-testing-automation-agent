"use client";

import React, { Suspense, useContext, useState } from "react";
import WorkspaceHeader from "@/components/custom/WorkspaceHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Zap, HelpCircle, Loader2 } from "lucide-react";
import { UserDetailContext } from "@/context/UserDetailContext";
import axios from "axios";
import { useSearchParams } from "next/navigation";

function PricingContent() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const demoSuccess = searchParams.get("demo_success");
  const creditsParam = searchParams.get("credits");

  const plans = [
    {
      id: "starter",
      name: "Starter Pack",
      price: 10,
      credits: 1000,
      description: "Perfect for indie developers testing side projects and small web apps.",
      popular: false,
      features: [
        "1,000 Automation Credits",
        "~20 Full AI Test Suite Generations",
        "~100 Individual Browserbase Cloud Runs",
        "Playwright Script Code Export",
        "Standard Execution Speed",
        "GitHub Repository Sync",
      ],
    },
    {
      id: "pro",
      name: "Pro Automation",
      price: 29,
      credits: 5000,
      description: "Ideal for growing teams and active full-stack applications.",
      popular: true,
      features: [
        "5,000 Automation Credits",
        "~100 Full AI Test Suite Generations",
        "~500 Browserbase Cloud Runs",
        "Live Browser Session Inspector",
        "Automated Screenshot on Failure",
        "Parallel Test Suite Execution",
        "Priority Execution Queue",
      ],
    },
    {
      id: "enterprise",
      name: "Scale & Team",
      price: 79,
      credits: 25000,
      description: "Designed for continuous CI/CD pipelines and high-volume test suites.",
      popular: false,
      features: [
        "25,000 Automation Credits",
        "~500 Full AI Test Suite Generations",
        "~2,500 Cloud Test Runs",
        "Unlimited Parallel Sessions",
        "Full Video Session Replay",
        "Custom Playwright Assertions",
        "Dedicated Support & Custom Integrations",
      ],
    },
  ];

  const handleSubscribe = async (plan: (typeof plans)[0]) => {
    try {
      setLoadingPlan(plan.id);

      const res = await axios.post("/api/checkout/stripe", {
        planName: plan.name,
        amount: plan.price,
        credits: plan.credits,
        userId: userDetail?.id,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      alert(err.response?.data?.error || "Failed to initialize payment session");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleClaimDemoCredits = () => {
    if (userDetail && creditsParam) {
      const added = Number(creditsParam);
      setUserDetail({ ...userDetail, credits: (userDetail.credits || 0) + added });
      alert(`🎉 Successfully credited ${added} test automation credits to your account!`);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Demo Success Alert */}
      {demoSuccess && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Demo Checkout Successful!</p>
              <p className="text-xs text-emerald-700">Click to apply {creditsParam || 1000} credits to your active account balance.</p>
            </div>
          </div>
          <Button size="sm" onClick={handleClaimDemoCredits} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            Apply Credits Now
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-3">
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>Pay-As-You-Go Credits</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Flexible, Transparent Pricing
        </h1>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          Purchase testing credits whenever you need them. No surprise bills or locked contracts. Credits never expire.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col relative rounded-3xl transition-all duration-200 ${
              plan.popular
                ? "border-2 border-blue-600 shadow-xl shadow-blue-500/10 bg-white ring-4 ring-blue-50"
                : "border border-slate-200 shadow-sm bg-white hover:border-slate-300"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">{plan.name}</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1 min-h-[32px]">
                {plan.description}
              </CardDescription>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                <span className="text-xs text-slate-500 font-medium">/ one-time</span>
              </div>

              <div className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg w-fit border border-blue-100">
                {plan.credits.toLocaleString()} Credits Included
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-2 flex-1">
              <div className="border-t border-slate-100 my-3" />
              <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider">What’s included</p>
              <ul className="space-y-2.5">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={loadingPlan === plan.id}
                className={`w-full h-10 text-xs font-semibold rounded-xl transition-all ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  `Buy ${plan.credits.toLocaleString()} Credits`
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Credit Breakdown FAQ */}
      <div className="mt-20 max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">How do automation credits work?</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">AI Test Suite Generation</h4>
            <p className="font-semibold text-blue-600 text-xs">50 credits per batch</p>
            <p className="text-slate-500 text-[11px] mt-1">
              Deeply scans your repository's structure, routes, and UI components to produce tailored Playwright test cases.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Cloud Browser Test Run</h4>
            <p className="font-semibold text-emerald-600 text-xs">10 credits per test run</p>
            <p className="text-slate-500 text-[11px] mt-1">
              Launches a live browser session in Browserbase, executes assertions, tracks logs, and captures screenshots.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <WorkspaceHeader />
      <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading pricing plans...</div>}>
        <PricingContent />
      </Suspense>
    </div>
  );
}
