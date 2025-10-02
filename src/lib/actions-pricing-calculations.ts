'use server'

import { getActivePricingRules, getCouponByCode } from '@/lib/data-async';
import type { CartBundle, AppliedPricingRule, Coupon } from '@/lib/types';

export async function calculatePricingAction(bundles: CartBundle[], couponCode?: string) {
    try {
        // Calculate base totals first
        const baseTotals = bundles.reduce((acc, bundle) => {
            acc.subtotal += bundle.subtotal;
            acc.total += bundle.total;
            acc.totalDiscount += bundle.discount;
            acc.itemsCount += bundle.items.reduce((sum, item) => sum + item.quantity, 0);
            return acc;
        }, { subtotal: 0, total: 0, totalDiscount: 0, itemsCount: 0 });

        // Get active pricing rules
        const pricingRules = await getActivePricingRules();
        
        // Apply pricing rules
        const appliedRules: AppliedPricingRule[] = [];
        let ruleDiscount = 0;

        // Sort rules by sortOrder to apply them in the correct order
        const sortedRules = [...pricingRules].sort((a, b) => a.sortOrder - b.sortOrder);

        for (const rule of sortedRules) {
            // Check if rule is active and within date range
            const now = new Date();
            if (!rule.isActive) continue;
            if (rule.startDate && new Date(rule.startDate) > now) continue;
            if (rule.endDate && new Date(rule.endDate) < now) continue;

            // Check minimum order value
            if (rule.minOrderValue && baseTotals.total < rule.minOrderValue) continue;

            let discountAmount = 0;

            switch (rule.ruleType) {
                case 'percentage_discount':
                    if (rule.value) {
                        discountAmount = (baseTotals.total * rule.value) / 100;
                    }
                    break;
                case 'fixed_amount':
                    if (rule.value) {
                        discountAmount = Math.min(rule.value, baseTotals.total);
                    }
                    break;
                case 'buy_x_get_y':
                    // This is already handled in the bundle calculation
                    break;
                case 'free_shipping':
                    // Shipping discount would be applied at checkout
                    break;
            }

            if (discountAmount > 0) {
                appliedRules.push({
                    id: rule.id,
                    name: rule.name,
                    description: rule.description,
                    ruleType: rule.ruleType,
                    value: rule.value,
                    discountAmount
                });
                ruleDiscount += discountAmount;
            }
        }

        // Apply coupon if provided
        let coupon: Coupon | null = null;
        let couponDiscount = 0;

        if (couponCode) {
            try {
                coupon = await getCouponByCode(couponCode);
                if (coupon) {
                    // Check if coupon is active and within date range
                    const now = new Date();
                    if (coupon.isActive && 
                        (!coupon.startDate || new Date(coupon.startDate) <= now) && 
                        (!coupon.endDate || new Date(coupon.endDate) >= now) &&
                        (!coupon.minOrderValue || baseTotals.total >= coupon.minOrderValue) &&
                        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
                        
                        if (coupon.discountType === 'percentage') {
                            couponDiscount = (baseTotals.total * coupon.discountValue) / 100;
                        } else {
                            couponDiscount = Math.min(coupon.discountValue, baseTotals.total);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch coupon:', error);
            }
        }

        const finalTotal = Math.max(0, baseTotals.total - ruleDiscount - couponDiscount);

        return {
            success: true,
            data: {
                ...baseTotals,
                finalTotal,
                appliedRules,
                ruleDiscount,
                couponDiscount,
                coupon: coupon ? {
                    id: coupon.id,
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                    minOrderValue: coupon.minOrderValue,
                    usageLimit: coupon.usageLimit,
                    usedCount: coupon.usedCount,
                    startDate: coupon.startDate,
                    endDate: coupon.endDate,
                    isActive: coupon.isActive,
                    createdAt: coupon.createdAt
                } : null
            }
        };
    } catch (error) {
        console.error('Failed to calculate pricing:', error);
        return {
            success: false,
            error: 'Failed to calculate pricing'
        };
    }
}