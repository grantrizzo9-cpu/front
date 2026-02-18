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
import { Loader2, ShieldAlert, ExternalLink, RefreshCcw, Lock, Trash2, Globe, CheckCircle2, Info } from "lucide-react";
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
  const [currentOrigin, setCurrentOrigin] = useState("");

  useEffect(() => {
    setIsHydrated(true);
    setCurrentOrigin(window.location.origin);
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
          if (firestore) {
              await terminate(firestore);
              await clearIndexedDbPersistence(firestore);
          }
          toast({ title: "Cache Cleared", description: "Reloading application..." });
          setTimeout(() => {
              window.location.reload();
          }, 500);
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
      toast({ title: "Login Successful", description: "Redirecting..." });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error.code, error.message);
      
      const isConnectionIssue = 
          error.message?.toLowerCase().includes('referer-blocked') || 
          error.code === 'auth/requests-from-referer-blocked' ||
          error.message?.toLowerCase().includes('offline') ||
          error.code === 'unavailable';

      if (isConnectionIssue) {
          setApiKeyBlocked(true);
          return;
      }

      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized domain')) {
          setUnauthorizedDomain(window.location.hostname);
          return; 
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
      });
    } finally {
        setIsLoading(false);
    }
  };

  const gcpCredentialsUrl = `https://console.cloud.google.com/apis/credentials?project=${firebaseConfig.projectId}`;

  return (
    <div className="space-y-6">
      {apiKeyBlocked && (
        <Alert variant="destructive" className="border-amber-500 bg-amber-50 shadow-lg">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-bold text-red-800 uppercase tracking-tighter">Connection Blocked</AlertTitle>
          <AlertDescription className="text-sm space-y-4 text-red-700">
            <p>Your <strong>Google Cloud API Key</strong> is blocking this site. This happens when the key was deleted or the domain isn't whitelisted.</p>
            
            <div className="bg-white/80 p-4 rounded-xl border border-amber-200 space-y-3">
                <p className="font-bold text-xs uppercase flex items-center gap-1"><Info className="h-3 w-3"/> Required Whitelist Entry:</p>
                <code className="block p-3 bg-slate-900 text-green-400 rounded-lg font-mono text-xs break-all shadow-inner">
                    {currentOrigin}/*
                </code>
                <p className="text-[10px] italic text-muted-foreground leading-tight">
                    In GCP Credentials, click your <strong>API Key</strong> (NOT Client ID), find "Website restrictions", click "ADD", and paste the code above.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <Button onClick={handleHardReset} variant="default" className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-12">
                    <Trash2 className="mr-2 h-4 w-4" /> 1. Clear Cache & Retry
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-white text-amber-800 border-amber-200 font-bold h-10">
                    <a href={gcpCredentialsUrl} target="_blank" rel="noopener noreferrer">
                        2. Go to GCP Credentials <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                </Button>
            </div>
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
            <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg" disabled={isLoading}>
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
