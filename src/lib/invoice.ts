import { Order } from './types';

export function generateInvoiceHtml(order: Order): string {
  const itemsHtml = order.items.map(bundle => bundle.items.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.product.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">₹${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('')).join('');

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h1 style="color: #0056b3; text-align: center;">Invoice</h1>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
      <p><strong>Customer Email:</strong> ${order.customerEmail}</p>
      <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      
      <h2 style="color: #0056b3; margin-top: 20px;">Order Details</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Price</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <h3 style="text-align: right; margin-top: 20px;">Total: ₹${order.total.toFixed(2)}</h3>
      
      <p style="text-align: center; margin-top: 30px; color: #777;">Thank you for your purchase!</p>
    </div>
  `;
}