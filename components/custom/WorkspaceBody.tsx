"use client";

import { UserDetailContext } from "@/context/UserDetailContext";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import EmptyWorkspace from "./EmptyWorkspace";
import { useRouter } from "next/navigation";
import axios from "axios";
import RepoDialog from "./RepoDialog";
import UserRepoList from "./UserRepoList";
import Link from "next/link";
import { Coins, CheckCircle2, ArrowRight, LogOut, RefreshCw, Github } from "lucide-react";

export type UserRepo = {
  id: number;
  repoId: number;
  name: string;
  fullName: string;
  private: number | boolean;
  htmlUrl: string;
  description: string | null;
  userId: number;
  updated_at?: string;
  language?: string | null;
  defaultBranch?: string | null;
  owner: string;
  baseUrl?: string | null;
  createdAt?: string;
};

export type GitHubUser = {
  id: number;
  login: string;
  name: string;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos?: number;
  totalPrivateRepos?: number;
};

function WorkspaceBody() {
  const { userDetail } = useContext(UserDetailContext);
  const router = useRouter();

  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [token, setToken] = useState("");
  const [userRepoList, setUserRepoList] = useState<UserRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    GetGithubUser();
  }, []);

  useEffect(() => {
    if (userDetail) {
      GetUserAddedRepoList();
    }
  }, [userDetail]);

  const GetGithubUser = async () => {
    try {
      const result = await axios.get("/api/github/user");
      if (result.data?.authenticated && result.data?.user) {
        setGithubUser(result.data.user);
        setToken(result.data.token || "connected");
      } else {
        setGithubUser(null);
        setToken("");
      }
    } catch (err) {
      console.warn("Could not retrieve GitHub user info:", err);
      // Fallback check token route
      try {
        const tokenRes = await axios.get("/api/github/token");
        if (tokenRes.data?.token) {
          setToken(tokenRes.data.token);
        }
      } catch {}
    }
  };

  const OnAddRepo = async () => {
    router.push("/api/github");
  };

  const handleDisconnectGithub = async () => {
    if (!confirm("Are you sure you want to disconnect your GitHub account?")) return;
    try {
      setDisconnecting(true);
      await axios.delete("/api/github/user");
      setGithubUser(null);
      setToken("");
    } catch (err) {
      console.error("Failed to disconnect:", err);
    } finally {
      setDisconnecting(false);
    }
  };

  const GetUserAddedRepoList = async () => {
    try {
      setLoading(true);
      const result = await axios.get("/api/user-repo?userId=" + userDetail?.id);
      setUserRepoList(result.data || []);
    } catch (err) {
      console.error("Error fetching user repos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Test Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated Playwright test generation and real-time cloud execution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/80 rounded-xl px-3.5 py-1.5 shadow-2xs">
            <Coins className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-950">
              Credits:{" "}
              <span className="font-bold text-blue-600">
                {userDetail?.credits !== undefined ? userDetail.credits : "..."}
              </span>
            </span>
          </div>

          <Link href="/pricing">
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-slate-200 hover:bg-slate-50 gap-1"
            >
              <span>Buy Credits</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* GitHub Integration Card */}
      <Card className="border border-slate-200 shadow-xs rounded-2xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {githubUser?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={githubUser.avatarUrl}
                alt={githubUser.login}
                className="h-13 w-13 rounded-2xl border-2 border-white/20 object-cover shadow-md"
              />
            ) : (
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                <Image
                  src={"/github.png"}
                  alt="github"
                  width={32}
                  height={32}
                  className="brightness-200"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {githubUser ? githubUser.name || githubUser.login : "GitHub Integration"}
                </h2>
                {token || githubUser ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Connected
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-slate-300 mt-0.5">
                {githubUser ? (
                  <span>
                    Logged in as{" "}
                    <a
                      href={githubUser.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-400 hover:underline"
                    >
                      @{githubUser.login}
                    </a>
                  </span>
                ) : token ? (
                  "GitHub connected. Add repositories below to start automated QA."
                ) : (
                  "Connect your GitHub account to access repositories and begin automated testing."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {token || githubUser ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnectGithub}
                  disabled={disconnecting}
                  className="text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Disconnect</span>
                </Button>
                <RepoDialog setRefreshPage={() => GetUserAddedRepoList()} />
              </>
            ) : (
              <Button
                onClick={OnAddRepo}
                className="cursor-pointer bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs px-4 h-9 gap-1.5"
              >
                <Github className="h-4 w-4" />
                <span>Connect GitHub</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Repository List or Empty State */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading workspace repositories...</span>
        </div>
      ) : userRepoList.length === 0 ? (
        <Card className="mt-8 border border-slate-200 rounded-2xl shadow-xs">
          <CardContent className="p-8">
            <EmptyWorkspace onConnect={!token ? OnAddRepo : undefined} />
          </CardContent>
        </Card>
      ) : (
        <UserRepoList repoList={userRepoList} onRefreshRepos={GetUserAddedRepoList} />
      )}
    </div>
  );
}

export default WorkspaceBody;
