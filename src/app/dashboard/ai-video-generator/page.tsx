'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateVideo } from '@/ai/flows/video-generator';
import { Loader2, Clapperboard, Download } from 'lucide-react';

export default function AiVideoGeneratorPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedVideo('');

    try {
      const result = await generateVideo({ 
          prompt,
      });
      setGeneratedVideo(result.videoDataUri);
      toast({
        title: 'Video Generated!',
        description: 'Your AI-generated video is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error instanceof Error ? error.message : 'There was a problem with the AI video generator.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">AI Video Generator</h1>
        <p className="text-muted-foreground">
          Create stunning short videos from a text description.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
            <CardDescription>
              Describe the video you want to create. Be as descriptive as possible!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'A majestic dragon soaring over a mystical forest at dawn.'"
                  required
                  rows={5}
                />
              </div>
               <p className="text-xs text-muted-foreground">
                Note: Videos are generated in 16:9 widescreen format.
              </p>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  'Generate Video'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col relative">
          <CardHeader>
            <CardTitle>Generated Video</CardTitle>
            <CardDescription>Your video will appear here. This can take a few minutes.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-secondary/50 rounded-b-md">
            {isLoading && !generatedVideo && (
                <div className='flex flex-col items-center gap-4 text-muted-foreground'>
                    <Clapperboard className='w-16 h-16 animate-pulse' />
                    <p>Generating, please wait...</p>
                    <p className='text-xs'>(This may take a minute or two)</p>
                </div>
            )}
            {generatedVideo && (
              <video src={generatedVideo} controls autoPlay loop className="w-full rounded-md" />
            )}
            {!isLoading && !generatedVideo && (
                <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                    <Clapperboard className='w-16 h-16' />
                    <p>Your video will appear here.</p>
                </div>
            )}
          </CardContent>
          {generatedVideo && (
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                asChild
              >
                <a href={generatedVideo} download="ai-generated-video.mp4">
                    <Download className="h-4 w-4" />
                </a>
              </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
