"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Check,
  Play,
  Loader2,
  Trash2,
  XCircle,
  Clock,
  ExternalLink,
  AlertCircle,
  Eye,
  Camera,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { RunModalData } from "./TestRunModal";
import EditTestCaseDialog from "./EditTestCaseDialog";

export type TestCaseItem = {
  id: number;
  repoId: number;
  name: string;
  description: string | null;
  type: string;
  targetUrl: string | null;
  steps: string[] | string;
  script: string;
  status: string;
  latestRun?: {
    status: string;
    duration: number | null;
    errorMessage: string | null;
    logs: any;
    screenshotUrl?: string | null;
    liveUrl?: string | null;
  } | null;
};

type Props = {
  testCase: TestCaseItem;
  repoId: number;
  userId: number;
  baseUrl: string;
  onRefresh: () => void;
  onOpenRunModal: (data: RunModalData) => void;
};

export default function TestCaseCard({
  testCase,
  repoId,
  userId,
  baseUrl,
  onRefresh,
  onOpenRunModal,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse steps
  let steps: string[] = [];
  if (Array.isArray(testCase.steps)) {
    steps = testCase.steps;
  } else if (typeof testCase.steps === "string") {
    try {
      steps = JSON.parse(testCase.steps);
    } catch {
      steps = [testCase.steps];
    }
  }

  const handleRunTest = async () => {
    try {
      setIsRunning(true);
      onOpenRunModal({
        testCaseName: testCase.name,
        status: "running",
        logs: [
          {
            timestamp: new Date().toISOString().substring(11, 23),
            level: "info",
            message: "Starting Playwright runner...",
          },
        ],
      });

      const response = await axios.post("/api/test-runs/run", {
        testCaseId: testCase.id,
        repoId,
        userId,
      });

      const result = response.data.results?.[0];
      if (result) {
        onOpenRunModal({
          testCaseName: testCase.name,
          status: result.status,
          duration: result.duration,
          logs: result.logs || [],
          screenshotUrl: result.screenshotUrl,
          liveUrl: result.liveUrl,
          errorMessage: result.errorMessage,
        });
      }
      onRefresh();
    } catch (err: any) {
      console.error("Error running test:", err);
      onOpenRunModal({
        testCaseName: testCase.name,
        status: "failed",
        logs: [
          {
            timestamp: new Date().toISOString().substring(11, 23),
            level: "error",
            message: err.response?.data?.error || err.message,
          },
        ],
        errorMessage: err.response?.data?.error || "Execution failed",
      });
      onRefresh();
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenLatestReport = () => {
    if (!testCase.latestRun) return;
    let parsedLogs = [];
    try {
      parsedLogs = typeof testCase.latestRun.logs === "string" 
        ? JSON.parse(testCase.latestRun.logs) 
        : testCase.latestRun.logs || [];
    } catch {
      parsedLogs = [];
    }

    onOpenRunModal({
      testCaseName: testCase.name,
      status: (testCase.latestRun.status as any) || "failed",
      duration: testCase.latestRun.duration || undefined,
      logs: parsedLogs,
      screenshotUrl: testCase.latestRun.screenshotUrl,
      liveUrl: testCase.latestRun.liveUrl,
      errorMessage: testCase.latestRun.errorMessage,
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this test case?")) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/api/test-cases/${testCase.id}`);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete test case:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(testCase.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    const status = testCase.status?.toLowerCase();
    if (status === "passed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" /> Passed
        </span>
      );
    }
    if (status === "failed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="h-3.5 w-3.5" /> Failed
        </span>
      );
    }
    if (status === "running") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="h-3.5 w-3.5" /> Pending
      </span>
    );
  };

  const getTypeBadge = () => {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
        {testCase.type || "UI"}
      </span>
    );
  };

  const errorMessage = testCase.latestRun?.errorMessage;

  return (
    <>
      <Card className="border border-slate-200 hover:border-slate-300 transition-all shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {getTypeBadge()}
                {getStatusBadge()}
                {testCase.targetUrl && (
                  <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {testCase.targetUrl}
                  </span>
                )}
                {testCase.latestRun?.duration && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {(testCase.latestRun.duration / 1000).toFixed(2)}s
                  </span>
                )}
              </div>

              <CardTitle className="text-base font-semibold text-slate-900 mt-1">
                {testCase.name}
              </CardTitle>

              {testCase.description && (
                <CardDescription className="text-xs text-slate-600 line-clamp-2">
                  {testCase.description}
                </CardDescription>
              )}

              {/* Prominent Failure Reason Banner right on the Card */}
              {errorMessage && (
                <div
                  onClick={handleOpenLatestReport}
                  className="mt-2.5 p-2.5 rounded-lg bg-rose-50/90 border border-rose-200/90 text-xs text-rose-900 flex items-start gap-2 cursor-pointer hover:bg-rose-100/90 transition-colors group"
                >
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-rose-950">Failure Reason</span>
                      <span className="text-[11px] font-medium text-rose-600 group-hover:underline flex items-center gap-1 shrink-0">
                        View Logs & Snapshot &rarr;
                      </span>
                    </div>
                    <p className="text-rose-800 leading-relaxed font-mono text-[11px] break-words">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-0.5">
              {testCase.latestRun && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenLatestReport}
                  className="h-8 text-xs gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700"
                  title="View last run telemetry & snapshot"
                >
                  <Eye className="h-3.5 w-3.5 text-slate-600" />
                  <span>Report</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="h-8 text-xs gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700"
                title="Edit test case parameters and script"
              >
                <Pencil className="h-3.5 w-3.5 text-slate-600" />
                <span>Edit</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScriptModalOpen(true)}
                className="h-8 text-xs gap-1.5 border-slate-200 hover:bg-slate-50"
              >
                <Code2 className="h-3.5 w-3.5 text-slate-600" />
                <span>Script</span>
              </Button>

              <Button
                size="sm"
                onClick={handleRunTest}
                disabled={isRunning}
                className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run</span>
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {steps.length > 0 && (
          <CardContent className="px-4 sm:px-5 pt-0 pb-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 py-1 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Hide Steps ({steps.length})
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> View Steps ({steps.length})
                </>
              )}
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-1.5 bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs text-slate-700">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 select-none">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Edit Test Case Modal */}
      <EditTestCaseDialog
        testCase={testCase}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={onRefresh}
      />

      {/* Script Code Modal */}
      <Dialog open={isScriptModalOpen} onOpenChange={setIsScriptModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 text-slate-100 border-slate-800 rounded-2xl p-6">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-semibold text-white">
                  Playwright Automation Script
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  {testCase.name}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyScript}
                className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" /> Copy Code
                  </>
                )}
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-3 bg-black/90 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-80 text-emerald-400 select-text">
            <pre>{testCase.script}</pre>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScriptModalOpen(false)}
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
