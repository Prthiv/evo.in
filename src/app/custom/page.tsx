
'use client'

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { QuantitySelector } from '@/components/quantity-selector';
import { useToast } from '@/hooks/use-toast';
import { MIN_ORDER_QUANTITY, POSTER_SIZES, FRAME_OPTIONS } from '@/lib/constants';
import { UploadCloud, X, ShoppingBag, ArrowLeft, Pencil, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { CustomItemEditor } from '@/components/admin/custom-item-editor';
import { useCart } from '@/hooks/use-cart';

const customItemSchema = z.object({
  image: z.any().refine(file => file, 'Please upload an image.'),
  preview: z.string().min(1, 'Please upload an image.'),
  productType: z.enum(['poster', 'framed']),
  size: z.enum(['A4', 'A3']),
});

const customOrderSchema = z.object({
  items: z.array(customItemSchema).min(1, "Please configure at least one item."),
});

type CustomItemValues = z.infer<typeof customItemSchema>;
type CustomOrderValues = z.infer<typeof customOrderSchema>;


export default function CustomPage() {
  const [selectedQuantity, setSelectedQuantity] = useState(MIN_ORDER_QUANTITY);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const router = useRouter();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { addCustomBundleToCart } = useCart();

  const form = useForm<CustomOrderValues>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      items: [],
    },
  });

  const { replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch('items');

  const startCustomizing = () => {
    if (selectedQuantity > 0) {
      const newItems = Array.from({ length: selectedQuantity }, () => ({
        image: null,
        preview: '',
        productType: 'poster' as const,
        size: 'A4' as const,
      }));
      replace(newItems);
      setIsCustomizing(true);
      setEditingIndex(isMobile ? 0 : null);
    }
  };
  
  const handleBackToQuantity = () => {
    form.reset({ items: [] });
    setIsCustomizing(false);
    setEditingIndex(null);
  }

  const onSubmit = (data: CustomOrderValues) => {
    const customItems = data.items.map(item => ({
        name: `Custom Poster ${item.size}`,
        previewUrl: item.preview,
        posterSize: item.size,
        isFramed: item.productType === 'framed',
    }));

    addCustomBundleToCart(customItems);
    
    toast({
      title: "Custom Bundle Added!",
      description: `${data.items.length} custom items have been added to your cart.`,
    });
    router.push('/cart');
  };

  const totalBundlePrice = items.reduce((acc, item) => {
    if (!item?.size) return acc;
    const posterPrice = POSTER_SIZES[item.size]?.price || 0;
    const framePrice = item.productType === 'framed' ? (FRAME_OPTIONS.find(f => f.size === item.size)?.price || 0) : 0;
    return acc + posterPrice + framePrice;
  }, 0);
  
  const isEditingOnMobile = isMobile && editingIndex !== null;

  const handleNavigation = (newIndex: number) => {
      if (newIndex >= 0 && newIndex < items.length) {
        setEditingIndex(newIndex);
      } else {
        setEditingIndex(null); // Close the editor
      }
  };

  const handleNextInDialog = async () => {
    if (editingIndex === null) return;
    const isValid = await form.trigger(`items.${editingIndex}`);
    if (isValid) {
      handleNavigation(editingIndex + 1);
    }
  };


  if (!isCustomizing) {
    return (
        <div className="container py-12 flex justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Create Your Custom Posters</CardTitle>
                    <CardDescription>How many custom posters would you like to create?</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <QuantitySelector quantity={selectedQuantity} setQuantity={setSelectedQuantity} min={1} max={20}/>
                    <p className="text-xs text-muted-foreground">You can create up to 20 custom posters at a time.</p>
                     <Button size="lg" onClick={startCustomizing} disabled={selectedQuantity <= 0}>
                        Start Customizing
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container py-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8", isEditingOnMobile && 'flex flex-col h-[calc(100vh-10rem)]')}>
          {isEditingOnMobile ? (
            editingIndex !== null && (
              <CustomItemEditor 
                index={editingIndex} 
                totalItems={items.length}
                onNavigate={handleNavigation}
                onBack={() => setEditingIndex(null)}
              />
            )
          ) : (
            <>
              <div className="flex justify-between items-center">
                <Button variant="outline" type="button" onClick={handleBackToQuantity}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div className="text-center">
                  <h1 className="text-3xl font-bold font-headline">Customize Your Items</h1>
                  <p className="text-muted-foreground">{items.length} items to configure</p>
                </div>
                <div className="w-24"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {items.map((item, index) => (
                  <Card 
                    key={index}
                    className="aspect-[2/3] relative group flex items-center justify-center cursor-pointer border-2 border-dashed hover:border-primary transition-all"
                    onClick={() => setEditingIndex(index)}
                  >
                    {item.preview ? (
                      <Image src={item.preview} alt={`Custom Item ${index + 1}`} fill className="object-cover rounded-md" />
                    ) : (
                      <div className="text-center text-muted-foreground p-2">
                        <UploadCloud className="h-10 w-10 mx-auto mb-2" />
                        <p className="font-semibold">Item #{index + 1}</p>
                        <p className="text-xs">Click to edit</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                      <Pencil className="h-8 w-8 text-white" />
                    </div>
                  </Card>
                ))}
              </div>
              
              <Dialog open={!isMobile && editingIndex !== null} onOpenChange={(open) => !open && setEditingIndex(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Editing Custom Item #{editingIndex !== null ? editingIndex + 1 : ''}</DialogTitle>
                  </DialogHeader>
                  {editingIndex !== null && (
                     <CustomItemEditor 
                        index={editingIndex}
                        totalItems={items.length}
                        onNavigate={handleNavigation}
                     />
                  )}
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => handleNavigation(editingIndex! - 1)} disabled={editingIndex === 0}>
                          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                      </Button>
                      
                      {editingIndex !== null && editingIndex < items.length - 1 ? (
                          <Button type="button" onClick={handleNextInDialog}>
                              Next <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                      ) : (
                          <DialogClose asChild>
                              <Button type="button">Done</Button>
                          </DialogClose>
                      )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {items.length > 0 && !isEditingOnMobile && (
            <div className="sticky bottom-4 z-10 mt-auto">
                <Card className="bg-card border rounded-lg shadow-lg">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="font-headline">
                        <span className="text-muted-foreground text-sm">Total Price: </span>
                        <span className="font-bold text-lg">₹{totalBundlePrice.toFixed(2)}</span>
                        </div>
                        <Button type="submit" size="lg" disabled={form.formState.isSubmitting || !form.formState.isValid}>
                        {form.formState.isSubmitting ? 'Adding...' : <><ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart</>}
                        </Button>
                    </CardContent>
                </Card>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
