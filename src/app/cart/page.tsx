
'use client'

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { CreditCard, ShoppingCart, Pencil, PackagePlus, AlertTriangle, BadgePercent } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MIN_ORDER_QUANTITY } from "@/lib/constants";

export default function CartPage() {
  const { bundles, total, bundleCount, subtotal, totalDiscount, clearCart, appliedDeal } = useCart();
  
  const minOrderPerBundle = bundles.some(bundle => bundle.items.length < MIN_ORDER_QUANTITY);

  return (
    <div className="container py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold font-headline">Your Cart</h1>
          <p className="text-muted-foreground mt-2">{bundleCount} bundle{bundleCount !== 1 && 's'} in your cart</p>
        </div>
        {bundles.length > 0 && (
            <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
        )}
      </div>

      {bundles.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-6 text-2xl font-headline">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added any bundles to your cart yet.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Start Building a Bundle</Link>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
             {minOrderPerBundle && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Minimum Order Not Met</AlertTitle>
                <AlertDescription>
                  One of your bundles has fewer than {MIN_ORDER_QUANTITY} posters. Please edit the bundle to proceed to checkout.
                </AlertDescription>
              </Alert>
            )}

            <Accordion type="multiple" defaultValue={bundles.map(b => b.id)} className="w-full space-y-4">
              {bundles.map((bundle) => (
                <AccordionItem value={bundle.id} key={bundle.id} className="border-b-0">
                   <Card>
                    <AccordionTrigger className="p-6 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                           <div className="flex items-center gap-4">
                             <div className="flex -space-x-4">
                                {bundle.items.slice(0, 4).map((item, index) => (
                                    <Image 
                                        key={item.product.id + index}
                                        src={item.product.images[0].url}
                                        alt={item.product.name}
                                        width={40}
                                        height={60}
                                        className="rounded-md object-cover border-2 border-card"
                                    />
                                ))}
                            </div>
                            <div>
                                <h3 className="font-headline text-xl text-left">{bundle.name}</h3>
                                <p className="text-sm text-muted-foreground">{bundle.items.length} posters</p>
                            </div>
                           </div>
                           <div className="text-right">
                                <p className="font-bold text-lg">₹{bundle.total.toFixed(2)}</p>
                                {bundle.discount > 0 && (
                                    <p className="text-sm text-primary">-₹{bundle.discount.toFixed(2)} discount</p>
                                )}
                           </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        <Separator className="mb-4" />
                        {bundle.appliedDeal && (
                            <div className="bg-primary/10 text-primary rounded-md p-3 text-center text-sm font-medium mb-4 flex items-center justify-center gap-2">
                                <BadgePercent className="h-4 w-4" />
                                <span>Bundle Deal Applied: Buy {bundle.appliedDeal.buy}, Get {bundle.appliedDeal.get} FREE!</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            {bundle.items.map(item => (
                                <div key={item.product.id} className="flex justify-between items-center text-sm">
                                    <span className="flex-1 truncate">{item.product.name} ({item.posterSize})</span>
                                    <span className="w-24 text-right">{item.isFree ? 'FREE' : `₹${item.price.toFixed(2)}`}</span>
                                </div>
                            ))}
                        </div>
                        <Button asChild variant="outline" className="w-full mt-4">
                            <Link href={`/cart/edit/${bundle.id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Bundle
                            </Link>
                        </Button>
                    </AccordionContent>
                   </Card>
                </AccordionItem>
              ))}
            </Accordion>

             <Button asChild variant="outline">
                <Link href="/products">
                    <PackagePlus className="mr-2 h-4 w-4"/> Add Another Bundle
                </Link>
            </Button>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 font-body">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                    <div className="flex justify-between text-primary">
                        <span>Bundle Discounts</span>
                        <span>-₹{totalDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                 <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild size="lg" className="w-full" disabled={minOrderPerBundle}>
                  <Link href="/checkout">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Proceed to Checkout
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
