
'use client'

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitOrder } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
      {pending ? 'Processing...' : 'Place Order'}
    </Button>
  );
}

export default function CheckoutPage() {
  const { itemsCount, bundles, total, clearCart } = useCart();
  const router = useRouter();
  const [state, formAction] = useActionState(submitOrder, { errors: {} });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    if (itemsCount === 0) {
      router.replace('/cart');
    }
  }, [itemsCount, router]);

  useEffect(() => {
    // This effect will run when the order is successfully submitted.
    // The `submitOrder` action does not return a success flag,
    // but a successful submission results in a redirect, so the
    // `state.errors` will be empty on the next render before redirect.
    // If we're here and there are no errors, it's time to clear the cart.
    if (Object.keys(state.errors).length === 0 && !state.errors.form) {
      clearCart();
    }
  }, [state, clearCart]);
  
  if (itemsCount === 0) {
      return null;
  }

  return (
    <div className="container flex justify-center py-12">
      <form action={formAction} className="w-full max-w-lg">
        <input type="hidden" name="cartItems" value={JSON.stringify(bundles)} />
        <input type="hidden" name="total" value={total} />

        <Card>
          <CardHeader>
            <CardTitle>Guest Checkout</CardTitle>
            <CardDescription>
              Please provide your shipping and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea id="shippingAddress" name="shippingAddress" placeholder="123 Main St, Anytown, USA 12345" required />
              {state.errors?.shippingAddress && <p className="text-sm text-destructive">{state.errors.shippingAddress[0]}</p>}
            </div>

            <div className="space-y-4">
              <Label>Payment Method</Label>
              <input type="hidden" name="paymentMethod" value={paymentMethod} />
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                <Label
                  className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary"
                >
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <span className="font-medium">Razorpay / Card / etc.</span>
                </Label>
                <Label
                  className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary"
                >
                  <RadioGroupItem value="upi" id="upi" />
                  <span className="font-medium">UPI</span>
                </Label>
              </RadioGroup>
            </div>

             {state.errors?.form && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.errors.form[0]}</AlertDescription>
                </Alert>
            )}
            {state.errors?.cartItems && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.errors.cartItems[0]}</AlertDescription>
                </Alert>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
