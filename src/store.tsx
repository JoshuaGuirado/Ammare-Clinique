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
  generateCustomKitImage: () => Promise<void>;
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
    id: k.id || '',
    name: k.name || '',
    shortDescription: k.short_description || '',
    fullDescription: k.full_description || '',
    items: Array.isArray(k.items) ? k.items : [],
    imageUrl: k.image_url || '',
    galleryUrls: Array.isArray(k.gallery_urls) ? k.gallery_urls : [],
    category: k.category || 'Outros',
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
    id: p.id || '',
    name: p.name || '',
    category: p.category || 'Outros',
    imageUrl: p.image_url || undefined
  };
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [kits, setKits] = useState<Kit[]>(() => {
    const saved = localStorage.getItem('ammare_kits');
    let loadedKits = initialKits;
    if (saved) {
      try {
        loadedKits = JSON.parse(saved);
      } catch (e) {
        loadedKits = initialKits;
      }
    }
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const customParam = searchParams.get('c');
      if (customParam) {
        const decoded = JSON.parse(decodeURIComponent(atob(customParam)));
        if (Array.isArray(decoded)) {
          const decodedKits = decoded.map(mapDBToKit);
          const existingIds = new Set(loadedKits.map(k => k.id));
          for (const kit of decodedKits) {
            if (!existingIds.has(kit.id)) {
              loadedKits.push(kit);
            }
          }
        }
      }
    } catch (e) {
      console.error("Erro ao decodificar kits da URL na inicialização:", e);
    }
    return loadedKits;
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
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const itemsParam = searchParams.get('items');
      if (itemsParam) {
        return itemsParam.split('_');
      }
    } catch (e) {
      console.error("Erro ao ler items da URL:", e);
    }
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
        const { data: dbCategories, error: catError } = await supabase.from('categories').select('name');
        if (catError) throw catError;

        let finalCategories = categories;
        if (!dbCategories || dbCategories.length === 0) {
          const seedCategories = categories.filter(cat => cat !== 'Todos').map(cat => ({ name: cat }));
          await supabase.from('categories').insert(seedCategories);
          finalCategories = categories;
        } else {
          finalCategories = ['Todos', ...dbCategories.map(c => c.name)];
        }
        setCategories(finalCategories);

        const { data: dbProducts, error: prodError } = await supabase.from('products').select('*');
        if (prodError) throw prodError;

        let finalProducts = products;
        if (!dbProducts || dbProducts.length === 0) {
          const seedProducts = products.map(mapProductToDB);
          await supabase.from('products').insert(seedProducts);
          finalProducts = products;
        } else {
          finalProducts = dbProducts.map(mapDBToProduct);
        }
        setProducts(finalProducts);

        const { data: dbKits, error: kitsError } = await supabase.from('kits').select('*');
        if (kitsError) throw kitsError;

        let finalKits = kits;
        if (!dbKits || dbKits.length === 0) {
          const seedKits = kits.map(mapKitToDB);
          await supabase.from('kits').insert(seedKits);
          finalKits = kits;
        } else {
          finalKits = dbKits.map(mapDBToKit);
        }
        
        try {
          const searchParams = new URLSearchParams(window.location.search);
          const customParam = searchParams.get('c');
          if (customParam) {
            const decoded = JSON.parse(decodeURIComponent(atob(customParam)));
            if (Array.isArray(decoded)) {
              const decodedKits = decoded.map(mapDBToKit);
              const existingIds = new Set(finalKits.map(k => k.id));
              for (const kit of decodedKits) {
                if (!existingIds.has(kit.id)) {
                  finalKits.push(kit);
                }
              }
            }
          }
        } catch (e) {
          console.error("Erro ao decodificar kits da URL no loadData:", e);
        }
        setKits(finalKits);

      } catch (e) {
        console.error("Erro ao sincronizar com o Supabase. Utilizando cache do LocalStorage:", e);
      }
    }

    loadData();
  }, []);

  // ESSA É A PARTE QUE CORRIGE O ERRO DA TELA BRANCA
  useEffect(() => {
    try {
      localStorage.setItem('ammare_kits', JSON.stringify(kits));
    } catch (e) {
      console.warn('Limite de armazenamento excedido para kits, ignorando erro.');
    }
  }, [kits]);

  useEffect(() => {
    try {
      localStorage.setItem('ammare_categories', JSON.stringify(categories));
    } catch (e) {
      console.warn('Limite de armazenamento excedido para categorias, ignorando erro.');
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('ammare_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Limite de armazenamento excedido para produtos, ignorando erro.');
    }
  }, [products]);

  useEffect(() => {
    if (kits.length > 0 && customKitSelectedIds.length > 0) {
      const sanitized = customKitSelectedIds.filter(id => {
        return kits.some(k => k.id === id);
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
    }
  }, [customKitSelectedIds]);

  const generateCustomKitImage = async () => {
    if (customKitSelectedIds.length === 0) return;
    setIsGeneratingImage(true);
    try {
      const selectedProducts = customKitSelectedIds.map(id => kits.find(k => k.id === id)).filter(Boolean);
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
  };

  const addToCustomKit = (id: string) => {
    const item = kits.find(k => k.id === id);
    if (item) {
      setCustomKitSelectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    }
  };

  const removeFromCustomKit = (id: string) => {
    setCustomKitSelectedIds(prev => prev.filter(itemId => itemId !== id));
  };

  const addKit = async (kit: Kit) => {
    setKits(prev => [...prev, kit]);
    if (isSupabaseConfigured) {
      await supabase.from('kits').insert(mapKitToDB(kit));
    }
  };

  const updateKit = async (id: string, updatedKit: Kit) => {
    setKits(prev => prev.map(k => k.id === id ? updatedKit : k));
    if (isSupabaseConfigured) {
      await supabase.from('kits').update(mapKitToDB(updatedKit)).eq('id', id);
    }
  };

  const removeKit = async (id: string) => {
    setKits(prev => prev.filter(k => k.id !== id));
    if (isSupabaseConfigured) {
      await supabase.from('kits').delete().eq('id', id);
    }
  };

  const addCategory = async (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
      if (isSupabaseConfigured) {
        await supabase.from('categories').insert({ name: category });
      }
    }
  };

  const removeCategory = async (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
    if (isSupabaseConfigured) {
      await supabase.from('categories').delete().eq('name', category);
    }
  };

  const addProduct = async (product: Product) => {
    setProducts(prev => [...prev, product]);
    if (isSupabaseConfigured) {
      await supabase.from('products').insert(mapProductToDB(product));
    }
  };

  const updateProduct = async (id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    if (isSupabaseConfigured) {
      await supabase.from('products').update(mapProductToDB(updatedProduct)).eq('id', id);
    }
  };

  const removeProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (isSupabaseConfigured) {
      await supabase.from('products').delete().eq('id', id);
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
      customKitTheme, setCustomKitTheme,
      generateCustomKitImage
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
