import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-background p-4 pt-20 md:pt-32 space-y-12">
      <div className="relative z-20 pb-4">
        <Logo className="scale-150" />
      </div>
      <div className="w-full max-w-md relative z-10 pb-12">
        {children}
      </div>
    </div>
  );
}