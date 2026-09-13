import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const execFileAsync = promisify(execFile);

async function git(repoPath: string, args: string[]) {
  return execFileAsync("git", ["-C", repoPath, ...args], {
    cwd: repoPath,
    maxBuffer: 1024 * 1024,
  });
}

function getPullRequestNumber(prUrl: string) {
  const match = prUrl.match(/\/pull\/(\d+)(?:$|[/?#])/);
  return match ? Number(match[1]) : null;
}

export async function POST(request: Request) {
  try {
    const repoPath = process.cwd();
    const requestBody = (await request.json()) as { prUrl?: string };
    const prNumber = requestBody.prUrl ? getPullRequestNumber(requestBody.prUrl) : null;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!prNumber || !owner || !repo || !token) {
      return NextResponse.json(
        { error: "Wait for a valid pull request to be merged and closed before syncing main." },
        { status: 400 },
      );
    }

    const octokit = new Octokit({ auth: token });
    const pullRequest = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
    if (!pullRequest.data.merged_at || pullRequest.data.state !== "closed") {
      return NextResponse.json(
        { error: "The pull request must be successfully merged and closed before syncing main." },
        { status: 409 },
      );
    }

    const statusResult = await git(repoPath, ["status", "--porcelain"]);
    const output: string[] = [];

    if (statusResult.stdout.trim()) {
      await git(repoPath, ["add", "-A"]);
      const commitResult = await git(repoPath, [
        "commit",
        "-m",
        "chore: save website updates before syncing main",
      ]);
      output.push(commitResult.stdout.trim());
    } else {
      output.push("No local changes needed a commit.");
    }

    const pullResult = await git(repoPath, ["pull", "--rebase", "origin", "main"]);
    output.push(pullResult.stdout.trim());

    const pushResult = await git(repoPath, ["push", "origin", "main"]);
    output.push(pushResult.stdout.trim());

    return NextResponse.json({
      success: true,
      pullOutput: output.filter(Boolean).join("\n"),
      pushOutput: "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Git sync failed.";
    const details =
      typeof error === "object" && error !== null && "stderr" in error && typeof error.stderr === "string"
        ? error.stderr.trim()
        : "";

    return NextResponse.json(
      {
        error: `${message}${details ? `\n${details}` : ""}`,
      },
      { status: 500 },
    );
  }
}
