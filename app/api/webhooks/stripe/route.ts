import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error(`Stripe Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const creditsToAdd = Number(session.metadata?.credits || 1000);

      if (userId) {
        try {
          await db
            .update(users)
            .set({
              credits: sql`${users.credits} + ${creditsToAdd}`,
            })
            .where(eq(users.id, Number(userId)));

          console.log(`Successfully added ${creditsToAdd} credits to user ID ${userId}`);
        } catch (dbErr) {
          console.error("Failed to update user credits from webhook:", dbErr);
        }
      }
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
