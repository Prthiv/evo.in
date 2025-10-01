import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="container py-12 max-w-2xl mx-auto">
        <Card>
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-primary" />
                <CardTitle className="text-3xl font-headline mt-4">Thank You for Your Order!</CardTitle>
                <CardDescription>
                Your order <span className="font-bold text-primary">{params.orderId}</span> has been placed successfully.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        A confirmation email with your order details and invoice has been sent to your email address. You can track your order status using the order lookup page.
                    </p>
                    <Separator />
                    <div className="text-center">
                        <h3 className="font-headline text-lg">What's next?</h3>
                        <p className="text-muted-foreground mt-2">
                            We're preparing your items for shipment. You'll receive another email once your order has shipped.
                        </p>
                    </div>
                    <div className="flex justify-center gap-4 pt-4">
                         <Button asChild>
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/order-lookup">Check Order Status</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
