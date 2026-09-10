"use client";

import React from "react";
import WorkspaceHeader from "@/components/custom/WorkspaceHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Key, Github, Globe, Terminal, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";

export default function SupportPage() {
  const setupSteps = [
    {
      icon: <Github className="h-5 w-5 text-slate-900" />,
      title: "1. GitHub OAuth Configuration",
      description: "Connect your GitHub account to allow the agent to discover repositories and read directory structures.",
      code: `# .env configuration\nGITHUB_CLIENT_ID=your_github_client_id\nGITHUB_CLIENT_SECRET=your_github_client_secret\nGITHUB_REDIRECT_URL=http://localhost:3000/api/github/callback`,
      link: "https://github.com/settings/developers",
      linkText: "GitHub Developer Settings",
    },
    {
      icon: <Sparkles className="h-5 w-5 text-indigo-600" />,
      title: "2. AI Test Generator Setup (Gemini / OpenAI)",
      description: "Supply a Google Gemini API Key or OpenAI Key to enable context-aware Playwright test generation.",
      code: `# .env configuration\nGEMINI_API_KEY=AIzaSy...your_gemini_api_key`,
      link: "https://aistudio.google.com/app/apikey",
      linkText: "Get Gemini API Key",
    },
    {
      icon: <Globe className="h-5 w-5 text-blue-600" />,
      title: "3. Browserbase Cloud Browser Setup",
      description: "Run automated tests inside high-speed cloud browsers with live debugging and session replays.",
      code: `# .env configuration\nBROWSERBASE_API_KEY=bb_api_...\nBROWSERBASE_PROJECT_ID=bb_proj_...`,
      link: "https://www.browserbase.com",
      linkText: "Browserbase Dashboard",
    },
    {
      icon: <Terminal className="h-5 w-5 text-emerald-600" />,
      title: "4. Setting Target Base URL for Testing",
      description: "Set the Base URL in your repository dashboard (e.g. 'http://localhost:3000' or 'https://my-app.vercel.app'). The test runner directs cloud browsers to this host.",
      code: `// Playwright script will execute against:\nawait page.goto(baseUrl + '/');`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <WorkspaceHeader />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Documentation & Setup Guide</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How to Use AI Testing Automation Agent
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            A complete walkthrough to configure API keys, generate Playwright scripts, and execute cloud browser tests.
          </p>
        </div>

        <div className="space-y-6">
          {setupSteps.map((step, idx) => (
            <Card key={idx} className="border border-slate-200 shadow-xs bg-white rounded-2xl overflow-hidden">
              <CardHeader className="p-6 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                      {step.icon}
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      {step.title}
                    </CardTitle>
                  </div>

                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>{step.linkText}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {step.description}
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-6 pt-1">
                <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre>{step.code}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support & Community Box */}
        <div className="mt-12 p-6 rounded-2xl border border-slate-200 bg-white text-center shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Need Help or Have Questions?</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Check the project documentation, inspect live Browserbase execution logs, or reach out on GitHub.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
