
'use client'

import { ProductCard } from "./product-card";
import { Button } from "./ui/button";
import Link from "next/link";
import type { Product } from "@/lib/types";

interface TrendingPostersProps {
    trendingProducts: Product[];
}

export function TrendingPosters({ trendingProducts }: TrendingPostersProps) {
    if (trendingProducts.length === 0) {
        return null; // Don't render the section if there are no trending products
    }

    return (
        <section className="container">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline sm:text-4xl">Trending Posters</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Discover what's popular and join the trend. Our best-sellers are waiting for you.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {trendingProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            <div className="mt-12 text-center">
                <Button asChild size="lg" variant="outline">
                    <Link href="/products">View All Products</Link>
                </Button>
            </div>
        </section>
    )
}
