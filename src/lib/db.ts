
import 'server-only'
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { BUNDLE_DEALS, CATEGORIES } from './constants';

const dbPath = path.join(process.cwd(), 'evo.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

function initializeDatabase() {
    // Create products table
    db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      images TEXT NOT NULL, -- JSON array of image URLs
      stock INTEGER NOT NULL,
      tags TEXT, -- Comma-separated
      isTrending BOOLEAN NOT NULL DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);

    // Create homepage_settings table
    db.exec(`
    CREATE TABLE IF NOT EXISTS homepage_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    `);
    
    // Create orders table
    db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customerEmail TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      items TEXT NOT NULL, -- JSON of CartBundle[]
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);

    // Create categories table
    db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      imageUrl TEXT,
      isVisible BOOLEAN NOT NULL DEFAULT 1,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);

    // Create curated_bundles table
    db.exec(`
    CREATE TABLE IF NOT EXISTS curated_bundles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      productIds TEXT NOT NULL, -- JSON array of product IDs
      imageUrl TEXT,
      isActive BOOLEAN NOT NULL DEFAULT 1,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);

    // Create pricing_rules table for dynamic pricing
    db.exec(`
    CREATE TABLE IF NOT EXISTS pricing_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      ruleType TEXT NOT NULL, -- 'percentage_discount', 'fixed_amount', 'buy_x_get_y', 'free_shipping', etc.
      value REAL, -- discount percentage or fixed amount
      targetType TEXT NOT NULL, -- 'cart', 'product', 'category', 'bundle'
      targetValue TEXT, -- specific product IDs, category names, or bundle IDs (JSON array)
      minOrderValue REAL, -- minimum order value for the rule to apply
      startDate TIMESTAMP,
      endDate TIMESTAMP,
      isActive BOOLEAN NOT NULL DEFAULT 1,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);

    // Create coupons table for promotional codes
    db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      discountType TEXT NOT NULL, -- 'percentage', 'fixed_amount'
      discountValue REAL NOT NULL,
      minOrderValue REAL, -- minimum order value for coupon to apply
      usageLimit INTEGER, -- maximum number of times this coupon can be used
      usedCount INTEGER DEFAULT 0,
      startDate TIMESTAMP,
      endDate TIMESTAMP,
      isActive BOOLEAN NOT NULL DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);

    // Seed homepage settings if table is empty
    const settingsCount = (db.prepare('SELECT COUNT(*) as count FROM homepage_settings').get() as { count: number }).count;
    if (settingsCount === 0) {
        console.log('Seeding database with initial homepage settings...');
        const defaultSettings = [
            { 
                key: 'hero', 
                value: JSON.stringify({
                    headline: 'Art That Defines You',
                    subheadline: 'From iconic movie scenes to breathtaking landscapes, find the perfect high-quality posters and frames to express your style.',
                    videoUrl: '/snapsave-app_3722314188888151940.mp4'
                })
            },
            {
                key: 'megaDeals',
                value: JSON.stringify(BUNDLE_DEALS.map(deal => ({...deal, active: true})))
            },
            {
                key: 'reels',
                value: JSON.stringify([])
            }
        ];
        
        const insertSetting = db.prepare('INSERT INTO homepage_settings (key, value) VALUES (?, ?)');
        const insertManySettings = db.transaction((settings) => {
            for (const setting of settings) {
                insertSetting.run(setting.key, setting.value);
            }
        });

        try {
            insertManySettings(defaultSettings);
            console.log('Homepage settings seeded successfully.');
        } catch (err) {
            console.error('Settings seeding failed:', err);
        }
    }

    // Seed categories if table is empty
    const categoriesCount = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count;
    if (categoriesCount === 0) {
        console.log('Seeding database with initial categories...');
        const defaultCategories = CATEGORIES.map((category, index) => ({
            name: category,
            slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: `Products in the ${category} category`,
            isVisible: true,
            sortOrder: index
        }));

        const insertCategory = db.prepare(`
            INSERT INTO categories (name, slug, description, isVisible, sortOrder)
            VALUES (?, ?, ?, ?, ?)
        `);

        try {
            for (const category of defaultCategories) {
                insertCategory.run(
                    category.name,
                    category.slug,
                    category.description,
                    category.isVisible ? 1 : 0,
                    category.sortOrder
                );
            }
            console.log('Categories seeded successfully.');
        } catch (err) {
            console.error('Categories seeding failed:', err);
        }
    }

    // Seed pricing rules if table is empty
    const pricingRulesCount = (db.prepare('SELECT COUNT(*) as count FROM pricing_rules').get() as { count: number }).count;
    if (pricingRulesCount === 0) {
        console.log('Seeding database with initial pricing rules...');
        const defaultPricingRules = [
            {
                name: '10% Off Orders Over ₹1000',
                description: 'Apply 10% discount on orders over ₹1000',
                ruleType: 'percentage_discount',
                value: 10,
                targetType: 'cart',
                minOrderValue: 1000,
                isActive: true,
                sortOrder: 1
            },
            {
                name: 'Free Shipping on Orders Over ₹1500',
                description: 'Free shipping for orders over ₹1500',
                ruleType: 'free_shipping',
                targetType: 'cart',
                minOrderValue: 1500,
                isActive: true,
                sortOrder: 2
            },
            {
                name: 'Buy 3 Get 1 Free',
                description: 'Buy 3 items, get 1 free',
                ruleType: 'buy_x_get_y',
                value: 1, // get 1
                targetType: 'cart',
                targetValue: '3', // buy 3
                isActive: true,
                sortOrder: 3
            }
        ];

        const insertPricingRule = db.prepare(`
            INSERT INTO pricing_rules (name, description, ruleType, value, targetType, targetValue, minOrderValue, isActive, sortOrder)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        try {
            for (const rule of defaultPricingRules) {
                insertPricingRule.run(
                    rule.name,
                    rule.description || '',
                    rule.ruleType,
                    rule.value || null,
                    rule.targetType,
                    rule.targetValue || null,
                    rule.minOrderValue || null,
                    rule.isActive ? 1 : 0,
                    rule.sortOrder
                );
            }
            console.log('Pricing rules seeded successfully.');
        } catch (err) {
            console.error('Pricing rules seeding failed:', err);
        }
    }

    // Seed coupons if table is empty
    const couponsCount = (db.prepare('SELECT COUNT(*) as count FROM coupons').get() as { count: number }).count;
    if (couponsCount === 0) {
        console.log('Seeding database with initial coupons...');
        const defaultCoupons = [
            {
                code: 'WELCOME10',
                description: '10% off for new customers',
                discountType: 'percentage',
                discountValue: 10,
                minOrderValue: 500,
                usageLimit: 100,
                isActive: true
            },
            {
                code: 'SAVE50',
                description: '₹50 off on orders over ₹1000',
                discountType: 'fixed_amount',
                discountValue: 50,
                minOrderValue: 1000,
                usageLimit: 50,
                isActive: true
            }
        ];

        const insertCoupon = db.prepare(`
            INSERT INTO coupons (code, description, discountType, discountValue, minOrderValue, usageLimit, isActive)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        try {
            for (const coupon of defaultCoupons) {
                insertCoupon.run(
                    coupon.code,
                    coupon.description || '',
                    coupon.discountType,
                    coupon.discountValue,
                    coupon.minOrderValue || null,
                    coupon.usageLimit || null,
                    coupon.isActive ? 1 : 0
                );
            }
            console.log('Coupons seeded successfully.');
        } catch (err) {
            console.error('Coupons seeding failed:', err);
        }
    }
    
    // Force create pricing tables if they don't exist (in case database was created before new tables were added)
    try {
        // Check if pricing_rules table exists
        const pricingRulesTableCheck = db.prepare(`
            SELECT name FROM sqlite_master WHERE type='table' AND name='pricing_rules'
        `).get();
        
        if (!pricingRulesTableCheck) {
            console.log('Creating pricing_rules table...');
            db.exec(`
            CREATE TABLE pricing_rules (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              description TEXT,
              ruleType TEXT NOT NULL, -- 'percentage_discount', 'fixed_amount', 'buy_x_get_y', 'free_shipping', etc.
              value REAL, -- discount percentage or fixed amount
              targetType TEXT NOT NULL, -- 'cart', 'product', 'category', 'bundle'
              targetValue TEXT, -- specific product IDs, category names, or bundle IDs (JSON array)
              minOrderValue REAL, -- minimum order value for the rule to apply
              startDate TIMESTAMP,
              endDate TIMESTAMP,
              isActive BOOLEAN NOT NULL DEFAULT 1,
              sortOrder INTEGER NOT NULL DEFAULT 0,
              createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `);
            
            // Seed with default pricing rules
            console.log('Seeding database with initial pricing rules...');
            const defaultPricingRules = [
                {
                    name: '10% Off Orders Over ₹1000',
                    description: 'Apply 10% discount on orders over ₹1000',
                    ruleType: 'percentage_discount',
                    value: 10,
                    targetType: 'cart',
                    minOrderValue: 1000,
                    isActive: true,
                    sortOrder: 1
                },
                {
                    name: 'Free Shipping on Orders Over ₹1500',
                    description: 'Free shipping for orders over ₹1500',
                    ruleType: 'free_shipping',
                    targetType: 'cart',
                    minOrderValue: 1500,
                    isActive: true,
                    sortOrder: 2
                },
                {
                    name: 'Buy 3 Get 1 Free',
                    description: 'Buy 3 items, get 1 free',
                    ruleType: 'buy_x_get_y',
                    value: 1, // get 1
                    targetType: 'cart',
                    targetValue: '3', // buy 3
                    isActive: true,
                    sortOrder: 3
                }
            ];

            const insertPricingRule = db.prepare(`
                INSERT INTO pricing_rules (name, description, ruleType, value, targetType, targetValue, minOrderValue, isActive, sortOrder)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const rule of defaultPricingRules) {
                insertPricingRule.run(
                    rule.name,
                    rule.description || '',
                    rule.ruleType,
                    rule.value || null,
                    rule.targetType,
                    rule.targetValue || null,
                    rule.minOrderValue || null,
                    rule.isActive ? 1 : 0,
                    rule.sortOrder
                );
            }
            console.log('Pricing rules seeded successfully.');
        }
        
        // Check if coupons table exists
        const couponsTableCheck = db.prepare(`
            SELECT name FROM sqlite_master WHERE type='table' AND name='coupons'
        `).get();
        
        if (!couponsTableCheck) {
            console.log('Creating coupons table...');
            db.exec(`
            CREATE TABLE coupons (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              code TEXT NOT NULL UNIQUE,
              description TEXT,
              discountType TEXT NOT NULL, -- 'percentage', 'fixed_amount'
              discountValue REAL NOT NULL,
              minOrderValue REAL, -- minimum order value for coupon to apply
              usageLimit INTEGER, -- maximum number of times this coupon can be used
              usedCount INTEGER DEFAULT 0,
              startDate TIMESTAMP,
              endDate TIMESTAMP,
              isActive BOOLEAN NOT NULL DEFAULT 1,
              createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `);
            
            // Seed with default coupons
            console.log('Seeding database with initial coupons...');
            const defaultCoupons = [
                {
                    code: 'WELCOME10',
                    description: '10% off for new customers',
                    discountType: 'percentage',
                    discountValue: 10,
                    minOrderValue: 500,
                    usageLimit: 100,
                    isActive: true
                },
                {
                    code: 'SAVE50',
                    description: '₹50 off on orders over ₹1000',
                    discountType: 'fixed_amount',
                    discountValue: 50,
                    minOrderValue: 1000,
                    usageLimit: 50,
                    isActive: true
                }
            ];

            const insertCoupon = db.prepare(`
                INSERT INTO coupons (code, description, discountType, discountValue, minOrderValue, usageLimit, isActive)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            for (const coupon of defaultCoupons) {
                insertCoupon.run(
                    coupon.code,
                    coupon.description || '',
                    coupon.discountType,
                    coupon.discountValue,
                    coupon.minOrderValue || null,
                    coupon.usageLimit || null,
                    coupon.isActive ? 1 : 0
                );
            }
            console.log('Coupons seeded successfully.');
        }
    } catch (err) {
        console.error('Error ensuring tables exist:', err);
    }
}

initializeDatabase();
