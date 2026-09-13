import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

async function git(args: string[]) {
  const repoPath = process.cwd();
  const result = await execFileAsync("git", ["-C", repoPath, ...args], {
    cwd: repoPath,
    maxBuffer: 1024 * 1024,
  });
  return result.stdout.toString().trim();
}

export async function POST() {
  try {
    await git(["fetch", "origin", "main"]);

    const base = await git(["merge-base", "HEAD", "origin/main"]);
    if (!base) {
      return NextResponse.json({
        mergeable: false,
        message: "There is no shared merge base between this branch and origin/main.",
      });
    }

    const mergeTree = await git(["merge-tree", base, "HEAD", "origin/main"]);
    const hasConflict = /^(<<<<<<<|=======|>>>>>>>|\|\|\|\|\|\|\|)/m.test(mergeTree);

    if (hasConflict) {
      return NextResponse.json({
        mergeable: false,
        message: "Git reports a merge conflict between this branch and origin/main.",
      });
    }

    const counts = await git(["rev-list", "--left-right", "--count", "HEAD...origin/main"]);
    const [ahead, behind] = counts.split(/\s+/).map(Number);

    return NextResponse.json({
      mergeable: true,
      message:
        ahead > 0 && behind > 0
          ? "This branch can be merged, but it has diverged from origin/main. Rebase will reconcile the differences."
          : "This branch is ready to be rebased and pushed to main.",
      ahead,
      behind,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mergeability check failed.";
    const stderr =
      typeof error === "object" && error !== null && "stderr" in error && typeof error.stderr === "string"
        ? error.stderr.trim()
        : "";

    return NextResponse.json(
      {
        mergeable: false,
        message: `${message}${stderr ? `\n${stderr}` : ""}`,
      },
      { status: 500 },
    );
  }
}
