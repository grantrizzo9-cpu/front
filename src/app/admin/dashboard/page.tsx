
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { subscriptionTiers } from "@/lib/data";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isPlatformOwner, isLoading: isAdminLoading } = useAdmin();

  useEffect(() => {
    if (!isAdminLoading && !isPlatformOwner) {
      router.push('/dashboard');
    }
  }, [isPlatformOwner, isAdminLoading, router]);

  if (isAdminLoading || !isPlatformOwner) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin: Packages</h1>
        <p className="text-muted-foreground">A complete overview of all subscription packages and their features.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {subscriptionTiers.map((tier) => (
          <Card key={tier.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-xl">{tier.name}</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${tier.price.toFixed(2)}</span>
                <span className="text-muted-foreground">USD / day</span>
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
