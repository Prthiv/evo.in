'use client';

export default function ShippingReturnsPage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Shipping & Returns Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">SHIPPING INFORMATION</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Delivery Times</h3>
              <p className="text-muted-foreground">
                We strive to process and ship all orders within 1-2 business days. 
                Delivery times vary based on your location:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Metro Cities: 2-3 business days</li>
                <li>Other Cities: 3-5 business days</li>
                <li>Remote Areas: 5-7 business days</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Shipping Costs</h3>
              <p className="text-muted-foreground">
                We offer the following shipping options:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Free Shipping on orders over ₹999</li>
                <li>Standard Shipping: ₹99 for orders under ₹999</li>
                <li>Express Shipping: ₹199 (1-2 business days delivery)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Shipping Restrictions</h3>
              <p className="text-muted-foreground">
                We currently ship only within India. All shipments are subject to customs and postal delays 
                beyond our control. We are not responsible for any customs duties or taxes that may apply.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Tracking Your Order</h3>
              <p className="text-muted-foreground">
                Once your order has been shipped, you'll receive a confirmation email with tracking information. 
                You can track your order status through our Order Lookup page using your order number.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">RETURN POLICY</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Eligibility</h3>
              <p className="text-muted-foreground">
                We offer a 30-day return policy from the date of delivery. To be eligible for a return, 
                items must be:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>In original condition and packaging</li>
                <li>Unused and unworn</li>
                <li>With all tags attached</li>
                <li>Accompanied by the original invoice</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                We do not accept returns on items that are damaged due to misuse, washing, or wear and tear.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Non-returnable Items</h3>
              <p className="text-muted-foreground">
                The following items cannot be returned:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Custom or personalized items</li>
                <li>Items marked as final sale</li>
                <li>Gift cards</li>
                <li>Downloadable software or digital products</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Return Process</h3>
              <p className="text-muted-foreground">
                To initiate a return:
              </p>
              <ol className="list-decimal pl-6 mt-2 space-y-1">
                <li>Contact our support team at support@evo.in with your order number and reason for return</li>
                <li>We'll provide you with a Return Authorization Number (RAN) and return instructions</li>
                <li>Pack the item securely in its original packaging</li>
                <li>Ship the package to our return address provided in the return instructions</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Refunds</h3>
              <p className="text-muted-foreground">
                Once we receive your returned item and verify its condition, we'll process your refund 
                within 5-7 business days. Refunds will be issued to the original payment method. 
                Please note that shipping charges are non-refundable.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Exchanges</h3>
              <p className="text-muted-foreground">
                We offer exchanges for damaged or defective items. If you received a damaged item, 
                please contact us within 7 days of delivery with photos of the damage. 
                We'll arrange for a replacement to be sent to you.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">DAMAGED OR DEFECTIVE ITEMS</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Reporting Issues</h3>
              <p className="text-muted-foreground">
                If you receive a damaged or defective item, please contact us immediately with:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your order number</li>
                <li>Photos of the damaged item and packaging</li>
                <li>A description of the issue</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                We'll work to resolve the issue as quickly as possible, typically within 24-48 hours.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">CONTACT US</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Have Questions?</h3>
              <p className="text-muted-foreground">
                If you have any questions about our shipping or return policies, please don't hesitate to contact us:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Email: <a href="mailto:support@evo.in" className="text-primary hover:underline">support@evo.in</a></li>
                <li>Phone: +91-XXXXXXXXXX</li>
                <li>Hours: Monday-Friday, 9:00 AM - 6:00 PM IST</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}