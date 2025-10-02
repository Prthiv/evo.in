import 'server-only';

import type { Product, ProductFromDB, Order, OrderFromDB, CategoryRecord, CategoryFromDB, CuratedBundle, CuratedBundleFromDB, PricingRule, PricingRuleFromDB, Coupon, CouponFromDB } from '@/lib/types';
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

// Add transformation functions for pricing rules and coupons
function transformPricingRule(rule: PricingRuleFromDB): PricingRule {
    let targetValue: string[] = [];
    try {
        if (typeof rule.targetValue === 'string') {
            targetValue = JSON.parse(rule.targetValue);
        }
    } catch (e) {
        targetValue = [];
    }

    return {
        id: rule.id.toString(),
        name: rule.name,
        description: rule.description,
        ruleType: rule.ruleType,
        value: rule.value,
        targetType: rule.targetType,
        targetValue: targetValue,
        minOrderValue: rule.minOrderValue,
        startDate: rule.startDate,
        endDate: rule.endDate,
        isActive: !!rule.isActive,
        sortOrder: rule.sortOrder,
        createdAt: rule.createdAt,
    };
}

function transformCoupon(coupon: CouponFromDB): Coupon {
    return {
        id: coupon.id.toString(),
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        isActive: !!coupon.isActive,
        createdAt: coupon.createdAt,
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

export async function getAllCategories(): Promise<CategoryRecord[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM categories ORDER BY sortOrder ASC');
        const dbCategories = stmt.all() as CategoryFromDB[];
        return dbCategories.map(transformCategory);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export async function getVisibleCategories(): Promise<CategoryRecord[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM categories WHERE isVisible = 1 ORDER BY sortOrder ASC');
        const dbCategories = stmt.all() as CategoryFromDB[];
        return dbCategories.map(transformCategory);
    } catch (error) {
        console.error("Failed to fetch visible categories:", error);
        return [];
    }
}

export async function getCategoryById(id: string): Promise<CategoryRecord | null> {
    try {
        const db = await dbManager.getDb();
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

export async function getCategoryBySlug(slug: string): Promise<CategoryRecord | null> {
    try {
        const db = await dbManager.getDb();
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

export async function getAllCuratedBundles(): Promise<CuratedBundle[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM curated_bundles ORDER BY sortOrder ASC');
        const dbBundles = stmt.all() as CuratedBundleFromDB[];
        return dbBundles.map(transformCuratedBundle);
    } catch (error) {
        console.error("Failed to fetch curated bundles:", error);
        return [];
    }
}

export async function getActiveCuratedBundles(): Promise<CuratedBundle[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM curated_bundles WHERE isActive = 1 ORDER BY sortOrder ASC');
        const dbBundles = stmt.all() as CuratedBundleFromDB[];
        return dbBundles.map(transformCuratedBundle);
    } catch (error) {
        console.error("Failed to fetch active curated bundles:", error);
        return [];
    }
}

export async function getCuratedBundleById(id: string): Promise<CuratedBundle | null> {
    try {
        const db = await dbManager.getDb();
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

// Category management functions
export async function createCategory(categoryData: {
    name: string;
    description?: string;
    imageUrl?: string;
    isVisible?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const db = await dbManager.getDb();
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
        
        revalidatePath('/studio/categories');
        revalidatePath('/');
        revalidatePath('/products');
        return { success: true, id: result.lastInsertRowid?.toString() };
    } catch (error: any) {
        console.error('Failed to create category:', error);
        if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { success: false, error: 'A category with this name already exists.' };
        }
        return { success: false, error: 'Failed to create category' };
    }
}

export async function updateCategory(id: string, categoryData: {
    name: string;
    description?: string;
    imageUrl?: string;
    isVisible?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
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
        
        revalidatePath('/studio/categories');
        revalidatePath('/');
        revalidatePath('/products');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update category:', error);
        if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { success: false, error: 'A category with this name already exists.' };
        }
        return { success: false, error: 'Failed to update category' };
    }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
        const result = stmt.run(id);
        
        if (result.changes === 0) {
            return { success: false, error: 'Category not found' };
        }
        
        revalidatePath('/studio/categories');
        revalidatePath('/');
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete category:', error);
        return { success: false, error: 'Failed to delete category' };
    }
}

// Curated bundle management functions
export async function createCuratedBundle(bundleData: {
    name: string;
    description?: string;
    productIds: string[];
    imageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const db = await dbManager.getDb();
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
        
        revalidatePath('/studio/bundles');
        revalidatePath('/');
        return { success: true, id: result.lastInsertRowid?.toString() };
    } catch (error) {
        console.error('Failed to create curated bundle:', error);
        return { success: false, error: 'Failed to create curated bundle' };
    }
}

export async function updateCuratedBundle(id: string, bundleData: {
    name: string;
    description?: string;
    productIds: string[];
    imageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
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
        
        revalidatePath('/studio/bundles');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update curated bundle:', error);
        return { success: false, error: 'Failed to update curated bundle' };
    }
}

export async function deleteCuratedBundle(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('DELETE FROM curated_bundles WHERE id = ?');
        const result = stmt.run(id);
        
        if (result.changes === 0) {
            return { success: false, error: 'Curated bundle not found' };
        }
        
        revalidatePath('/studio/bundles');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete curated bundle:', error);
        return { success: false, error: 'Failed to delete curated bundle' };
    }
}

// Pricing rule management functions
export async function getAllPricingRules(): Promise<PricingRule[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM pricing_rules ORDER BY sortOrder ASC');
        const dbRules = stmt.all() as PricingRuleFromDB[];
        return dbRules.map(transformPricingRule);
    } catch (error) {
        console.error("Failed to fetch pricing rules:", error);
        return [];
    }
}

export async function getActivePricingRules(): Promise<PricingRule[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM pricing_rules WHERE isActive = 1 ORDER BY sortOrder ASC');
        const dbRules = stmt.all() as PricingRuleFromDB[];
        return dbRules.map(transformPricingRule);
    } catch (error) {
        console.error("Failed to fetch active pricing rules:", error);
        return [];
    }
}

