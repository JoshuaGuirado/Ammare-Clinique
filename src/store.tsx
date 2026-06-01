import React, { createContext, useContext, useState, useEffect } from 'react';
import { Kit, Product } from './types';
import { initialKits, categories as initialCategories, initialProducts } from './data';
import { supabase, isSupabaseConfigured } from './supabaseClient';

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
  customKitTheme: string;
  setCustomKitTheme: (theme: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper mapping functions to transition between frontend CamelCase and DB snake_case
const mapKitToDB = (kit: Kit) => {
  return {
    id: kit.id,
    name: kit.name,
    short_description: kit.shortDescription,
    full_description: kit.fullDescription,
    items: kit.items,
    image_url: kit.imageUrl,
    gallery_urls: kit.galleryUrls || [],
    category: kit.category,
    price: kit.price || null,
    sizes: kit.sizes || [],
    colors: kit.colors || [],
    observations: kit.observations || null,
    is_active: kit.isActive !== false,
    is_individual: kit.isIndividual === true
  };
};

const mapDBToKit = (k: any): Kit => {
  return {
    id: k.id,
    name: k.name,
    shortDescription: k.short_description || '',
    fullDescription: k.full_description || '',
    items: Array.isArray(k.items) ? k.items : [],
    imageUrl: k.image_url || '',
    galleryUrls: Array.isArray(k.gallery_urls) ? k.gallery_urls : [],
    category: k.category,
    price: k.price ? Number(k.price) : undefined,
    sizes: Array.isArray(k.sizes) ? k.sizes : [],
    colors: Array.isArray(k.colors) ? k.colors : [],
    observations: k.observations || undefined,
    isActive: k.is_active !== false,
    isIndividual: k.is_individual === true
  };
};

const mapProductToDB = (p: Product) => {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    image_url: p.imageUrl || null
  };
};

