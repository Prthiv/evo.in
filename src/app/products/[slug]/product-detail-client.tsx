'use client'

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useProductOptions } from '@/hooks/use-product-options';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Truck, PackagePlus, ShoppingBag } from 'lucide-react';
import { QuantitySelector } from '@/components/quantity-selector';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

export function ProductDetailPageClient({ product }: { product: Product }) {
  const router = useRouter();
  const { toast } = useToast();
  const { addBundleToCart } = useCart();

  const {
    quantity,
    setQuantity,
    showFrames,
    setShowFrames,
    selectedPosterSize,
    setSelectedPosterSize,
    selectedFinish,
    setSelectedFinish,
    availableFinishes,
    selectedFrame,
    totalItemPrice,
    posterSizes,
  } = useProductOptions();

  const handleBuyNow = () => {
    addBundleToCart([product], "A4", undefined);
    toast({
      title: "Added to Cart",
      description: `A bundle with ${product.name} has been created.`,
    });
    router.push('/cart');
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <Carousel className="w-full">
          <CarouselContent>
            {product.images.map((image) => (
              <CarouselItem key={image.id}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      data-ai-hint={image.hint}
                      width={800}
                      height={1200}
                      className="object-cover w-full h-full"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        <div className="flex flex-col gap-6">
          <div>
            <span className="text-sm text-primary font-medium uppercase tracking-wider font-body">{product.category}</span>
            <h1 className="text-3xl lg:text-4xl font-bold font-headline mt-1">{product.name}</h1>
            <p className="text-2xl font-headline text-primary mt-2">
              ₹{totalItemPrice.toFixed(2)}
            </p>
          </div>
          
          <p className="text-muted-foreground leading-relaxed font-body">{product.description}</p>
          
          <Separator />

          <div>
            <Label className="font-headline">Size</Label>
            <div className="flex gap-4 mt-2">
              {Object.entries(posterSizes).map(([size, { price }]) => (
                <Button key={size} variant={selectedPosterSize === size ? 'secondary' : 'outline'} onClick={() => setSelectedPosterSize(size as 'A4' | 'A3')}>
                  {size} (₹{price.toFixed(2)})
                </Button>
              ))}
            </div>
          </div>
          
          {product.category !== 'CUSTOM FRAMES' && (
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-lg font-headline">Add a Frame?</Label>
                <Button variant={showFrames ? 'secondary' : 'outline'} onClick={() => setShowFrames(!showFrames)}>
                  {showFrames ? 'Remove Frame' : 'Add Frame'}
                </Button>
              </div>
              {showFrames && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="font-headline">Finish</Label>
                     <RadioGroup value={selectedFinish} onValueChange={(v) => setSelectedFinish(v as 'Black' | 'White')} className="flex items-center gap-2 mt-2">
                        {availableFinishes.map(finish => (
                        <div key={finish}>
                          <RadioGroupItem value={finish} id={`finish-${finish}`} className="sr-only"/>
                          <Label htmlFor={`finish-${finish}`} 
                                 className={cn("flex items-center justify-center rounded-md border-2 p-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                 selectedFinish === finish ? "border-primary" : "border-muted-foreground")}>
                            {finish}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                   <p className="text-sm text-muted-foreground">+₹{selectedFrame?.price.toFixed(2) || '0.00'} for frame</p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1" onClick={handleBuyNow}>
              <ShoppingBag className="mr-2 h-5 w-5" /> Buy Now
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground font-body space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>High-quality printing on premium paper</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Ships worldwide. Estimated delivery: 5-7 business days.</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}