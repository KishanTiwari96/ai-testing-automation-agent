"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useContext } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";
import { Coins } from "lucide-react";

function WorkspaceHeader() {
  const pathname = usePathname();
  const { userDetail } = useContext(UserDetailContext);

  const navLinks = [
    { label: "Workspace", href: "/workspace" },
    { label: "Pricing", href: "/pricing" },
    { label: "Support & Docs", href: "/support" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/workspace" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <Image src={"/logo.svg"} alt="logo" width={160} height={40} className="h-8 w-auto" priority />
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Credits & UserButton */}
        <div className="flex items-center gap-3.5">
          {userDetail && (
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100/80 transition-colors text-xs font-semibold text-blue-800"
            >
              <Coins className="h-3.5 w-3.5 text-blue-600" />
              <span>{userDetail.credits ?? 0}</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider ml-0.5 bg-blue-200/60 px-1.5 py-0.2 rounded-md">
                + Buy
              </span>
            </Link>
          )}

          <div className="border-l border-slate-200 pl-3">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default WorkspaceHeader;
