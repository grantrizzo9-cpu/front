
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateVideo } from '@/ai/flows/video-generator';
import { Loader2, Download, AlertTriangle, Clapperboard } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function AiVideoPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedVideoUrl('');
    setError(null);

    try {
      const result = await generateVideo({ prompt });
      if (result.error) {
        setError(result.error);
      } else if (result.videoUrl) {
        setGeneratedVideoUrl(result.videoUrl);
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

  const handleDownload = () => {
    if (generatedVideoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideoUrl;
      link.download = `ai-generated-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'Video Downloading!',
        description: 'Your video has started downloading.',
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">AI Video Generator</h1>
        <p className="text-muted-foreground">
          Bring your ideas to life. Create short video clips from a simple text description.
        </p>
      </div>
      
       <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Please Note</AlertTitle>
          <AlertDescription>
            Video generation is a resource-intensive process and may take a minute or more to complete. Please be patient.
          </AlertDescription>
        </Alert>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
            <CardDescription>
              Describe the video you want to create. Be as specific as possible for the best results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
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
            <CardDescription>Your AI-generated video will appear below. Download and use it anywhere!</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-secondary/50 rounded-b-lg p-4 min-h-[300px]">
            {isLoading && (
                <div className='flex flex-col items-center gap-4 text-muted-foreground text-center'>
                    <Loader2 className='w-12 h-12 animate-spin' />
                    <p>Generating your video... <br/>This can take over a minute. Please wait.</p>
                </div>
            )}
            {!isLoading && error && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <AlertTriangle className="w-12 h-12 text-destructive" />
                  <p className="font-semibold text-destructive">
                    Video Generation Failed
                  </p>
                  <div className="text-sm text-muted-foreground p-4 bg-secondary/50 rounded-lg max-w-sm">
                    <p>{error}</p>
                    {error.includes("API Key") && (
                      <p className="mt-2">
                        Click the link below to get your key, then paste it into the 
                        <code className="bg-muted p-1 rounded-sm mx-1">.env</code> file in the file explorer.
                      </p>
                    )}
                  </div>
                  {error.includes("API Key") && (
                    <Button asChild variant="link">
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                        Get Gemini API Key
                      </a>
                    </Button>
                  )}
                </div>
            )}
            {!isLoading && !error && !generatedVideoUrl && (
                <div className='flex flex-col items-center gap-2 text-muted-foreground text-center'>
                    <Clapperboard className='w-16 h-16' />
                    <p>Your video will appear here.</p>
                </div>
            )}
            {!isLoading && !error && generatedVideoUrl && (
                <div className="relative w-full h-full aspect-video">
                    <video
                        src={generatedVideoUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-contain"
                    />
                </div>
            )}
          </CardContent>
          {generatedVideoUrl && !error && (
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
