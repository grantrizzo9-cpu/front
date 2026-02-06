import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-background p-4 pt-20 md:pt-32">
      <div className="mb-12">
        <Logo className="scale-125" />
      </div>
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
