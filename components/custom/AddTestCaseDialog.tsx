"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import axios from "axios";

type Props = {
  repoId: number;
  onAdded: () => void;
};

const DEFAULT_SCRIPT = `import { test, expect } from '@playwright/test';

test('Custom Scenario Check', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/./);
  const element = page.locator('h1, h2').first();
  await expect(element).toBeVisible();
});`;

export default function AddTestCaseDialog({ repoId, onAdded }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("UI");
  const [targetUrl, setTargetUrl] = useState("/");
  const [stepsText, setStepsText] = useState("1. Navigate to '/'\n2. Assert page is visible");
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a test case name");
      return;
    }
    if (!script.trim()) {
      setError("Please provide a Playwright script");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const steps = stepsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      await axios.post("/api/test-cases", {
        repoId,
        name,
        description,
        type,
        targetUrl,
        steps,
        script,
      });

      setIsOpen(false);
      setName("");
      setDescription("");
      setType("UI");
      setTargetUrl("/");
      setStepsText("1. Navigate to '/'\n2. Assert page is visible");
      setScript(DEFAULT_SCRIPT);
      onAdded();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add test case");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Custom Test</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Custom Test Case</DialogTitle>
          <DialogDescription>
            Create a custom Playwright test case for your repository.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Test Name *</label>
            <Input
              placeholder="e.g. Verify Checkout Flow & Cart Validation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Test Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-slate-950"
              >
                <option value="UI">UI</option>
                <option value="Navigation">Navigation</option>
                <option value="Form">Form</option>
                <option value="Auth">Auth</option>
                <option value="E2E">E2E</option>
                <option value="API">API</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Path</label>
              <Input
                placeholder="/checkout or /login"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Input
              placeholder="Brief summary of test objectives"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Steps (One per line)</label>
            <textarea
              rows={3}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              className="w-full rounded-md border border-slate-200 p-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-950"
              placeholder="1. Open page&#10;2. Check header element&#10;3. Click CTA"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Playwright Code *</label>
            <textarea
              rows={6}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950 text-emerald-400 p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-950"
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Test Case"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
