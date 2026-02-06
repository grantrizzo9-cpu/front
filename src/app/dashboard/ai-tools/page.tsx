'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateContent } from '@/ai/flows/content-generator';
import { Loader2, Copy, AlertTriangle, BrainCircuit } from 'lucide-react';

export default function AiToolsPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog-intro');
  const [wordCount, setWordCount] = useState<number | undefined>(undefined);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedContent('');
    setError(null);

    try {
      const result = await generateContent({ topic, contentType, wordCount: wordCount ? Number(wordCount) : undefined });
      if (result.error) {
        setError(result.error);
      } else if (result.content) {
        setGeneratedContent(result.content);
      } else {
        setError('The AI model returned an empty response.');
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected problem occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast({
        title: 'Content Copied!',
        description: 'The generated content has been copied to your clipboard.',
      });
    }
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">AI Content Generator</h1>
        <p className="text-muted-foreground">
          Create compelling content for your websites, blogs, and social media in seconds.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
            <CardDescription>
              Provide a topic and select the type of content you want to generate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
               <div className="space-y-2">
                <Label htmlFor="topic">Topic / Subject</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 'The future of renewable energy'"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger id="content-type">
                      <SelectValue placeholder="Select a content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog-intro">Blog Post Intro</SelectItem>
                      <SelectItem value="social-media-post">Social Media Post</SelectItem>
                      <SelectItem value="product-description">Product Description</SelectItem>
                      <SelectItem value="email-subject-line">Email Subject Line</SelectItem>
                      <SelectItem value="welcome-email">Welcome Email</SelectItem>
                      <SelectItem value="promotional-email">Promotional Email</SelectItem>
                      <SelectItem value="follow-up-email">Follow-up Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="word-count">Word Count (Optional)</Label>
                    <Input
                        id="word-count"
                        type="number"
                        value={wordCount || ''}
                        onChange={(e) => setWordCount(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="e.g., 250"
                    />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Content'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col relative">
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>Your AI-generated text will appear below. Copy and use it anywhere!</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-secondary/50 rounded-b-lg p-4 min-h-[200px]">
            {isLoading && (
                <div className='flex flex-col items-center gap-4 text-muted-foreground text-center'>
                    <Loader2 className='w-12 h-12 animate-spin' />
                    <p>Generating content...</p>
                </div>
            )}
            {!isLoading && error && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <AlertTriangle className="w-12 h-12 text-destructive" />
                  <p className="font-semibold text-destructive">
                    Content Generation Failed
                  </p>
                  <div className="text-sm text-muted-foreground p-4 bg-secondary/50 rounded-lg max-w-sm">
                    <p>{error}</p>
                    {error.includes("API key") && (
                      <p className="mt-2">
                        Click the link below to get your key, then paste it into the 
                        <code className="bg-muted p-1 rounded-sm mx-1">.env</code> file in the file explorer.
                      </p>
                    )}
                  </div>
                  {error.includes("API key") && (
                    <Button asChild variant="link">
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                        Get Gemini API Key
                      </a>
                    </Button>
                  )}
                   {error.includes("Enable the API") && (
                    <Button asChild variant="default" className="mt-2">
                      <a href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=affiliate-ai-host-new" target="_blank" rel="noopener noreferrer">
                        Enable API for Project
                      </a>
                    </Button>
                  )}
                </div>
            )}
            {!isLoading && !error && !generatedContent && (
                <div className='flex flex-col items-center gap-2 text-muted-foreground text-center'>
                    <BrainCircuit className='w-16 h-16' />
                    <p>Your content will appear here.</p>
                </div>
            )}
            {!isLoading && !error && generatedContent && (
                 <Textarea
                    className="h-full flex-1 resize-none bg-background"
                    placeholder="Your content will be generated here."
                    value={generatedContent}
                    readOnly
                />
            )}
          </CardContent>
          {generatedContent && !error && (
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
