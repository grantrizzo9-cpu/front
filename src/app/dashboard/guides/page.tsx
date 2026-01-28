
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { subscriptionTiers } from '@/lib/data';
import { allGuides, Guide } from '@/lib/guides';
import { Loader2, BookOpen, Lock, Download, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAdmin } from '@/hooks/use-admin';

// Helper component for rendering the guide list
function GuideList({ guides, onDownload }: { guides: Guide[], onDownload: (guide: Guide) => void }) {
    if (guides.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No guides available for your current plan.</p>
            </div>
        );
    }
    return (
        <Accordion type="single" collapsible className="w-full">
            {guides.map((guide, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span>{guide.title}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div 
                            className="text-base text-muted-foreground [&_a]:text-primary [&_a:hover]:underline [&_strong]:text-foreground [&_code]:bg-muted [&_code]:p-1 [&_code]:rounded-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:italic"
                            dangerouslySetInnerHTML={{ __html: guide.content }} 
                        />
                        <Button variant="outline" size="sm" onClick={() => onDownload(guide)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download as .txt
                        </Button>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

export default function GuidesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const { currentTier, accessibleGuides } = useMemo(() => {
    if (!userData?.subscription) {
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
  
  const lockedGuides = useMemo(() => 
    allGuides.filter(guide => !accessibleGuides.some(g => g.title === guide.title)),
    [accessibleGuides]
  );
  
  const isHighestPlan = currentTier?.id === 'enterprise';
  const isLoading = isUserLoading || isUserDataLoading || isAdminLoading;

  const handleDownload = (guide: Guide) => {
    const stripHtml = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    }

    const textContent = stripHtml(guide.content)
                            .replace(/(\n\s*){3,}/g, '\n\n')
                            .trim();

    const blob = new Blob([`Guide: ${guide.title}\n\n---\n\n${textContent}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${guide.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ADMIN VIEW: This is the first check. If the user is an admin, show all guides immediately.
  if (isAdmin) {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
                <p className="text-muted-foreground">You have admin access to all guides.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Available Guides</CardTitle>
                    <CardDescription>As an admin, you have access to all guides across all subscription tiers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GuideList guides={allGuides} onDownload={handleDownload} />
                </CardContent>
            </Card>
             <Card className="max-w-md bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                        <BadgeCheck className="h-6 w-6" />
                        <span>Admin Access Confirmed</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-green-700 dark:text-green-300">
                        You are viewing this page as an administrator.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  // NO SUBSCRIPTION VIEW: If not admin and no subscription exists.
  if (!userData?.subscription) {
      return (
          <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
            </div>
            <div className="text-center border rounded-lg p-12">
              <h2 className="text-2xl font-bold">No Subscription Found</h2>
              <p className="text-muted-foreground mt-2">You need an active subscription to access marketing guides.</p>
              <Button asChild className="mt-4">
                  <Link href="/dashboard/upgrade">Choose a Plan</Link>
              </Button>
            </div>
          </div>
      )
  }

  // SUBSCRIBED USER VIEW
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
        <p className="text-muted-foreground">You are on the {currentTier?.name} plan. Here are your unlocked guides.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Your Unlocked Guides</CardTitle>
            <CardDescription>Click on any guide to read its content. Upgrade your plan to unlock more advanced strategies.</CardDescription>
        </CardHeader>
        <CardContent>
            <GuideList guides={accessibleGuides} onDownload={handleDownload} />
        </CardContent>
      </Card>
      
      { !isHighestPlan && lockedGuides.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>Locked Guides</CardTitle>
                <CardDescription>Upgrade your plan to unlock these more advanced guides.</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="space-y-3">
                    {lockedGuides.map((guide, index) => (
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
