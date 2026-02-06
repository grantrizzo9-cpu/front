import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 py-12">
      <div className="mb-8">
        <Logo className="scale-110" />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
