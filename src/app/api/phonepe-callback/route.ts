import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { db } from '@/lib/db';
import { updateOrderStatus } from '@/lib/actions';
import { generateInvoiceHtml } from '@/lib/invoice';
import { sendEmail } from '@/lib/email';
import { getOrderById } from '@/lib/data';

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_HOST = process.env.PHONEPE_HOST || "https://api-preprod.phonepe.com/apis/pg-sandbox";

export async function POST(req: NextRequest) {
    try {
        const { orderId } = Object.fromEntries(req.nextUrl.searchParams);
        const data = await req.json();
        const { response } = data;

        if (!response) {
            return NextResponse.json({ success: false, message: "Invalid callback data" }, { status: 400 });
        }

        const decodedResponse = Buffer.from(response, 'base64').toString('utf-8');
        const responseData = JSON.parse(decodedResponse);

        const { transactionId, merchantId, amount, state } = responseData.data;

        // Verify checksum
        const checksum = crypto.createHash("sha256").update(response + SALT_KEY).digest("hex") + "###" + SALT_INDEX;
        const receivedChecksum = req.headers.get('X-VERIFY');

        if (checksum !== receivedChecksum) {
            console.error("Checksum mismatch:", { expected: checksum, received: receivedChecksum });
            return NextResponse.json({ success: false, message: "Checksum mismatch" }, { status: 400 });
        }

        if (merchantId !== MERCHANT_ID) {
            console.error("Merchant ID mismatch:", { expected: MERCHANT_ID, received: merchantId });
            return NextResponse.json({ success: false, message: "Merchant ID mismatch" }, { status: 400 });
        }

        let newStatus: string;
        if (state === 'COMPLETED') {
            newStatus = 'Processing'; // Or 'Paid', 'Confirmed', etc.
        } else if (state === 'FAILED') {
            newStatus = 'Cancelled';
        } else {
            newStatus = 'Pending';
        }

        await updateOrderStatus(orderId, newStatus);

        if (newStatus === 'Processing') {
            const order = await getOrderById(orderId);
            if (order) {
                const invoiceHtml = generateInvoiceHtml(order);
                await sendEmail({
                    to: order.customerEmail,
                    subject: `Invoice for Order ${order.id}`,
                    html: invoiceHtml,
                });
                // Optionally, send to owner as well
                await sendEmail({
                    to: process.env.EMAIL_FROM as string,
                    subject: `New Order Received: ${order.id}`,
                    html: invoiceHtml,
                });
            }
            return NextResponse.redirect(new URL(`/order-confirmation/${orderId}`, req.url));
        } else {
            return NextResponse.redirect(new URL(`/order-failure/${orderId}`, req.url));
        }

    } catch (error) {
        console.error('Error processing PhonePe callback:', error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { orderId } = Object.fromEntries(req.nextUrl.searchParams);

        // Check payment status with PhonePe API
        const xVerifyString = `/pg/v1/status/${MERCHANT_ID}/${orderId}` + SALT_KEY;
        const checksum = crypto.createHash("sha256").update(xVerifyString).digest("hex") + "###" + SALT_INDEX;

        const response = await axios.get(
            `${PHONEPE_HOST}/pg/v1/status/${MERCHANT_ID}/${orderId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": checksum,
                    "X-MERCHANT-ID": MERCHANT_ID,
                },
            }
        );

        const { state } = response.data.data;

        let newStatus: string;
        if (state === 'COMPLETED') {
            newStatus = 'Processing';
        } else if (state === 'FAILED') {
            newStatus = 'Cancelled';
        } else {
            newStatus = 'Pending';
        }

        await updateOrderStatus(orderId, newStatus);

        if (newStatus === 'Processing') {
            const order = await getOrderById(orderId);
            if (order) {
                const invoiceHtml = generateInvoiceHtml(order);
                await sendEmail({
                    to: order.customerEmail,
                    subject: `Invoice for Order ${order.id}`,
                    html: invoiceHtml,
                });
                // Optionally, send to owner as well
                await sendEmail({
                    to: process.env.EMAIL_FROM as string,
                    subject: `New Order Received: ${order.id}`,
                    html: invoiceHtml,
                });
            }
            return NextResponse.redirect(new URL(`/order-confirmation/${orderId}`, req.url));
        } else {
            return NextResponse.redirect(new URL(`/order-failure/${orderId}`, req.url));
        }

    } catch (error) {
        console.error('Error checking PhonePe payment status:', error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}