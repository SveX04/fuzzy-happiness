"use client";

import { useState } from "react";

export default function EvolutionPanel() {
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
      const result = (await response.json()) as { error?: string };

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
        placeholder="e.g. Add a blue Get Started button."
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        aria-label="Describe the change"
      />
      <button
        type="button"
        onClick={triggerEvolution}
        disabled={isLoading || !prompt.trim()}
        className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? "Evolving Code..." : "Submit AI Task"}
      </button>
      {error && <p className="mt-4 text-sm text-red-700" role="alert">Failed: {error}</p>}
      {status && <p className="mt-4 text-sm text-gray-700" role="status">{status}</p>}
    </section>
  );
}
