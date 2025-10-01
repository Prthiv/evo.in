
'use client'

import { useSelection } from "@/hooks/use-selection.tsx";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { BUNDLE_DEALS, MIN_ORDER_QUANTITY } from "@/lib/constants";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function SelectionTray() {
    const { selectedItems, selectionCount, nextDeal, clearSelection, toggleSelection } = useSelection();
    const { addBundleToCart } = useCart();
    const router = useRouter();
    const { toast } = useToast();

    const handleProceed = () => {
        addBundleToCart(selectedItems, 'A4', undefined);
        toast({
            title: "Bundle Created!",
            description: `Your bundle with ${selectionCount} posters has been added to your cart.`
        })
        clearSelection();
        router.push('/cart');
    }

    if (selectionCount === 0) {
        return null;
    }

    const progressPercentage = nextDeal ? (selectionCount / nextDeal.buy) * 100 : (selectionCount / MIN_ORDER_QUANTITY) * 100;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
            <div className="container mx-auto">
                <div className="bg-card border rounded-lg shadow-2xl p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-headline text-lg">Your Bundle ({selectionCount} {selectionCount === 1 ? 'item' : 'items'})</h3>
                                {nextDeal ? (
                                    <p className="text-sm font-medium text-primary">
                                        Buy {nextDeal.buy}, Get {nextDeal.get} FREE!
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Select at least {MIN_ORDER_QUANTITY} to start a bundle.</p>
                                )}
                            </div>
                            <Progress value={progressPercentage} className="h-2"/>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                <span>{selectionCount} selected</span>
                                <span>{nextDeal ? `Next offer at ${nextDeal.buy} items` : `Minimum ${MIN_ORDER_QUANTITY} items`}</span>
                            </div>
                        </div>

                        <div className="h-12 flex items-center gap-2 overflow-x-auto">
                            {selectedItems.map(item => (
                                <div key={item.id} className="relative shrink-0">
                                    <Image 
                                        src={item.images[0].url} 
                                        alt={item.name}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-md object-cover"
                                    />
                                    <button onClick={() => toggleSelection(item)} className="absolute -top-1 -right-1 bg-muted rounded-full p-0.5 border">
                                        <X className="h-3 w-3"/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={clearSelection}>Clear</Button>
                            <Button 
                                size="lg" 
                                disabled={selectionCount < MIN_ORDER_QUANTITY}
                                onClick={handleProceed}
                            >
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Proceed
                                <ArrowRight className="ml-2 h-5 w-5"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
