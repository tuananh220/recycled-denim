export interface ProductImage { id: string; url: string; alt?: string; position: number }
export interface Category { id: string; name: string; slug: string }
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  sizes: string[];
  colors: string[];
  recycledPercent: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  category: Category;
  images: ProductImage[];
  createdAt: string;
}
