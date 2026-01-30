'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { createPaypalOrder, capturePaypalOrder } from '@/app/actions/paypal-actions';
import { useToast } from '@/hooks/use-toast';

interface PayPalPaymentButtonProps {
    planId: string;
    onPaymentSuccess: (details: any) => Promise<void>;
    onPaymentStart: () => void;
    onPaymentError: () => void;
    disabled: boolean;
}

export function PayPalPaymentButton({ planId, onPaymentSuccess, onPaymentStart, onPaymentError, disabled }: PayPalPaymentButtonProps) {
    const { toast } = useToast();

    const handleCreateOrder = async () => {
        onPaymentStart();
        const result = await createPaypalOrder(planId);
        if (result.error || !result.orderId) {
            toast({
                variant: 'destructive',
                title: 'PayPal Error',
                description: result.error || 'Could not create a PayPal order. Please refresh and try again.',
            });
            onPaymentError();
            throw new Error(result.error || 'Could not create PayPal order.');
        }
        return result.orderId;
    };

    const handleOnApprove = async (data: { orderID: string }, actions: any) => {
        const result = await capturePaypalOrder(data.orderID);

        if (result.success && result.orderData) {
            toast({
                title: 'Payment Successful!',
                description: "We're now creating your account...",
            });
            await onPaymentSuccess(result.orderData);
        } else {
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: result.error || 'An error occurred while processing your payment. You have not been charged.',
            });
            onPaymentError();
        }
    };
    
    const onError = (err: any) => {
        toast({
            variant: "destructive",
            title: "PayPal Error",
            description: "An unexpected error occurred with the PayPal transaction. Please check your details and try again.",
        });
        onPaymentError();
    }

    return (
        <PayPalButtons
            style={{ layout: "vertical", label: "pay", tagline: false, height: 44 }}
            createOrder={handleCreateOrder}
            onApprove={handleOnApprove}
            onError={onError}
            disabled={disabled}
            forceReRender={[planId, disabled]}
        />
    );
}
