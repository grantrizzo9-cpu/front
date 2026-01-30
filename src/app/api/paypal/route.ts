
import { NextResponse } from 'next/server';
import { subscriptionTiers } from '@/lib/data';

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<{ token?: string; error?: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes('REPLACE_WITH') || clientSecret.includes('REPLACE_WITH')) {
    const errorMsg = "PayPal server credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured correctly in the .env file.";
    console.error("getPayPalAccessToken Error:", errorMsg);
    return { error: errorMsg };
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        // More aggressive timeout
        signal: AbortSignal.timeout(8000) 
    });

    if (!response.ok) {
        const data = await response.json();
        console.error("PAYPAL_TOKEN_ERROR:", JSON.stringify(data, null, 2));
        return { error: `Failed to get PayPal access token. Status: ${response.status}. Response: ${JSON.stringify(data)}` };
    }

    const data = await response.json();

    if (!data.access_token) {
        console.error("PAYPAL_TOKEN_ERROR: No access_token in response", JSON.stringify(data, null, 2));
        return { error: `PayPal authentication succeeded but no access token was returned.` };
    }

    return { token: data.access_token };
  } catch (e: any) {
    console.error("GET_PAYPAL_ACCESS_TOKEN_CATCH_BLOCK:", e);
    return { error: `A critical network error occurred while getting the PayPal token: ${e.message}` };
  }
}

export async function POST(request: Request) {
  // CRITICAL: Check for environment variables first to prevent silent crashes.
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret || clientId.includes('REPLACE_WITH') || clientSecret.includes('REPLACE_WITH')) {
    const errorMsg = "PayPal server credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured. Please add them to your .env file.";
    console.error("PayPal API Error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg, debug: "Server-side environment variables are missing." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    const tokenResult = await getPayPalAccessToken();
    if (tokenResult.error || !tokenResult.token) {
      return NextResponse.json({ success: false, error: "Could not authenticate with PayPal.", debug: tokenResult.error }, { status: 500 });
    }
    const accessToken = tokenResult.token;

    if (action === 'create_order') {
      const { planId } = body;
      if (!planId) {
        return NextResponse.json({ success: false, error: "Plan ID is required." }, { status: 400 });
      }

      const plan = subscriptionTiers.find(p => p.id === planId);
      if (!plan) {
        return NextResponse.json({ success: false, error: 'The selected plan could not be found.' }, { status: 404 });
      }

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: plan.price.toFixed(2),
          },
          description: `First day payment for ${plan.name} Plan at Affiliate AI Host`,
        }],
        application_context: {
          brand_name: 'Affiliate AI Host',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: 'https://example.com/return', 
          cancel_url: 'https://example.com/cancel',
        }
      };

      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `order-${Date.now()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const issue = data.details?.[0]?.issue || data.name || "UNKNOWN_ISSUE";
        const description = data.details?.[0]?.description || data.message || "An error occurred while creating the order.";
        return NextResponse.json({ success: false, error: `PayPal Error: ${issue}`, debug: description }, { status: 500 });
      }

      if (!data.id) {
        return NextResponse.json({ success: false, error: "PayPal did not return an order ID.", debug: data }, { status: 500 });
      }

      return NextResponse.json({ success: true, orderId: data.id });
    }

    if (action === 'capture_order') {
      const { orderId } = body;
      if (!orderId) {
        return NextResponse.json({ success: false, error: "Order ID is required." }, { status: 400 });
      }

      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `capture-${Date.now()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const issue = data.details?.[0]?.issue || data.name || "CAPTURE_FAILED";
        const description = data.details?.[0]?.description || data.message || "Could not capture the payment.";
        return NextResponse.json({ success: false, error: `PayPal capture failed: ${issue}`, debug: description }, { status: 500 });
      }

      if (data.status === 'COMPLETED') {
        return NextResponse.json({ success: true, orderData: data });
      } else {
        return NextResponse.json({ success: false, error: `Payment not completed. Status: ${data.status}`, debug: data }, { status: 400 });
      }
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 });

  } catch (e: any) {
    console.error("[CRITICAL] Top-level error in /api/paypal route:", e);
    return NextResponse.json({ success: false, error: "A critical server error occurred.", debug: e.message }, { status: 500 });
  }
}
