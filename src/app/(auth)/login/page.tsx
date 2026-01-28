
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { firebaseConfig } from "@/firebase/config"; // Import config

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    // Check if the config is still the placeholder on the client side
    if (firebaseConfig.apiKey === "REPLACE_WITH_YOUR_API_KEY") {
      setIsConfigured(false);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
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
      let description = "An unknown error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = "Invalid email or password. If you've signed up before, you can also reset your password.";
      } else if (error.code === 'auth/too-many-requests') {
        description = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
      } else if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/configuration-not-found') {
          description = "The Firebase configuration is invalid. Please check your API key."
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

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Firebase Not Configured
          </CardTitle>
          <CardDescription>
            The application is not connected to Firebase. Please follow the instructions in the code file below to resolve this issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-semibold">Action Required:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Open the file: <code className="bg-muted px-1 py-0.5 rounded">src/firebase/config.ts</code></li>
            <li>Follow the instructions in the comments at the top of the file to add your Firebase project configuration.</li>
          </ol>
        </CardContent>
      </Card>
    )
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
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
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required disabled={isLoading}/>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
