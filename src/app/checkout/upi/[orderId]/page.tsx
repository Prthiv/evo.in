
'use client'

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UpiPaymentPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const { total, clearCart } = useCart();
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (timeLeft === 0) {
            // Handle timeout, maybe redirect back to cart with an error
            router.push('/cart');
            return;
        };

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, router]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const handlePaymentConfirmation = () => {
        // In a real app, a webhook from the payment provider would trigger this.
        // For this simulation, the user confirms payment manually.
        clearCart();
        router.push(`/order-confirmation/${orderId}`);
    };

    return (
        <div className="container py-12 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Complete Your Payment</CardTitle>
                    <CardDescription>Scan the QR code with any UPI app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                         <Image 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=your-upi-id@okhdfcbank%26pn=Evo.in%26am=1.00%26cu=INR%26tn=Order{orderId}"
                            alt="UPI QR Code"
                            width={200}
                            height={200}
                        />
                    </div>
                    
                    <div className="text-center">
                        <p className="text-muted-foreground">Amount to Pay</p>
                        <p className="text-3xl font-bold font-headline">₹{total.toFixed(2)}</p>
                    </div>

                    <Separator />

                     <div className="text-center">
                        <p className="text-sm text-muted-foreground">Or pay to UPI ID:</p>
                        <p className="font-mono text-primary p-2 bg-muted rounded-md">your-upi-id@okhdfcbank</p>
                    </div>

                    <Alert variant="default" className="bg-amber-50 border-amber-200">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800">Waiting for Payment</AlertTitle>
                        <AlertDescription className="text-amber-700">
                           This page will automatically update once payment is complete. Do not close this window.
                           Time left: <span className="font-bold">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handlePaymentConfirmation}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        I Have Paid
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

