"use client";

import { useState } from "react";

export default function DynamicFeature() {
  const [rating, setRating] = useState(0);
  const [dark, setDark] = useState(false);
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const link = "https://example.com";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copied!");
    } catch {
      alert("Failed to copy");
    }
  };

  return (
    <div className={`my-6 rounded-xl border ${dark ? "border-slate-300" : "border-slate-700"} bg-${dark ? "slate-900" : "slate-800"} p-8 text-${dark ? "white" : "white"} shadow-lg transition-colors`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Version 1.1 Feature</h2>
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
        This component evolves with each update. Enter a prompt below to let the AI agent redesign or extend it automatically.
      </p>
      <div className="mb-4 flex items-center gap-1">
        {stars.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
            className={`rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              rating >= s ? "text-yellow-400" : "text-slate-500"
            }`}
            onClick={() => setRating(s)}
          >
            ★
          </button>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Explore Now
        </button>
        <button
          type="button"
          className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          onClick={copyLink}
        >
          Copy URL
        </button>
      </div>
      <div className="mt-4 text-xs text-slate-400">
        Built by AI
      </div>
    </div>
  );
}