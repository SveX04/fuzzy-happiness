import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const FILE_PATH = "components/DynamicFeature.tsx";
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH ?? "main";
const sixtyCharacters = 60;
const systemPrompt = `Rewrite the supplied small Next.js component for the requested feature. Return only a concise, valid TSX file. Preserve the default export, use Tailwind CSS, and keep it accessible. Implement at most three small changes. No reasoning, prose, or markdown fences.`;

function cleanGeneratedCode(code: string) {
  return code
    .trim()
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^```(?:tsx|typescript|javascript|jsx)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as { prompt?: string };
    const task = prompt?.trim();

    if (!task) {
      return NextResponse.json({ error: "A feature prompt is required." }, { status: 400 });
    }

    const requiredVariables = [
      "GROQ_API_KEY",
      "GITHUB_TOKEN",
      "GITHUB_OWNER",
      "GITHUB_REPO",
    ] as const;
    const missingVariable = requiredVariables.find((name) => !process.env[name]);

    if (missingVariable) {
      return NextResponse.json(
        { error: `${missingVariable} is not configured.` },
        { status: 500 },
      );
    }

    if (process.env.GITHUB_TOKEN === "your_github_token_here") {
      return NextResponse.json(
        { error: "GITHUB_TOKEN is still a placeholder in .env.local." },
        { status: 500 },
      );
    }

    if (process.env.GROQ_API_KEY === "your_groq_api_key_here") {
      return NextResponse.json(
        { error: "GROQ_API_KEY is still a placeholder in .env.local." },
        { status: 500 },
      );
    }

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const mainRef = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${BASE_BRANCH}`,
    });
    const fileResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: FILE_PATH,
      ref: BASE_BRANCH,
    });

    if (Array.isArray(fileResponse.data) || !("content" in fileResponse.data)) {
      throw new Error(`${FILE_PATH} was not found as a file.`);
    }

    const currentCode = Buffer.from(fileResponse.data.content, "base64").toString("utf8");
    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
        temperature: 0.3,
        max_tokens: 2400,
        reasoning_effort: "low",
        reasoning_format: "hidden",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Current Code:\n${currentCode}\n\nTask:\n${task}` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const details = await aiResponse.text();
      console.error("Groq request failed:", details);
      let providerMessage = "Check GROQ_API_KEY and GROQ_MODEL.";
      try {
        const parsedDetails = JSON.parse(details) as { error?: { message?: string } };
        providerMessage = parsedDetails.error?.message ?? providerMessage;
      } catch {
        // Keep the user-facing fallback when Groq does not return JSON.
      }
      return NextResponse.json(
        { error: `Groq could not generate the feature: ${providerMessage}` },
        { status: 502 },
      );
    }

    const aiResult = (await aiResponse.json()) as {
      choices?: Array<{ finish_reason?: string; message?: { content?: string } }>;
    };
    const choice = aiResult.choices?.[0];
    const generatedCode = choice?.message?.content;
    const newCode = generatedCode ? cleanGeneratedCode(generatedCode) : "";

    if (!newCode || !/export\s+default/.test(newCode)) {
      throw new Error(
        `The AI returned invalid or incomplete component code${choice?.finish_reason === "length" ? " because the response was truncated" : ""}. Try a smaller feature request.`,
      );
    }

    const branchName = `ai-update-${Date.now()}`;
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: mainRef.data.object.sha,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: FILE_PATH,
      message: `feat(ai): ${task.slice(0, sixtyCharacters)}`,
      content: Buffer.from(newCode).toString("base64"),
      branch: branchName,
      sha: fileResponse.data.sha,
    });

    const pullRequest = await octokit.pulls.create({
      owner,
      repo,
      title: `AI evolution: ${task.slice(0, sixtyCharacters)}`,
      head: branchName,
      base: BASE_BRANCH,
      body: `Automated pull request generated by the AI agent.\n\n**Requested task:** ${task}`,
    });

    return NextResponse.json({
      success: true,
      branchName,
      prUrl: pullRequest.data.html_url,
    });
  } catch (error) {
    console.error("Evolution request failed:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 401
    ) {
      return NextResponse.json(
        { error: "GitHub rejected GITHUB_TOKEN. Replace it with a valid token and restart the dev server." },
        { status: 401 },
      );
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 409
    ) {
      return NextResponse.json(
        { error: `GitHub has no ${BASE_BRANCH} branch yet. Push an initial commit to the repository before evolving the site.` },
        { status: 409 },
      );
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 403
    ) {
      return NextResponse.json(
        { error: `GitHub denied branch creation. Update this token for ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO} with Contents: Read and write, then restart the server.` },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evolution failed." },
      { status: 500 },
    );
  }
}

