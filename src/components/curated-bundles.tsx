
'use client'

import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

// NOTE: This component is currently not in use as the hardcoded bundles have been removed.
// To make this functional, you would need to implement a system to create and manage
// curated bundles from the studio, similar to how "Mega Deals" or "Trending Products" work.
// The fetched bundles would then be passed to this component as props.

const bundles: any[] = []


export function CuratedBundles({ products }: { products: Product[] }) {
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
        addBundleToCart(bundleProducts, 'A4', undefined);
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
                {bundles.map(bundle => (
                    <Card key={bundle.name} className="overflow-hidden group">
                        <CardContent className="p-0">
                            <div className="relative aspect-video">
                                {bundle.image && (
                                    <Image 
                                        src={bundle.image.imageUrl}
                                        alt={bundle.name}
                                        data-ai-hint={bundle.image.imageHint}
                                        fill
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
                ))}
            </div>
        </section>
    )
}
