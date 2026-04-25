"use client";

import { Activity, Cpu } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#00e5ff]/40 bg-[#00e5ff]/10 p-2">
            <Cpu className="h-5 w-5 text-[#00e5ff]" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#00e5ff]">
            CodeSense
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
          <Activity className="h-4 w-4 text-emerald-300" />
          <span className="text-sm font-medium text-emerald-200">Live Mode</span>
        </div>
      </div>
    </header>
  );
}
