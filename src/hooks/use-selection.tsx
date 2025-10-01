
'use client'

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Product, BundleDeal } from '@/lib/types';
import { BUNDLE_DEALS, MIN_ORDER_QUANTITY } from '@/lib/constants';

interface SelectionContextType {
  selectedItems: Product[];
  setSelectedItems: React.Dispatch<React.SetStateAction<Product[]>>;
  toggleSelection: (product: Product) => void;
  isSelected: (productId: string) => boolean;
  clearSelection: () => void;
  selectionCount: number;
  nextDeal: { buy: number; get: number, total: number } | null;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);

  const toggleSelection = (product: Product) => {
    setSelectedItems(prev => {
      const isAlreadySelected = prev.some(item => item.id === product.id);
      if (isAlreadySelected) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isSelected = (productId: string) => {
    return selectedItems.some(item => item.id === productId);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const selectionCount = selectedItems.length;

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
    <SelectionContext.Provider value={{ selectedItems, setSelectedItems, toggleSelection, isSelected, clearSelection, selectionCount, nextDeal }}>
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
