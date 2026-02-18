
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page has been replaced by /dashboard/website
// It now just redirects to the new page.
export default function AiWebsiteRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/website');
    }, [router]);

    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" />
                <span>Redirecting...</span>
            </div>
        </div>
    );
}
