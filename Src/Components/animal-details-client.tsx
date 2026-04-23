
'use client';

import { useState } from 'react';
import type { Animal } from '@/lib/definitions';
import { summarizeAnimalListing, SummarizeAnimalListingOutput } from '@/ai/flows/summarize-animal-listing';
import { suggestSimilarAnimals, SuggestSimilarAnimalsOutput } from '@/ai/flows/suggest-similar-animals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { AnimalIcon } from './animal-icon';
import { MapPin, Calendar, User, Phone, BrainCircuit, Sparkles, Loader2, AlertTriangle, LogIn, Clock, Send, Check, Hourglass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

type ContactStatus = 'idle' | 'requested' | 'approved' | 'revealed';

function StatusTracker({ status }: { status: ContactStatus }) {
    const isRequested = status === 'requested' || status === 'approved' || status === 'revealed';
    const isApproved = status === 'approved' || status === 'revealed';

    return (
        <div className="space-y-4">
            <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", isRequested ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <Send className="h-4 w-4" />
                    </div>
                    <div className={cn("h-8 w-0.5", isApproved ? "bg-primary" : "bg-muted")} />
                </div>
                <div>
                    <p className={cn("font-semibold", isRequested && "text-primary")}>Request Sent</p>
                    <p className="text-sm text-muted-foreground">Your request has been sent to the seller.</p>
                </div>
            </div>
            <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {isApproved ?
                        <Check className="h-5 w-5 text-primary" /> :
                        <Hourglass className={cn("h-5 w-5", isRequested && "animate-spin")} />
                    }
                </div>
                <div className='ml-4'>
                    <p className={cn("font-semibold", isApproved && "text-primary")}>Seller Approval</p>
                    <p className="text-sm text-muted-foreground">
                        {isApproved ? 'The seller has approved your request.' : 'Waiting for the seller to respond.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AnimalDetailsClient({ animal }: { animal: Animal }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummarizeAnimalListingOutput | null>(null);
  const [similar, setSimilar] = useState<SuggestSimilarAnimalsOutput | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<ContactStatus>('idle');

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    try {
      const result = await summarizeAnimalListing({
        title: animal.title,
        breed: animal.breed,
        price: animal.price,
        location: animal.location,
        desc: animal.desc,
      });
      setSummary(result);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummaryError('Failed to generate summary. Please try again.');
    } finally {
      setIsSummaryLoading(false);
    }
  };
  
  const handleSuggestSimilar = async () => {
    setIsSimilarLoading(true);
    setSimilarError(null);
    try {
      const result = await suggestSimilarAnimals({
        category: animal.category,
        breed: animal.breed,
        location: animal.location,
        title: animal.title,
        desc: animal.desc,
      });
      setSimilar(result);
    } catch (error) {
      console.error('Error suggesting similar animals:', error);
      setSimilarError('Failed to suggest similar animals. Please try again.');
    }
    finally {
      setIsSimilarLoading(false);
    }
  };

  const handleRequestContact = () => {
    setContactStatus('requested');
    toast({
        title: "Request Sent",
        description: "The seller has been notified. Please wait for approval.",
    });

    // Simulate seller approval after a delay
    setTimeout(() => {
        setContactStatus('approved');
        toast({
            title: "Request Approved!",
            description: "You can now view the seller's contact information.",
        });
    }, 5000); // 5-second delay
  }

  const handleViewContact = () => {
    setContactStatus('revealed');
    toast({
        title: "Seller Contact Revealed",
        description: "You can now see the seller's phone number.",
    });
  }

  const handleCallSeller = () => {
    const sellerPhoneNumber = animal.userPhone;
    toast({
      title: 'Contacting Seller',
      description: `Dialing ${sellerPhoneNumber}...`,
    });
    // This will attempt to open the default calling app.
    window.location.href = `tel:${sellerPhoneNumber}`;
  };

  const renderContactButton = () => {
    if (animal.status !== 'active') {
        return <Badge variant="destructive" className="w-full text-center justify-center py-2 text-base">SOLD</Badge>;
    }
    if (!user) {
        return (
            <Button asChild className="w-full" variant="outline">
                <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login to Contact Seller
                </Link>
            </Button>
        );
    }

    if (contactStatus === 'idle') {
        return (
            <Button onClick={handleRequestContact} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Request to See Contact
            </Button>
        );
    }

    if (contactStatus === 'requested') {
        return <StatusTracker status={contactStatus} />;
    }

    if (contactStatus === 'approved') {
        return (
            <div className='flex flex-col gap-4'>
                <StatusTracker status={contactStatus} />
                <Button onClick={handleViewContact} className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    View Contact
                </Button>
            </div>
        );
    }

    if (contactStatus === 'revealed') {
        return (
            <div className='flex flex-col gap-2'>
                 <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className='font-semibold'>{animal.userPhone}</span>
                </div>
                <Button onClick={handleCallSeller} className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                </Button>
            </div>
        );
    }
    
    return null;
  }


  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <Card className="overflow-hidden">
          <CardHeader className="p-0">
            <Image
              src={animal.imageUrl}
              alt={animal.title}
              width={800}
              height={600}
              className="w-full object-cover"
              data-ai-hint={animal.imageHint}
              priority
            />
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <h1 className="text-3xl font-bold">{animal.title}</h1>
            <div className="text-2xl font-semibold text-primary">{formatPrice(animal.price)}</div>
            <p className="text-muted-foreground">{animal.desc}</p>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-4 text-sm text-muted-foreground">
             <div className="flex items-center gap-2">
                <AnimalIcon category={animal.category} className="h-4 w-4" />
                <span>{animal.category} / {animal.breed}</span>
            </div>
            {animal.age && (
              <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{animal.age}</span>
              </div>
            )}
             <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{animal.location}</span>
            </div>
             <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Posted {formatDistanceToNow(new Date(animal.createdAt), { addSuffix: true })}</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit /> AI Corner</CardTitle>
                <CardDescription>Use AI to get more insights about this listing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Button onClick={handleGenerateSummary} disabled={isSummaryLoading}>
                        {isSummaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate AI Summary
                    </Button>
                    {summaryError && <Alert variant="destructive" className="mt-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{summaryError}</AlertDescription></Alert>}
                    {summary && (
                        <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                            <h4 className="font-semibold">Summary:</h4>
                            <p className="text-sm text-muted-foreground">{summary.summary}</p>
                        </div>
                    )}
                </div>
                 <div>
                    <Button onClick={handleSuggestSimilar} disabled={isSimilarLoading}>
                       {isSimilarLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Suggest Similar Animals
                    </Button>
                    {similarError && <Alert variant="destructive" className="mt-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{similarError}</AlertDescription></Alert>}
                    {similar && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-semibold">Similar Animals:</h4>
                          <div className="grid gap-4">
                            {similar.map((item, index) => (
                              <div key={index} className="p-3 bg-muted rounded-lg">
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.breed} in {item.location}</p>
                                <p className="text-xs mt-1 italic">Reason: {item.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seller Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>{animal.userName}</span>
            </div>
            {renderContactButton()}
          </CardContent>
        </Card>
         <Button variant="outline" asChild className="w-full">
            <Link href="/">⬅ Back to all animals</Link>
         </Button>
      </div>
    </div>
  );
}

    