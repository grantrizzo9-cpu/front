import { NextResponse } from 'next/server';
import { subscriptionTiers } from '@/lib/data';

const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
    ? "https://api-m.paypal.com" 
    : "https://api-m.sandbox.paypal.com";

// This function gets an access token from PayPal
async function getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId.includes('REPLACE_WITH') || clientSecret.includes('REPLACE_WITH')) {
        throw new Error("PayPal server credentials are not configured correctly in the .env file.");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        signal: AbortSignal.timeout(10000)
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) {
        console.error("PAYPAL_TOKEN_ERROR:", JSON.stringify(data, null, 2));
        throw new Error(`Failed to authenticate with PayPal. Response: ${JSON.stringify(data)}`);
    }
    return data.access_token;
}


export async function POST(request: Request) {
  try {
    const { action, planId, customId } = await request.json();
    const accessToken = await getPayPalAccessToken();

    if (action === 'create_subscription') {
      if (!planId) return NextResponse.json({ success: false, error: "Plan ID is required." }, { status: 400 });

      const tier = subscriptionTiers.find(t => t.id === planId);
      if (!tier || !tier.paypalPlanId || tier.paypalPlanId.includes('REPLACE_WITH')) {
        const errorMsg = `The selected plan '${planId}' does not have a valid PayPal Plan ID configured.`;
        console.error(errorMsg);
        return NextResponse.json({ success: false, error: errorMsg }, { status: 404 });
      }

      const payload = {
        plan_id: tier.paypalPlanId,
        custom_id: customId, // Pass the Firebase UID
        application_context: {
          brand_name: 'Affiliate AI Host',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: 'https://example.com/return',
          cancel_url: 'https://example.com/cancel',
        }
      };

      const subResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `sub-${Date.now()}`
        },
        body: JSON.stringify(payload),
      });

      const subData = await subResponse.json();
      if (!subResponse.ok) {
        const issue = subData.details?.[0]?.issue || subData.name || "SUBSCRIPTION_CREATION_FAILED";
        const description = subData.details?.[0]?.description || subData.message || "An error occurred.";
        return NextResponse.json({ success: false, error: `PayPal Error: ${issue}`, debug: description }, { status: subResponse.status });
      }

      return NextResponse.json({ success: true, subscriptionId: subData.id });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 });

  } catch (e: any) {
    console.error("[CRITICAL] Unhandled error in /api/paypal/route:", e);
    return NextResponse.json({ success: false, error: "A critical server error occurred.", debug: e.message }, { status: 500 });
  }
}
