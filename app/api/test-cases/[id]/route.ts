import { db } from "@/db";
import { testCases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testCaseId = Number(id);
    const body = await req.json();
    const { name, description, type, targetUrl, steps, script, status } = body;

    const updated = await db
      .update(testCases)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(targetUrl !== undefined && { targetUrl }),
        ...(steps !== undefined && {
          steps: typeof steps === "string" ? steps : JSON.stringify(steps),
        }),
        ...(script !== undefined && { script }),
        ...(status !== undefined && { status }),
        updatedAt: new Date(),
      })
      .where(eq(testCases.id, testCaseId))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Test case not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("Error updating test case:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update test case" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testCaseId = Number(id);

    await db.delete(testCases).where(eq(testCases.id, testCaseId));

    return NextResponse.json({ success: true, message: "Test case deleted" });
  } catch (error: any) {
    console.error("Error deleting test case:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete test case" },
      { status: 500 }
    );
  }
}
