export interface KitItem {
  id: string;
  name: string;
}

export interface Kit {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  items: KitItem[];
  imageUrl: string;
  galleryUrls: string[];
  category: string;
  price?: number;
  sizes?: string[];
  colors?: string[];
  observations?: string;
  isActive?: boolean;
  isIndividual?: boolean;
}
