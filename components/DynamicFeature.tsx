"use client";

import { useState } from "react";

export default function DynamicFeature() {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  function toggleLike() {
    setLiked((prev) => {
      const next = !prev;
      setLikes((count) => count + (next ? 1 : -1));
      return next;
    });
  }

  return (
    <div className="my-6 rounded-xl border border-slate-700 bg-slate-800 p-8 text-white shadow-lg">
      <h2 className="mb-2 text-2xl font-bold">Version 1.0 Feature</h2>
      <p className="mb-6 text-slate-300">
        This is a starter component. Enter a prompt below to make the AI agent redesign or extend this component automatically.
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Get Started
        </button>
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? "Unlike feature" : "Like feature"}
          className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-3 text-slate-200 transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          <span aria-hidden="true" className={liked ? "text-pink-500" : "text-slate-400"}>
            {liked ? "♥" : "♡"}
          </span>
          <span>{likes}</span>
        </button>
      </div>
    </div>
  );
}

export function EvolutionPanel() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function triggerEvolution() {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");
    setStatus("AI agent is generating component code and opening a pull request...");

    try {
      const response = await fetch("/api/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const result = (await response.json()) as { code?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to evolve the feature.");
      }

      setStatus("Pull request created successfully. GitHub Actions will validate it before merging.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to evolve the feature.");
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg border bg-gray-50 p-6 shadow-sm" aria-labelledby="control-heading">
      <h2 id="control-heading" className="mb-2 text-lg font-semibold">Instruct the Website to Change Itself</h2>
      <textarea
        className="mb-4 w-full rounded-md border p-3 text-black"
        rows={3}