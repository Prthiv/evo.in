
import 'server-only';

import type { Product, ProductFromDB, Order, OrderFromDB, CategoryRecord, CategoryFromDB, CuratedBundle, CuratedBundleFromDB } from '@/lib/types';
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

// Add transformation functions for categories and bundles
function transformCategory(category: CategoryFromDB): CategoryRecord {
    return {
        id: category.id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        isVisible: !!category.isVisible,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
    };
}

function transformCuratedBundle(bundle: CuratedBundleFromDB): CuratedBundle {
    let productIds: string[] = [];
    try {
        if (typeof bundle.productIds === 'string') {
            productIds = JSON.parse(bundle.productIds);
        }
    } catch (e) {
        productIds = [];
    }

    return {
        id: bundle.id.toString(),
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description,
        productIds: productIds,
        imageUrl: bundle.imageUrl,
        isActive: !!bundle.isActive,
        sortOrder: bundle.sortOrder,
        createdAt: bundle.createdAt,
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

// Add new functions for categories and bundles
export function getAllCategories(): CategoryRecord[] {
    try {
        const stmt = db.prepare('SELECT * FROM categories ORDER BY sortOrder ASC');
        const dbCategories = stmt.all() as CategoryFromDB[];
        return dbCategories.map(transformCategory);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export function getVisibleCategories(): CategoryRecord[] {
    try {
        const stmt = db.prepare('SELECT * FROM categories WHERE isVisible = 1 ORDER BY sortOrder ASC');
        const dbCategories = stmt.all() as CategoryFromDB[];
        return dbCategories.map(transformCategory);
    } catch (error) {
        console.error("Failed to fetch visible categories:", error);
        return [];
    }
}

export function getCategoryById(id: string): CategoryRecord | null {
    try {
        const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
        const dbCategory = stmt.get(id) as CategoryFromDB | undefined;
        if (dbCategory) {
            return transformCategory(dbCategory);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch category with id ${id}:`, error);
        return null;
    }
}

export function getCategoryBySlug(slug: string): CategoryRecord | null {
    try {
        const stmt = db.prepare('SELECT * FROM categories WHERE slug = ?');
        const dbCategory = stmt.get(slug) as CategoryFromDB | undefined;
        if (dbCategory) {
            return transformCategory(dbCategory);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch category with slug ${slug}:`, error);
        return null;
    }
}

export function getAllCuratedBundles(): CuratedBundle[] {
    try {
        const stmt = db.prepare('SELECT * FROM curated_bundles ORDER BY sortOrder ASC');
        const dbBundles = stmt.all() as CuratedBundleFromDB[];
        return dbBundles.map(transformCuratedBundle);
    } catch (error) {
        console.error("Failed to fetch curated bundles:", error);
        return [];
    }
}

export function getActiveCuratedBundles(): CuratedBundle[] {
    try {
        const stmt = db.prepare('SELECT * FROM curated_bundles WHERE isActive = 1 ORDER BY sortOrder ASC');
        const dbBundles = stmt.all() as CuratedBundleFromDB[];
        return dbBundles.map(transformCuratedBundle);
    } catch (error) {
        console.error("Failed to fetch active curated bundles:", error);
        return [];
    }
}

export function getCuratedBundleById(id: string): CuratedBundle | null {
    try {
        const stmt = db.prepare('SELECT * FROM curated_bundles WHERE id = ?');
        const dbBundle = stmt.get(id) as CuratedBundleFromDB | undefined;
        if (dbBundle) {
            return transformCuratedBundle(dbBundle);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch curated bundle with id ${id}:`, error);
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

// Category management functions
export function createCategory(categoryData: {
    name: string;
    description?: string;
    imageUrl?: string;
    isVisible?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        // Make slug more unique by adding timestamp
        const baseSlug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Date.now()}`;
        
        const stmt = db.prepare(`
            INSERT INTO categories (name, slug, description, imageUrl, isVisible, sortOrder)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            categoryData.name,
            slug,
            categoryData.description || '',
            categoryData.imageUrl || '',
            categoryData.isVisible ? 1 : 0,
            categoryData.sortOrder || 0
        );
        
        return Promise.resolve({ success: true, id: result.lastInsertRowid?.toString() });
    } catch (error: any) {
        console.error('Failed to create category:', error);
        if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return Promise.resolve({ success: false, error: 'A category with this name already exists.' });
        }
        return Promise.resolve({ success: false, error: 'Failed to create category' });
    }
}

export function updateCategory(id: string, categoryData: {
    name: string;
    description?: string;
    imageUrl?: string;
    isVisible?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const baseSlug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Date.now()}`;
        
        const stmt = db.prepare(`
            UPDATE categories
            SET name = ?, slug = ?, description = ?, imageUrl = ?, isVisible = ?, sortOrder = ?
            WHERE id = ?
        `);
        
        stmt.run(
            categoryData.name,
            slug,
            categoryData.description || '',
            categoryData.imageUrl || '',
            categoryData.isVisible ? 1 : 0,
            categoryData.sortOrder || 0,
            id
        );
        
        return Promise.resolve({ success: true });
    } catch (error: any) {
        console.error('Failed to update category:', error);
        if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return Promise.resolve({ success: false, error: 'A category with this name already exists.' });
        }
        return Promise.resolve({ success: false, error: 'Failed to update category' });
    }
}

// Curated bundle management functions
export function createCuratedBundle(bundleData: {
    name: string;
    description?: string;
    productIds: string[];
    imageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        // Make slug more unique by adding timestamp
        const baseSlug = bundleData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Date.now()}`;
        
        const stmt = db.prepare(`
            INSERT INTO curated_bundles (name, slug, description, productIds, imageUrl, isActive, sortOrder)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            bundleData.name,
            slug,
            bundleData.description || '',
            JSON.stringify(bundleData.productIds),
            bundleData.imageUrl || '',
            bundleData.isActive ? 1 : 0,
            bundleData.sortOrder || 0
        );
        
        return Promise.resolve({ success: true, id: result.lastInsertRowid?.toString() });
    } catch (error) {
        console.error('Failed to create curated bundle:', error);
        return Promise.resolve({ success: false, error: 'Failed to create curated bundle' });
    }
}

export function updateCuratedBundle(id: string, bundleData: {
    name: string;
    description?: string;
    productIds: string[];
    imageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const baseSlug = bundleData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Date.now()}`;
        
        const stmt = db.prepare(`
            UPDATE curated_bundles
            SET name = ?, slug = ?, description = ?, productIds = ?, imageUrl = ?, isActive = ?, sortOrder = ?
            WHERE id = ?
        `);
        
        stmt.run(
            bundleData.name,
            slug,
            bundleData.description || '',
            JSON.stringify(bundleData.productIds),
            bundleData.imageUrl || '',
            bundleData.isActive ? 1 : 0,
            bundleData.sortOrder || 0,
            id
        );
        
        return Promise.resolve({ success: true });
    } catch (error) {
        console.error('Failed to update curated bundle:', error);
        return Promise.resolve({ success: false, error: 'Failed to update curated bundle' });
    }
}
