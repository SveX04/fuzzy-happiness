"use client";

import { useEffect, useState } from "react";

export default function CurriculumCard({ repo = "owner/repo", prNumber = 1 }) {
  const [status, setStatus] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/pulls/${prNumber}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStatus(data.state); // open, closed, merged
      } catch {
        setStatus("unknown");
      }
    };
    fetchStatus();
  }, [repo, prNumber]);

  return (
    <div
      className={`my-6 rounded-xl border ${
        dark ? "border-slate-300" : "border-slate-700"
      } bg-${dark ? "slate-900" : "slate-800"} p-8 text-white shadow-lg transition-colors`}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">AI Design Journal</h2>
        <button
          type="button"
          aria-label="Toggle dark mode"
          className="rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? "🌞" : "🌙"}
        </button>
      </div>
      <p className="mb-6 text-slate-300">
        Record design decisions and let AI auto-generate a visual change log to keep your team aligned.
      </p>
      <div className="mb-4 flex items-center gap-1">
        <span className="text-sm font-medium">PR #{prNumber} status: </span>
        <span
          className={`px-2 py-1 rounded ${
            status === "merged"
              ? "bg-green-600 text-white"
              : status === "closed"
              ? "bg-red-600 text-white"
              : status === "open"
              ? "bg-blue-600 text-white"
              : "bg-gray-600 text-white"
          }`}
        >
          {status ?? "loading…"}
        </span>
      </div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Start Journal
        </button>
        <button
          type="button"
          className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Get Started
        </button>
      </div>
      <div className="mt-4 text-xs text-slate-400">Built by AI</div>
    </div>
  );
}