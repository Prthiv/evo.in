'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { CartItem, Product, FrameOption, PosterSize, CartBundle, BundleDeal, CustomCartItemInput, SelectedProduct } from '@/lib/types';
import { BUNDLE_DEALS, MIN_ORDER_QUANTITY, POSTER_SIZES, FRAME_OPTIONS } from '@/lib/constants';
import { usePricing } from './use-pricing';

interface CartContextType {
  bundles: CartBundle[];
  addBundleToCart: (products: SelectedProduct[], posterSize: PosterSize, frame?: FrameOption) => void;
  addCustomBundleToCart: (customItems: CustomCartItemInput[]) => void;
  updateBundle: (bundleId: string, items: SelectedProduct[], posterSize: PosterSize, frame?: FrameOption) => void;
  removeBundle: (bundleId: string) => void;
  clearCart: () => void;
  getBundleById: (bundleId: string) => CartBundle | undefined;
  bundleCount: number;
  itemsCount: number;
  subtotal: number;
  total: number;
  totalDiscount: number;
  isMinOrderMet: boolean;
  appliedDeal: BundleDeal | null;
  // New pricing properties
  finalTotal: number;
  appliedRules: any[];
  ruleDiscount: number;
  couponDiscount: number;
  couponCode: string | null;
  setCouponCode: (code: string | null) => void;
  pricingLoading: boolean;
  calculatePricingWithCoupon: (code?: string) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getItemPrice = (item: Pick<CartItem, 'posterSize' | 'frame'>): number => {
    const posterPrice = POSTER_SIZES[item.posterSize]?.price || 0;
    const framePrice = item.frame?.price || 0;
    return posterPrice + framePrice;
}

const calculateBundle = (items: CartItem[]) => {
  const sortedDeals = [...BUNDLE_DEALS].sort((a, b) => b.buy - a.buy);
  let appliedDeal: BundleDeal | null = null;
  let totalItemsInBundle = items.reduce((acc, item) => acc + item.quantity, 0);
  let freeItemsCount = 0;

  if (totalItemsInBundle >= MIN_ORDER_QUANTITY) {
    for (const deal of sortedDeals) {
      if (totalItemsInBundle >= deal.buy) {
        freeItemsCount = deal.get;
        appliedDeal = deal;
        break;
      }
    }
  }
  
  const itemsWithStatus = items.map(item => ({ ...item, isFree: false }));

  if (freeItemsCount > 0) {
    // Create a flattened list of all individual items, considering their quantities
    const allIndividualItems = itemsWithStatus.flatMap(item => 
      Array(item.quantity).fill({ ...item, quantity: 1 })
    );
    
    const sortedIndividualItems = [...allIndividualItems].sort((a, b) => a.price - b.price);
    
    for (let i = 0; i < freeItemsCount; i++) {
        if(sortedIndividualItems[i]) {
            // Mark the original item as free if it corresponds to one of the cheapest individual items
            const originalItem = itemsWithStatus.find(item => item.id === sortedIndividualItems[i].id);
            if (originalItem) {
                originalItem.isFree = true;
            }
        }
    }
  }
  
  const subtotal = itemsWithStatus.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = itemsWithStatus.reduce((acc, item) => acc + (item.isFree ? 0 : (item.price * item.quantity)), 0);
  const discount = subtotal - total;

  return { items: itemsWithStatus, subtotal, total, discount, appliedDeal };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bundles, setBundles] = useState<CartBundle[]>([]);
  const [couponCode, setCouponCodeState] = useState<string | null>(null);
  const { 
    finalTotal, 
    appliedRules, 
    ruleDiscount, 
    couponDiscount, 
    coupon, 
    loading: pricingLoading,
    calculatePricingWithCoupon
  } = usePricing(bundles);

