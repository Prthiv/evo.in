
import { getOrderForCustomer } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, Home } from "lucide-react";
import Link from "next/link";
import { OrderStatusTimeline } from "@/components/order-status-timeline";

export default function CustomerOrderDetailsPage({ 
    params,
    searchParams 
}: { 
    params: { orderId: string },
    searchParams: { email: string }
}) {
    const { orderId } = params;
    const { email } = searchParams;

    if (!orderId || !email) {
        notFound();
    }
    
    const order = getOrderForCustomer(orderId, email);

    if (!order) {
        notFound();
    }

    return (
        <div className="container py-12">
             <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <p className="text-primary font-semibold">Order Details</p>
                            <CardTitle className="text-2xl md:text-3xl">{order.id}</CardTitle>
                            <CardDescription>
                                Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </CardDescription>
                        </div>
                        <div className="text-left md:text-right">
                             <p className="text-muted-foreground">Order Status</p>
                             <Badge className="text-lg mt-1" variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h3 className="font-headline text-xl mb-4">Order Status</h3>
                        <OrderStatusTimeline currentStatus={order.status} />
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-headline text-xl mb-4">Order Summary</h3>
                        <div className="space-y-4">
                            {order.items.map(bundle => (
                                <Card key={bundle.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{bundle.name}</CardTitle>
                                        <CardDescription>{bundle.items.length} items</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {bundle.items.map(item => (
                                                <div key={item.id} className="flex flex-col items-center text-center">
                                                     <Image 
                                                        src={item.product.images[0].url}
                                                        alt={item.product.name}
                                                        width={100}
                                                        height={150}
                                                        className="rounded-md object-cover aspect-[2/3]"
                                                    />
                                                    <p className="text-sm font-medium mt-2 truncate w-full">{item.product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.posterSize}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <Separator />
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-headline text-xl mb-4 flex items-center gap-2"><Truck className="h-5 w-5"/> Shipping Information</h3>
                             <p className="font-semibold">{order.customerEmail}</p>
                            <p className="text-muted-foreground">{order.shippingAddress}</p>
                        </div>
                         <div>
                            <h3 className="font-headline text-xl mb-4 flex items-center gap-2"><Package className="h-5 w-5"/> Financial Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{order.items.reduce((acc, b) => acc + b.subtotal, 0).toFixed(2)}</span>
                                </div>
                                 <div className="flex justify-between text-primary">
                                    <span>Discounts</span>
                                    <span>-₹{order.items.reduce((acc, b) => acc + b.discount, 0).toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Grand Total</span>
                                    <span>₹{order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/"><Home className="mr-2"/> Back to Homepage</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
