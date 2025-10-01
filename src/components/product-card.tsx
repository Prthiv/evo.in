
'use client'

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { POSTER_SIZES } from '@/lib/constants';
import { CheckCircle, Eye, PlusCircle } from 'lucide-react';
import { useSelection } from '@/hooks/use-selection.tsx';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface ProductCardProps {
  product: Product;
  children?: React.ReactNode;
}

export function ProductCard({ product, children }: ProductCardProps) {
  const basePrice = POSTER_SIZES.A4.price;
  const { isSelected, toggleSelection } = useSelection();
  const selected = isSelected(product.id);

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleSelection(product);
  }
  
  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="group relative">
      <Card className={cn("overflow-hidden transition-all duration-300 h-full flex flex-col bg-card/50", selected ? "border-primary ring-2 ring-primary" : "hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 card-glow")}>
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className="aspect-[2/3] relative w-full cursor-pointer" onClick={handleSelect}>
            {product.isTrending && <div className="product-badge">Best Seller</div>}
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt}
              data-ai-hint={product.images[0].hint}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
              <Button asChild variant="secondary" size="sm" onClick={(e) => e.stopPropagation()}>
                <Link href={`/products/${product.slug}`}>
                  <Eye className="mr-2 h-4 w-4" /> View
                </Link>
              </Button>
            </div>

            {selected && (
                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground z-20">
                    <CheckCircle className="h-4 w-4" />
                </div>
            )}
             <div className={cn("absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground transition-all duration-300 z-20",
                selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
             )}>
                {selected ? <CheckCircle className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5" />}
            </div>
          </div>
          <Link href={`/products/${product.slug}`} className="p-4 flex-1 flex flex-col justify-between" onClick={handleTextClick}>
            <div>
                <h3 className="font-headline text-lg font-medium truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.category.replace(/ FRAMES AND WALLPOSTERS| FRAMES AND POSTERS/g, "")}</p>
            </div>
            <p className="mt-2 font-semibold text-base">From ₹{basePrice.toFixed(2)}</p>
          </Link>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