  useEffect(() => {
    const storedCart = localStorage.getItem('evo.in-cart-bundles');
    if (storedCart) {
      try {
        setBundles(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        setBundles([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('evo.in-cart-bundles', JSON.stringify(bundles));
  }, [bundles]);

  const setCouponCode = (code: string | null) => {
    setCouponCodeState(code);
    if (code) {
      calculatePricingWithCoupon(code);
    } else {
      calculatePricingWithCoupon();
    }
  };

  const addBundleToCart = (products: SelectedProduct[], posterSize: PosterSize, frame?: FrameOption) => {
    setBundles(prevBundles => {
      const bundleId = `bundle-${Date.now()}`;
      const name = `Custom Bundle ${prevBundles.length + 1}`;
      
      let initialItems: CartItem[] = products.map((selectedProduct, index) => {
        const item: Omit<CartItem, 'id' | 'price' | 'isFree'> = { product: selectedProduct, quantity: selectedProduct.quantity, posterSize, frame };
        return {
          ...item,
          id: `${bundleId}-item-${selectedProduct.id}-${index}`,
          price: getItemPrice(item),
          isFree: false,
        };
      });

      const { items, subtotal, total, discount, appliedDeal } = calculateBundle(initialItems);
      
      const newBundle: CartBundle = { id: bundleId, name, items, subtotal, total, discount, appliedDeal };
      return [...prevBundles, newBundle];
    });
  };

  const addCustomBundleToCart = (customItems: CustomCartItemInput[]) => {
    setBundles(prevBundles => {
        const bundleId = `bundle-custom-${Date.now()}`;
        const name = `Custom Designed Bundle`;

        let initialItems: CartItem[] = customItems.map((customItem, index) => {
            const frame = customItem.isFramed ? FRAME_OPTIONS.find(f => f.size === customItem.posterSize) : undefined;
            const product: Product = {
                id: `custom-${Date.now()}-${index}`,
                name: customItem.name,
                slug: `custom-${Date.now()}-${index}`,
                description: 'A custom user-designed poster.',
                price: POSTER_SIZES[customItem.posterSize].price,
                category: 'EVO WALL POSTER & FRAMES',
                images: [{ id: 'custom', url: customItem.previewUrl, alt: 'Custom Poster', hint: 'custom design' }],
                stock: 1,
                tags: ['custom'],
            };

            const item: Omit<CartItem, 'id' | 'price' | 'isFree'> = { product, quantity: customItem.quantity || 1, posterSize: customItem.posterSize, frame };
            return {
                ...item,
                id: `${bundleId}-item-${product.id}-${index}`,
                price: getItemPrice(item),
                isFree: false,
            };
        });

        const { items, subtotal, total, discount, appliedDeal } = calculateBundle(initialItems);
        
        const newBundle: CartBundle = { id: bundleId, name, items, subtotal, total, discount, appliedDeal };
        return [...prevBundles, newBundle];
    });
  };

  const updateBundle = (bundleId: string, products: SelectedProduct[], posterSize: PosterSize, frame?: FrameOption) => {
    setBundles(prevBundles => {
      return prevBundles.map(bundle => {
        if (bundle.id === bundleId) {
           let newItems: CartItem[] = products.map((selectedProduct, index) => {
            const item: Omit<CartItem, 'id' | 'price'| 'isFree'> = { product: selectedProduct, quantity: selectedProduct.quantity, posterSize, frame };
            return {
              ...item,
              id: `${bundleId}-item-${selectedProduct.id}-${index}`,
              price: getItemPrice(item),
              isFree: false,
            };
          });

          const { items, subtotal, total, discount, appliedDeal } = calculateBundle(newItems);
          return { ...bundle, items, subtotal, total, discount, appliedDeal };
        }
        return bundle;
      });
    });
  }

  const removeBundle = (bundleId: string) => {
    setBundles(prevBundles => prevBundles.filter(bundle => bundle.id !== bundleId));
  };

  const clearCart = () => {
    setBundles([]);
    setCouponCodeState(null);
  };

  const getBundleById = (bundleId: string) => {
    return bundles.find(b => b.id === bundleId);
  }

  // Calculate base totals for the cart
  const { subtotal, total, totalDiscount, itemsCount, appliedDeal } = useMemo(() => {
    const totals = bundles.reduce((acc, bundle) => {
        acc.subtotal += bundle.subtotal;
        acc.total += bundle.total;
        acc.totalDiscount += bundle.discount;
        acc.itemsCount += bundle.items.reduce((sum, item) => sum + item.quantity, 0);
        // For simplicity, we take the applied deal from the first bundle.
        // In a multi-bundle scenario, this might need more complex logic.
        if (!acc.appliedDeal && bundle.appliedDeal) {
          acc.appliedDeal = bundle.appliedDeal
        }
        return acc;
    }, { subtotal: 0, total: 0, totalDiscount: 0, itemsCount: 0, appliedDeal: null as BundleDeal | null });
    
    return totals;
  }, [bundles]);

  const bundleCount = bundles.length;
  const isMinOrderMet = itemsCount >= MIN_ORDER_QUANTITY;

  return (
    <CartContext.Provider value={{ 
        bundles, 
        addBundleToCart,
        addCustomBundleToCart,
        updateBundle, 
        removeBundle, 
        clearCart,
        getBundleById, 
        bundleCount, 
        itemsCount,
        subtotal, 
        total,
        totalDiscount, 
        isMinOrderMet,
        appliedDeal,
        // New pricing values
        finalTotal,
        appliedRules,
        ruleDiscount,
        couponDiscount,
        couponCode,
        setCouponCode,
        pricingLoading,
        calculatePricingWithCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};