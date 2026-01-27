"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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
        // We don't want to reveal if a user exists or not for security reasons.
        // So we show the same message as success.
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
        <CardTitle className="font-headline text-2xl">Forgot Password</CardTitle>
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
                     <Link href="/login">Back to Log In</Link>
                 </Button>
             </div>
        ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </Button>
            </form>
        )}
        <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
                Log in
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
