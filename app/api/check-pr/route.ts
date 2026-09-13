import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

function getPullRequestNumber(prUrl: string) {
  const match = prUrl.match(/\/pull\/(\d+)(?:$|[/?#])/);
  return match ? Number(match[1]) : null;
}

export async function POST(request: Request) {
  try {
    const { prUrl } = (await request.json()) as { prUrl?: string };
    const number = prUrl ? getPullRequestNumber(prUrl) : null;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!number || !owner || !repo || !token) {
      return NextResponse.json({ error: "A valid pull request and GitHub configuration are required." }, { status: 400 });
    }

    const octokit = new Octokit({ auth: token });
    const pullRequest = await octokit.pulls.get({ owner, repo, pull_number: number });
    const mergedAndClosed = Boolean(pullRequest.data.merged_at) && pullRequest.data.state === "closed";

    return NextResponse.json({
      mergedAndClosed,
      state: pullRequest.data.state,
      mergedAt: pullRequest.data.merged_at,
      message: mergedAndClosed
        ? "Pull request successfully merged and closed. You're all set — the branch has been merged."
        : pullRequest.data.state === "closed"
          ? "The pull request is closed but has not been merged."
          : "Waiting for the pull request to be merged and closed.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check pull request status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
