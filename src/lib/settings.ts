
'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ========== GETTERS ==========

export async function getHomepageSettings<T>(key: string, defaultValue: T): Promise<T> {
    try {
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