export async function getPricingRuleById(id: string): Promise<PricingRule | null> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM pricing_rules WHERE id = ?');
        const dbRule = stmt.get(id) as PricingRuleFromDB | undefined;
        if (dbRule) {
            return transformPricingRule(dbRule);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch pricing rule with id ${id}:`, error);
        return null;
    }
}

export async function createPricingRule(ruleData: {
    name: string;
    description?: string;
    ruleType: 'percentage_discount' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
    value?: number;
    targetType: 'cart' | 'product' | 'category' | 'bundle';
    targetValue?: string[];
    minOrderValue?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const db = await dbManager.getDb();
        
        const stmt = db.prepare(`
            INSERT INTO pricing_rules (name, description, ruleType, value, targetType, targetValue, minOrderValue, startDate, endDate, isActive, sortOrder)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            ruleData.name,
            ruleData.description || '',
            ruleData.ruleType,
            ruleData.value || null,
            ruleData.targetType,
            ruleData.targetValue ? JSON.stringify(ruleData.targetValue) : null,
            ruleData.minOrderValue || null,
            ruleData.startDate || null,
            ruleData.endDate || null,
            ruleData.isActive ? 1 : 0,
            ruleData.sortOrder || 0
        );
        
        revalidatePath('/studio/pricing');
        return { success: true, id: result.lastInsertRowid?.toString() };
    } catch (error) {
        console.error('Failed to create pricing rule:', error);
        return { success: false, error: 'Failed to create pricing rule' };
    }
}

export async function updatePricingRule(id: string, ruleData: {
    name: string;
    description?: string;
    ruleType: 'percentage_discount' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
    value?: number;
    targetType: 'cart' | 'product' | 'category' | 'bundle';
    targetValue?: string[];
    minOrderValue?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    sortOrder?: number;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        
        const stmt = db.prepare(`
            UPDATE pricing_rules
            SET name = ?, description = ?, ruleType = ?, value = ?, targetType = ?, targetValue = ?, minOrderValue = ?, startDate = ?, endDate = ?, isActive = ?, sortOrder = ?
            WHERE id = ?
        `);
        
        stmt.run(
            ruleData.name,
            ruleData.description || '',
            ruleData.ruleType,
            ruleData.value || null,
            ruleData.targetType,
            ruleData.targetValue ? JSON.stringify(ruleData.targetValue) : null,
            ruleData.minOrderValue || null,
            ruleData.startDate || null,
            ruleData.endDate || null,
            ruleData.isActive ? 1 : 0,
            ruleData.sortOrder || 0,
            id
        );
        
        revalidatePath('/studio/pricing');
        return { success: true };
    } catch (error) {
        console.error('Failed to update pricing rule:', error);
        return { success: false, error: 'Failed to update pricing rule' };
    }
}

