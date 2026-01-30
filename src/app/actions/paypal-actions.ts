'use server';

import { createOrder as createPaypalOrderApi, captureOrder as capturePaypalOrderApi } from '@/lib/paypal';

/**
 * Creates a PayPal order for a one-time payment for the selected subscription plan.
 * This function is designed to be crash-proof and always return a JSON response.
 * @param planId The ID of the subscription tier to purchase.
 * @returns An object containing the orderId or an error and debug info.
 */
export async function createPaypalOrder(planId: string): Promise<{orderId?: string; error?: string; debug?: string}> {
    try {
        // The underlying API call is already wrapped in a try/catch,
        // but we add another one here as a final guarantee that the Server Action itself will not crash.
        const result = await createPaypalOrderApi(planId);
        return result;
    } catch (e: any) {
        console.error("CRITICAL_ERROR_IN_CREATE_PAYPAL_ORDER_ACTION:", e);
        // This is the safety net. If anything in the action itself fails, return this.
        return {
            error: "A critical unhandled error occurred on the server while creating the PayPal order.",
            debug: e.message || 'Unknown server error'
        };
    }
}


/**
 * Captures the payment for a PayPal order after the user has approved it.
 * This function is designed to be crash-proof and always return a JSON response.
 * @param orderId The ID of the order to capture.
 * @returns An object containing the success status and order data or an error and debug info.
 */
export async function capturePaypalOrder(orderId: string): Promise<{success: boolean, orderData?: any, error?: string, debug?: string}> {
    try {
        const result = await capturePaypalOrderApi(orderId);
        return result;
    } catch (e: any) {
        console.error("CRITICAL_ERROR_IN_CAPTURE_PAYPAL_ORDER_ACTION:", e);
        return {
            success: false,
            error: "A critical unhandled error occurred on the server while capturing the PayPal order.",
            debug: e.message || 'Unknown server error'
        };
    }
}
