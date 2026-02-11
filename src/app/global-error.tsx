'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans antialiased">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">Critical System Error</h1>
            <p className="text-muted-foreground">
              A serious error occurred that prevented the application from starting.
            </p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left font-mono text-xs text-destructive-foreground overflow-auto max-h-32">
            {error.message}
          </div>
          <Button onClick={() => reset()} size="lg" className="w-full shadow-lg">
            <RefreshCcw className="mr-2 h-4 w-4" /> Restart Application
          </Button>
        </div>
      </body>
    </html>
  );
}
