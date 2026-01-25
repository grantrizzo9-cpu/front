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
import { Loader2, Copy } from 'lucide-react';

export default function AiToolsPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog-intro');
  const [wordCount, setWordCount] = useState<number | undefined>(undefined);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedContent('');

    try {
      const result = await generateContent({ topic, contentType, wordCount: wordCount ? Number(wordCount) : undefined });
      setGeneratedContent(result.content);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with the AI content generator.',
      });
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
          <CardContent className="flex-1">
            <Textarea
              className="h-full resize-none bg-secondary/50"
              placeholder="Your content will be generated here."
              value={generatedContent}
              readOnly
            />
          </CardContent>
          {generatedContent && (
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
