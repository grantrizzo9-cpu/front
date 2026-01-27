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
import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { firebaseConfig } from "@/firebase/config";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (firebaseConfig.apiKey.startsWith("REPLACE_WITH")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <AlertTriangle className="text-destructive" />
            Firebase Not Configured
          </CardTitle>
          <CardDescription>
            The application is not connected to Firebase. Please follow the instructions
            in the code file below to resolve this issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-semibold">Action Required:</p>
            <p className="text-sm">
                1. Open the file: <code className="bg-background p-1 rounded">src/firebase/config.ts</code>
            </p>
            <p className="text-sm">
                2. Follow the instructions in the comments at the top of the file to add your
                   Firebase project configuration.
            </p>
        </CardContent>
      </Card>
    );
  }

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
