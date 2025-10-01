
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { CartItem, Product, FrameOption, PosterSize, CartBundle, BundleDeal, CustomCartItemInput } from '@/lib/types';
import { BUNDLE_DEALS, MIN_ORDER_QUANTITY, POSTER_SIZES, FRAME_OPTIONS } from '@/lib/constants';

interface CartContextType {
  bundles: CartBundle[];
  addBundleToCart: (products: Product[], posterSize: PosterSize, frame?: FrameOption) => void;
  addCustomBundleToCart: (customItems: CustomCartItemInput[]) => void;
  updateBundle: (bundleId: string, items: Product[], posterSize: PosterSize, frame?: FrameOption) => void;
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
  let freeItemsCount = 0;

  if (items.length >= MIN_ORDER_QUANTITY) {
    for (const deal of sortedDeals) {
      if (items.length >= deal.buy) {
        freeItemsCount = deal.get;
        appliedDeal = deal;
        break;
      }
    }
  }
  
  const itemsWithStatus = items.map(item => ({ ...item, isFree: false }));

  if (freeItemsCount > 0) {
    const sortedItems = [...itemsWithStatus].sort((a, b) => a.price - b.price);
    for (let i = 0; i < freeItemsCount; i++) {
        if(sortedItems[i]) {
            const freeItem = itemsWithStatus.find(item => item.id === sortedItems[i].id);
            if (freeItem) {
                freeItem.isFree = true;
            }
        }
    }
  }
  
  const subtotal = itemsWithStatus.reduce((acc, item) => acc + item.price, 0);
  const total = itemsWithStatus.reduce((acc, item) => acc + (item.isFree ? 0 : item.price), 0);
  const discount = subtotal - total;

  return { items: itemsWithStatus, subtotal, total, discount, appliedDeal };
};


export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bundles, setBundles] = useState<CartBundle[]>([]);

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

  const addBundleToCart = (products: Product[], posterSize: PosterSize, frame?: FrameOption) => {
    setBundles(prevBundles => {
      const bundleId = `bundle-${Date.now()}`;
      const name = `Custom Bundle ${prevBundles.length + 1}`;
      
      let initialItems: CartItem[] = products.map((product, index) => {
        const item: Omit<CartItem, 'id' | 'price' | 'isFree'> = { product, quantity: 1, posterSize, frame };
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

            const item: Omit<CartItem, 'id' | 'price' | 'isFree'> = { product, quantity: 1, posterSize: customItem.posterSize, frame };
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


  const updateBundle = (bundleId: string, products: Product[], posterSize: PosterSize, frame?: FrameOption) => {
    setBundles(prevBundles => {
      return prevBundles.map(bundle => {
        if (bundle.id === bundleId) {
           let newItems: CartItem[] = products.map((product, index) => {
            const item: Omit<CartItem, 'id' | 'price'| 'isFree'> = { product, quantity: 1, posterSize, frame };
            return {
              ...item,
              id: `${bundleId}-item-${product.id}-${index}`,
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
  };

  const getBundleById = (bundleId: string) => {
    return bundles.find(b => b.id === bundleId);
  }

  const { subtotal, total, totalDiscount, itemsCount, appliedDeal } = useMemo(() => {
    const totals = bundles.reduce((acc, bundle) => {
        acc.subtotal += bundle.subtotal;
        acc.total += bundle.total;
        acc.totalDiscount += bundle.discount;
        acc.itemsCount += bundle.items.length;
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
  const isMinOrderMet = bundles.every(b => b.items.length >= MIN_ORDER_QUANTITY) || bundles.length === 0;

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
        appliedDeal
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
