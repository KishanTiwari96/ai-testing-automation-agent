"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Edit3 } from "lucide-react";
import axios from "axios";
import { TestCaseItem } from "./TestCaseCard";

type Props = {
  testCase: TestCaseItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditTestCaseDialog({
  testCase,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const [name, setName] = useState(testCase.name);
  const [description, setDescription] = useState(testCase.description || "");
  const [type, setType] = useState(testCase.type || "UI");
  const [targetUrl, setTargetUrl] = useState(testCase.targetUrl || "/");
  const [stepsText, setStepsText] = useState("");
  const [script, setScript] = useState(testCase.script || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync state when testCase or modal state changes
  useEffect(() => {
    if (isOpen) {
      setName(testCase.name);
      setDescription(testCase.description || "");
      setType(testCase.type || "UI");
      setTargetUrl(testCase.targetUrl || "/");
      setScript(testCase.script || "");
      setError("");

      let stepsArr: string[] = [];
      if (Array.isArray(testCase.steps)) {
        stepsArr = testCase.steps;
      } else if (typeof testCase.steps === "string") {
        try {
          stepsArr = JSON.parse(testCase.steps);
        } catch {
          stepsArr = [testCase.steps];
        }
      }
      setStepsText(stepsArr.join("\n"));
    }
  }, [isOpen, testCase]);

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

      await axios.put(`/api/test-cases/${testCase.id}`, {
        name,
        description,
        type,
        targetUrl,
        steps,
        script,
      });

      onUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error updating test case:", err);
      setError(err.response?.data?.error || "Failed to update test case");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                Edit Test Case
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Modify scenario parameters, target routes, steps, or automation script.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 font-medium">
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

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Update Test Case"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
