'use client';

export default function FAQPage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">ORDERING & PAYMENT</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">How do I place an order?</h3>
              <p className="text-muted-foreground">
                You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. 
                You'll need to provide your shipping information and payment details to complete your purchase.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards including Visa, Mastercard, and American Express, 
                as well as digital payment methods like Razorpay and UPI.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Is my payment information secure?</h3>
              <p className="text-muted-foreground">
                Yes, we use industry-standard encryption to protect your payment information. 
                We do not store your credit card details on our servers. All payments are processed securely through Razorpay.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">SHIPPING & DELIVERY</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">How long does shipping take?</h3>
              <p className="text-muted-foreground">
                Standard shipping typically takes 3-5 business days within India. 
                Express shipping options are available at checkout for faster delivery.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Do you ship internationally?</h3>
              <p className="text-muted-foreground">
                Currently, we only ship within India. We're working on expanding our shipping options 
                to other countries in the future.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">How much does shipping cost?</h3>
              <p className="text-muted-foreground">
                We offer free shipping on orders over ₹999. For orders below ₹999, a nominal shipping 
                fee of ₹99 applies.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">RETURNS & EXCHANGES</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">What is your return policy?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day return policy for damaged or defective items. 
                Items must be in original condition with all packaging and tags. For more details, 
                please see our complete <a href="/shipping-returns" className="text-primary hover:underline">Shipping & Returns Policy</a>.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">How do I initiate a return?</h3>
              <p className="text-muted-foreground">
                To initiate a return, please contact our customer support team at support@evo.in 
                with your order number and reason for return. We'll provide you with a return authorization 
                and instructions.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Can I exchange an item?</h3>
              <p className="text-muted-foreground">
                Yes, we offer exchanges for damaged or defective items. Please contact our support team 
                to initiate an exchange.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">PRODUCT INFORMATION</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">What materials are your posters printed on?</h3>
              <p className="text-muted-foreground">
                Our posters are printed on high-quality 250gsm art paper with vibrant, fade-resistant inks. 
                Our frames are made from durable materials with UV-protective glass.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Are your frames easy to hang?</h3>
              <p className="text-muted-foreground">
                Yes, all our frames come with pre-installed hanging hardware and mounting instructions. 
                Most frames can be hung both horizontally and vertically.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">CUSTOMER SUPPORT</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">How can I contact customer support?</h3>
              <p className="text-muted-foreground">
                You can reach our customer support team by emailing support@evo.in or by filling out 
                the contact form on our website. We typically respond within 24 hours.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">What are your customer support hours?</h3>
              <p className="text-muted-foreground">
                Our customer support team is available Monday through Friday, 9:00 AM to 6:00 PM IST.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}