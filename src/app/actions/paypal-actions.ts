'use server';

import { getClient } from '@/lib/paypal-client';
import paypal from '@paypal/checkout-server-sdk';
import { subscriptionTiers } from '@/lib/data';

/**
 * Creates a PayPal order for a one-time payment for the selected subscription plan.
 * @param planId The ID of the subscription tier to purchase.
 * @returns An object containing the orderId or an error.
 */
export async function createPaypalOrder(planId: string) {
    const client = getClient();
    if (!client) {
        return { error: 'PayPal service is not configured on the server. Please check the environment variables.' };
    }

    const plan = subscriptionTiers.find(p => p.id === planId);
    if (!plan) {
        return { error: 'Plan not found' };
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE', // CAPTURE for a one-time payment
        purchase_units: [{
            amount: {
                currency_code: 'AUD',
                value: plan.price.toFixed(2),
            },
            description: `First day payment for ${plan.name} Plan at Affiliate AI Host`,
        }],
        application_context: {
            brand_name: 'Affiliate AI Host',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
        }
    });

    try {
        const order = await client.execute(request);
        return { orderId: order.result.id };
    } catch (err: any) {
        console.error("Error creating PayPal order:", err);
        return { error: 'Could not initiate PayPal transaction. Check server logs for details.' };
    }
}

/**
 * Captures a PayPal order after the user has approved it.
 * @param orderId The ID of the order to capture.
 * @returns An object indicating success and the captured data, or an error.
 */
export async function capturePaypalOrder(orderId: string) {
    const client = getClient();
    if (!client) {
        return { success: false, error: 'PayPal service is not configured on the server. Please check environment variables.' };
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);

    try {
        const capture = await client.execute(request);
        
        if (capture.result.status === 'COMPLETED') {
            return { success: true, orderData: capture.result };
        } else {
            // This path is unlikely as PayPal usually throws an error for non-completed captures.
            return { success: false, error: `Payment status was not 'COMPLETED'. Status: ${capture.result.status}` };
        }
    } catch (err: any) {
        console.error("Error capturing PayPal order:", err);
        // Provide a generic error to the client for security.
        return { success: false, error: 'There was an issue processing your payment with PayPal. You have not been charged. Please try again.' };
    }
}
