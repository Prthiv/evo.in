'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckoutPage() {
  const { orderId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { finalTotal, clearCart } = useCart();
  const razorpayOrderId = searchParams.get('razorpay_order_id');

  useEffect(() => {
    if (!razorpayOrderId) {
      console.error('Razorpay order ID not found');
      return;
    }

    const loadRazorpay = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: Math.round(finalTotal * 100), // amount in the smallest currency unit
          currency: "INR",
          name: "Evo.in",
          description: "Poster Purchase",
          order_id: razorpayOrderId,
          handler: function (response: any) {
            // Handle successful payment
            clearCart();
            
            // Send payment details to backend for verification
            fetch(`/api/razorpay?orderId=${orderId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            }).then(() => {
              router.push(`/order-confirmation/${orderId}`);
            }).catch(() => {
              router.push(`/order-failure/${orderId}`);
            });
          },
          prefill: {
            name: "",
            email: "",
            contact: ""
          },
          notes: {
            orderId: orderId
          },
          theme: {
            color: "#3399cc"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
    };

    if (typeof window !== 'undefined') {
      loadRazorpay();
    }
  }, [orderId, razorpayOrderId, finalTotal, clearCart, router]);

  return (
    <div className="container py-12 flex justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Payment...</h2>
        <p>Please wait while we redirect you to the payment gateway.</p>
        <p className="mt-4 text-sm text-muted-foreground">If you are not redirected automatically, please refresh the page.</p>
      </div>
    </div>
  );
}