"use client";

import { useState } from "react";

export default function CurriculumCard() {
  const [rating, setRating] = useState(0);
  const [dark, setDark] = useState(false);
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const link = "https://example.com/curriculum";

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
        <h2 className="text-2xl font-bold">Personal Learning Curriculum</h2>
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
        This curriculum adapts to your progress, keeping the most relevant lessons at the top. Rate the content to help it evolve.
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
          Start Learning
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