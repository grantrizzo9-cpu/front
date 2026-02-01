
import { NextResponse } from 'next/server';
import { subscriptionTiers } from '@/lib/data';

// Determine the PayPal API base URL based on the environment
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
  const environment = process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX';
  console.log(`PayPal API route called. Using ${environment} environment.`);

  try {
    const { action, planId, customId, subscriptionId, reason } = await request.json();
    const accessToken = await getPayPalAccessToken();

    if (action === 'create_subscription') {
      if (!planId) return NextResponse.json({ success: false, error: "Plan ID is required." }, { status: 400 });

      const tier = subscriptionTiers.find(t => t.id === planId);
      if (!tier) {
        return NextResponse.json({ success: false, error: `Subscription tier with id '${planId}' not found.` }, { status: 404 });
      }

      if (!tier.paypalPlanId || tier.paypalPlanId.includes('REPLACE_WITH')) {
        const errorMsg = `The PayPal Plan ID for the '${tier.name}' plan is not configured in src/lib/data.ts. Please create a plan in your PayPal ${environment} account and add the ID.`;
        console.error(errorMsg);
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
      }

      const payload = {
        plan_id: tier.paypalPlanId,
        custom_id: customId, // Pass the Firebase UID
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
        console.error("PAYPAL_SUBSCRIPTION_ERROR:", {
            status: subResponse.status,
            paypalResponse: subData,
            sentPayload: payload,
        });
        const issue = subData.details?.[0]?.issue || subData.name || "SUBSCRIPTION_CREATION_FAILED";
        const description = subData.details?.[0]?.description || subData.message || "An error occurred.";
        return NextResponse.json({ success: false, error: `PayPal Error for plan '${tier.name}': ${issue}`, debug: `${description} (Hint: This often happens if the Plan ID for the '${tier.name}' tier does not exist or is misconfigured in your PayPal ${environment} account.)` }, { status: subResponse.status });
      }

      return NextResponse.json({ success: true, subscriptionId: subData.id });
    }

    if (action === 'cancel_subscription') {
      if (!subscriptionId) {
        return NextResponse.json({ success: false, error: "Subscription ID is required for cancellation." }, { status: 400 });
      }

      const cancelResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason: reason || 'User upgraded to a different plan.' }),
      });

      // PayPal returns 204 No Content on success
      if (cancelResponse.status === 204) {
        return NextResponse.json({ success: true, message: 'Subscription cancelled successfully.' });
      } else {
        const errorData = await cancelResponse.json();
        console.error("PAYPAL_CANCEL_ERROR:", {
            status: cancelResponse.status,
            paypalResponse: errorData,
            subscriptionId: subscriptionId,
        });
        return NextResponse.json({ success: false, error: `PayPal cancellation failed: ${errorData.message || 'Unknown error'}` }, { status: cancelResponse.status });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 });

  } catch (e: any) {
    console.error("[CRITICAL] Unhandled error in /api/paypal/route:", e);
    return NextResponse.json({ success: false, error: "A critical server error occurred.", debug: e.message }, { status: 500 });
  }
}
