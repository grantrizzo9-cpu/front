'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateImage } from '@/ai/flows/image-generator';
import { Loader2, Download, AlertTriangle, ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function AiImagePage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedImageUrl('');
    setError(null);

    try {
      const result = await generateImage({ prompt });
      if (result.error) {
        setError(result.error);
      } else if (result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
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
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'Image Downloading!',
        description: 'Your image has started downloading.',
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">AI Image Generator</h1>
        <p className="text-muted-foreground">
          Create stunning, unique, and royalty-free images from a simple text description.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Image Details</CardTitle>
            <CardDescription>
              Describe the image you want to create in as much detail as possible.
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
                  placeholder="e.g., 'A photorealistic image of an astronaut riding a horse on Mars'"
                  required
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Image'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col relative">
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>Your AI-generated image will appear below. Download and use it anywhere!</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-secondary/50 rounded-b-lg p-4 min-h-[300px]">
            {isLoading && (
                <div className='flex flex-col items-center gap-4 text-muted-foreground text-center'>
                    <Loader2 className='w-12 h-12 animate-spin' />
                    <p>Generating your image... <br/>This can take up to 30 seconds.</p>
                </div>
            )}
            {!isLoading && error && (
                <div className='flex flex-col items-center gap-4 text-destructive text-center'>
                    <AlertTriangle className='w-12 h-12' />
                    <p className='font-semibold'>Image Generation Failed</p>
                    <p className='text-sm'>{error}</p>
                </div>
            )}
            {!isLoading && !error && !generatedImageUrl && (
                <div className='flex flex-col items-center gap-2 text-muted-foreground text-center'>
                    <ImageIcon className='w-16 h-16' />
                    <p>Your image will appear here.</p>
                </div>
            )}
            {!isLoading && !error && generatedImageUrl && (
                <div className="relative w-full h-full aspect-square">
                    <Image
                        src={generatedImageUrl}
                        alt={prompt}
                        fill
                        className="object-contain"
                    />
                </div>
            )}
          </CardContent>
          {generatedImageUrl && !error && (
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