export async function deletePricingRule(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('DELETE FROM pricing_rules WHERE id = ?');
        const result = stmt.run(id);
        
        if (result.changes === 0) {
            return { success: false, error: 'Pricing rule not found' };
        }
        
        revalidatePath('/studio/pricing');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete pricing rule:', error);
        return { success: false, error: 'Failed to delete pricing rule' };
    }
}

// Coupon management functions
export async function getAllCoupons(): Promise<Coupon[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM coupons ORDER BY createdAt DESC');
        const dbCoupons = stmt.all() as CouponFromDB[];
        return dbCoupons.map(transformCoupon);
    } catch (error) {
        console.error("Failed to fetch coupons:", error);
        return [];
    }
}

export async function getActiveCoupons(): Promise<Coupon[]> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM coupons WHERE isActive = 1 ORDER BY createdAt DESC');
        const dbCoupons = stmt.all() as CouponFromDB[];
        return dbCoupons.map(transformCoupon);
    } catch (error) {
        console.error("Failed to fetch active coupons:", error);
        return [];
    }
}

export async function getCouponById(id: string): Promise<Coupon | null> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM coupons WHERE id = ?');
        const dbCoupon = stmt.get(id) as CouponFromDB | undefined;
        if (dbCoupon) {
            return transformCoupon(dbCoupon);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch coupon with id ${id}:`, error);
        return null;
    }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT * FROM coupons WHERE code = ? AND isActive = 1');
        const dbCoupon = stmt.get(code) as CouponFromDB | undefined;
        if (dbCoupon) {
            return transformCoupon(dbCoupon);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch coupon with code ${code}:`, error);
        return null;
    }
}

export async function createCoupon(couponData: {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    minOrderValue?: number;
    usageLimit?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const db = await dbManager.getDb();
        
        const stmt = db.prepare(`
            INSERT INTO coupons (code, description, discountType, discountValue, minOrderValue, usageLimit, startDate, endDate, isActive)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            couponData.code,
            couponData.description || '',
            couponData.discountType,
            couponData.discountValue,
            couponData.minOrderValue || null,
            couponData.usageLimit || null,
            couponData.startDate || null,
            couponData.endDate || null,
            couponData.isActive ? 1 : 0
        );
        
        revalidatePath('/studio/pricing');
        return { success: true, id: result.lastInsertRowid?.toString() };
    } catch (error) {
        console.error('Failed to create coupon:', error);
        return { success: false, error: 'Failed to create coupon' };
    }
}

export async function updateCoupon(id: string, couponData: {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    minOrderValue?: number;
    usageLimit?: number;
    usedCount?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        
        const stmt = db.prepare(`
            UPDATE coupons
            SET code = ?, description = ?, discountType = ?, discountValue = ?, minOrderValue = ?, usageLimit = ?, usedCount = ?, startDate = ?, endDate = ?, isActive = ?
            WHERE id = ?
        `);
        
        stmt.run(
            couponData.code,
            couponData.description || '',
            couponData.discountType,
            couponData.discountValue,
            couponData.minOrderValue || null,
            couponData.usageLimit || null,
            couponData.usedCount || 0,
            couponData.startDate || null,
            couponData.endDate || null,
            couponData.isActive ? 1 : 0,
            id
        );
        
        revalidatePath('/studio/pricing');
        return { success: true };
    } catch (error) {
        console.error('Failed to update coupon:', error);
        return { success: false, error: 'Failed to update coupon' };
    }
}

export async function deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('DELETE FROM coupons WHERE id = ?');
        const result = stmt.run(id);
        
        if (result.changes === 0) {
            return { success: false, error: 'Coupon not found' };
        }
        
        revalidatePath('/studio/pricing');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete coupon:', error);
        return { success: false, error: 'Failed to delete coupon' };
    }
}

export async function incrementCouponUsage(couponId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('UPDATE coupons SET usedCount = usedCount + 1 WHERE id = ?');
        stmt.run(couponId);
        
        return { success: true };
    } catch (error) {
        console.error('Failed to increment coupon usage:', error);
        return { success: false, error: 'Failed to increment coupon usage' };
    }
}