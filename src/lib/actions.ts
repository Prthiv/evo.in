'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import fs from 'node:fs/promises'
import path from 'node:path'
import { updateHomepageSettings } from './settings'
import crypto from 'crypto';
import axios from 'axios';

const PHONEPE_HOST = process.env.PHONEPE_HOST || "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

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
      db.prepare(`
        INSERT INTO orders (id, customerEmail, shippingAddress, paymentMethod, items, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(orderId, email, shippingAddress, paymentMethod, cartItems, total);
    } catch (error) {
      console.error('Failed to save order:', error);
      return {
        errors: { form: ['There was an error saving your order. Please try again.'] }
      }
    }
    
    if (paymentMethod === 'upi') {
        redirect(`/checkout/upi/${orderId}`);
    } else if (paymentMethod === 'phonepe') {
        try {
            const merchantTransactionId = `MT-${orderId}`;
            const normalPayLoad = {
                merchantId: MERCHANT_ID,
                merchantTransactionId: merchantTransactionId,
                merchantUserId: `MUID-${orderId}`,
                amount: Math.round(total * 100), // amount in paise
                redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe-callback?orderId=${orderId}`,
                redirectMode: "REDIRECT",
                callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe-callback?orderId=${orderId}`,
                mobileNumber: "9999999999", // Placeholder, ideally from user data
                paymentInstrument: {
                    type: "PAY_PAGE",
                },
            };

            const payload = Buffer.from(JSON.stringify(normalPayLoad)).toString("base64");
            const checksum =
                crypto.createHash("sha256").update(payload + "/pg/v1/pay" + SALT_KEY).digest("hex") +
                "###" +
                SALT_INDEX;

            const response = await axios.post(
                `${PHONEPE_HOST}/pg/v1/pay`,
                { request: payload },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-VERIFY": checksum,
                    },
                }
            );
            
            if (response.data.success) {
                redirect(response.data.data.instrumentResponse.redirectInfo.url);
            } else {
                console.error("PhonePe API error:", response.data);
                return {
                    errors: { form: ['PhonePe payment initiation failed. Please try again.'] }
                };
            }
        } catch (phonepeError) {
            console.error('PhonePe integration error:', phonepeError);
            return {
                errors: { form: ['An error occurred during PhonePe payment. Please try again.'] }
            };
        }
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
  const newImages = (Array.isArray(validatedFields.data.newImages) ? validatedFields.data.newImages : (validatedFields.data.newImages ? [validatedFields.data.newImages] : [])).filter(f => f instanceof File && f.size > 0);
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const finalImagePaths: string[] = [...existingImages];

    for (const image of newImages) {
        if (image) {
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            await fs.mkdir(uploadsDir, { recursive: true });
            
            const fileExtension = path.extname(image.name);
            const newFileName = `${slug}-${Date.now()}${fileExtension}`;
            const filePath = path.join(uploadsDir, newFileName);
            
            await fs.writeFile(filePath, Buffer.from(await image.arrayBuffer()));
            finalImagePaths.push(`/uploads/${newFileName}`);
        }
    }
    
    if (id) {
        const productInDb = db.prepare('SELECT images FROM products WHERE id = ?').get(id) as { images: string };
        if (productInDb && productInDb.images) {
            try {
                const oldImagePaths: string[] = JSON.parse(productInDb.images);
                const removedImages = oldImagePaths.filter(oldPath => !finalImagePaths.includes(oldPath));
                for (const imagePath of removedImages) {
                     if (imagePath.startsWith('/uploads/')) {
                        const filePath = path.join(process.cwd(), 'public', imagePath);
                        await fs.unlink(filePath).catch(err => console.error(`Failed to delete old image file: ${filePath}`, err));
                    }
                }
            } catch (e) {
                console.error("Could not parse old images JSON:", productInDb.images);
            }
        }
    }


    if (id) {
        db.prepare(`
            UPDATE products
            SET name = ?, slug = ?, description = ?, price = ?, category = ?, stock = ?, tags = ?, images = ?, isTrending = ?
            WHERE id = ?
        `).run(name, slug, description, price, category, stock, tags || '', JSON.stringify(finalImagePaths), isTrending ? 1 : 0, id);
    } else {
        db.prepare(`
            INSERT INTO products (name, slug, description, price, category, stock, tags, images, isTrending)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(name, slug, description, price, category, stock, tags || '', JSON.stringify(finalImagePaths), isTrending ? 1 : 0);
    }
  } catch (error) {
      console.error('Database/File Error:', error);
      return { errors: { form: ['An unexpected error occurred.'] } };
  }

  revalidatePath('/studio/products');
  revalidatePath('/products');
  revalidatePath('/');
  revalidatePath('/studio/homepage');
  
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }

  redirect('/studio/products');
}

export async function deleteProduct(productId: string) {
    try {
        const productQuery = db.prepare('SELECT images FROM products WHERE id = ?');
        const product = productQuery.get(productId) as { images: string };

        if (product && product.images) {
            try {
                const imagePaths: string[] = JSON.parse(product.images);
                for (const imagePath of imagePaths) {
                    if (imagePath.startsWith('/uploads/')) {
                        const filePath = path.join(process.cwd(), 'public', imagePath);
                        await fs.unlink(filePath).catch(err => console.error(`Failed to delete image file: ${filePath}`, err));
                    }
                }
            } catch (e) {
                console.error("Could not parse images JSON for deletion:", product.images);
            }
        }
        
        db.prepare('DELETE FROM products WHERE id = ?').run(productId);

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
});
export async function updateHeroSettings(prevState: any, formData: FormData) {
    const validatedFields = heroSettingsSchema.safeParse({
        headline: formData.get('headline'),
        subheadline: formData.get('subheadline'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const result = await updateHomepageSettings('hero', validatedFields.data);
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
export async function updateMegaDeals(prevState: any, formData: FormData) {
    const deals = JSON.parse(formData.get('deals' as string) as string);
    const validatedFields = megaDealsSchema.safeParse({ deals });

     if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const result = await updateHomepageSettings('megaDeals', validatedFields.data.deals);
     if (result.success) {
        revalidatePath('/');
        revalidatePath('/studio/homepage');
    }
    return {
        ...result,
        errors: result.success ? {} : { form: result.error }
    };
}

export async function updateReels(prevState: any, formData: FormData) {
    const reelsData = JSON.parse(formData.get('reels') as string);

    const result = await updateHomepageSettings('reels', reelsData);
    if (result.success) {
        revalidatePath('/');
        revalidatePath('/studio/homepage');
    }

    return {
        ...result,
        errors: result.success ? {} : { form: result.error }
    };
}

export async function updateTrendingProducts(prevState: any, formData: FormData) {
    try {
        const allProductIds: { id: string }[] = db.prepare('SELECT id FROM products').all() as { id: string }[];
        const trendingProductIds = formData.getAll('trendingProductIds');

        const updates = allProductIds.map(p => ({
            id: p.id,
            isTrending: trendingProductIds.includes(p.id.toString()) ? 1 : 0
        }));

        const stmt = db.prepare('UPDATE products SET isTrending = @isTrending WHERE id = @id');
        
        db.transaction((updatesToRun: typeof updates) => {
            for (const update of updatesToRun) {
                stmt.run(update);
            }
        })(updates);
        
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
