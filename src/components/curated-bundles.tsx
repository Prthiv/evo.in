'use client'

import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product, CuratedBundle } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface CuratedBundlesProps {
  products: Product[];
  bundles: CuratedBundle[];
}

export function CuratedBundles({ products, bundles }: CuratedBundlesProps) {
    const { addBundleToCart } = useCart();
    const router = useRouter();
    const { toast } = useToast();

    if (bundles.length === 0) {
        return null;
    }

    const handleBuyBundle = (productIds: string[]) => {
        const bundleProducts = products.filter(p => productIds.includes(p.id));
        if (bundleProducts.length === 0) {
            toast({
                variant: 'destructive',
                title: "Products not found",
                description: "These curated products are not in the database. Please add them first."
            })
            return;
        }
        
        // Convert Product[] to SelectedProduct[] by adding quantity property
        const selectedProducts = bundleProducts.map(product => ({
            ...product,
            quantity: 1 // Default quantity of 1 for bundle products
        }));
        
        addBundleToCart(selectedProducts, 'A4', undefined);
        toast({
            title: "Bundle Added!",
            description: "The curated bundle has been added to your cart."
        });
        router.push('/cart');
    }

    return (
        <section id="curated-bundles" className="container">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline sm:text-4xl">Curated Bundles</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Get started with our hand-picked collections.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {bundles.map(bundle => {
                    // Try to find an image for the bundle
                    let image = null;
                    if (bundle.imageUrl) {
                        image = { imageUrl: bundle.imageUrl, imageHint: bundle.name };
                    } else if (bundle.productIds.length > 0) {
                        // Use the first product's image as fallback
                        const firstProduct = products.find(p => p.id === bundle.productIds[0]);
                        if (firstProduct && firstProduct.images.length > 0) {
                            image = { imageUrl: firstProduct.images[0].url, imageHint: firstProduct.name };
                        }
                    }
                    
                    // Fallback to a placeholder image
                    if (!image) {
                        image = PlaceHolderImages[0];
                    }

                    return (
                        <Card key={bundle.id} className="overflow-hidden group">
                            <CardContent className="p-0">
                                <div className="relative aspect-video">
                                    {image && (
                                        <Image 
                                            src={image.imageUrl}
                                            alt={bundle.name}
                                            data-ai-hint={image.imageHint}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    <h3 className="absolute bottom-4 left-4 font-headline text-2xl text-white">{bundle.name}</h3>
                                </div>
                                <div className="p-6">
                                    <Button className="w-full" onClick={() => handleBuyBundle(bundle.productIds)}>
                                        Buy Now <ArrowRight className="ml-2"/>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </section>
    )
}