"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CheckCircle } from "lucide-react";

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find(p => p.id === 'feature-2');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              About Affiliate AI Host
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              We are on a mission to empower affiliates and entrepreneurs with the best tools, the most lucrative commission structure, and the most reliable platform in the industry.
            </p>
          </div>
        </section>

        <section className="pb-20 md:pb-32">
          <div className="container grid gap-12 lg:grid-cols-2 items-center">
            <div className="relative h-80 lg:h-[500px] w-full">
              {aboutImage && (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  data-ai-hint={aboutImage.imageHint}
                  fill
                  className="object-cover rounded-lg shadow-lg"
                />
              )}
            </div>
            <div className="space-y-6">
              <h2 className="font-headline text-3xl font-bold">Our Vision</h2>
              <p className="text-muted-foreground">
                Affiliate AI Host was born from a simple idea: affiliate marketing should be more rewarding and less complicated. We saw too many programs with low commissions, confusing terms, and delayed payouts. We knew we could do better.
              </p>
              <p className="text-muted-foreground">
                Our platform combines state-of-the-art web hosting with powerful AI tools, creating an irresistible offer for customers. For our affiliates, we built a system that is fair, transparent, and incredibly profitable.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Generous 70%-75% Commissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Automated Daily PayPal Payouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Lifetime Customer-Affiliate Linking</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
