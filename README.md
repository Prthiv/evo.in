# Evo.in - Online Poster Store

This is an e-commerce platform for selling posters with integrated payment processing.

## Features
- Product catalog with categories
- Shopping cart functionality
- Checkout process with multiple payment options
- Order management system
- Admin dashboard for product and order management

## Payment Integration
The platform now uses Razorpay for payment processing, supporting:
- UPI payments
- Credit/Debit cards
- Wallet payments

### Razorpay Setup
1. Create a Razorpay account at https://razorpay.com/
2. Obtain your API keys from the Razorpay Dashboard
3. Set the following environment variables:
   - `RAZORPAY_KEY_ID` - Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Your Razorpay Key ID (public)

## Getting Started
To get started, take a look at src/app/page.tsx.

### Installation
1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up your environment variables in a `.env.local` file
4. Run `npm run dev` to start the development server

### Environment Variables
Refer to `.env.example` for required environment variables.