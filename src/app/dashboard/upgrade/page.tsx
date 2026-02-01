import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { UpgradeContent } from './upgrade-content';

function Loading() {
    return (
        <div className="flex justify-center items-center h-full p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}

export default function UpgradePage() {
    return (
        <Suspense fallback={<Loading />}>
            <UpgradeContent />
        </Suspense>
    );
}
