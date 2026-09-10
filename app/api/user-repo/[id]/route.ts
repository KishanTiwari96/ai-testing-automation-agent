import { db } from "@/db";
import { repositories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const repoId = Number(id);
    const body = await req.json();
    const { baseUrl, description } = body;

    const updated = await db
      .update(repositories)
      .set({
        ...(baseUrl !== undefined && { baseUrl }),
        ...(description !== undefined && { description }),
      })
      .where(eq(repositories.id, repoId))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("Error updating repository:", error);
    return NextResponse.json({ error: error.message || "Failed to update repository" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const repoId = Number(id);

    await db.delete(repositories).where(eq(repositories.id, repoId));

    return NextResponse.json({ success: true, message: "Repository deleted" });
  } catch (error: any) {
    console.error("Error deleting repository:", error);
    return NextResponse.json({ error: error.message || "Failed to delete repository" }, { status: 500 });
  }
}
