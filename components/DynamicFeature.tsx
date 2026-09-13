"use client";

import { useEffect, useState } from "react";

export default function CurriculumCard({
  repo = "owner/repo",
  prNumber = 1,
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [nextProposal, setNextProposal] = useState<string>("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/pulls/${prNumber}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStatus(data.state);
      } catch {
        setStatus("unknown");
      }
    };
    fetchStatus();
  }, [repo, prNumber]);

  useEffect(() => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(now.getDate() + 7);
    setNextProposal(next.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
  }, []);

  const timeline = ["Created", "Open", "Checking", "Merged", "Closed", "Synced"];
  const currentIndex = timeline.indexOf(
    status === "merged" ? "Merged" :
    status === "closed" ? "Closed" :
    status === "open" ? "Open" :
    "Created"
  );

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
      <div className="mb-4 flex items-center gap-1" aria-live="polite">
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
        <button
          type="button"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          onClick={() => setPreview(true)}
        >
          Preview
        </button>
      </div>
      <div className="mb-4 text-sm text-slate-400">
        Live PR timeline:{" "}
        {timeline.map((step, i) => (
          <span key={step} className={`flex items-center gap-1 ${i <= currentIndex ? "text-white" : "text-slate-500"}`}>
            {step}
            {i < timeline.length - 1 && <span>→</span>}
          </span>
        ))}
      </div>
      <div className="mb-2 text-sm text-slate-400">
        Next improvement proposal: {nextProposal}
      </div>
      <div className="mt-4 text-xs text-slate-400">Built by AI</div>

      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Preview of AI Design Journal</h3>
            <div className="border rounded p-4">
              <h4 className="text-lg font-medium mb-2">AI Design Journal</h4>
              <p className="text-sm text-gray-700">
                Record design decisions and let AI auto-generate a visual change log to keep your team aligned.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={() => setPreview(false)}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}