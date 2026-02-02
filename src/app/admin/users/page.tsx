'use client';

import { useMemo, useState, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Fetch all users
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'users');
  }, [firestore, isAdmin]);
  const { data: users, isLoading: usersLoading } = useCollection<UserType>(usersQuery);
  
  // 2. Fetch all admin role documents
  const adminRolesQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'roles_admin');
  }, [firestore, isAdmin]);
  const { data: adminRoles, isLoading: rolesLoading } = useCollection<{uid: string}>(adminRolesQuery);

  // Create a fast lookup set of admin UIDs
  const adminUids = useMemo(() => new Set(adminRoles?.map(role => role.id) ?? []), [adminRoles]);

  // Redirect if not an admin
  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isAdminLoading, router]);

  const isLoading = isAdminLoading || usersLoading || rolesLoading;

  const handleToggleAdmin = async (targetUser: UserType) => {
    if (!firestore) return;

    const isCurrentlyAdmin = adminUids.has(targetUser.id);
    // Prevent the main admin from having their role revoked via the UI
    if (targetUser.email === 'rentapog@gmail.com') {
      toast({ variant: 'destructive', title: 'Action Not Allowed', description: 'The platform owner\'s admin status cannot be changed.' });
      return;
    }

    setProcessingId(targetUser.id);
    const adminRoleRef = doc(firestore, 'roles_admin', targetUser.id);
    
    try {
        if (isCurrentlyAdmin) {
            // Revoke admin
            await deleteDoc(adminRoleRef);
            toast({ title: 'Admin Revoked', description: `${targetUser.username} is no longer an admin.` });
        } else {
            // Grant admin - create an empty document
            await setDoc(adminRoleRef, {}); 
            toast({ title: 'Admin Granted', description: `${targetUser.username} is now an admin.` });
        }
    } catch (error: any) {
        console.error("Failed to toggle admin status:", error);
        toast({ variant: 'destructive', title: 'Operation Failed', description: error.message || 'Could not update admin status. Check security rules.' });
    } finally {
        setProcessingId(null);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Users & Admins</h1>
        <p className="text-muted-foreground">Grant or revoke admin privileges for users.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
                {isLoading ? "Loading users..." : (
                    <>There are currently <span className="font-bold text-primary">{users?.length ?? 0}</span> users on the platform.</>
                )}
            </CardDescription>
        </CardHeader>
        <CardContent>
             {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
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
                           <Avatar>
                                <AvatarImage src={`https://picsum.photos/seed/${u.id}/100/100`} />
                                <AvatarFallback>{u.username?.charAt(0).toUpperCase()}</AvatarFallback>
                           </Avatar>
                           <div>
                                <p className="font-semibold">{u.username}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {adminUids.has(u.id) ? (
                            <Badge className="bg-primary hover:bg-primary text-primary-foreground">
                                <Crown className="mr-2 h-3 w-3" />
                                Admin
                            </Badge>
                        ) : (
                             <Badge variant="secondary">
                                <User className="mr-2 h-3 w-3" />
                                User
                            </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleAdmin(u)}
                            disabled={processingId === u.id || u.email === 'rentapog@gmail.com'}
                        >
                          {processingId === u.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : adminUids.has(u.id) ? (
                            <ShieldOff className="mr-2 h-4 w-4" />
                          ) : (
                            <Crown className="mr-2 h-4 w-4" />
                          )}
                          {adminUids.has(u.id) ? 'Revoke Admin' : 'Grant Admin'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 font-semibold">No users found.</p>
                    <p className="text-sm">The first user will appear here after they sign up.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
