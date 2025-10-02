'use client';

import { useState, useEffect } from 'react';
import type { CartBundle, AppliedPricingRule, Coupon } from '@/lib/types';
import { calculatePricingAction } from '@/lib/actions-pricing-calculations';

interface PricingCalculationResult {
    subtotal: number;
    total: number;
    totalDiscount: number;
    itemsCount: number;
    finalTotal: number;
    appliedRules: AppliedPricingRule[];
    ruleDiscount: number;
    couponDiscount: number;
    coupon: Coupon | null;
}

const defaultPricingData: PricingCalculationResult = {
    subtotal: 0,
    total: 0,
    totalDiscount: 0,
    itemsCount: 0,
    finalTotal: 0,
    appliedRules: [],
    ruleDiscount: 0,
    couponDiscount: 0,
    coupon: null
};

export function usePricing(bundles: CartBundle[]) {
    const [pricingData, setPricingData] = useState<PricingCalculationResult>(defaultPricingData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculatePricing = async () => {
            try {
                const result = await calculatePricingAction(bundles);
                if (result.success && result.data) {
                    setPricingData(result.data);
                } else {
                    setPricingData(defaultPricingData);
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to calculate pricing:', error);
                setPricingData(defaultPricingData);
                setLoading(false);
            }
        };

        if (bundles.length > 0) {
            calculatePricing();
        } else {
            setPricingData(defaultPricingData);
            setLoading(false);
        }
    }, [bundles]);

    const calculatePricingWithCoupon = async (couponCode?: string) => {
        try {
            const result = await calculatePricingAction(bundles, couponCode);
            if (result.success && result.data) {
                setPricingData(result.data);
                return result.data;
            }
        } catch (error) {
            console.error('Failed to calculate pricing with coupon:', error);
        }
        return null;
    };

    return {
        ...pricingData,
        loading,
        calculatePricingWithCoupon
    };
}