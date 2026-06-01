import React, { createContext, useContext, useState, useEffect } from 'react';
import { Kit, Product } from './types';
import { initialKits, categories as initialCategories, initialProducts } from './data';

interface AppContextType {
  kits: Kit[];
  categories: string[];
  products: Product[];
  addKit: (kit: Kit) => void;
  updateKit: (id: string, kit: Kit) => void;
  removeKit: (id: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  removeProduct: (id: string) => void;
  customKitSelectedIds: string[];
  customKitImage: string | null;
  isGeneratingImage: boolean;
  addToCustomKit: (id: string) => void;
  removeFromCustomKit: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [kits, setKits] = useState<Kit[]>(() => {
    const saved = localStorage.getItem('ammare_kits');
    if (saved) {
      try {
        return JSON.parse(saved);
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
        return JSON.parse(saved);
      } catch (e) {
        return initialCategories;
      }
    }
    return initialCategories;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ammare_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const [customKitSelectedIds, setCustomKitSelectedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ammare_custom_kit');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [customKitImage, setCustomKitImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    localStorage.setItem('ammare_kits', JSON.stringify(kits));
  }, [kits]);

  useEffect(() => {
    localStorage.setItem('ammare_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('ammare_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ammare_custom_kit', JSON.stringify(customKitSelectedIds));
    
    if (customKitSelectedIds.length === 0) {
      setCustomKitImage(null);
      setIsGeneratingImage(false);
      return;
    }
    
    // Auto-generate AI image for custom kit when selection changes
    const timer = setTimeout(async () => {
      setIsGeneratingImage(true);
      try {
        const selectedNames = customKitSelectedIds
          .map(id => kits.find(k => k.id === id)?.name)
          .filter(Boolean);
          
        const prompt = `A highly professional studio photography image of a beautiful luxury gift box kit. Inside this elegant open box or arrangement, there is a set of premium cosmetics and products: ${selectedNames.join(', ')}. Emphasize that this is a single cohesive kit bundle. Minimal aesthetic, premium clinic vibe, soft shadows, 8k resolution.`;
        
        const response = await fetch('/api/generate-kit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        if (response.ok) {
          const data = await response.json();
          setCustomKitImage(data.imageUrl);
        }
      } catch (e) {
        console.error('Error generating image', e);
      } finally {
        setIsGeneratingImage(false);
      }
    }, 2500); // 2.5s debounce to avoid generating on every single click
    
    return () => clearTimeout(timer);
  }, [customKitSelectedIds, kits]);

  const addToCustomKit = (id: string) => {
    setCustomKitSelectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const removeFromCustomKit = (id: string) => {
    setCustomKitSelectedIds(prev => prev.filter(itemId => itemId !== id));
  };

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

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      kits, categories, products, 
      addKit, updateKit, removeKit, 
      addCategory, removeCategory,
      addProduct, updateProduct, removeProduct,
      customKitSelectedIds, customKitImage, isGeneratingImage,
      addToCustomKit, removeFromCustomKit
    }}>
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
