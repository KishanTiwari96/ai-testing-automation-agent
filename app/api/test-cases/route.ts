import { db } from "@/db";
import { testCases, testRuns } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");

    if (!repoId) {
      return NextResponse.json({ error: "Missing repoId" }, { status: 400 });
    }

    const cases = await db
      .select()
      .from(testCases)
      .where(eq(testCases.repoId, Number(repoId)))
      .orderBy(desc(testCases.id));

    // Also fetch the latest test run for each test case
    const enrichedCases = await Promise.all(
      cases.map(async (tc) => {
        const latestRun = await db
          .select()
          .from(testRuns)
          .where(eq(testRuns.testCaseId, tc.id))
          .orderBy(desc(testRuns.id))
          .limit(1);

        let parsedSteps = [];
        try {
          parsedSteps = tc.steps ? JSON.parse(tc.steps) : [];
        } catch {
          parsedSteps = tc.steps ? [tc.steps] : [];
        }

        return {
          ...tc,
          steps: parsedSteps,
          latestRun: latestRun[0] || null,
        };
      })
    );

    return NextResponse.json(enrichedCases);
  } catch (error: any) {
    console.error("Error fetching test cases:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch test cases" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoId, name, description, type, targetUrl, steps, script } = body;

    if (!repoId || !name || !script) {
      return NextResponse.json(
        { error: "Missing required fields: repoId, name, script" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(testCases)
      .values({
        repoId: Number(repoId),
        name,
        description: description || null,
        type: type || "UI",
        targetUrl: targetUrl || "/",
        steps: typeof steps === "string" ? steps : JSON.stringify(steps || []),
        script,
        status: "pending",
      })
      .returning();

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    console.error("Error creating test case:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test case" },
      { status: 500 }
    );
  }
}
