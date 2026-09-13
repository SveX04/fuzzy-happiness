import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

async function git(repoPath: string, args: string[]) {
  return execFileAsync("git", ["-C", repoPath, ...args], {
    cwd: repoPath,
    maxBuffer: 1024 * 1024,
  });
}

export async function POST() {
  try {
    const repoPath = process.cwd();
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
