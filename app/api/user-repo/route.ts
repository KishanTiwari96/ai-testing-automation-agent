import { db } from "@/db";
import { repositories } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      repoId,
      userId,
      name,
      full_name,
      fullName,
      private_,
      html_url,
      htmlUrl,
      description,
      language,
      default_branch,
      defaultBranch,
      owner,
      baseUrl,
    } = body;

    const targetFullName = full_name || fullName || name;
    const targetHtmlUrl = html_url || htmlUrl || `https://github.com/${owner}/${name}`;
    const targetBranch = default_branch || defaultBranch || "main";

    // Check if repo already exists for user
    const existing = await db
      .select()
      .from(repositories)
      .where(
        and(
          eq(repositories.userId, Number(userId)),
          eq(repositories.repoId, Number(repoId))
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }

    const result = await db
      .insert(repositories)
      .values({
        repoId: Number(repoId),
        userId: Number(userId),
        name: name || targetFullName.split("/").pop() || "repository",
        fullName: targetFullName,
        private: private_ ? 1 : 0,
        htmlUrl: targetHtmlUrl,
        description: description || null,
        language: language || "TypeScript",
        defaultBranch: targetBranch,
        owner: typeof owner === "string" ? owner : (owner?.login || targetFullName.split("/")[0]),
        baseUrl: baseUrl || null,
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error creating user-repo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add repository" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, Number(userId)))
      .orderBy(desc(repositories.id));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching user-repos:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
