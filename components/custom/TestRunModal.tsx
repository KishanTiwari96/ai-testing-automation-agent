"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Terminal,
  XCircle,
  Camera,
  Copy,
  Check,
} from "lucide-react";

export type RunModalData = {
  testCaseName: string;
  status: "running" | "passed" | "failed";
  duration?: number;
  logs: Array<{ timestamp: string; level: string; message: string }>;
  screenshotUrl?: string | null;
  liveUrl?: string | null;
  errorMessage?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: RunModalData | null;
};

export default function TestRunModal({ isOpen, onClose, data }: Props) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const isRunning = data.status === "running";
  const isPassed = data.status === "passed";
  const isFailed = data.status === "failed";

  const copyLogs = () => {
    const text = data.logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto bg-slate-950 text-slate-100 border-slate-800 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  isRunning
                    ? "bg-blue-500/20 text-blue-400"
                    : isPassed
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {isRunning ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPassed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-white">
                  {data.testCaseName}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isRunning
                        ? "bg-blue-900/60 text-blue-300 border border-blue-700/50"
                        : isPassed
                        ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                        : "bg-rose-900/60 text-rose-300 border border-rose-700/50"
                    }`}
                  >
                    {data.status}
                  </span>
                  {data.duration !== undefined && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" />
                      {(data.duration / 1000).toFixed(2)}s
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>

            {data.liveUrl && (
              <a
                href={data.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors"
              >
                <span>Browserbase Live</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </DialogHeader>

        {/* Error Banner */}
        {isFailed && data.errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-sm">
            <span className="font-semibold text-rose-400">Failure Reason: </span>
            {data.errorMessage}
          </div>
        )}

        {/* Terminal Execution Logs */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-slate-400" />
              <span>Execution Telemetry & Playwright Logs</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyLogs}
              className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" /> Copy Logs
                </>
              )}
            </Button>
          </div>

          <div className="bg-black/90 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-72 overflow-y-auto space-y-1.5 select-text shadow-inner">
            {data.logs.length === 0 ? (
              <div className="text-slate-500 italic flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                Waiting for execution telemetry...
              </div>
            ) : (
              data.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                  <span
                    className={
                      log.level === "success"
                        ? "text-emerald-400 font-semibold"
                        : log.level === "error"
                        ? "text-rose-400 font-semibold"
                        : log.level === "warn"
                        ? "text-amber-300"
                        : "text-slate-300"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Screenshot View if available */}
        {data.screenshotUrl && (
          <div className="mt-4 border border-slate-800 rounded-xl p-3 bg-slate-900/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Camera className="h-3.5 w-3.5 text-indigo-400" />
              <span>Browser Snapshot</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.screenshotUrl}
              alt="Test execution snapshot"
              className="w-full rounded-lg border border-slate-700 max-h-60 object-cover object-top"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Close Console
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
