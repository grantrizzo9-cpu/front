'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { subscriptionTiers } from '@/lib/data';
import { allGuides, Guide } from '@/lib/guides';
import { Loader2, BookOpen, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function GuidesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const isLoading = isUserLoading || isUserDataLoading;

  const { currentTier, accessibleGuides } = useMemo(() => {
    if (!userData || !userData.subscription) {
      return { currentTier: null, accessibleGuides: [] };
    }

    const tier = subscriptionTiers.find(t => t.id === userData.subscription?.tierId);
    if (!tier) {
      return { currentTier: null, accessibleGuides: [] };
    }
    
    const levelHierarchy = ['starter', 'plus', 'pro', 'business', 'scale', 'enterprise'];
    const userLevelIndex = levelHierarchy.indexOf(tier.guideAccessLevel);
    
    const guides = allGuides.filter(guide => {
      const guideLevelIndex = levelHierarchy.indexOf(guide.level);
      return guideLevelIndex <= userLevelIndex;
    });

    return { currentTier: tier, accessibleGuides: guides };
  }, [userData]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentTier) {
      return (
          <div className="text-center">
              <h2 className="text-2xl font-bold">No Subscription Found</h2>
              <p className="text-muted-foreground">You need an active subscription to access marketing guides.</p>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
        <p className="text-muted-foreground">
          You are on the <span className="font-semibold text-primary">{currentTier.name}</span> plan. Here are your unlocked guides.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Your Unlocked Guides</CardTitle>
            <CardDescription>Click on any guide to read its content. Upgrade your plan to unlock more advanced strategies.</CardDescription>
        </CardHeader>
        <CardContent>
            {accessibleGuides.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {accessibleGuides.map((guide, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    <span>{guide.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground prose dark:prose-invert max-w-none">
                                <p>{guide.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No guides available for your current plan.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      {allGuides.length > accessibleGuides.length && (
         <Card>
            <CardHeader>
                <CardTitle>Locked Guides</CardTitle>
                <CardDescription>Upgrade your plan to unlock these more advanced guides.</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="space-y-3">
                    {allGuides
                        .filter(guide => !accessibleGuides.some(g => g.title === guide.title))
                        .map((guide, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-md">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                                <span className="text-muted-foreground">{guide.title}</span>
                                <span className="ml-auto text-xs font-semibold uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">{guide.level} Plan</span>
                            </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
