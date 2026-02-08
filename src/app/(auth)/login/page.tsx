"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect, Suspense } from "react";
import { Loader2, ShieldAlert, ExternalLink, RefreshCcw, Lock, Clock, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { firebaseConfig } from "@/firebase/config";
import { terminate, clearIndexedDbPersistence } from "firebase/firestore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [apiKeyBlocked, setApiKeyBlocked] = useState(false);

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

  const handleHardReset = async () => {
      setIsLoading(true);
      try {
          await terminate(firestore);
          await clearIndexedDbPersistence(firestore);
          toast({ title: "Cache Cleared", description: "Reloading application..." });
          window.location.reload();
      } catch (e) {
          window.location.reload();
      }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setUnauthorizedDomain(null);
    setApiKeyBlocked(false);
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
      
      if (error.message?.toLowerCase().includes('requests-from-referer-blocked') || 
          error.code === 'auth/requests-from-referer-blocked' ||
          error.message?.toLowerCase().includes('offline')) {
          setApiKeyBlocked(true);
          return;
      }

      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized domain')) {
          setUnauthorizedDomain(window.location.hostname);
          return; 
      }

      let description = "An unknown error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = "Invalid email or password.";
      } else if (error.code === 'auth/too-many-requests') {
        description = "Too many failed attempts. Try again later.";
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

  const gcpCredentialsUrl = `https://console.cloud.google.com/apis/credentials?project=${firebaseConfig.projectId}`;

  return (
    <div className="space-y-6">
      {apiKeyBlocked && (
        <Alert variant="destructive" className="border-amber-500 bg-amber-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-bold text-red-800">Security Sync in Progress</AlertTitle>
          <AlertDescription className="text-sm space-y-3 text-red-700">
            <p>Google Cloud settings can take <strong>2–5 minutes</strong> to sync globally. If you just clicked Save, please wait.</p>
            <div className="bg-white/50 p-3 rounded border border-red-200 text-xs space-y-2">
                <p className="font-semibold uppercase tracking-wider flex items-center gap-1"><Clock className="h-3 w-3"/> Verification Check:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Confirm API Key ends in: <code>...{firebaseConfig.apiKey.slice(-4)}</code></li>
                    <li>Confirm Entry: <code>https://{window.location.hostname}/*</code></li>
                </ul>
            </div>
            <div className="flex flex-col gap-2">
                <Button asChild variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">
                    <a href={gcpCredentialsUrl} target="_blank" rel="noopener noreferrer">
                        Check API Key Settings <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </Button>
                <Button onClick={handleHardReset} variant="outline" size="sm" className="bg-white text-amber-800 border-amber-200 font-bold">
                    <Trash2 className="mr-2 h-3 w-3" /> Clear Cache & Refresh
                </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {unauthorizedDomain && !apiKeyBlocked && (
        <Alert variant="destructive" className="border-red-500 bg-red-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="font-bold text-red-800">Domain Not Whitelisted</AlertTitle>
          <AlertDescription className="text-sm space-y-3 text-red-700">
            <p>Firebase Auth is blocking access because this domain is missing from your "Authorized Domains".</p>
            <div className="bg-white/50 p-3 rounded border border-red-200">
                <p className="font-semibold text-xs uppercase tracking-wider mb-1">Required Action:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Go to <strong>Firebase Console > Auth > Settings</strong>.</li>
                    <li>In <strong>Authorized Domains</strong>, click "Add domain".</li>
                    <li>Paste: <code>{unauthorizedDomain}</code></li>
                </ol>
            </div>
            <Button onClick={handleHardReset} variant="outline" size="sm" className="w-full bg-white">
                <RefreshCcw className="mr-2 h-3 w-3" /> Refresh Page
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-xl border-t-4 border-t-red-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-2xl text-red-600">Access Your Account</CardTitle>
            <Lock className="h-5 w-5 text-muted-foreground/30" />
          </div>
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
                <Link href={getLinkWithRef('/forgot-password')} className="text-sm text-muted-foreground hover:text-primary">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required disabled={isLoading}/>
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
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
