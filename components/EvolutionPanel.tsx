"use client";

import { useEffect, useState } from "react";

type UpdateRecord = {
  id: string;
  prompt: string;
  createdAt: string;
  branchName?: string;
  prUrl?: string;
};

const STORAGE_KEY = "evolution-update-history";

export default function EvolutionPanel() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingMerge, setIsCheckingMerge] = useState(false);
  const [mergeStatus, setMergeStatus] = useState<"unknown" | "mergeable" | "not-mergeable">("unknown");
  const [mergeMessage, setMergeMessage] = useState("");
  const [syncText, setSyncText] = useState("");
  const [updates, setUpdates] = useState<UpdateRecord[]>([]);

  useEffect(() => {
    try {
      const savedUpdates = localStorage.getItem(STORAGE_KEY);
      if (savedUpdates) {
        setUpdates(JSON.parse(savedUpdates) as UpdateRecord[]);
      }
    } catch {
      // Ignore invalid local storage data and fall back to the empty history.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  }, [updates]);

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
      const result = (await response.json()) as {
        error?: string;
        branchName?: string;
        prUrl?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to evolve the feature.");
      }

      const newUpdate: UpdateRecord = {
        id: result.branchName ?? `manual-${Date.now()}`,
        prompt: prompt.trim(),
        createdAt: new Date().toISOString(),
        branchName: result.branchName,
        prUrl: result.prUrl,
      };

      setUpdates((previousUpdates) => [newUpdate, ...previousUpdates]);
      setStatus("Pull request created successfully. Each update now lives in its own slot.");
      setPrompt("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to evolve the feature.");
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  }

  async function checkMergeability() {
    setIsCheckingMerge(true);
    setError("");
    setMergeMessage("Checking whether git can safely rebase and merge...");
    setMergeStatus("unknown");

    try {
      const response = await fetch("/api/check-merge", { method: "POST" });
      const result = (await response.json()) as {
        mergeable?: boolean;
        message?: string;
      };

      if (!response.ok || result.mergeable === undefined) {
        throw new Error(result.message ?? "Unable to check merge status.");
      }

      setMergeStatus(result.mergeable ? "mergeable" : "not-mergeable");
      setMergeMessage(result.message ?? "Mergeability status unknown.");
    } catch (requestError) {
      setMergeStatus("not-mergeable");
      setMergeMessage(
        requestError instanceof Error ? requestError.message : "Mergeability check failed.",
      );
    } finally {
      setIsCheckingMerge(false);
    }
  }

  async function syncMainBranch() {
    if (mergeStatus !== "mergeable") {
      setError("This branch is not mergeable yet. Run the merge check first.");
      return;
    }

    setIsSyncing(true);
    setError("");
    setSyncText("");
    setStatus("Saving local changes, rebasing, and pushing main branch...");

    try {
      const response = await fetch("/api/sync-main", { method: "POST" });
      const result = (await response.json()) as {
        error?: string;
        pullOutput?: string;
        pushOutput?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to sync main branch.");
      }

      const output = [result.pullOutput, result.pushOutput].filter(Boolean).join("\n");
      setSyncText(output || "Main branch is synced and pushed.");
      setStatus("Main branch was successfully rebased and pushed.");
      setMergeStatus("unknown");
      setMergeMessage("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sync main branch.");
      setSyncText("");
      setStatus("");
    } finally {
      setIsSyncing(false);
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
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={triggerEvolution}
          disabled={isLoading || !prompt.trim()}
          className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? "Evolving Code..." : "Submit AI Task"}
        </button>

        <button
          type="button"
          onClick={checkMergeability}
          disabled={isCheckingMerge}
          className="rounded-md border border-slate-300 bg-white px-6 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isCheckingMerge ? "Checking mergeability..." : "Check git mergeability"}
        </button>

        <button
          type="button"
          onClick={syncMainBranch}
          disabled={isSyncing || mergeStatus !== "mergeable"}
          className="rounded-md border border-slate-300 bg-white px-6 py-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSyncing ? "Saving and syncing main..." : "Commit, rebase, and push main"}
        </button>
      </div>

      {mergeMessage && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              mergeStatus === "mergeable"
                ? "bg-emerald-100 text-emerald-700"
                : mergeStatus === "not-mergeable"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {mergeStatus === "mergeable"
              ? "Mergeable"
              : mergeStatus === "not-mergeable"
                ? "Not mergeable"
                : "Checking"}
          </span>
          <p className="text-sm text-gray-700">{mergeMessage}</p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-700" role="alert">Failed: {error}</p>}
      {status && <p className="mt-4 text-sm text-gray-700" role="status">{status}</p>}
      {syncText && (
        <pre className="mt-3 overflow-x-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100 whitespace-pre-wrap">
          {syncText}
        </pre>
      )}

      {updates.length > 0 && (
        <div className="mt-6" aria-live="polite">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-600">Update history</h3>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {updates.length} total
            </span>
          </div>

          <div className="relative space-y-4 before:absolute before:left-[12px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-indigo-200">
            {updates.map((update, index) => (
              <article
                key={update.id}
                className="relative rounded-xl border border-slate-200 bg-white p-4 pl-10 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="absolute left-0 top-5 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
                  {updates.length - index}
                </div>

                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Evolution #{updates.length - index}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(update.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm leading-6 text-gray-800">{update.prompt}</p>

                {update.branchName && (
                  <p className="mt-3 text-xs text-gray-500">Branch: {update.branchName}</p>
                )}

                {update.prUrl ? (
                  <a
                    href={update.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Open pull request →
                  </a>
                ) : (
                  <p className="mt-3 text-xs text-gray-500">Waiting for GitHub PR link…</p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
