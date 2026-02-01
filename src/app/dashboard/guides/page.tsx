
'use client';

import { useState } from 'react';
import { allGuides, type Guide } from '@/lib/guides';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  // This is a safety check. If the guides data is not loaded correctly,
  // it will prevent the page from crashing and show a helpful message.
  if (!allGuides || !Array.isArray(allGuides)) {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
            <p className="text-muted-foreground">
                There was an error loading the marketing guides. Please try refreshing the page.
            </p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
        <p className="text-muted-foreground">
          Your library of expert guides to help you grow your affiliate business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allGuides.map((guide) => (
            <Card key={guide.title} className="flex flex-col overflow-hidden">
              <CardHeader>
                <CardTitle>{guide.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                 <p className="text-sm text-muted-foreground">
                    Access Level: <span className="font-semibold text-primary">{guide.level.charAt(0).toUpperCase() + guide.level.slice(1)}</span>
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setSelectedGuide(guide)}>
                  Read Guide
                </Button>
              </CardFooter>
            </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedGuide}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedGuide(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl pr-6">
              {selectedGuide?.title}
            </DialogTitle>
            <DialogDescription>
              Access Level: {selectedGuide?.level.charAt(0).toUpperCase() + (selectedGuide?.level.slice(1) || '')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-6 space-y-4 text-foreground/90 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:pl-2 [&_code]:bg-muted [&_code]:font-mono [&_code]:px-1.5 [&_code]:py-1 [&_code]:rounded-sm [&_a]:text-primary [&_a]:hover:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
            <div
              dangerouslySetInnerHTML={{ __html: selectedGuide?.content || '' }}
            />
          </div>
          <DialogFooter className="mt-4 sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedGuide(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
