"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Globe, Loader2, CheckCircle, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import type { User as UserType } from "@/lib/types";
import { useAdmin } from "@/hooks/use-admin";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, doc, where } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { firebaseConfig } from "@/firebase/config";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminHostingPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { isPlatformOwner, isLoading: isAdminLoading } = useAdmin();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAdminLoading && !isPlatformOwner) {
      router.push('/dashboard');
    }
  }, [isPlatformOwner, isAdminLoading, router]);

  // Fetch all users who have a custom domain configured
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isPlatformOwner) return null;
    return collection(firestore, 'users');
  }, [firestore, isPlatformOwner]);
  
  const { data: allUsers, isLoading: usersLoading } = useCollection<UserType>(usersQuery);

  const domainRequests = useMemo(() => {
    return allUsers?.filter(u => u.customDomain && u.customDomain.status !== 'unconfigured') ?? [];
  }, [allUsers]);

  const pendingCount = useMemo(() => {
    return domainRequests.filter(u => u.customDomain?.status === 'pending').length;
  }, [domainRequests]);

  const handleMarkConnected = async (user: UserType) => {
    if (!firestore || !user.customDomain) return;
    setProcessingId(user.id);
    
    const userDocRef = doc(firestore, 'users', user.id);
    updateDocumentNonBlocking(userDocRef, { 
        'customDomain.status': 'connected' 
    });
    
    toast({
      title: "Domain Connected",
      description: `User ${user.username} has been notified that ${user.customDomain.name} is live.`,
    });
    setProcessingId(null);
  };

  const hostingConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/hosting/custom-domains`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline heading-red">Manage Custom Domains</h1>
            <p className="text-muted-foreground">Fulfill domain setup requests from your users.</p>
        </div>
        <Button asChild variant="outline">
            <Link href={hostingConsoleUrl} target="_blank" rel="noopener noreferrer">
                Open Firebase Console <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
                {usersLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{pendingCount}</div>}
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Domain Requests</CardTitle>
            <CardDescription>
                When a user submits a domain, it appears here. Add it to Firebase Hosting, then mark it as connected.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {usersLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : domainRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Domain Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domainRequests.sort((a,b) => (a.customDomain?.status === 'pending' ? -1 : 1)).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.username}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <a href={`https://${u.customDomain?.name}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                            {u.customDomain?.name}
                            <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge 
                            variant={u.customDomain?.status === 'connected' ? 'secondary' : 'default'}
                            className={u.customDomain?.status === 'pending' ? 'bg-amber-500 text-white animate-pulse' : 'bg-green-500 text-white'}
                        >
                          {u.customDomain?.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {u.customDomain?.status === 'pending' && (
                            <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleMarkConnected(u)}
                                disabled={processingId === u.id}
                            >
                            {processingId === u.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Mark as Connected
                            </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <Globe className="mx-auto h-12 w-12 text-gray-400 opacity-20" />
                    <p className="mt-4 font-semibold">No domain requests yet.</p>
                    <p className="text-sm">User requests will appear here once they submit their domains.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  How to fulfill a request
              </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
              <ol className="list-decimal list-inside space-y-2">
                  <li>Copy the domain name from the table above.</li>
                  <li>Click <strong>"Open Firebase Console"</strong> to go to the Hosting settings.</li>
                  <li>Click <strong>"Add custom domain"</strong> and paste the domain name.</li>
                  <li>Follow the instructions in the Firebase wizard to get the <strong>A Records</strong> (IP addresses).</li>
                  <li>Go to your domain registrar (e.g. GoDaddy) and add those A Records to the domain's DNS settings.</li>
                  <li>Once done, click <strong>"Mark as Connected"</strong> here so the user sees the "Live" badge on their dashboard.</li>
              </ol>
          </CardContent>
      </Card>
    </div>
  );
}
