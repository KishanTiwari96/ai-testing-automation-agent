import { db } from "@/db";
import { testRuns } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");
    const testCaseId = searchParams.get("testCaseId");

    let runs;

    if (testCaseId) {
      runs = await db
        .select()
        .from(testRuns)
        .where(eq(testRuns.testCaseId, Number(testCaseId)))
        .orderBy(desc(testRuns.id))
        .limit(20);
    } else if (repoId) {
      runs = await db
        .select()
        .from(testRuns)
        .where(eq(testRuns.repoId, Number(repoId)))
        .orderBy(desc(testRuns.id))
        .limit(50);
    } else {
      return NextResponse.json({ error: "Missing repoId or testCaseId" }, { status: 400 });
    }

    const parsedRuns = runs.map((r) => {
      let logs = [];
      try {
        logs = r.logs ? JSON.parse(r.logs) : [];
      } catch {
        logs = [];
      }
      return {
        ...r,
        logs,
      };
    });

    return NextResponse.json(parsedRuns);
  } catch (error: any) {
    console.error("Error fetching test runs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch test runs" },
      { status: 500 }
    );
  }
}
