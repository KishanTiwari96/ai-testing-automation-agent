import { db } from "@/db";
import { users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const email = user?.primaryEmailAddress?.emailAddress;

        if (!email) {
            return NextResponse.json({ error: "Unauthorized: User not authenticated" }, { status: 401 });
        }

        const userResult = await db.select().from(users).where(
            eq(users.email, email)
        );

        if (userResult.length === 0) {
            const newUser = await db.insert(users).values({
                email,
                name: user?.fullName ?? user?.firstName ?? 'User'
            }).returning();

            return NextResponse.json({ user: newUser[0] });
        } else {
            return NextResponse.json({ user: userResult[0] });
        }
    } catch (e) {
        console.error("Error creating/fetching user:", e);
        return NextResponse.json({ error: "Failed to create/fetch user" }, { status: 500 });
    }
}
