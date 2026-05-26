import React, { createContext, useContext, useState, useEffect } from 'react';
import { Kit } from './types';
import { initialKits, categories as initialCategories } from './data';

interface AppContextType {
  kits: Kit[];
  categories: string[];
  addKit: (kit: Kit) => void;
  updateKit: (id: string, kit: Kit) => void;
  removeKit: (id: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [kits, setKits] = useState<Kit[]>(() => {
    const saved = localStorage.getItem('ammare_kits');
    if (saved) {
      try {
        const parsedKits = JSON.parse(saved) as Kit[];
        const uniqueKits = [];
        const seenIds = new Set();
        for (const kit of parsedKits) {
          if (!seenIds.has(kit.id)) {
            seenIds.add(kit.id);
            uniqueKits.push(kit);
          }
        }
        return uniqueKits.length > 0 ? uniqueKits : initialKits;
      } catch (e) {
        return initialKits;
      }
    }
    return initialKits;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('ammare_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : initialCategories;
      } catch (e) {
        return initialCategories;
      }
    }
    return initialCategories;
  });

  useEffect(() => {
    localStorage.setItem('ammare_kits', JSON.stringify(kits));
  }, [kits]);

  useEffect(() => {
    localStorage.setItem('ammare_categories', JSON.stringify(categories));
  }, [categories]);

  const addKit = (kit: Kit) => {
    setKits(prev => [...prev, kit]);
  };

  const updateKit = (id: string, updatedKit: Kit) => {
    setKits(prev => prev.map(k => k.id === id ? updatedKit : k));
  };

  const removeKit = (id: string) => {
    setKits(prev => prev.filter(k => k.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  return (
    <AppContext.Provider value={{ kits, categories, addKit, updateKit, removeKit, addCategory, removeCategory }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
