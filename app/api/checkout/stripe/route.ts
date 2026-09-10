import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, planName, credits, userId, amount } = body;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // If Stripe key is placeholder or demo mode
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder") || process.env.STRIPE_SECRET_KEY === "sk_test_51...") {
      return NextResponse.json({
        demo: true,
        message: "Stripe test mode initialized",
        url: `${appUrl}/pricing?demo_success=true&credits=${credits || 1000}`,
      });
    }

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${planName || "AI Testing Agent"} - ${credits || 1000} Credits`,
                description: "Automated test generation and Browserbase cloud test executions",
              },
              unit_amount: (amount || 10) * 100,
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        userId: String(userId || ""),
        credits: String(credits || 1000),
      },
      success_url: `${appUrl}/workspace?payment=success&credits=${credits || 1000}`,
      cancel_url: `${appUrl}/pricing?payment=cancelled`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
  }
}
