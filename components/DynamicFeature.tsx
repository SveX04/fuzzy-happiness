"use client";

import { useState } from "react";

export default function DynamicFeature() {
  const [rating, setRating] = useState(0);
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="my-6 rounded-xl border border-slate-700 bg-slate-800 p-8 text-white shadow-lg">
      <h2 className="mb-2 text-2xl font-bold">Version 1.0 Feature</h2>
      <p className="mb-6 text-slate-300">
        This is a starter component. Enter a prompt below to make the AI agent redesign or extend this component automatically.
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
      <button
        type="button"
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
      >
        Get Started
      </button>
    </div>
  );
}