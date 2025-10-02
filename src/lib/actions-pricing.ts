'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { dbManager } from './db-async'
import { 
  createPricingRule as createPricingRuleData,
  updatePricingRule as updatePricingRuleData,
  deletePricingRule as deletePricingRuleData,
  createCoupon as createCouponData,
  updateCoupon as updateCouponData,
  deleteCoupon as deleteCouponData
} from './data-async'

// Pricing rule actions
export async function createPricingRuleAction(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const ruleType = formData.get('ruleType') as string;
    const value = formData.get('value') ? parseFloat(formData.get('value') as string) : undefined;
    const targetType = formData.get('targetType') as string;
    const targetValue = formData.get('targetValue') as string;
    const minOrderValue = formData.get('minOrderValue') ? parseFloat(formData.get('minOrderValue') as string) : undefined;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const isActive = formData.get('isActive') === 'on';
    const sortOrder = formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : 0;

    try {
        const result = await createPricingRuleData({
            name,
            description: description || undefined,
            ruleType: ruleType as 'percentage_discount' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping',
            value,
            targetType: targetType as 'cart' | 'product' | 'category' | 'bundle',
            targetValue: targetValue ? targetValue.split(',').map(v => v.trim()) : undefined,
            minOrderValue,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            isActive,
            sortOrder
        });

        if (result.success) {
            revalidatePath('/studio/pricing');
            return { success: true, errors: {} };
        } else {
            return { success: false, errors: { form: result.error } };
        }
    } catch (error) {
        console.error('Failed to create pricing rule:', error);
        return { success: false, errors: { form: 'Failed to create pricing rule.' } };
    }
}

export async function updatePricingRuleAction(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const ruleType = formData.get('ruleType') as string;
    const value = formData.get('value') ? parseFloat(formData.get('value') as string) : undefined;
    const targetType = formData.get('targetType') as string;
    const targetValue = formData.get('targetValue') as string;
    const minOrderValue = formData.get('minOrderValue') ? parseFloat(formData.get('minOrderValue') as string) : undefined;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const isActive = formData.get('isActive') === 'on';
    const sortOrder = formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : 0;

    try {
        const result = await updatePricingRuleData(id, {
            name,
            description: description || undefined,
            ruleType: ruleType as 'percentage_discount' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping',
            value,
            targetType: targetType as 'cart' | 'product' | 'category' | 'bundle',
            targetValue: targetValue ? targetValue.split(',').map(v => v.trim()) : undefined,
            minOrderValue,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            isActive,
            sortOrder
        });

        if (result.success) {
            revalidatePath('/studio/pricing');
            return { success: true, errors: {} };
        } else {
            return { success: false, errors: { form: result.error } };
        }
    } catch (error) {
        console.error('Failed to update pricing rule:', error);
        return { success: false, errors: { form: 'Failed to update pricing rule.' } };
    }
}

export async function deletePricingRuleAction(id: string) {
    try {
        const result = await deletePricingRuleData(id);
        
        if (result.success) {
            revalidatePath('/studio/pricing');
            return { success: true };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Failed to delete pricing rule:', error);
        return { success: false, error: 'Failed to delete pricing rule.' };
    }
}

// Coupon actions
export async function createCouponAction(prevState: any, formData: FormData) {
    const code = formData.get('code') as string;
    const description = formData.get('description') as string;
    const discountType = formData.get('discountType') as string;
    const discountValue = parseFloat(formData.get('discountValue') as string);
    const minOrderValue = formData.get('minOrderValue') ? parseFloat(formData.get('minOrderValue') as string) : undefined;
    const usageLimit = formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string) : undefined;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const isActive = formData.get('isActive') === 'on';

    try {
        const result = await createCouponData({
            code,
            description: description || undefined,
            discountType: discountType as 'percentage' | 'fixed_amount',
            discountValue,
            minOrderValue,
            usageLimit,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            isActive
        });

        if (result.success) {
            revalidatePath('/studio/pricing');
            return { success: true, errors: {} };
        } else {
            return { success: false, errors: { form: result.error } };
        }
    } catch (error) {
        console.error('Failed to create coupon:', error);
        return { success: false, errors: { form: 'Failed to create coupon.' } };
    }
}

export async function updateCouponAction(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const code = formData.get('code') as string;
    const description = formData.get('description') as string;
    const discountType = formData.get('discountType') as string;
    const discountValue = parseFloat(formData.get('discountValue') as string);
    const minOrderValue = formData.get('minOrderValue') ? parseFloat(formData.get('minOrderValue') as string) : undefined;
    const usageLimit = formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string) : undefined;
    const usedCount = formData.get('usedCount') ? parseInt(formData.get('usedCount') as string) : 0;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const isActive = formData.get('isActive') === 'on';

    try {
        const result = await updateCouponData(id, {
            code,
            description: description || undefined,
            discountType: discountType as 'percentage' | 'fixed_amount',
            discountValue,
            minOrderValue,
            usageLimit,
            usedCount,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            isActive
        });

        if (result.success) {
            revalidatePath('/studio/pricing');
            return { success: true, errors: {} };
        } else {
            return { success: false, errors: { form: result.error } };
        }
    } catch (error) {
        console.error('Failed to update coupon:', error);
        return { success: false, errors: { form: 'Failed to update coupon.' } };
    }
}

export async function deleteCouponAction(id: string) {
    try {
        const result = await deleteCouponData(id);
        
        if (result.success) {
            revalidatePath('/studio/pricing');
            return { success: true };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Failed to delete coupon:', error);
        return { success: false, error: 'Failed to delete coupon.' };
    }
}