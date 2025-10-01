'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Trash2, PlusCircle, Video, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Product, HeroSettings, MegaDealSettings } from '@/lib/types';
import { updateHeroSettingsAction, updateMegaDealsAction, updateTrendingProductsAction, updateReelsAction } from '@/lib/actions-async';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Checkbox } from '../ui/checkbox';

interface StudioHomepageClientProps {
    products: Product[];
    heroData: HeroSettings;
    megaDeals: MegaDealSettings[];
    reels: any[];
}

function SubmitButton({ label = 'Save Changes'}: { label?: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // A simple way to manage form submission state without useFormStatus for multiple forms
    const handleClick = () => {
        setIsSubmitting(true);
        // Reset after a delay, assuming submission takes time
        setTimeout(() => setIsSubmitting(false), 3000); 
    };

    return (
        <Button type="submit" onClick={handleClick} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Saving...' : label}
        </Button>
    )
}

const megaDealsSchema = z.object({
    deals: z.array(z.object({
        buy: z.coerce.number().min(1, "Must be at least 1"),
        get: z.coerce.number().min(1, "Must be at least 1"),
        total: z.coerce.number().min(1, "Must be at least 1"),
        active: z.boolean()
    }))
});

const reelsSchema = z.object({
    reels: z.array(z.object({
        id: z.coerce.number(),
        title: z.string().min(1, "Title is required"),
        poster: z.string().min(1, "Poster URL is required"),
        src: z.string().min(1, "Video URL is required"),
    }))
});

export function StudioHomepageClient({ products, heroData, megaDeals, reels: defaultReels }: StudioHomepageClientProps) {
    const { toast } = useToast();

    // --- Hero Section Form ---
    const [heroState, heroAction] = useActionState(updateHeroSettingsAction, { success: false, errors: {} });
     useEffect(() => {
        if (heroState.success) {
            toast({ title: "Hero Section Updated!", description: "Your changes have been saved." });
        }
    }, [heroState, toast]);

    // --- Mega Deals Form ---
    const dealsForm = useForm<z.infer<typeof megaDealsSchema>>({
        resolver: zodResolver(megaDealsSchema),
        defaultValues: {
            deals: megaDeals
        }
    });
    const { fields: dealFields, append: appendDeal, remove: removeDeal } = useFieldArray({
        control: dealsForm.control,
        name: "deals"
    });
    const [dealsState, dealsAction] = useActionState(updateMegaDealsAction, { success: false, errors: {} });
     useEffect(() => {
        if (dealsState.success) {
            toast({ title: "Mega Deals Updated!", description: "Your changes have been saved." });
        }
    }, [dealsState, toast]);
    const onDealsSubmit = (data: z.infer<typeof megaDealsSchema>) => {
        const formData = new FormData();
        formData.append('deals', JSON.stringify(data.deals));
        dealsAction(formData);
    }
    
    // --- Reels Form ---
    const reelsForm = useForm<z.infer<typeof reelsSchema>>({
        resolver: zodResolver(reelsSchema),
        defaultValues: {
            reels: defaultReels
        }
    });
    const { fields: reelFields, append: appendReel, remove: removeReel } = useFieldArray({
        control: reelsForm.control,
        name: "reels"
    });
    const [reelsState, reelsAction] = useActionState(updateReelsAction, { success: false, errors: {} });
    useEffect(() => {
        if (reelsState.success) {
            toast({ title: "Reels Showcase Updated!", description: "Your changes have been saved." });
        }
    }, [reelsState, toast]);
    const onReelsSubmit = (data: z.infer<typeof reelsSchema>) => {
        const formData = new FormData();
        formData.append('reels', JSON.stringify(data.reels));
        reelsAction(formData);
    }

    // --- Trending Products Form ---
    const [trendingState, trendingAction] = useActionState(updateTrendingProductsAction, { success: false, errors: {} });
    useEffect(() => {
        if (trendingState.success) {
            toast({ title: "Trending Products Updated!", description: "Your changes have been saved." });
        }
    }, [trendingState, toast]);

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-headline font-bold">Homepage Customization</h1>
                <p className="text-muted-foreground">Control the content and layout of your homepage.</p>
            </div>
        </div>

        {/* Hero Section */}
        <form action={heroAction}>
            <Card>
                <CardHeader>
                    <CardTitle>Hero Section</CardTitle>
                    <CardDescription>Update the main headline, subheadline, and background video.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="headline">Headline</Label>
                        <Input id="headline" name="headline" defaultValue={heroData.headline} />
                        {heroState.errors?.headline && <p className="text-sm text-destructive">{heroState.errors.headline[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subheadline">Subheadline</Label>
                        <Textarea id="subheadline" name="subheadline" defaultValue={heroData.subheadline} className="min-h-24"/>
                        {heroState.errors?.subheadline && <p className="text-sm text-destructive">{heroState.errors.subheadline[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hero-video">Background Video</Label>
                        <Input id="hero-video" name="videoUrl" type="file" accept="video/mp4,video/webm" />
                        <p className="text-sm text-muted-foreground">Upload a new background video. Recommended: short, looping, web-optimized MP4.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>

        {/* Mega Deals Section */}
        <Form {...dealsForm}>
            <form onSubmit={dealsForm.handleSubmit(onDealsSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Mega Deals</CardTitle>
                        <CardDescription>Add, edit, or remove bundle deals from the homepage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {dealFields.map((field, index) => (
                            <Card key={field.id} className="p-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={dealsForm.control}
                                        name={`deals.${index}.buy`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Buy</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={dealsForm.control}
                                        name={`deals.${index}.get`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Get</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={dealsForm.control}
                                        name={`deals.${index}.total`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <FormField
                                        control={dealsForm.control}
                                        name={`deals.${index}.active`}
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2 space-y-0">
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                <FormLabel>Active</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeDeal(index)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" className="w-full" onClick={() => appendDeal({ buy: 0, get: 0, total: 0, active: true })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Deal
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <SubmitButton label="Save Deals"/>
                    </CardFooter>
                </Card>
            </form>
        </Form>
        
        {/* Reels Showcase Section */}
        <Form {...reelsForm}>
            <form onSubmit={reelsForm.handleSubmit(onReelsSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Reels Showcase</CardTitle>
                        <CardDescription>Manage the videos that appear in the "Community Showcase" section.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {reelFields.map((field, index) => (
                             <Card key={field.id} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1 space-y-4">
                                        <FormField
                                            control={reelsForm.control}
                                            name={`reels.${index}.title`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={reelsForm.control}
                                            name={`reels.${index}.poster`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Poster URL</FormLabel>
                                                    <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                                                     <p className="text-xs text-muted-foreground">Enter a public URL for the video poster image.</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                         <FormField
                                            control={reelsForm.control}
                                            name={`reels.${index}.src`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Video URL</FormLabel>
                                                    <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                                                     <p className="text-xs text-muted-foreground">Enter a public URL for the video file.</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-end">
                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeReel(index)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Reel
                                    </Button>
                                </div>
                            </Card>
                        ))}
                         <Button type="button" variant="outline" className="w-full" onClick={() => appendReel({ id: Date.now(), title: '', poster: '', src: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Reel
                        </Button>
                    </CardContent>
                    <CardFooter>
                         <SubmitButton label="Save Reels"/>
                    </CardFooter>
                </Card>
            </form>
        </Form>

        {/* Trending Posters Section */}
        <form action={trendingAction}>
            <Card>
                <CardHeader>
                    <CardTitle>Trending Posters</CardTitle>
                    <CardDescription>Select which products appear in the "Trending Posters" grid on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-4">
                        {products.map(product => (
                            <div key={product.id} className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-4">
                                    <Checkbox 
                                        id={`trending-${product.id}`}
                                        name="trendingProductIds"
                                        value={product.id}
                                        defaultChecked={product.isTrending}
                                    />
                                    <Label htmlFor={`trending-${product.id}`} className="flex items-center gap-4 cursor-pointer">
                                        <Image src={product.images[0].url} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                                        <span className="font-medium">{product.name}</span>
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton label="Save Trending" />
                </CardFooter>
            </Card>
        </form>
    </div>
  );
}
