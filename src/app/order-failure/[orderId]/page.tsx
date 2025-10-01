import { XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrderFailurePage({ params }: { params: { orderId: string } }) {
  return (
    <div className="container py-12 max-w-2xl mx-auto">
        <Card>
            <CardHeader className="text-center">
                <XCircle className="mx-auto h-16 w-16 text-destructive" />
                <CardTitle className="text-3xl font-headline mt-4">Order Failed</CardTitle>
                <CardDescription>
                Your order <span className="font-bold text-destructive">{params.orderId}</span> could not be placed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        There was an issue processing your payment. Please try again or contact support.
                    </p>
                    <Separator />
                    <div className="flex justify-center gap-4 pt-4">
                         <Button asChild>
                            <Link href="/checkout">Try Again</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/">Back to Homepage</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}