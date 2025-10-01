
import 'server-only';

import type { Product, ProductFromDB, Order, OrderFromDB } from '@/lib/types';
import { db } from './db';

function transformProduct(product: ProductFromDB): Product {
    let imageUrls: string[] = [];
    try {
        // Ensure that product.images is a string before parsing
        if (typeof product.images === 'string') {
            imageUrls = JSON.parse(product.images);
        }
    } catch (e) {
        // Fallback for when images is not a valid JSON string
        imageUrls = [];
    }

    const tags = product.tags ? product.tags.split(',').map(tag => tag.trim()) : [];

    return {
        id: product.id.toString(),
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        tags: tags,
        isTrending: !!product.isTrending,
        images: imageUrls.map((url, index) => ({
            id: `${product.id}-image-${index}`,
            url: url,
            alt: product.name,
            hint: tags.slice(0, 2).join(' '),
        })),
    };
}

function transformOrder(order: OrderFromDB): Order {
     return {
        id: order.id,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        items: JSON.parse(order.items),
        total: order.total,
        status: order.status,
        createdAt: new Date(order.createdAt),
    };
}


export function getAllProducts(): Product[] {
    try {
        const stmt = db.prepare('SELECT * FROM products ORDER BY createdAt DESC');
        const dbProducts = stmt.all() as ProductFromDB[];
        return dbProducts.map(transformProduct);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}

export function searchProducts(query: string): Product[] {
    try {
        const stmt = db.prepare(`
            SELECT * FROM products
            WHERE name LIKE ? OR tags LIKE ? OR category LIKE ?
            ORDER BY createdAt DESC
        `);
        const likeQuery = `%${query}%`;
        const dbProducts = stmt.all(likeQuery, likeQuery, likeQuery) as ProductFromDB[];
        return dbProducts.map(transformProduct);
    } catch (error) {
        console.error("Failed to search products:", error);
        return [];
    }
}


export function getProductBySlug(slug: string): Product | null {
    try {
        const stmt = db.prepare('SELECT * FROM products WHERE slug = ?');
        const dbProduct = stmt.get(slug) as ProductFromDB;
        if (dbProduct) {
            return transformProduct(dbProduct);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch product with slug ${slug}:`, error);
        return null;
    }
}

export function getProductById(id: string): Product | null {
    try {
        const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
        const dbProduct = stmt.get(id) as ProductFromDB;
        if (dbProduct) {
            return transformProduct(dbProduct);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch product with id ${id}:`, error);
        return null;
    }
}

export function getAllOrders(): Order[] {
    try {
        const stmt = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC');
        const dbOrders = stmt.all() as OrderFromDB[];
        return dbOrders.map(transformOrder);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
}

export function getOrderById(id: string): Order | null {
    try {
        const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
        const dbOrder = stmt.get(id) as OrderFromDB | undefined;
        if (dbOrder) {
            return transformOrder(dbOrder);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch order with id ${id}:`, error);
        return null;
    }
}

export function getOrderForCustomer(id: string, email: string): Order | null {
    try {
        const stmt = db.prepare('SELECT * FROM orders WHERE id = ? AND customerEmail = ?');
        const dbOrder = stmt.get(id, email) as OrderFromDB | undefined;
        if (dbOrder) {
            return transformOrder(dbOrder);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch order for customer:`, error);
        return null;
    }
}

export function getDashboardData() {
    try {
        const totalRevenue = (db.prepare('SELECT SUM(total) as total FROM orders WHERE status = ?').get('Shipped') as { total: number | null })?.total || 0;
        
        const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }).count;
        
        const pendingOrders = (db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('Pending') as { count: number }).count;

        const monthlyRevenue = db.prepare(`
            SELECT strftime('%Y-%m', createdAt) as month, SUM(total) as revenue
            FROM orders
            WHERE status = 'Shipped' AND createdAt >= date('now', '-6 months')
            GROUP BY month
            ORDER BY month ASC
        `).all() as { month: string, revenue: number }[];

        return {
            totalRevenue,
            totalOrders,
            pendingOrders,
            monthlyRevenue: monthlyRevenue.map(r => ({ ...r, month: new Date(r.month + '-02').toLocaleString('default', { month: 'long' }) }))
        };

    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            pendingOrders: 0,
            monthlyRevenue: []
        };
    }
}
