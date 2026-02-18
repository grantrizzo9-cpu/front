'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, serverTimestamp, writeBatch, Timestamp } from "firebase/firestore";
import type { User as UserType } from "@/lib/types";
import { subscriptionTiers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { OnApproveData, CreateSubscriptionData } from "@paypal/paypal-js";
import { Skeleton } from "@/components/ui/skeleton";

export function UpgradeContent() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const useSandbox = process.env.PAYPAL_SANDBOX !== 'false';
    const paypalClientId = useSandbox ? process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID : process.env.NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID;

    const searchParams = useSearchParams();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);
    const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);
    
    useEffect(() => {
        const planId = searchParams.get('plan');
        if (planId && subscriptionTiers.some(t => t.id === planId)) {
            setSelectedTierId(planId);
        } else if (userData?.subscription?.status === 'inactive' && userData.subscription.tierId) {
            setSelectedTierId(userData.subscription.tierId);
        }
    }, [searchParams, userData]);

    const availableTiers = useMemo(() => {
        if (!userData?.subscription || userData.subscription.status === 'inactive') {
            return subscriptionTiers;
        }
        const currentTierPrice = subscriptionTiers.find(t => t.id === userData.subscription?.tierId)?.price ?? 0;
        return subscriptionTiers.filter(t => t.price > currentTierPrice);
    }, [userData]);

    const createSubscription = async (data: CreateSubscriptionData): Promise<string> => {
        setPaymentError(null);
        if (!selectedTierId || !user) {
            throw new Error("Missing selection or session.");
        }
        const response = await fetch('/api/paypal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create_subscription', planId: selectedTierId, customId: user.uid }),
        });
        const responseData = await response.json();
        if (response.ok && responseData.subscriptionId) return responseData.subscriptionId;
        throw new Error(responseData.error || "PayPal error");
    };

    const onApprove = async (data: OnApproveData): Promise<void> => {
        setIsProcessing(true);
        try {
            if (!userDocRef || !selectedTierId || !userData) throw new Error("No session");
            const tier = subscriptionTiers.find(t => t.id === selectedTierId);
            const isUpgrade = userData.subscription?.status === 'active';
            const batch = writeBatch(firestore);
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 3);

            batch.update(userDocRef, { 
                subscription: {
                    tierId: selectedTierId,
                    status: 'active',
                    startDate: serverTimestamp(),
                    endDate: null,
                    trialEndDate: isUpgrade ? null : Timestamp.fromDate(trialEnd),
                    paypalSubscriptionId: data.subscriptionID,
                }
            });
            
            if (!isUpgrade && userData.referredBy) {
                const referralDocRef = doc(firestore, 'users', userData.referredBy, 'referrals', user!.uid);
                batch.update(referralDocRef, { activationStatus: 'activated', grossSale: tier!.price });
            }
            await batch.commit();
            router.push('/dashboard');
        } catch (error: any) {
             setPaymentError(error.message);
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (!isHydrated) return <Skeleton className="h-96 w-full" />;

    if (!paypalClientId || paypalClientId.includes('REPLACE_WITH')) {
      return <Alert variant="destructive"><AlertTitle>Gateway Error</AlertTitle><AlertDescription>PayPal not configured.</AlertDescription></Alert>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline heading-red">Manage Subscription</h1>
            {paymentError && <Alert variant="destructive"><AlertDescription>{paymentError}</AlertDescription></Alert>}
            
            <PayPalScriptProvider options={{ clientId: paypalClientId!, vault: true, intent: "subscription" }}>
                {selectedTierId ? (
                    (() => {
                        const tier = subscriptionTiers.find(t => t.id === selectedTierId);
                        if (!tier) return null;
                        return (
                            <Card className="max-w-md mx-auto">
                                <CardHeader><CardTitle>{tier.name}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-4xl font-bold">${tier.price.toFixed(2)}</div>
                                    <ul className="space-y-2">{tier.features.map((f, i) => <li key={i} className="text-sm flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {f}</li>)}</ul>
                                </CardContent>
                                <CardFooter className="flex-col gap-4">
                                    <PayPalButtons style={{ layout: "vertical" }} createSubscription={createSubscription} onApprove={onApprove} />
                                    <Button variant="ghost" onClick={() => setSelectedTierId(null)}>Change Plan</Button>
                                </CardFooter>
                            </Card>
                        )
                    })()
                ) : (
                    <div className="grid gap-6 md:grid-cols-3">
                        {isUserDataLoading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />) : availableTiers.map((tier) => (
                        <Card key={tier.id} className={cn(tier.isMostPopular && "border-primary shadow-lg")}>
                            <CardHeader><CardTitle>{tier.name}</CardTitle><div className="text-2xl font-bold">${tier.price}</div></CardHeader>
                            <CardFooter><Button className="w-full" onClick={() => setSelectedTierId(tier.id)}>Select {tier.name}</Button></CardFooter>
                        </Card>
                        ))}
                    </div>
                )}
            </PayPalScriptProvider>
        </div>
    );
}
