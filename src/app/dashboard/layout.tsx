import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col">
          {/* A minimal header for mobile or a trigger can be added here */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
