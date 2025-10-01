'use server'

import { dbManager } from './db-async';
import { revalidatePath } from 'next/cache';

// ========== GETTERS ==========

export async function getHomepageSettings<T>(key: string, defaultValue: T): Promise<T> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT value FROM homepage_settings WHERE key = ?');
        const row = stmt.get(key) as { value: string } | undefined;
        
        if (row) {
            return JSON.parse(row.value) as T;
        }
        return defaultValue;
    } catch (error) {
        console.error(`Failed to get setting for key "${key}":`, error);
        return defaultValue;
    }
}

// ========== SETTERS ==========

export async function updateHomepageSettings(key: string, value: any) {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare(`
            INSERT INTO homepage_settings (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `);
        stmt.run(key, JSON.stringify(value));
        
        // Revalidate paths that use this data
        revalidatePath('/');
        revalidatePath('/studio/homepage');

        return { success: true };
    } catch (error) {
        console.error(`Failed to update setting for key "${key}":`, error);
        return { success: false, error: 'Database operation failed.' };
    }
}

// ========== SPECIFIC SETTINGS FUNCTIONS ==========

export async function updateHeroSettings(data: {
    headline: string;
    subheadline: string;
    videoUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await updateHomepageSettings('hero', data);
        return result;
    } catch (error) {
        console.error('Failed to update hero settings:', error);
        return { success: false, error: 'Failed to update hero settings' };
    }
}

export async function updateMegaDealsSettings(deals: any[]): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await updateHomepageSettings('megaDeals', deals);
        return result;
    } catch (error) {
        console.error('Failed to update mega deals settings:', error);
        return { success: false, error: 'Failed to update mega deals settings' };
    }
}

export async function updateReelsSettings(reels: any[]): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await updateHomepageSettings('reels', reels);
        return result;
    } catch (error) {
        console.error('Failed to update reels settings:', error);
        return { success: false, error: 'Failed to update reels settings' };
    }
}

export async function getAllHomepageSettings(): Promise<Record<string, any>> {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT key, value FROM homepage_settings');
        const rows = stmt.all() as { key: string; value: string }[];
        
        const settings: Record<string, any> = {};
        for (const row of rows) {
            try {
                settings[row.key] = JSON.parse(row.value);
            } catch (e) {
                console.error(`Failed to parse setting for key "${row.key}":`, e);
                settings[row.key] = row.value;
            }
        }
        
        return settings;
    } catch (error) {
        console.error('Failed to get all homepage settings:', error);
        return {};
    }
}
