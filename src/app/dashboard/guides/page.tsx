'use client';

import { useState } from 'react';
import { allGuides, Guide } from '@/lib/guides';
import { ArrowRight } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  // Drastically simplified: Statically import and display all guides to prevent crashes.
  const guides = allGuides;

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedGuide(null)}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
          <p className="text-muted-foreground">
            Exclusive guides to help you maximize your affiliate earnings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
              <Card key={guide.title} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                        <span className="font-headline text-lg">{guide.title}</span>
                        <Badge variant="outline" className="capitalize flex-shrink-0">{guide.level}</Badge>
                    </CardTitle>
                    <CardDescription className="line-clamp-3 pt-2">
                        {guide.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
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
            ))}
        </div>
      </div>
      
       {/* Dialog Content */}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{selectedGuide?.title}</DialogTitle>
          <DialogDescription>
             Guide for the <span className="capitalize font-semibold text-primary">{selectedGuide?.level}</span> plan.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
            <div 
                className="prose prose-sm dark:prose-invert max-w-none text-base text-muted-foreground [&_a]:text-primary [&_a:hover]:underline [&_strong]:text-foreground [&_code]:bg-muted [&_code]:p-1 [&_code]:rounded-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: selectedGuide?.content.replace(/\[YOUR_USERNAME_HERE\]/g, 'rentahost') || "" }} 
            />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
