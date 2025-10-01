'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { dbManager } from './db-async'
import { ImageService } from './image-service'
import { 
    createProduct, 
    updateProduct, 
    deleteProduct as deleteProductFromDb,
    updateProductTrendingStatus,
    getAllProducts
} from './data-async'
import { 
    updateHeroSettings, 
    updateMegaDealsSettings, 
    updateReelsSettings 
} from './settings-async'

const checkoutSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.'}),
    shippingAddress: z.string().min(10, 'Please enter a complete shipping address.'),
    paymentMethod: z.enum(['upi', 'phonepe']),
    cartItems: z.string().min(1, 'Cart cannot be empty.'),
    total: z.coerce.number().min(0.01, 'Total must be valid.'),
})

export async function submitOrder(prevState: any, formData: FormData) {
    const validatedFields = checkoutSchema.safeParse({
        email: formData.get('email'),
        shippingAddress: formData.get('shippingAddress'),
        paymentMethod: formData.get('paymentMethod'),
        cartItems: formData.get('cartItems'),
        total: formData.get('total'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }
    
    const { email, shippingAddress, paymentMethod, cartItems, total } = validatedFields.data;
    const orderId = `EVO-${Date.now().toString().slice(-6)}`;

    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare(`
            INSERT INTO orders (id, customerEmail, shippingAddress, paymentMethod, items, total)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(orderId, email, shippingAddress, paymentMethod, cartItems, total);
    } catch (error) {
        console.error('Failed to save order:', error);
        return {
            errors: { form: ['There was an error saving your order. Please try again.'] }
        }
    }
    
    // In a real app, you would integrate with a payment provider here.
    // For now, we simulate success and redirect.

    if (paymentMethod === 'upi') {
        redirect(`/checkout/upi/${orderId}`);
    }
    
    redirect(`/order-confirmation/${orderId}`)
}

const fileSchema = z.instanceof(File).optional();
const imageSchema = fileSchema.refine(
    (file) => !file || file.size === 0 || file.type.startsWith('image/'),
    { message: 'File must be an image.' }
);

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  category: z.string({ required_error: 'Category is required.' }).min(1, 'Category is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  tags: z.string().optional(),
  isTrending: z.string().optional(),
  existingImages: z.union([z.array(z.string()), z.string()]).optional(),
  newImages: z.union([z.array(fileSchema), fileSchema]).optional(),
}).refine((data) => {
    const existing = Array.isArray(data.existingImages) ? data.existingImages : (data.existingImages ? [data.existingImages] : []);
    const newImgs = (Array.isArray(data.newImages) ? data.newImages : (data.newImages ? [data.newImages] : [])).filter(f => f instanceof File && f.size > 0);
    return existing.length > 0 || newImgs.length > 0;
}, {
    message: 'At least one image is required',
    path: ['newImages'],
});

export async function upsertProduct(prevState: any, formData: FormData) {
  const validatedFields = productSchema.safeParse({
      id: formData.get('id') || undefined,
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      category: formData.get('category'),
      stock: formData.get('stock'),
      tags: formData.get('tags'),
      isTrending: formData.get('isTrending'),
      existingImages: formData.getAll('existingImages'),
      newImages: formData.getAll('newImages'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, description, price, category, stock, tags } = validatedFields.data;
  const isTrending = validatedFields.data.isTrending === 'on';
  
  // Normalize image fields
  const existingImages = Array.isArray(validatedFields.data.existingImages) ? validatedFields.data.existingImages : (validatedFields.data.existingImages ? [validatedFields.data.existingImages] : []);
  const newImages = (Array.isArray(validatedFields.data.newImages) ? validatedFields.data.newImages : (validatedFields.data.newImages ? [validatedFields.data.newImages] : [])).filter((f): f is File => f instanceof File && f.size > 0);
  
  try {
    const finalImagePaths: string[] = [...existingImages];

    // Upload new images
    if (newImages.length > 0) {
      const uploadResult = await ImageService.uploadMultipleImages(newImages, name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      
      if (uploadResult.success && uploadResult.urls) {
        finalImagePaths.push(...uploadResult.urls);
      } else {
        return { 
          errors: { 
            newImages: uploadResult.errors || ['Failed to upload images'] 
          } 
        };
      }
    }

    // Clean up old images if updating
    if (id) {
      try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT images FROM products WHERE id = ?');
        const productInDb = stmt.get(id) as { images: string };
        
        if (productInDb && productInDb.images) {
          const oldImagePaths: string[] = JSON.parse(productInDb.images);
          const removedImages = oldImagePaths.filter(oldPath => !finalImagePaths.includes(oldPath));
          
          if (removedImages.length > 0) {
            await ImageService.deleteMultipleImages(removedImages);
          }
        }
      } catch (e) {
        console.error("Could not clean up old images:", e);
      }
    }

    const productData = {
      name,
      description,
      price,
      category,
      stock,
      tags: tags || '',
      images: finalImagePaths,
      isTrending
    };

    let result;
    if (id) {
      result = await updateProduct(id, productData);
    } else {
      result = await createProduct(productData);
    }

    if (!result.success) {
      return { errors: { form: [result.error || 'Failed to save product'] } };
    }

  } catch (error) {
      console.error('Product operation error:', error);
      return { errors: { form: ['An unexpected error occurred.'] } };
  }

  revalidatePath('/studio/products');
  revalidatePath('/products');
  revalidatePath('/');
  revalidatePath('/studio/homepage');
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }

  redirect('/studio/products');
}

export async function deleteProduct(productId: string) {
    try {
        // Get product images first
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT images FROM products WHERE id = ?');
        const product = stmt.get(productId) as { images: string };

        if (product && product.images) {
            try {
                const imagePaths: string[] = JSON.parse(product.images);
                await ImageService.deleteMultipleImages(imagePaths);
            } catch (e) {
                console.error("Could not delete product images:", e);
            }
        }
        
        const result = await deleteProductFromDb(productId);
        if (!result.success) {
            throw new Error(result.error || 'Failed to delete product');
        }

        revalidatePath('/studio/products');
        revalidatePath('/products');
        revalidatePath('/');
        
    } catch (error) {
        console.error('Failed to delete product:', error);
        throw new Error('Failed to delete product.');
    }
}

// --- Homepage Settings Actions ---

const heroSettingsSchema = z.object({
    headline: z.string().min(1, 'Headline is required'),
    subheadline: z.string().min(1, 'Subheadline is required'),
    videoUrl: z.string().optional(),
});

export async function updateHeroSettingsAction(prevState: any, formData: FormData) {
    const validatedFields = heroSettingsSchema.safeParse({
        headline: formData.get('headline'),
        subheadline: formData.get('subheadline'),
        videoUrl: formData.get('videoUrl'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const result = await updateHeroSettings(validatedFields.data);
    if (result.success) {
        revalidatePath('/');
        revalidatePath('/studio/homepage');
    }
    return {
        ...result,
        errors: result.success ? {} : { form: result.error }
    };
}

const megaDealSchema = z.object({
    buy: z.coerce.number().min(1),
    get: z.coerce.number().min(1),
    total: z.coerce.number().min(1),
    active: z.coerce.boolean(),
});

const megaDealsSchema = z.object({
    deals: z.array(megaDealSchema),
});

export async function updateMegaDealsAction(prevState: any, formData: FormData) {
    const deals = JSON.parse(formData.get('deals' as string) as string);
    const validatedFields = megaDealsSchema.safeParse({ deals });

     if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const result = await updateMegaDealsSettings(validatedFields.data.deals);
     if (result.success) {
        revalidatePath('/');
        revalidatePath('/studio/homepage');
    }
    return {
        ...result,
        errors: result.success ? {} : { form: result.error }
    };
}

export async function updateReelsAction(prevState: any, formData: FormData) {
    const reelsData = JSON.parse(formData.get('reels') as string);

    const result = await updateReelsSettings(reelsData);
    if (result.success) {
        revalidatePath('/');
        revalidatePath('/studio/homepage');
    }

    return {
        ...result,
        errors: result.success ? {} : { form: result.error }
    };
}

export async function updateTrendingProductsAction(prevState: any, formData: FormData) {
    try {
        const allProducts = await getAllProducts();
        const trendingProductIds = formData.getAll('trendingProductIds');

        const updates = allProducts.map(p => ({
            id: p.id,
            isTrending: trendingProductIds.includes(p.id)
        }));

        // Update trending status for all products
        for (const update of updates) {
            await updateProductTrendingStatus([update.id], update.isTrending);
        }
        
        revalidatePath('/');
        revalidatePath('/products');
        revalidatePath('/studio/homepage');

        return { success: true, errors: {} };
    } catch (error) {
        console.error('Failed to update trending products:', error);
        return { success: false, errors: { form: 'Failed to update trending products.' } };
    }
}

const lookupSchema = z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    email: z.string().email('A valid email is required'),
});

export async function findOrder(prevState: any, formData: FormData) {
    const validatedFields = lookupSchema.safeParse({
        orderId: formData.get('orderId'),
        email: formData.get('email'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    const { orderId, email } = validatedFields.data;

    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('SELECT id FROM orders WHERE id = ? AND customerEmail = ?');
        const order = stmt.get(orderId, email);

        if (order) {
            redirect(`/order-lookup/${orderId}?email=${email}`);
        } else {
            return {
                errors: { form: 'No matching order found. Please check your details and try again.' }
            };
        }
    } catch (error) {
        console.error('Order lookup failed:', error);
        return {
            errors: { form: 'An unexpected error occurred.' }
        };
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const db = await dbManager.getDb();
        const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
        stmt.run(status, orderId);

        revalidatePath(`/studio/orders`);
        revalidatePath(`/studio/orders/${orderId}`);
        revalidatePath(`/order-lookup/${orderId}`);
        
        return { success: true, message: `Order ${orderId} status updated to ${status}.` };
    } catch (error) {
        console.error('Failed to update order status:', error);
        return { success: false, error: 'Failed to update order status.' };
    }
}
