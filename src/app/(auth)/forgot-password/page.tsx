"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ForgotPasswordForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const getLinkWithRef = (baseHref: string) => {
    if (!refCode) return baseHref;
    const url = new URL(baseHref, 'http://dummybase.com');
    url.searchParams.set('ref', refCode);
    return `${url.pathname}${url.search}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${email}, you will receive an email with instructions to reset your password.`,
      });
    } catch (error: any) {
      let description = "An error occurred. Please try again.";
      if (error.code === 'auth/user-not-found') {
        setEmailSent(true);
        toast({
            title: "Password Reset Email Sent",
            description: `If an account exists for ${email}, you will receive an email with instructions to reset your password.`,
        });
      } else {
        toast({
            variant: "destructive",
            title: "Error Sending Email",
            description: description,
        });
      }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-red-600">Forgot Password</CardTitle>
        <CardDescription>
            {emailSent 
                ? "Check your inbox for a password reset link."
                : "Enter your email address and we'll send you a link to reset your password."
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent ? (
             <div className="text-center">
                 <p className="text-muted-foreground mb-4">Didn't receive an email? Check your spam folder or try again.</p>
                 <Button asChild variant="secondary">
                     <Link href={getLinkWithRef('/login')}>Back to Log In</Link>
                 </Button>
             </div>
        ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </Button>
            </form>
        )}
        <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link href={getLinkWithRef('/login')} className="text-primary hover:underline">
                Log in
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
