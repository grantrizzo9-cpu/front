'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { subscriptionTiers } from '@/lib/data';
import { allGuides, Guide } from '@/lib/guides';
import { Loader2, Lock, Download, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAdmin } from '@/hooks/use-admin';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Helper function to find a guide image, with a fallback
const getGuideImage = (level: string) => {
    const specificImage = PlaceHolderImages.find(p => p.id === `guide-${level}`);
    if (specificImage) return specificImage;
    // Fallback to a generic feature image if a specific guide image isn't found
    return PlaceHolderImages.find(p => p.id === 'feature-2')!; 
};


export default function GuidesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const { currentTier, accessibleGuides } = useMemo(() => {
    // Admin gets all guides
    if (isAdmin) {
      const adminTier = subscriptionTiers.find(t => t.id === 'enterprise');
      return { currentTier: adminTier, accessibleGuides: allGuides };
    }

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
  }, [userData, isAdmin]);
  
  const lockedGuides = useMemo(() => 
    allGuides.filter(guide => !accessibleGuides.some(g => g.title === guide.title)),
    [accessibleGuides]
  );
  
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

  // NO SUBSCRIPTION VIEW: If not admin and no subscription exists.
  if (!isAdmin && !userData?.subscription) {
      return (
          <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
                <p className="text-muted-foreground">Exclusive guides to help you maximize your affiliate earnings.</p>
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

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedGuide(null)}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
          <p className="text-muted-foreground">
            {isAdmin 
                ? "You have admin access to all guides." 
                : `You are on the ${currentTier?.name} plan. Here are your unlocked guides.`
            }
          </p>
        </div>

        {/* Unlocked Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleGuides.map((guide) => {
            const guideImage = getGuideImage(guide.level);
            return (
              <Card key={guide.title} className="flex flex-col">
                <div className="relative h-40 w-full">
                    <Image
                        src={guideImage.imageUrl}
                        alt={guide.title}
                        data-ai-hint={guideImage.imageHint}
                        fill
                        className="object-cover rounded-t-lg"
                    />
                </div>
                <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                        <span className="font-headline text-lg">{guide.title}</span>
                        <Badge variant="outline" className="capitalize flex-shrink-0">{guide.level}</Badge>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 pt-2">
                        {guide.content.replace(/<[^>]+>/g, '').substring(0, 100)}...
                    </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedGuide(guide)}>
                            Read Guide <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </CardFooter>
              </Card>
            );
          })}
           {lockedGuides.map((guide) => {
            const guideImage = getGuideImage(guide.level);
            return (
              <Card key={guide.title} className="flex flex-col relative overflow-hidden">
                <div className="relative h-40 w-full">
                    <Image
                        src={guideImage.imageUrl}
                        alt={guide.title}
                        data-ai-hint={guideImage.imageHint}
                        fill
                        className="object-cover rounded-t-lg filter grayscale"
                    />
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                </div>
                <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                        <span className="font-headline text-lg text-muted-foreground">{guide.title}</span>
                         <Badge variant="secondary" className="capitalize flex-shrink-0">{guide.level}</Badge>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 pt-2 text-muted-foreground">
                        Upgrade to the {guide.level} plan or higher to unlock this guide.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button className="w-full" variant="secondary" asChild>
                        <Link href="/dashboard/upgrade">
                            Upgrade to Unlock
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      
       {/* Dialog Content */}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{selectedGuide?.title}</DialogTitle>
          <DialogDescription>
             Exclusive guide for the <span className="capitalize font-semibold text-primary">{selectedGuide?.level}</span> plan.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
            <div 
                className="prose prose-sm dark:prose-invert max-w-none text-base text-muted-foreground [&_a]:text-primary [&_a:hover]:underline [&_strong]:text-foreground [&_code]:bg-muted [&_code]:p-1 [&_code]:rounded-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: selectedGuide?.content ?? "" }} 
            />
        </ScrollArea>
        <CardFooter>
            <Button variant="outline" onClick={() => selectedGuide && handleDownload(selectedGuide)}>
                <Download className="mr-2 h-4 w-4" />
                Download as .txt
            </Button>
        </CardFooter>
      </DialogContent>
    </Dialog>
  );
}
