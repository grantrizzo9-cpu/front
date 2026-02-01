"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function ContactContent() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const subject = formData.get('subject') as string | null;
    const message = formData.get('message') as string | null;
    const name = formData.get('name') as string | null;
    const email = formData.get('email') as string | null;

    const body = `Name: ${name || ''}\nFrom: ${email || ''}\n\nMessage:\n${message || ''}`;
    
    // This will open the user's default email client
    window.location.href = `mailto:support@rentahost.shop?subject=${encodeURIComponent(
      subject || 'Contact Form Submission'
    )}&body=${encodeURIComponent(body)}`;

    toast({
      title: "Opening Email Client",
      description: "Your message has been prepared in your default email application.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-20 md:py-32">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Contact Us</CardTitle>
              <CardDescription>
                Have a question or need support? Fill out the form below to open a pre-filled email in your default email client.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" type="text" placeholder="Your Name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" type="text" placeholder="How can we help?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Your message..." required rows={6} />
                </div>
                <Button type="submit" className="w-full">
                  Prepare Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
