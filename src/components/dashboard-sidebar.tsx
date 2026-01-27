"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  Shield,
  LogOut,
  MoreVertical,
  Undo2,
  LayoutGrid,
  BrainCircuit,
  ShieldQuestion,
  ArrowUpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Skeleton } from "./ui/skeleton";
import { useAdmin } from "@/hooks/use-admin";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push("/");
    });
  };

  const menuItems = [
    { path: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { path: "/dashboard/ai-tools", icon: <BrainCircuit />, label: "AI Content" },
    { path: "/dashboard/upgrade", icon: <ArrowUpCircle />, label: "Upgrade" },
    { path: "/dashboard/referrals", icon: <Users />, label: "Referrals" },
    { path: "/dashboard/payouts", icon: <Wallet />, label: "Payouts" },
    { path: "/dashboard/settings", icon: <Settings />, label: "Settings" },
    { path: "/dashboard/refund", icon: <Undo2 />, label: "Refund" },
  ];

  const adminMenuItems = [
    { path: "/admin/dashboard", icon: <LayoutGrid />, label: "Packages" },
    { path: "/admin/payouts", icon: <Shield />, label: "Manage Payouts" },
    { path: "/admin/refunds", icon: <ShieldQuestion />, label: "Refund Requests" },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.path)}
              >
                <Link href={item.path}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {!isAdminLoading && isAdmin && (
            <>
              <SidebarMenuItem className="mt-4">
                <span className="px-2 text-xs font-semibold text-muted-foreground">Admin</span>
              </SidebarMenuItem>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                  >
                    <Link href={item.path}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3">
           <Avatar>
            {isUserLoading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : (
              <>
                <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/100/100`} />
                <AvatarFallback>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          <div className="flex-1 overflow-hidden">
            {isUserLoading ? (
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <>
                <p className="font-semibold text-sm truncate">{user?.displayName || user?.email}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isUserLoading}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
