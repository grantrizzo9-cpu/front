import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { subscriptionTiers } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find the Perfect Plan
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
              Choose a plan to get started. All plans come with a 75% affiliate commission rate. Become an affiliate by signing up.
            </p>
          </div>
        </section>

        <section className="pb-20 md:pb-32">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {subscriptionTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={cn(
                    "flex flex-col",
                    tier.isMostPopular ? "border-primary ring-2 ring-primary shadow-lg" : ""
                  )}
                >
                  {tier.isMostPopular && (
                    <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold rounded-t-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">/ day</span>
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full" variant={tier.isMostPopular ? "default" : "outline"}>
                      <Link href={`/signup?plan=${tier.id}`}>Sign Up Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
