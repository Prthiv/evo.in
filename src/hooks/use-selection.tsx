
'use client'

import { createContext, useContext, useState, useMemo } from 'react';
import type { Product, BundleDeal, SelectedProduct } from '@/lib/types';
import { BUNDLE_DEALS, MIN_ORDER_QUANTITY } from '@/lib/constants';

interface SelectionContextType {
  selectedItems: SelectedProduct[];
  setSelectedItems: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  toggleSelection: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  isSelected: (productId: string) => boolean;
  clearSelection: () => void;
  removeItemFromSelection: (productId: string) => void;
  selectionCount: number;
  nextDeal: { buy: number; get: number, total: number } | null;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState<SelectedProduct[]>([]);

  const toggleSelection = (product: Product) => {
    setSelectedItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeItemFromSelection = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== productId));
  };

  const isSelected = (productId: string) => {
    return selectedItems.some(item => item.id === productId);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const selectionCount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  const nextDeal = useMemo(() => {
    const sortedDeals = [...BUNDLE_DEALS].sort((a,b) => a.buy - b.buy);
    if (selectionCount < MIN_ORDER_QUANTITY) {
        return {buy: MIN_ORDER_QUANTITY, get: 0, total: MIN_ORDER_QUANTITY}
    }
    for (const deal of sortedDeals) {
      if (selectionCount < deal.buy) {
        return deal;
      }
    }
    // If all deals are met, maybe show the biggest one or a special message
    return sortedDeals[sortedDeals.length - 1]; 
  }, [selectionCount]);
  

  return (
    <SelectionContext.Provider value={{ selectedItems, setSelectedItems, toggleSelection, updateQuantity, isSelected, clearSelection, removeItemFromSelection, selectionCount, nextDeal }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
