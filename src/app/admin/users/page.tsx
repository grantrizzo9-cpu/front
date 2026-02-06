'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Crown, Loader2, ShieldOff, User } from 'lucide-react';
import type { User as UserType } from '@/lib/types';
import { useAdmin } from '@/hooks/use-admin';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { isPlatformOwner } = useAdmin();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isPlatformOwner) return null;
    return collection(firestore, 'users');
  }, [firestore, isPlatformOwner]);
  const { data: users, isLoading: usersLoading } = useCollection<UserType>(usersQuery);
  
  const adminRolesQuery = useMemoFirebase(() => {
    if (!firestore || !isPlatformOwner) return null;
    return collection(firestore, 'roles_admin');
  }, [firestore, isPlatformOwner]);
  const { data: adminRoles, isLoading: rolesLoading } = useCollection<{uid: string}>(adminRolesQuery);

  const adminUids = useMemo(() => new Set(adminRoles?.map(role => role.id) ?? []), [adminRoles]);

  const handleToggleAdmin = async (targetUser: UserType) => {
    if (!firestore) return;
    const isCurrentlyAdmin = adminUids.has(targetUser.id);
    if (targetUser.email === 'rentapog@gmail.com') return;

    setProcessingId(targetUser.id);
    const adminRoleRef = doc(firestore, 'roles_admin', targetUser.id);
    
    try {
        if (isCurrentlyAdmin) {
            await deleteDoc(adminRoleRef);
            toast({ title: 'Admin Revoked', description: `${targetUser.username} is no longer an admin.` });
        } else {
            await setDoc(adminRoleRef, {}); 
            toast({ title: 'Admin Granted', description: `${targetUser.username} is now an admin.` });
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold font-headline heading-red">Manage Users</h1>
        <p className="text-muted-foreground">Grant or revoke administrative privileges.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Platform Directory</CardTitle>
            <CardDescription>Manage roles for all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
             {usersLoading || rolesLoading ? (
                <div className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
            ) : users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://picsum.photos/seed/${u.id}/100/100`} />
                                <AvatarFallback>{u.username?.charAt(0).toUpperCase()}</AvatarFallback>
                           </Avatar>
                           <div><p className="font-semibold text-sm">{u.username}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {adminUids.has(u.id) ? <Badge className="bg-primary"><Crown className="mr-2 h-3 w-3" /> Admin</Badge> : <Badge variant="secondary"><User className="mr-2 h-3 w-3" /> User</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleToggleAdmin(u)} disabled={processingId === u.id || u.email === 'rentapog@gmail.com'}>
                          {processingId === u.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : adminUids.has(u.id) ? <ShieldOff className="mr-2 h-4 w-4" /> : <Crown className="mr-2 h-4 w-4" />}
                          {adminUids.has(u.id) ? 'Revoke' : 'Grant'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg bg-slate-50/50"><p>No users found on the platform yet.</p></div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
