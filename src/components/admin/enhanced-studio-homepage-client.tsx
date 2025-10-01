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
import { Save, Trash2, PlusCircle, Video, Image as ImageIcon, Loader2, Upload, X, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import type { Product, HeroSettings, MegaDealSettings } from '@/lib/types';
import { updateHeroSettingsAction, updateMegaDealsAction, updateTrendingProductsAction, updateReelsAction } from '@/lib/actions-async';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Checkbox } from '../ui/checkbox';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface StudioHomepageClientProps {
    products: Product[];
    heroData: HeroSettings;
    megaDeals: MegaDealSettings[];
    reels: any[];
}

function SubmitButton({ label = 'Save Changes', isLoading = false }: { label?: string; isLoading?: boolean }) {
    return (
        <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isLoading ? 'Saving...' : label}
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

const heroSchema = z.object({
    headline: z.string().min(1, "Headline is required"),
    subheadline: z.string().min(1, "Subheadline is required"),
    videoUrl: z.string().optional(),
    backgroundImage: z.string().optional(),
});

export function EnhancedStudioHomepageClient({ products, heroData, megaDeals, reels: defaultReels }: StudioHomepageClientProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('hero');
    const [isLoading, setIsLoading] = useState(false);

    // --- Hero Section Form ---
    const [heroState, heroAction] = useActionState(updateHeroSettingsAction, { success: false, errors: {} });
    const heroForm = useForm<z.infer<typeof heroSchema>>({
        resolver: zodResolver(heroSchema),
        defaultValues: {
            headline: heroData.headline,
            subheadline: heroData.subheadline,
            videoUrl: heroData.videoUrl,
            backgroundImage: '',
        }
    });

    useEffect(() => {
        if (heroState.success) {
            toast({ title: "Hero Section Updated!", description: "Your changes have been saved." });
        }
    }, [heroState, toast]);

    const onHeroSubmit = (data: z.infer<typeof heroSchema>) => {
        const formData = new FormData();
        formData.append('headline', data.headline);
        formData.append('subheadline', data.subheadline);
        formData.append('videoUrl', data.videoUrl || '');
        heroAction(formData);
    };

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

    // Image upload handlers
    const onImageDrop = (acceptedFiles: File[], fieldName: string, setValue: any) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const url = URL.createObjectURL(file);
            setValue(fieldName, url);
        }
    };

    const tabs = [
        { id: 'hero', label: 'Hero Section', icon: Video },
        { id: 'deals', label: 'Mega Deals', icon: PlusCircle },
        { id: 'reels', label: 'Reels', icon: Video },
        { id: 'trending', label: 'Trending Products', icon: ImageIcon },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Homepage Customization</h1>
                    <p className="text-muted-foreground">Customize your homepage content and layout with ease.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1"
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {tab.label}
                        </Button>
                    );
                })}
            </div>

            {/* Hero Section */}
            {activeTab === 'hero' && (
                <Form {...heroForm}>
                    <form onSubmit={heroForm.handleSubmit(onHeroSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Hero Section</CardTitle>
                                <CardDescription>Customize the main hero section of your homepage.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={heroForm.control}
                                        name="headline"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Headline</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your headline" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={heroForm.control}
                                        name="videoUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Background Video URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://example.com/video.mp4" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <FormField
                                    control={heroForm.control}
                                    name="subheadline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subheadline</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Enter your subheadline" 
                                                    className="min-h-24"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Preview */}
                                <div className="space-y-2">
                                    <Label>Preview</Label>
                                    <div className="border rounded-lg p-4 bg-muted/50">
                                        <h2 className="text-2xl font-bold mb-2">{heroForm.watch('headline') || 'Your Headline'}</h2>
                                        <p className="text-muted-foreground mb-4">{heroForm.watch('subheadline') || 'Your subheadline will appear here'}</p>
                                        {heroForm.watch('videoUrl') && (
                                            <div className="text-sm text-green-600">✓ Video background configured</div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SubmitButton isLoading={isLoading} />
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            )}

            {/* Mega Deals Section */}
            {activeTab === 'deals' && (
                <Form {...dealsForm}>
                    <form onSubmit={dealsForm.handleSubmit(onDealsSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Mega Deals</CardTitle>
                                <CardDescription>Create and manage bundle deals for your homepage.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {dealFields.map((field, index) => (
                                    <Card key={field.id} className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <FormField
                                                control={dealsForm.control}
                                                name={`deals.${index}.buy`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Buy</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="2" {...field} />
                                                        </FormControl>
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
                                                        <FormControl>
                                                            <Input type="number" placeholder="1" {...field} />
                                                        </FormControl>
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
                                                        <FormControl>
                                                            <Input type="number" placeholder="3" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex items-end">
                                                <FormField
                                                    control={dealsForm.control}
                                                    name={`deals.${index}.active`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl>
                                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                            <FormLabel>Active</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <Button 
                                                type="button" 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={() => removeDeal(index)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-full" 
                                    onClick={() => appendDeal({ buy: 2, get: 1, total: 3, active: true })}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Deal
                                </Button>
                            </CardContent>
                            <CardFooter>
                                <SubmitButton label="Save Deals" isLoading={isLoading} />
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            )}

            {/* Reels Section */}
            {activeTab === 'reels' && (
                <Form {...reelsForm}>
                    <form onSubmit={reelsForm.handleSubmit(onReelsSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Reels Showcase</CardTitle>
                                <CardDescription>Manage videos in the community showcase section.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {reelFields.map((field, index) => (
                                    <Card key={field.id} className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <FormField
                                                    control={reelsForm.control}
                                                    name={`reels.${index}.title`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Title</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Reel title" {...field} />
                                                            </FormControl>
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
                                                            <FormControl>
                                                                <Input placeholder="https://example.com/poster.jpg" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <FormField
                                                    control={reelsForm.control}
                                                    name={`reels.${index}.src`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Video URL</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="https://example.com/video.mp4" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {reelsForm.watch(`reels.${index}.poster`) && (
                                                    <div className="space-y-2">
                                                        <Label>Preview</Label>
                                                        <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                                                            <Image
                                                                src={reelsForm.watch(`reels.${index}.poster`) || '/placeholder.svg'}
                                                                alt="Reel preview"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <Button 
                                                type="button" 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={() => removeReel(index)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-full" 
                                    onClick={() => appendReel({ id: Date.now(), title: '', poster: '', src: '' })}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Reel
                                </Button>
                            </CardContent>
                            <CardFooter>
                                <SubmitButton label="Save Reels" isLoading={isLoading} />
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            )}

            {/* Trending Products Section */}
            {activeTab === 'trending' && (
                <form action={trendingAction}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Trending Products</CardTitle>
                            <CardDescription>Select which products appear in the trending section.</CardDescription>
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
                                                <Image 
                                                    src={product.images[0]?.url || '/placeholder.svg'} 
                                                    alt={product.name} 
                                                    width={40} 
                                                    height={40} 
                                                    className="rounded-md object-cover" 
                                                />
                                                <div>
                                                    <span className="font-medium">{product.name}</span>
                                                    <p className="text-sm text-muted-foreground">₹{product.price}</p>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {product.stock} in stock
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <SubmitButton label="Save Trending Products" isLoading={isLoading} />
                        </CardFooter>
                    </Card>
                </form>
            )}
        </div>
    );
}
