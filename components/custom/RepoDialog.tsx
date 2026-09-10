"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import axios from "axios";
import { Input } from "../ui/input";
import { UserDetailContext } from "@/context/UserDetailContext";
import { Plus, Search, Loader2, Check, Star, GitFork, RefreshCw, Lock, Globe } from "lucide-react";

export type Repo = {
  id: number;
  name: string;
  full_name: string;
  private_: boolean;
  html_url: string;
  description: string;
  updated_at: string;
  language: string;
  default_branch: string;
  owner: string;
  stars?: number;
  forks?: number;
};

function RepoDialog({ setRefreshPage }: { setRefreshPage: (refresh: boolean) => void }) {
  const [repoList, setRepoList] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { userDetail } = useContext(UserDetailContext);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      GetRepoList();
    }
  }, [isOpen]);

  const GetRepoList = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await axios.get("/api/github/repos");
      setRepoList(result.data || []);
    } catch (err: any) {
      console.error("Failed to fetch github repos:", err);
      setError(err.response?.data?.error || "Failed to load repositories from GitHub");
    } finally {
      setLoading(false);
    }
  };

  const filteredRepoList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return repoList;
    return repoList.filter(
      (r) =>
        r.full_name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.language?.toLowerCase().includes(q)
    );
  }, [searchTerm, repoList]);

  const SaveRepoToDB = async () => {
    if (!selectedRepo) return;

    try {
      setSaving(true);
      await axios.post("/api/user-repo", {
        repoId: selectedRepo.id,
        userId: userDetail?.id,
        name: selectedRepo.name,
        full_name: selectedRepo.full_name,
        private_: selectedRepo.private_,
        html_url: selectedRepo.html_url,
        description: selectedRepo.description,
        language: selectedRepo.language,
        updated_at: selectedRepo.updated_at,
        default_branch: selectedRepo.default_branch,
        owner: selectedRepo.owner,
        baseUrl: "http://localhost:3000",
      });

      setIsOpen(false);
      setSelectedRepo(null);
      setRefreshPage(true);
    } catch (err) {
      console.error("Error saving repository:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="cursor-pointer gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs text-xs font-semibold px-3.5 h-9">
            <Plus className="h-4 w-4" /> Add Repo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">Add GitHub Repository</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Select one of your repositories to import and generate AI test suites
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={GetRepoList}
                disabled={loading}
                className="h-8 text-xs text-slate-500 hover:text-slate-900 gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Reload</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-3 space-y-3 flex-1 min-h-0 flex flex-col">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search repositories by name, language, description..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Repo List */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-xs font-medium">Fetching repositories from GitHub...</p>
              </div>
            ) : filteredRepoList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/70">
                {repoList.length === 0
                  ? "No repositories found on this GitHub account."
                  : "No repositories matched your search query."}
              </div>
            ) : (
              <ul className="max-h-[320px] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 flex-1">
                {filteredRepoList.map((repo) => {
                  const isSelected = selectedRepo?.id === repo.id;
                  return (
                    <li
                      key={repo.id}
                      className={`p-3.5 hover:bg-blue-50/70 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected ? "bg-blue-50/90 border-l-4 border-l-blue-600" : ""
                      }`}
                      onClick={() => setSelectedRepo(repo)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {repo.full_name}
                          </p>
                          {repo.private_ ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              <Lock className="h-2.5 w-2.5" /> Private
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Globe className="h-2.5 w-2.5" /> Public
                            </span>
                          )}
                        </div>

                        {repo.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {repo.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                          {repo.language && (
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                              {repo.language}
                            </span>
                          )}
                          <span>Branch: {repo.default_branch || "main"}</span>
                          {(repo.stars ?? 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-slate-500">
                              <Star className="h-3 w-3 text-amber-500 fill-current" />
                              {repo.stars}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border border-slate-300 shrink-0 mt-1" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <DialogFooter className="gap-2 pt-3 border-t border-slate-100 mt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={saving}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              disabled={!selectedRepo || saving}
              onClick={SaveRepoToDB}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...
                </>
              ) : (
                "Import Repository"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RepoDialog;
