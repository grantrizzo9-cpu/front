
import { NextResponse } from 'next/server';
import { subscriptionTiers } from '@/lib/data';

const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
    ? "https://api-m.paypal.com" 
    : "https://api-m.sandbox.paypal.com";

export async function POST(request: Request) {
  try {
    // === Step 1: Get Credentials & Body ===
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret || clientId.includes('REPLACE_WITH') || clientSecret.includes('REPLACE_WITH')) {
      const errorMsg = "PayPal server credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured correctly in the .env file.";
      console.error("PayPal API Error:", errorMsg);
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }

    const body = await request.json();
    const { action, planId, orderId } = body;

    // === Step 2: Get PayPal Access Token ===
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        signal: AbortSignal.timeout(10000) 
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
        console.error("PAYPAL_TOKEN_ERROR:", JSON.stringify(tokenData, null, 2));
        return NextResponse.json({ success: false, error: `Failed to authenticate with PayPal. Response: ${JSON.stringify(tokenData)}` }, { status: 500 });
    }
    const accessToken = tokenData.access_token;


    // === Step 3: Handle the requested action ===
    if (action === 'create_order') {
      if (!planId) return NextResponse.json({ success: false, error: "Plan ID is required." }, { status: 400 });

      const plan = subscriptionTiers.find(p => p.id === planId);
      if (!plan) return NextResponse.json({ success: false, error: 'The selected plan could not be found.' }, { status: 404 });

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: plan.price.toFixed(2) },
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

      const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `order-${Date.now()}`,
        },
        body: JSON.stringify(payload),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        const issue = orderData.details?.[0]?.issue || orderData.name || "UNKNOWN_ISSUE";
        const description = orderData.details?.[0]?.description || orderData.message || "An error occurred.";
        return NextResponse.json({ success: false, error: `PayPal Error: ${issue}`, debug: description }, { status: orderResponse.status });
      }

      return NextResponse.json({ success: true, orderId: orderData.id });
    }

    if (action === 'capture_order') {
      if (!orderId) return NextResponse.json({ success: false, error: "Order ID is required." }, { status: 400 });

      const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });

      const captureData = await captureResponse.json();

      if (!captureResponse.ok) {
        const issue = captureData.details?.[0]?.issue || captureData.name || "CAPTURE_FAILED";
        const description = captureData.details?.[0]?.description || captureData.message || "Could not capture payment.";
        return NextResponse.json({ success: false, error: `PayPal capture failed: ${issue}`, debug: description }, { status: captureResponse.status });
      }
      
      return NextResponse.json({ success: true, orderData: captureData });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 });

  } catch (e: any) {
    // This is the master catch-all block. Any unexpected error will be caught here.
    console.error("[CRITICAL] Unhandled error in /api/paypal/route:", e);
    return NextResponse.json({ success: false, error: "A critical server error occurred.", debug: e.message }, { status: 500 });
  }
}
