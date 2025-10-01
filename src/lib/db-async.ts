import 'server-only'
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';
import { BUNDLE_DEALS } from './constants';

const dbPath = path.join(process.cwd(), 'evo.db');

class DatabaseManager {
  private db: Database.Database | null = null;

  async init() {
    if (this.db) return this.db;
    
    this.db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    
    await this.initializeTables();
    await this.seedInitialData();
    
    return this.db;
  }

  async getDb() {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  private async initializeTables() {
    const db = await this.getDb();
    
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
  }

  private async seedInitialData() {
    const db = await this.getDb();
    
    // Check if settings already exist
    const settingsCount = db.prepare('SELECT COUNT(*) as count FROM homepage_settings').get() as { count: number };
    
    if (settingsCount.count === 0) {
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
      
      for (const setting of defaultSettings) {
        insertSetting.run(setting.key, setting.value);
      }
      
      console.log('Homepage settings seeded successfully.');
    }
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

// Initialize database on import
dbManager.init().catch(console.error);

export { dbManager };
export default dbManager;