
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateContent } from '@/ai/flows/content-generator';
import { Loader2, Copy, AlertTriangle, BrainCircuit, PlusCircle, FileText, Send, Edit, FileUp, X, Eye } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, serverTimestamp, orderBy, doc } from 'firebase/firestore';
import type { Content } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PublisherPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Blog Post');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  const [selectedArticle, setSelectedArticle] = useState<Content | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // Fetch all content for the current user, ordered by date
  const contentQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'content'), orderBy('createdAt', 'desc'));
  }, [firestore, user?.uid]);
  const { data: articles, isLoading: isLoadingArticles } = useCollection<Content>(contentQuery);

  const handleGenerateContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !firestore) return;
    setIsGenerating(true);
    setGeneratorError(null);

    try {
      const result = await generateContent({ topic, contentType });
      if (result.error) {
        setGeneratorError(result.error);
      } else if (result.content) {
        const contentRef = collection(firestore, 'users', user.uid, 'content');
        const newArticle = {
          userId: user.uid,
          title: title || topic,
          topic,
          contentType,
          content: result.content,
          status: 'draft' as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await addDocumentNonBlocking(contentRef, newArticle);
        toast({ title: 'Content Saved!', description: 'Your new article has been saved as a draft.' });
        setTopic('');
        setTitle('');
      } else {
        setGeneratorError('The AI model returned an empty response.');
      }
    } catch (e: any) {
      setGeneratorError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedArticle || !firestore) return;
    const docRef = doc(firestore, 'users', selectedArticle.userId, 'content', selectedArticle.id);
    const updatedData = {
        title: selectedArticle.title,
        content: selectedArticle.content,
        updatedAt: serverTimestamp(),
    };
    updateDocumentNonBlocking(docRef, updatedData);
    toast({ title: 'Changes Saved', description: 'Your article has been updated.' });
    setIsEditDialogOpen(false);
  };
  
  const handlePublish = () => {
    if (!selectedArticle || !firestore) return;
    const docRef = doc(firestore, 'users', selectedArticle.userId, 'content', selectedArticle.id);
    updateDocumentNonBlocking(docRef, { status: 'published', updatedAt: serverTimestamp() });
    toast({ title: 'Article Published!', description: 'Your article is now marked as published.' });
    setIsEditDialogOpen(false);
    setIsPublishDialogOpen(true);
  };
  
  const formatAsHtml = (text: string) => {
    return text.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p.trim()}</p>`).join('\n');
  };

  const copyHtml = () => {
    if (!selectedArticle) return;
    const htmlContent = formatAsHtml(selectedArticle.content);
    navigator.clipboard.writeText(htmlContent);
    toast({ title: 'Copied to Clipboard!', description: 'HTML content has been copied.' });
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Content Publisher</h1>
        <p className="text-muted-foreground">Generate, manage, and publish your articles and blog posts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PlusCircle /> New Article</CardTitle>
              <CardDescription>Generate a new article using AI.</CardDescription>
            </CardHeader>
            <form onSubmit={handleGenerateContent}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., How AI is Changing Marketing" required disabled={isGenerating} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Prompt</Label>
                  <Textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., a blog post about using AI to write ad copy" required disabled={isGenerating} />
                </div>
                {generatorError && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Generation Failed</AlertTitle>
                        <AlertDescription>{generatorError}</AlertDescription>
                    </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? <><Loader2 className="animate-spin" /> Generating...</> : <><BrainCircuit /> Generate Content</>}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText /> Your Content Hub</CardTitle>
              <CardDescription>All your saved articles are here. Click to edit and publish.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingArticles ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-primary" /></div>
              ) : articles && articles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map(article => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-xs truncate">{article.title}</TableCell>
                        <TableCell>
                          <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>{article.status}</Badge>
                        </TableCell>
                        <TableCell>{format(article.updatedAt.toDate(), 'PP')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedArticle(article); setIsEditDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>You haven't generated any content yet.</p>
                  <p className="text-sm">Use the form to create your first article.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleSaveChanges}>
            <DialogHeader>
              <DialogTitle>Edit Article</DialogTitle>
              <DialogDescription>Refine your article below. When you're ready, save your changes or publish it.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" value={selectedArticle?.title || ''} onChange={(e) => setSelectedArticle(prev => prev ? {...prev, title: e.target.value} : null)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea id="edit-content" value={selectedArticle?.content || ''} onChange={(e) => setSelectedArticle(prev => prev ? {...prev, content: e.target.value} : null)} rows={15} />
              </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
                <Button type="button" onClick={handlePublish}><FileUp className="mr-2"/> Publish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Publish Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ready to Publish!</DialogTitle>
            <DialogDescription>Your article has been formatted as HTML. Copy the code below and paste it into your blog or website editor (like WordPress, Medium, etc.).</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea readOnly value={formatAsHtml(selectedArticle?.content || '')} rows={10} className="font-mono text-xs"/>
          </div>
          <DialogFooter>
            <Button onClick={copyHtml}><Copy className="mr-2"/> Copy HTML</Button>
            <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
