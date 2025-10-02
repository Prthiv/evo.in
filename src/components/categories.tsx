'use client';

import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { CategoryRecord } from "@/lib/types";

const categoryImages: Record<string, string> = {
  'CAR FRAMES AND WALL POSTERS': 'category-car',
  'ANIME FRAMES AND WALLPOSTERS': 'category-anime',
  'SUPERHERO FRAMES AND POSTERS': 'category-superhero',
};

const categoryDisplayNames: Record<string, string> = {
    'CAR FRAMES AND WALL POSTERS': 'Cars',
    'ANIME FRAMES AND WALLPOSTERS': 'Anime',
    'SUPERHERO FRAMES AND POSTERS': 'Superheroes',
}

const categoryLinks: Record<string, string> = {
}

const categoryAnimation: Record<string, string> = {
    'ANIME FRAMES AND WALLPOSTERS': 'group-hover:shadow-primary/40 group-hover:shadow-xl',
    'CAR FRAMES AND WALL POSTERS': 'group-hover:-translate-x-1 group-hover:-translate-y-1',
    'SUPERHERO FRAMES AND POSTERS': 'group-hover:scale-105',
}

interface CategoriesProps {
  isProductsPage?: boolean;
  categories?: CategoryRecord[]; // Optional prop for dynamic categories
}

export function Categories({ isProductsPage = false, categories }: CategoriesProps) {
  // Only use useSearchParams in client components
  let currentCategory: string | null = null;
  if (typeof window !== 'undefined') {
    // This is a workaround to avoid the Suspense boundary issue
    // In a real app, you'd want to handle this more elegantly
    try {
      const searchParams = new URLSearchParams(window.location.search);
      currentCategory = searchParams.get('category');
    } catch (e) {
      // Ignore error in SSR
    }
  }

  // Use dynamic categories if provided, otherwise fallback to hardcoded ones
  const visibleCategories = categories 
    ? categories.filter(c => c.isVisible).map(c => c.name)
    : ['CAR FRAMES AND WALL POSTERS', 'ANIME FRAMES AND WALLPOSTERS', 'SUPERHERO FRAMES AND POSTERS'];

  if (isProductsPage) {
    return (
      <nav className="mb-8 w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <Button 
                variant={!currentCategory ? "secondary" : "ghost"} 
                className="shrink-0"
                asChild
            >
                <Link href="/products">All</Link>
            </Button>
            {visibleCategories.map((category) => (
            <Button
                key={category}
                variant={currentCategory === category ? "secondary" : "ghost"}
                className="shrink-0"
                asChild
            >
                <Link href={`/products?category=${encodeURIComponent(category)}`}>
                {categoryDisplayNames[category] || category}
                </Link>
            </Button>
            ))}
        </div>
      </nav>
    )
  }

  return (
    <section id="categories" className="container">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold font-headline sm:text-4xl">Shop by Category</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Find the perfect art for your passion.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleCategories.map((category) => {
          const imageId = categoryImages[category];
          const image = PlaceHolderImages.find(img => img.id === imageId);
          return (
            <Link key={category} href={`/products?category=${encodeURIComponent(category)}`} className="group">
              <Card className={cn("overflow-hidden relative aspect-video flex items-center justify-center text-center p-4 transition-all duration-300 hover:shadow-primary/20 hover:shadow-xl hover:-translate-y-2 border-0", categoryAnimation[category])}>
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={category}
                    data-ai-hint={image.imageHint}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className={cn("object-cover transition-transform duration-500 ease-in-out z-0", category === 'SUPERHERO FRAMES AND POSTERS' ? 'group-hover:scale-110' : 'group-hover:scale-125')}
                  />
                )}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-300 z-10" />
                <h3 className="text-xl font-bold font-headline text-white z-20">
                  {categoryDisplayNames[category] || category}
                </h3>
              </Card>
            </Link>
          )

        })}
      </div>
    </section>
  );
}