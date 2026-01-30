import { Skeleton } from "@/components/ui/skeleton";

// This component is now just a placeholder and is no longer used by the upgrade page.
export function UpgradePageContent() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
}
