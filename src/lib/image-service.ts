import 'server-only'
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface MultipleImageUploadResult {
  success: boolean;
  urls?: string[];
  errors?: string[];
}

export class ImageService {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
  private static readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
      throw new Error('Failed to create upload directory');
    }
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    // Check file type
    const extension = path.extname(file.name).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      return { valid: false, error: 'File type not supported. Allowed: JPG, PNG, WebP, GIF' };
    }

    return { valid: true };
  }

  static generateFileName(originalName: string, prefix?: string): string {
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, extension);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-');
    const uuid = uuidv4().substring(0, 8);
    const prefixPart = prefix ? `${prefix}-` : '';
    return `${prefixPart}${sanitizedBaseName}-${uuid}${extension}`;
  }

  static async uploadSingleImage(
    file: File, 
    prefix?: string
  ): Promise<ImageUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Ensure upload directory exists
      await this.ensureUploadDir();

      // Generate unique filename
      const fileName = this.generateFileName(file.name, prefix);
      const filePath = path.join(this.UPLOAD_DIR, fileName);

      // Write file
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      const url = `/uploads/${fileName}`;
      return { success: true, url };

    } catch (error) {
      console.error('Image upload failed:', error);
      return { success: false, error: 'Failed to upload image' };
    }
  }

  static async uploadMultipleImages(
    files: File[], 
    prefix?: string
  ): Promise<MultipleImageUploadResult> {
    const results: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const result = await this.uploadSingleImage(file, prefix);
      if (result.success && result.url) {
        results.push(result.url);
      } else {
        errors.push(`${file.name}: ${result.error || 'Unknown error'}`);
      }
    }

    return {
      success: results.length > 0,
      urls: results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  static async deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!imageUrl.startsWith('/uploads/')) {
        return { success: false, error: 'Invalid image URL' };
      }

      const filePath = path.join(process.cwd(), 'public', imageUrl);
      await fs.unlink(filePath);
      
      return { success: true };
    } catch (error) {
      console.error('Image deletion failed:', error);
      return { success: false, error: 'Failed to delete image' };
    }
  }

  static async deleteMultipleImages(imageUrls: string[]): Promise<{ success: boolean; errors?: string[] }> {
    const errors: string[] = [];

    for (const url of imageUrls) {
      const result = await this.deleteImage(url);
      if (!result.success) {
        errors.push(`${url}: ${result.error || 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  static async cleanupOrphanedImages(): Promise<void> {
    try {
      // This could be implemented to clean up images that are no longer referenced
      // in the database. For now, we'll leave it as a placeholder.
      console.log('Orphaned image cleanup not implemented yet');
    } catch (error) {
      console.error('Failed to cleanup orphaned images:', error);
    }
  }
}
