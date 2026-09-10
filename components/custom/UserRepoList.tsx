"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { UserRepo } from "./WorkspaceBody";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import {
  CheckCircle2,
  ListChecks,
  Sparkles,
  TrendingUp,
  XCircle,
  Play,
  Globe,
  Loader2,
  Trash2,
  RefreshCw,
  Search,
  Check,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axios from "axios";
import { UserDetailContext } from "@/context/UserDetailContext";
import TestCaseCard, { TestCaseItem } from "./TestCaseCard";
import TestRunModal, { RunModalData } from "./TestRunModal";
import AddTestCaseDialog from "./AddTestCaseDialog";

type Props = {
  repoList: UserRepo[];
  onRefreshRepos: () => void;
};

export default function UserRepoList({ repoList, onRefreshRepos }: Props) {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  // Per-repo state stores
  const [repoTests, setRepoTests] = useState<Record<number, TestCaseItem[]>>({});
  const [loadingTests, setLoadingTests] = useState<Record<number, boolean>>({});
  const [generatingAi, setGeneratingAi] = useState<Record<number, boolean>>({});
  const [runningAll, setRunningAll] = useState<Record<number, boolean>>({});
  const [baseUrls, setBaseUrls] = useState<Record<number, string>>({});
  const [savingBaseUrl, setSavingBaseUrl] = useState<Record<number, boolean>>({});
  const [urlSavedSuccess, setUrlSavedSuccess] = useState<Record<number, boolean>>({});
  const [filterStatus, setFilterStatus] = useState<Record<number, string>>({});
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});

  // Live Test Run modal state
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [runModalData, setRunModalData] = useState<RunModalData | null>(null);

  // Initialize baseUrls
  useEffect(() => {
    const initialUrls: Record<number, string> = {};
    repoList.forEach((r: any) => {
      initialUrls[r.id] = r.baseUrl || "http://localhost:3000";
    });
    setBaseUrls((prev) => ({ ...initialUrls, ...prev }));
  }, [repoList]);

  const fetchRepoTests = async (repoId: number) => {
    try {
      setLoadingTests((prev) => ({ ...prev, [repoId]: true }));
      const res = await axios.get(`/api/test-cases?repoId=${repoId}`);
      setRepoTests((prev) => ({ ...prev, [repoId]: res.data }));
    } catch (err) {
      console.error(`Failed to fetch test cases for repo ${repoId}:`, err);
    } finally {
      setLoadingTests((prev) => ({ ...prev, [repoId]: false }));
    }
  };

  const handleGenerateAiTests = async (repo: UserRepo) => {
    try {
      setGeneratingAi((prev) => ({ ...prev, [repo.id]: true }));
      const baseUrl = baseUrls[repo.id] || "http://localhost:3000";

      const res = await axios.post("/api/ai/generate-tests", {
        repoId: repo.id,
        userId: userDetail?.id,
        baseUrl,
      });

      if (res.data.remainingCredits !== undefined && userDetail) {
        setUserDetail({ ...userDetail, credits: res.data.remainingCredits });
      }

      await fetchRepoTests(repo.id);
    } catch (err: any) {
      console.error("AI Generation error:", err);
      alert(err.response?.data?.error || "Failed to generate AI test cases");
    } finally {
      setGeneratingAi((prev) => ({ ...prev, [repo.id]: false }));
    }
  };

  const handleRunAllTests = async (repoId: number) => {
    try {
      setRunningAll((prev) => ({ ...prev, [repoId]: true }));

      setRunModalData({
        testCaseName: `Batch Suite Execution (All Tests)`,
        status: "running",
        logs: [
          {
            timestamp: new Date().toISOString().substring(11, 23),
            level: "info",
            message: "Starting full test suite execution in parallel...",
          },
        ],
      });
      setRunModalOpen(true);

      const res = await axios.post("/api/test-runs/run", {
        repoId,
        userId: userDetail?.id,
        runAll: true,
      });

      if (res.data.remainingCredits !== undefined && userDetail) {
        setUserDetail({ ...userDetail, credits: res.data.remainingCredits });
      }

      const results = res.data.results || [];
      const failedCount = results.filter((r: any) => r.status === "failed").length;
      const allLogs = results.flatMap((r: any) => r.logs || []);

      setRunModalData({
        testCaseName: `Batch Suite Execution (${results.length} Tests)`,
        status: failedCount > 0 ? "failed" : "passed",
        logs: allLogs,
        errorMessage: failedCount > 0 ? `${failedCount} of ${results.length} test cases failed` : null,
      });

      await fetchRepoTests(repoId);
    } catch (err: any) {
      console.error("Run all tests error:", err);
      setRunModalData({
        testCaseName: "Batch Suite Execution",
        status: "failed",
        logs: [{ timestamp: new Date().toISOString().substring(11, 23), level: "error", message: err.response?.data?.error || err.message }],
        errorMessage: err.response?.data?.error || "Batch execution failed",
      });
      await fetchRepoTests(repoId);
    } finally {
      setRunningAll((prev) => ({ ...prev, [repoId]: false }));
    }
  };

  const handleSaveBaseUrl = async (repoId: number) => {
    try {
      setSavingBaseUrl((prev) => ({ ...prev, [repoId]: true }));
      const url = baseUrls[repoId] || "http://localhost:3000";
      await axios.put(`/api/user-repo/${repoId}`, { baseUrl: url });
      setUrlSavedSuccess((prev) => ({ ...prev, [repoId]: true }));
      setTimeout(() => {
        setUrlSavedSuccess((prev) => ({ ...prev, [repoId]: false }));
      }, 2500);
    } catch (err) {
      console.error("Failed to save base URL:", err);
    } finally {
      setSavingBaseUrl((prev) => ({ ...prev, [repoId]: false }));
    }
  };

  const handleDeleteRepo = async (repoId: number) => {
    if (!confirm("Are you sure you want to remove this repository and all its test cases?")) return;
    try {
      await axios.delete(`/api/user-repo/${repoId}`);
      onRefreshRepos();
    } catch (err) {
      console.error("Failed to delete repository:", err);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
          CONNECTED REPOSITORIES ({repoList.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefreshRepos}
          className="text-xs text-slate-500 hover:text-slate-900 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Repos</span>
        </Button>
      </div>

      <div className="space-y-4">
        {repoList.map((repo) => {
          const tests = repoTests[repo.id] || [];
          const totalTests = tests.length;
          const passedTests = tests.filter((t) => t.status === "passed").length;
          const failedTests = tests.filter((t) => t.status === "failed").length;
          const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

          const currentFilter = filterStatus[repo.id] || "ALL";
          const query = (searchQueries[repo.id] || "").trim().toLowerCase();

          const filteredTests = tests.filter((t) => {
            if (currentFilter !== "ALL" && t.status?.toUpperCase() !== currentFilter) {
              return false;
            }
            if (query && !t.name.toLowerCase().includes(query) && !t.type.toLowerCase().includes(query)) {
              return false;
            }
            return true;
          });

          return (
            <Accordion
              type="single"
              collapsible
              key={repo.id}
              className="border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden"
              onValueChange={(val) => {
                if (val && !repoTests[repo.id]) {
                  fetchRepoTests(repo.id);
                }
              }}
            >
              <AccordionItem value={`repo-${repo.id}`} className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-4 text-left w-full pr-4">
                    <div className="h-11 w-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <Image
                        src={"/github.png"}
                        alt="github"
                        width={28}
                        height={28}
                        className="opacity-90"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 truncate text-base">
                          {repo.fullName}
                        </h3>
                        {repo.private ? (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Private
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Branch: <span className="font-medium text-slate-700">{repo.defaultBranch || "main"}</span>
                        {repo.language && ` • ${repo.language}`}
                        {totalTests > 0 && ` • ${totalTests} test cases (${passRate}% pass rate)`}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-100">
                  <div className="space-y-6">
                    {/* Analytics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                      <StatusCard
                        title="Total Tests"
                        value={totalTests}
                        icon={<ListChecks className="h-4 w-4 text-blue-600" />}
                        bgColor="bg-blue-50"
                      />
                      <StatusCard
                        title="Passed"
                        value={passedTests}
                        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        bgColor="bg-emerald-50"
                      />
                      <StatusCard
                        title="Failed"
                        value={failedTests}
                        icon={<XCircle className="h-4 w-4 text-rose-600" />}
                        bgColor="bg-rose-50"
                      />
                      <StatusCard
                        title="Pass Rate"
                        value={`${passRate}%`}
                        icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
                        bgColor="bg-purple-50"
                      />
                    </div>

                    {/* Target Base URL Settings Bar */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">Target Base URL for Browserbase</p>
                          <p className="text-[11px] text-slate-500">The staging or production URL to test against</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                          value={baseUrls[repo.id] ?? "http://localhost:3000"}
                          onChange={(e) =>
                            setBaseUrls((prev) => ({ ...prev, [repo.id]: e.target.value }))
                          }
                          placeholder="https://my-app.vercel.app or http://localhost:3000"
                          className="h-8 text-xs bg-white w-full sm:w-64"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveBaseUrl(repo.id)}
                          disabled={savingBaseUrl[repo.id]}
                          className="h-8 text-xs shrink-0"
                        >
                          {savingBaseUrl[repo.id] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : urlSavedSuccess[repo.id] ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                              Saved
                            </>
                          ) : (
                            "Save URL"
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* AI Generator CTA Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-100 rounded-xl p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <h3 className="font-semibold text-slate-900 text-sm">
                            Generate Context-Aware Playwright Tests
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Scans repository files and routes to craft automated test cases with step-by-step assertions. (50 credits)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          onClick={() => handleGenerateAiTests(repo)}
                          disabled={generatingAi[repo.id]}
                          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs text-xs h-9"
                        >
                          {generatingAi[repo.id] ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>AI Analyzing & Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Generate Test Cases</span>
                            </>
                          )}
                        </Button>

                        {totalTests > 0 && (
                          <Button
                            onClick={() => handleRunAllTests(repo.id)}
                            disabled={runningAll[repo.id]}
                            variant="secondary"
                            className="gap-1.5 text-xs h-9 bg-slate-900 text-white hover:bg-slate-800"
                          >
                            {runningAll[repo.id] ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Running Suite...</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5 fill-current" />
                                <span>Run All Tests</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Test Cases Controls & List */}
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200/60 text-xs">
                            {["ALL", "PASSED", "FAILED", "PENDING"].map((st) => (
                              <button
                                key={st}
                                onClick={() =>
                                  setFilterStatus((prev) => ({ ...prev, [repo.id]: st }))
                                }
                                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                                  currentFilter === st
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <Input
                              placeholder="Filter test cases..."
                              value={searchQueries[repo.id] || ""}
                              onChange={(e) =>
                                setSearchQueries((prev) => ({
                                  ...prev,
                                  [repo.id]: e.target.value,
                                }))
                              }
                              className="h-8 pl-8 text-xs w-44 sm:w-56"
                            />
                          </div>

                          <AddTestCaseDialog
                            repoId={repo.id}
                            onAdded={() => fetchRepoTests(repo.id)}
                          />
                        </div>
                      </div>

                      {loadingTests[repo.id] ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <p className="text-xs">Loading test cases...</p>
                        </div>
                      ) : filteredTests.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          <p className="text-xs text-slate-500">
                            {totalTests === 0
                              ? "No test cases generated yet. Click 'Generate Test Cases' or 'Add Custom Test' to begin!"
                              : "No test cases matched your filter criteria."}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {filteredTests.map((tc) => (
                            <TestCaseCard
                              key={tc.id}
                              testCase={tc}
                              repoId={repo.id}
                              userId={userDetail?.id}
                              baseUrl={baseUrls[repo.id] || "http://localhost:3000"}
                              onRefresh={() => fetchRepoTests(repo.id)}
                              onOpenRunModal={(data) => {
                                setRunModalData(data);
                                setRunModalOpen(true);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Repo Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs text-slate-400">
                      <span>Repository ID: #{repo.id}</span>
                      <button
                        onClick={() => handleDeleteRepo(repo.id)}
                        className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium hover:underline cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove Repository
                      </button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>

      {/* Execution Telemetry Modal */}
      <TestRunModal
        isOpen={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        data={runModalData}
      />
    </div>
  );
}

function StatusCard({
  title,
  value,
  icon,
  bgColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between bg-white shadow-2xs">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <h3 className="text-xl font-bold text-slate-900 mt-0.5">{value}</h3>
      </div>
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${bgColor}`}>
        {icon}
      </div>
    </div>
  );
}
