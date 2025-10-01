import 'server-only';

import type { Product, ProductFromDB, Order, OrderFromDB } from '@/lib/types';
import { dbManager } from './db-async';
import { revalidatePath } from 'next/cache';

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

export async function getAllProducts(): Promise<Product[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = await db.prepare('SELECT * FROM products ORDER BY createdAt DESC');
        const dbProducts = stmt.all() as ProductFromDB[];
        return dbProducts.map(transformProduct);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}

export async function searchProducts(query: string): Promise<Product[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = await db.prepare(`
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

export async function getProductBySlug(slug: string): Promise<Product | null> {
    try {
        const db = await dbManager.getDb();
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

export async function getProductById(id: string): Promise<Product | null> {
    try {
        const db = await dbManager.getDb();
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

export async function getAllOrders(): Promise<Order[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC');
        const dbOrders = stmt.all() as OrderFromDB[];
        return dbOrders.map(transformOrder);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
}

export async function getOrderById(id: string): Promise<Order | null> {
    try {
        const db = await dbManager.getDb();
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

export async function getOrderForCustomer(id: string, email: string): Promise<Order | null> {
    try {
        const db = await dbManager.getDb();
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

export async function getDashboardData() {
    try {
        const db = await dbManager.getDb();
        
        const totalRevenueResult = db.prepare('SELECT SUM(total) as total FROM orders WHERE status = ?').get('Shipped') as { total: number | null };
        const totalRevenue = totalRevenueResult?.total || 0;
        
        const totalOrdersResult = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
        const totalOrders = totalOrdersResult.count;
        
        const pendingOrdersResult = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('Pending') as { count: number };
        const pendingOrders = pendingOrdersResult.count;

        const stmt = db.prepare(`
            SELECT strftime('%Y-%m', createdAt) as month, SUM(total) as revenue
            FROM orders
            WHERE status = 'Shipped' AND createdAt >= date('now', '-6 months')
            GROUP BY month
            ORDER BY month ASC
        `);
        const monthlyRevenue = stmt.all() as { month: string, revenue: number }[];

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

// Product management functions
export async function createProduct(productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    tags?: string;
    images: string[];
    isTrending?: boolean;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const db = await dbManager.getDb();
        const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const stmt = db.prepare(`
            INSERT INTO products (name, slug, description, price, category, stock, tags, images, isTrending)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            productData.name,
            slug,
            productData.description,
            productData.price,
            productData.category,
            productData.stock,
            productData.tags || '',
            JSON.stringify(productData.images),
            productData.isTrending ? 1 : 0
        );
        
        revalidatePath('/');
        revalidatePath('/products');
        return { success: true, id: result.lastInsertRowid?.toString() };
    } catch (error) {
        console.error('Failed to create product:', error);
        return { success: false, error: 'Failed to create product' };
    }
}

export async function updateProduct(id: string, productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    tags?: string;
    images: string[];
    isTrending?: boolean;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const stmt = db.prepare(`
            UPDATE products
            SET name = ?, slug = ?, description = ?, price = ?, category = ?, stock = ?, tags = ?, images = ?, isTrending = ?
            WHERE id = ?
        `);
        
        stmt.run(
            productData.name,
            slug,
            productData.description,
            productData.price,
            productData.category,
            productData.stock,
            productData.tags || '',
            JSON.stringify(productData.images),
            productData.isTrending ? 1 : 0,
            id
        );
        
        revalidatePath('/');
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Failed to update product:', error);
        return { success: false, error: 'Failed to update product' };
    }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        stmt.run(id);
        
        revalidatePath('/');
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete product:', error);
        return { success: false, error: 'Failed to delete product' };
    }
}

export async function updateProductTrendingStatus(productIds: string[], isTrending: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('UPDATE products SET isTrending = ? WHERE id = ?');
        
        for (const id of productIds) {
            stmt.run(isTrending ? 1 : 0, id);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Failed to update trending status:', error);
        return { success: false, error: 'Failed to update trending status' };
    }
}
