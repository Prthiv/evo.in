import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/db';
import { updateOrderStatus } from '@/lib/actions';
import { generateInvoiceHtml } from '@/lib/invoice';
import { sendEmail } from '@/lib/email';
import { getOrderById } from '@/lib/data';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export async function POST(req: NextRequest) {
  try {
    const { orderId } = Object.fromEntries(req.nextUrl.searchParams);
    const body = await req.json();
    
    // Verify the payment payload
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    
    // Verify payment signature
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret');
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    if (digest !== razorpay_signature) {
      console.error("Payment signature verification failed");
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 });
    }
    
    // Update order status to Processing
    await updateOrderStatus(orderId, 'Processing');
    
    // Send invoice emails
    const order = await getOrderById(orderId);
    if (order) {
      const invoiceHtml = generateInvoiceHtml(order);
      await sendEmail({
        to: order.customerEmail,
        subject: `Invoice for Order ${order.id}`,
        html: invoiceHtml,
      });
      // Send to owner as well
      await sendEmail({
        to: process.env.EMAIL_FROM as string,
        subject: `New Order Received: ${order.id}`,
        html: invoiceHtml,
      });
    }
    
    return NextResponse.json({ success: true, message: "Payment verified successfully" });
    
  } catch (error) {
    console.error('Error processing Razorpay payment:', error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { orderId } = Object.fromEntries(req.nextUrl.searchParams);
    
    // For testing purposes, we'll mark the order as Processing
    // In a real implementation, you would verify the payment status with Razorpay API
    await updateOrderStatus(orderId, 'Processing');
    
    // Send invoice emails
    const order = await getOrderById(orderId);
    if (order) {
      const invoiceHtml = generateInvoiceHtml(order);
      await sendEmail({
        to: order.customerEmail,
        subject: `Invoice for Order ${order.id}`,
        html: invoiceHtml,
      });
      // Send to owner as well
      await sendEmail({
        to: process.env.EMAIL_FROM as string,
        subject: `New Order Received: ${order.id}`,
        html: invoiceHtml,
      });
    }
    
    return NextResponse.redirect(new URL(`/order-confirmation/${orderId}`, req.url));
    
  } catch (error) {
    console.error('Error processing Razorpay payment:', error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}