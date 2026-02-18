import { NextResponse } from 'next/server';
import { subscriptionTiers } from '@/lib/data';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const useSandbox = process.env.PAYPAL_SANDBOX !== 'false';

const PAYPAL_API_BASE = useSandbox 
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

async function getPayPalAccessToken() {
    const env = useSandbox ? 'SANDBOX' : 'LIVE';
    const clientId = useSandbox ? process.env.PAYPAL_SANDBOX_CLIENT_ID : process.env.PAYPAL_LIVE_CLIENT_ID;
    const clientSecret = useSandbox ? process.env.PAYPAL_SANDBOX_CLIENT_SECRET : process.env.PAYPAL_LIVE_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId.includes('REPLACE_WITH')) {
        throw new Error(`PayPal ${env} credentials missing.`);
    }

    const auth = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) {
        throw new Error(`Failed to authenticate with PayPal.`);
    }
    return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { action, planId, customId, subscriptionId, reason } = await request.json();
    const accessToken = await getPayPalAccessToken();

    if (action === 'create_subscription') {
      const tier = subscriptionTiers.find(t => t.id === planId);
      if (!tier) return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });

      const paypalPlanId = useSandbox ? tier.paypalPlanId_Sandbox : tier.paypalPlanId_Live;
      const payload = { plan_id: paypalPlanId, custom_id: customId };

      const subResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const subData = await subResponse.json();
      return NextResponse.json({ success: true, subscriptionId: subData.id });
    }

    if (action === 'cancel_subscription') {
      const cancelResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason: reason || 'User upgrade' }),
      });

      if (cancelResponse.status === 204) return NextResponse.json({ success: true });
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
