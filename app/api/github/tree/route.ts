import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const branch = searchParams.get("branch") || "main";

    if (!owner || !repo) {
      return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("gh_token")?.value;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.+json",
      "User-Agent": "AI-Testing-Agent",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 1. Fetch file tree
    let treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers }
    );

    // If main failed, try master
    if (!treeRes.ok && branch === "main") {
      treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        { headers }
      );
    }

    if (!treeRes.ok) {
      const errText = await treeRes.text();
      return NextResponse.json(
        { error: `GitHub API error: ${treeRes.statusText}`, details: errText },
        { status: treeRes.status }
      );
    }

    const treeData = await treeRes.json();
    const tree = treeData.tree || [];

    // Filter key project files for context
    const keyPaths = tree
      .filter(
        (f: any) =>
          f.type === "blob" &&
          (f.path.endsWith("package.json") ||
            f.path.includes("page.tsx") ||
            f.path.includes("page.jsx") ||
            f.path.includes("page.js") ||
            f.path.includes("App.tsx") ||
            f.path.includes("App.jsx") ||
            f.path.includes("index.html") ||
            f.path.includes("routes") ||
            f.path.includes("components/"))
      )
      .slice(0, 15)
      .map((f: any) => f.path);

    // Fetch contents of up to 4 key files (e.g. package.json, main page)
    const sampleFiles: Record<string, string> = {};
    const priorityFiles = keyPaths.filter(
      (p: string) => p.endsWith("package.json") || p.includes("page.") || p.includes("App.")
    ).slice(0, 3);

    for (const filePath of priorityFiles) {
      try {
        const fileRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
          { headers }
        );
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          if (fileData.content) {
            const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
            sampleFiles[filePath] = decoded.slice(0, 3000); // Limit size
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch file content for ${filePath}:`, err);
      }
    }

    return NextResponse.json({
      tree: tree.map((item: any) => ({
        path: item.path,
        type: item.type,
        size: item.size,
      })),
      keyPaths,
      sampleFiles,
    });
  } catch (error: any) {
    console.error("Error in github tree API:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch repository tree" }, { status: 500 });
  }
}
