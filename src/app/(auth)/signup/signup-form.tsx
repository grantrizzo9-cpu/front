import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// This component is now just a placeholder and is no longer used by the signup page.
export function SignupForm() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
         <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}
