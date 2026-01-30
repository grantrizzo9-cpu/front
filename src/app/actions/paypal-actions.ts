'use server';

import { createOrder, captureOrder } from '@/lib/paypal';

/**
 * Creates a PayPal order for a one-time payment for the selected subscription plan.
 * @param planId The ID of the subscription tier to purchase.
 * @returns An object containing the orderId or an error.
 */
export async function createPaypalOrder(planId: string) {
    // This function now just acts as a thin wrapper around the new lib function.
    // This keeps the 'use server' boundary clean.
    return createOrder(planId);
}


/**
 * Captures the payment for a PayPal order after the user has approved it.
 * @param orderId The ID of the order to capture.
 * @returns An object containing the success status and order data or an error.
 */
export async function capturePaypalOrder(orderId: string) {
    // This function now just acts as a thin wrapper around the new lib function.
    return captureOrder(orderId);
}
