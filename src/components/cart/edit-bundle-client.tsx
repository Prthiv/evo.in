'use client'

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { Product } from "@/lib/types";
import { Save, ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MIN_ORDER_QUANTITY } from "@/lib/constants";
import { useSelection } from "@/hooks/use-selection";

interface EditBundlePageClientProps {
    products: Product[];
    bundleId: string;
}

export function EditBundlePageClient({ products, bundleId }: EditBundlePageClientProps) {
    const router = useRouter();
    const { getBundleById, updateBundle, removeBundle } = useCart();
    
    // We use the global selection hook to manage items on this page
    const { selectedItems, setSelectedItems, isSelected, toggleSelection, selectionCount } = useSelection();
    
    // Memoize the bundle to prevent re-fetching on every render
    const bundle = useMemo(() => getBundleById(bundleId as string), [bundleId, getBundleById]);

    // Effect to initialize the selected items from the cart bundle
    useEffect(() => {
        if (bundle) {
            setSelectedItems(bundle.items.map(i => ({ ...i.product, quantity: i.quantity })));
        } else {
             // If bundle not found, redirect after a short delay
            const timer = setTimeout(() => router.push('/cart'), 500);
            return () => clearTimeout(timer);
        }
        // Cleanup function to clear selection when leaving the page
        return () => {
            setSelectedItems([]);
        }
    }, [bundle, router, setSelectedItems]);

    if (!bundle) {
        return <div className="container py-12 text-center">Loading bundle... If you are not redirected, please return to the cart.</div>;
    }

    const handleSaveChanges = () => {
        // Assuming A4 and no frame for simplicity, as per original logic.
        // This could be enhanced to allow changing sizes/frames during edit.
        updateBundle(bundle.id, selectedItems, 'A4');
        router.push('/cart');
    };

    const handleRemoveBundle = () => {
        removeBundle(bundle.id);
        router.push('/cart');
    };

    const availableProducts = products.filter(p => !isSelected(p.id));
    const currentlyInBundle = products.filter(p => isSelected(p.id));

    return (
        <div className="container py-12">
             <div className="flex justify-between items-center mb-4">
                <Button variant="outline" onClick={() => router.push('/cart')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Cart
                </Button>
                <div className="text-center">
                    <h1 className="text-3xl font-bold font-headline">Editing: {bundle.name}</h1>
                    <p className="text-muted-foreground">{selectedItems.length} posters selected</p>
                </div>
                 <div className="flex items-center gap-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Bundle
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this bundle from your cart.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRemoveBundle}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button size="lg" onClick={handleSaveChanges} disabled={selectedItems.length < MIN_ORDER_QUANTITY}>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                 </div>
            </div>
            
            {selectedItems.length < MIN_ORDER_QUANTITY && (
                 <Alert variant="destructive" className="mb-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Minimum Not Met</AlertTitle>
                    <AlertDescription>
                        A bundle must contain at least {MIN_ORDER_QUANTITY} items. Please add {MIN_ORDER_QUANTITY - selectionCount} more.
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-12">
                <div>
                    <h2 className="text-2xl font-headline mb-4">Posters in your bundle ({selectedItems.length})</h2>
                     {currentlyInBundle.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {currentlyInBundle.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">You haven't selected any posters for this bundle yet.</p>
                    )}
                </div>

                <Separator />

                <div>
                    <h2 className="text-2xl font-headline mb-4">Add more posters</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {availableProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}
