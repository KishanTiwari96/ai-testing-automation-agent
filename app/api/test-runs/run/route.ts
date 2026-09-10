import { db } from "@/db";
import { repositories, testCases, testRuns, users } from "@/db/schema";
import { executeTestCase } from "@/lib/test-runner";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testCaseId, repoId, userId, runAll } = body;

    if (!repoId || !userId) {
      return NextResponse.json({ error: "Missing repoId or userId" }, { status: 400 });
    }

    // 1. Fetch user and check credits
    const user = await db.select().from(users).where(eq(users.id, Number(userId)));
    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentCredits = user[0].credits;
    const COST_PER_RUN = 10;

    // 2. Fetch repository
    const repoList = await db.select().from(repositories).where(eq(repositories.id, Number(repoId)));
    if (!repoList.length) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }
    const repo = repoList[0];
    const baseUrl = repo.baseUrl || "http://localhost:3000";

    // 3. Batch Run or Single Run
    let targetCases: any[] = [];
    if (runAll) {
      targetCases = await db.select().from(testCases).where(eq(testCases.repoId, Number(repoId)));
      if (targetCases.length === 0) {
        return NextResponse.json({ error: "No test cases found in this repository" }, { status: 400 });
      }
    } else {
      if (!testCaseId) {
        return NextResponse.json({ error: "Missing testCaseId" }, { status: 400 });
      }
      const tc = await db.select().from(testCases).where(eq(testCases.id, Number(testCaseId)));
      if (!tc.length) {
        return NextResponse.json({ error: "Test case not found" }, { status: 404 });
      }
      targetCases = [tc[0]];
    }

    const totalCost = targetCases.length * COST_PER_RUN;
    if (currentCredits < totalCost) {
      return NextResponse.json(
        { error: `Insufficient credits! You need ${totalCost} credits to run these tests, but have ${currentCredits}.` },
        { status: 402 }
      );
    }

    const results = [];

    for (const tc of targetCases) {
      // Mark running
      await db.update(testCases).set({ status: "running" }).where(eq(testCases.id, tc.id));

      // Execute
      const execResult = await executeTestCase(tc, baseUrl);

      // Save Test Run in DB
      const insertedRun = await db
        .insert(testRuns)
        .values({
          repoId: Number(repoId),
          testCaseId: tc.id,
          status: execResult.status,
          duration: execResult.duration,
          logs: JSON.stringify(execResult.logs),
          screenshotUrl: execResult.screenshotUrl || null,
          browserbaseSessionId: execResult.browserbaseSessionId || null,
          liveUrl: execResult.liveUrl || null,
          errorMessage: execResult.errorMessage || null,
        })
        .returning();

      // Update test case status
      await db
        .update(testCases)
        .set({ status: execResult.status, updatedAt: new Date() })
        .where(eq(testCases.id, tc.id));

      results.push({
        testCaseId: tc.id,
        testCaseName: tc.name,
        runId: insertedRun[0]?.id,
        ...execResult,
      });
    }

    // Deduct credits
    const newCreditBalance = Math.max(0, currentCredits - totalCost);
    await db.update(users).set({ credits: newCreditBalance }).where(eq(users.id, Number(userId)));

    return NextResponse.json({
      success: true,
      results,
      remainingCredits: newCreditBalance,
      deductedCredits: totalCost,
    });
  } catch (error: any) {
    console.error("Error executing test run:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute test run" },
      { status: 500 }
    );
  }
}
