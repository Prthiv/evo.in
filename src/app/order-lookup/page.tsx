
'use client'

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { findOrder } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {pending ? 'Finding...' : 'Find Order'}
        </Button>
    )
}

export default function OrderLookupPage() {
  const [state, formAction] = useActionState(findOrder, { errors: {} });

  return (
    <div className="container flex justify-center py-12">
      <form action={formAction} className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Order Lookup</CardTitle>
            <CardDescription>
              Enter your order ID and email to check the status of your order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                name="orderId"
                placeholder="EVO-123456"
                required
              />
              {state.errors?.orderId && <p className="text-sm text-destructive">{state.errors.orderId[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
               {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
             {state.errors?.form && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.errors.form[0]}</AlertDescription>
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
