-- SQL Schema para configurar o Banco de Dados do Supabase para Ammare Clinique
-- Copie e cole este script no painel do Supabase em "SQL Editor" -> "New Query" e clique em "Run".

-- 1. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seeding inicial de categorias (sem "Todos")
INSERT INTO categories (name) VALUES 
  ('Lipoaspiração e Abdominoplastia'),
  ('Mama'),
  ('Modelagem Localizada'),
  ('Facial'),
  ('Acessórios'),
  ('Cabelos'),
  ('Lipoaspiração')
ON CONFLICT (name) DO NOTHING;

-- 2. Tabela de Produtos (Itens individuais)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seeding inicial de produtos
INSERT INTO products (id, name, category) VALUES
  ('p1', 'Shampoo da Johnson', 'Cabelos'),
  ('p2', 'Maquiagem (Paleta)', 'Facial'),
  ('p3', 'Batom da Mary Kay', 'Facial'),
  ('p4', 'Tiara da Dior', 'Acessórios'),
  ('p5', 'Cinta Modeladora de Alta Compressão', 'Lipoaspiração'),
  ('p6', 'Espuma Protetora de Pele', 'Lipoaspiração')
ON CONFLICT (id) DO NOTHING;

-- 3. Tabela de Kits (Kits completos e itens individuais do catálogo)
CREATE TABLE IF NOT EXISTS kits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  items JSONB DEFAULT '[]'::jsonb, -- Array de objetos [{id: "...", name: "..."}]
  image_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::jsonb, -- Array de strings de URLs
  category TEXT NOT NULL,
  price NUMERIC,
  sizes JSONB DEFAULT '[]'::jsonb, -- Array de strings de tamanhos
  colors JSONB DEFAULT '[]'::jsonb, -- Array de strings de cores
  observations TEXT,
  is_active BOOLEAN DEFAULT true,
  is_individual BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seeding inicial de kits
INSERT INTO kits (id, name, short_description, full_description, items, image_url, gallery_urls, category, sizes, is_individual) VALUES
  (
    'kit-premium-1', 
    'Kit Pós Operatório Premium', 
    'O cuidado completo e sofisticado para uma recuperação impecável.', 
    'Desenvolvido para oferecer o máximo de conforto, segurança e resultados otimizados no seu pós-operatório. O Kit Premium da Ammare Clinique é a escolha ideal para quem busca uma recuperação com excelência e qualidade superior nos materiais.',
    '[{"id": "i1", "name": "Cinta Modeladora de Alta Compressão"}, {"id": "i2", "name": "Placa Abdominal Rígida"}, {"id": "i3", "name": "Espuma Protetora de Pele"}, {"id": "i4", "name": "Sutiã Cirúrgico Anatômico"}]'::jsonb,
    'https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&w=800&q=80',
    '["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1556228578-8d89b331f4fc?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'Lipoaspiração e Abdominoplastia',
    '["P", "M", "G", "GG"]'::jsonb,
    false
  ),
  (
    'kit-recovery-2', 
    'Kit Recovery Essencial', 
    'Os itens fundamentais para uma cicatrização segura e eficiente.', 
    'Pensado para recuperações mais direcionadas, o Kit Recovery Essencial traz o necessário para auxiliar na contenção do edema e na modelagem corporal nas primeiras semanas após o procedimento.',
    '[{"id": "i5", "name": "Faixa Compressiva Modeladora"}, {"id": "i6", "name": "Almofada para Drenagem Linfática"}, {"id": "i7", "name": "Espuma Lateral"}]'::jsonb,
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    '[]'::jsonb,
    'Modelagem Localizada',
    '["Único"]'::jsonb,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Desativar RLS (Row Level Security) nas tabelas
-- Isso permite leitura e escrita pública diretamente pelo cliente com a chave anon
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE kits DISABLE ROW LEVEL SECURITY;

