'use client'

import { useSelection } from '@/hooks/use-selection';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from '@/components/quantity-selector';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { MIN_ORDER_QUANTITY } from '@/lib/constants';

export default function EditBundlePage() {
  const { selectedItems, updateQuantity, clearSelection, removeItemFromSelection, selectionCount } = useSelection();
  const { addBundleToCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (selectionCount < MIN_ORDER_QUANTITY) {
      toast({
        title: "Minimum items not met",
        description: `Please select at least ${MIN_ORDER_QUANTITY} items to create a bundle.`,
        variant: "destructive",
      });
      return;
    }
    addBundleToCart(selectedItems, 'A4', undefined);
    toast({
      title: "Bundle Added to Cart!",
      description: `Your bundle with ${selectionCount} posters has been added to your cart.`,
    });
    clearSelection();
    router.push('/cart');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="font-headline text-3xl font-bold mb-6">Edit Your Bundle</h1>

      {selectedItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">No items in your bundle yet.</p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" /> Add More Posters
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {selectedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border rounded-lg p-4 shadow-sm">
              <div className="relative w-24 h-24 shrink-0">
                <Image
                  src={item.images[0].url}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-grow">
                <h2 className="font-semibold text-lg">{item.name}</h2>
                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <QuantitySelector
                  quantity={item.quantity}
                  setQuantity={(qty) => updateQuantity(item.id, qty)}
                  min={1}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItemFromSelection(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" /> Add More Posters
              </Link>
            </Button>
            <Button size="lg" onClick={handleAddToCart}>
              <ShoppingBag className="mr-2 h-5 w-5" /> Add Bundle to Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}