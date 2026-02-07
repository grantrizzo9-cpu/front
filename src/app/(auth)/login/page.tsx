"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect, Suspense } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const refCode = isHydrated ? searchParams.get('ref') : null;

  const getLinkWithRef = (baseHref: string) => {
    if (!refCode) return baseHref;
    const url = new URL(baseHref, 'http://dummybase.com');
    url.searchParams.set('ref', refCode);
    return `${url.pathname}${url.search}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setUnauthorizedDomain(null);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error.code, error.message);
      let description = "An unknown error occurred. Please try again.";
      
      // Handle domain blocked error (usually referer blocked)
      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('requests-from-referer') || error.message?.includes('blocked')) {
          setUnauthorizedDomain(window.location.hostname);
          return; 
      }

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = "Invalid email or password. If you've signed up before, you can also reset your password.";
      } else if (error.code === 'auth/too-many-requests') {
        description = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
      } else if (error.message) {
        description = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {unauthorizedDomain && (
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="font-bold">Domain Security Block</AlertTitle>
          <AlertDescription className="text-xs space-y-2">
            <p>Firebase is blocking access because this domain is not whitelisted.</p>
            <p className="font-semibold underline">Required Action:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <strong>Firebase Console</strong>.</li>
              <li>Navigate to <strong>Auth > Settings > Authorized Domains</strong>.</li>
              <li>Add <code>{unauthorizedDomain}</code> to the list.</li>
            </ol>
            <p className="pt-2">Then refresh this page and try again.</p>
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-red-600">Access Your Account</CardTitle>
          <CardDescription>Log in to manage your affiliate dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href={getLinkWithRef('/forgot-password')} name="forgot-password-link" className="text-sm text-muted-foreground hover:text-primary">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required disabled={isLoading}/>
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href={getLinkWithRef('/signup')} className="text-primary hover:underline font-bold">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