const mapDBToProduct = (p: any): Product => {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    imageUrl: p.image_url || undefined
  };
};

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
  const [customKitTheme, setCustomKitTheme] = useState<string>('minimalist_white');

  // Background sync from Supabase when component mounts
  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured) return;

      try {
        // 1. Sync Categories
        const { data: dbCategories, error: catError } = await supabase
          .from('categories')
          .select('name');
        
        if (catError) throw catError;

        let finalCategories = categories;
        if (!dbCategories || dbCategories.length === 0) {
          // Seed DB using local categories state to preserve additions
          const seedCategories = categories.filter(cat => cat !== 'Todos').map(cat => ({ name: cat }));
          await supabase.from('categories').insert(seedCategories);
          finalCategories = categories;
        } else {
          finalCategories = ['Todos', ...dbCategories.map(c => c.name)];
          
          // Sync local-only categories to Supabase
          const dbCatNames = new Set(dbCategories.map(c => c.name));
          const localOnlyCats = categories.filter(c => c !== 'Todos' && !dbCatNames.has(c));
          if (localOnlyCats.length > 0) {
            await supabase.from('categories').insert(localOnlyCats.map(name => ({ name })));
            finalCategories = [...finalCategories, ...localOnlyCats];
          }
        }
        setCategories(finalCategories);

        // 2. Sync Products
        const { data: dbProducts, error: prodError } = await supabase
          .from('products')
          .select('*');

        if (prodError) throw prodError;

        let finalProducts = products;
        if (!dbProducts || dbProducts.length === 0) {
          // Seed DB using local products state to preserve custom ones
          const seedProducts = products.map(mapProductToDB);
          await supabase.from('products').insert(seedProducts);
          finalProducts = products;
        } else {
          finalProducts = dbProducts.map(mapDBToProduct);
          
          // Sync local-only products to Supabase
          const dbProdIds = new Set(dbProducts.map(p => p.id));
          const localOnlyProds = products.filter(p => !dbProdIds.has(p.id));
          if (localOnlyProds.length > 0) {
            await supabase.from('products').insert(localOnlyProds.map(mapProductToDB));
            finalProducts = [...finalProducts, ...localOnlyProds];
          }
        }
        setProducts(finalProducts);

        // 3. Sync Kits
        const { data: dbKits, error: kitsError } = await supabase
          .from('kits')
          .select('*');

        if (kitsError) throw kitsError;

        let finalKits = kits;
        if (!dbKits || dbKits.length === 0) {
          // Seed DB using local kits state to preserve all custom kits and products
          const seedKits = kits.map(mapKitToDB);
          await supabase.from('kits').insert(seedKits);
          finalKits = kits;
        } else {
          finalKits = dbKits.map(mapDBToKit);
          
          // CRITICAL SYNC: Upload any local-only kits/products to Supabase!
          const dbKitIds = new Set(dbKits.map(k => k.id));
          const localOnlyKits = kits.filter(k => !dbKitIds.has(k.id));
          
          if (localOnlyKits.length > 0) {
            const mappedLocalKits = localOnlyKits.map(mapKitToDB);
            await supabase.from('kits').insert(mappedLocalKits);
            finalKits = [...finalKits, ...localOnlyKits];
          }
        }
        setKits(finalKits);

      } catch (e) {
        console.error("Erro ao sincronizar com o Supabase. Utilizando cache do LocalStorage:", e);
      }
    }

    loadData();
  }, []);

  // Save changes locally as instant cache
  useEffect(() => {
    localStorage.setItem('ammare_kits', JSON.stringify(kits));
  }, [kits]);

  useEffect(() => {
    localStorage.setItem('ammare_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('ammare_products', JSON.stringify(products));
  }, [products]);

  // Sanitização Defensiva: Remove qualquer kit completo ou item que não seja produto individual da seleção
  useEffect(() => {
    if (kits.length > 0 && customKitSelectedIds.length > 0) {
      const sanitized = customKitSelectedIds.filter(id => {
        const item = kits.find(k => k.id === id);
        return item && item.isIndividual === true;
      });
      
      if (sanitized.length !== customKitSelectedIds.length) {
        setCustomKitSelectedIds(sanitized);
      }
    }
  }, [kits, customKitSelectedIds]);



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
        const selectedProducts = customKitSelectedIds
          .map(id => kits.find(k => k.id === id))
          .filter(Boolean)
          .filter(k => k.isIndividual === true);
          
        const selectedNames = selectedProducts.map(k => k.name);
        const selectedImages = selectedProducts.map(k => k.imageUrl).filter(Boolean);
          
        let themeDetails = '';
        if (customKitTheme === 'minimalist_white') {
          themeDetails = 'The background should be an ultra-minimalist, clean matte white surface with soft, diffused natural window light and subtle shadows.';
        } else if (customKitTheme === 'luxury_dark' || customKitTheme === 'black_gold') {
          themeDetails = 'The background should be a dramatic dark slate or black marble surface with sophisticated spotlight lighting, gold metallic highlights, and a luxury clinic vibe.';
        } else if (customKitTheme === 'botanical_rose' || customKitTheme === 'rose_gold_blossom') {
          themeDetails = 'The background should be a soft pink clay surface with delicate shadows of organic leaves and modern botanical elements in the scene.';
        } else {
          themeDetails = 'The products should be placed on warm sand or organic stone textures, under warm, soft sunlight with a serene wellness aesthetic.';
        }
          
        const prompt = `A highly professional studio product photography of the cosmetic items shown in the attached reference images: ${selectedNames.join(', ')}. Arrange these specific products beautifully side-by-side as a single cohesive set on a flat surface, not in a box. They must look visually identical to the products shown in the reference images (same shapes, same colors, same bottle/jar packaging, same style). Minimalist aesthetic, premium spa and clinic vibe, soft shadows, 8k resolution. ${themeDetails}`;
        
        const response = await fetch('/api/generate-kit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, images: selectedImages })
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
  }, [customKitSelectedIds, customKitTheme, kits]);

  const addToCustomKit = (id: string) => {
    const item = kits.find(k => k.id === id);
    if (item && item.isIndividual) {
      setCustomKitSelectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    }
  };

  const removeFromCustomKit = (id: string) => {
    setCustomKitSelectedIds(prev => prev.filter(itemId => itemId !== id));
  };

  const addKit = async (kit: Kit) => {
    setKits(prev => [...prev, kit]);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('kits').insert(mapKitToDB(kit));
      if (error) {
        console.error("Erro ao inserir kit no Supabase:", error);
      }
    }
  };

  const updateKit = async (id: string, updatedKit: Kit) => {
    setKits(prev => prev.map(k => k.id === id ? updatedKit : k));
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('kits').update(mapKitToDB(updatedKit)).eq('id', id);
      if (error) {
        console.error("Erro ao atualizar kit no Supabase:", error);
      }
    }
  };

  const removeKit = async (id: string) => {
    setKits(prev => prev.filter(k => k.id !== id));
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('kits').delete().eq('id', id);
      if (error) {
        console.error("Erro ao deletar kit no Supabase:", error);
      }
    }
  };

  const addCategory = async (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('categories').insert({ name: category });
        if (error) {
          console.error("Erro ao inserir categoria no Supabase:", error);
        }
      }
    }
  };

  const removeCategory = async (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('categories').delete().eq('name', category);
      if (error) {
        console.error("Erro ao deletar categoria no Supabase:", error);
      }
    }
  };

  const addProduct = async (product: Product) => {
    setProducts(prev => [...prev, product]);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').insert(mapProductToDB(product));
      if (error) {
        console.error("Erro ao inserir produto no Supabase:", error);
      }
    }
  };

  const updateProduct = async (id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').update(mapProductToDB(updatedProduct)).eq('id', id);
      if (error) {
        console.error("Erro ao atualizar produto no Supabase:", error);
      }
    }
  };

  const removeProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error("Erro ao deletar produto no Supabase:", error);
      }
    }
  };

  return (
    <AppContext.Provider value={{ 
      kits, categories, products, 
      addKit, updateKit, removeKit, 
      addCategory, removeCategory,
      addProduct, updateProduct, removeProduct,
      customKitSelectedIds, customKitImage, isGeneratingImage,
      addToCustomKit, removeFromCustomKit,
      customKitTheme, setCustomKitTheme
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

