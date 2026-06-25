export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  currency: string;
  price: number;
  isOnSale: boolean;
  basePrice: number;
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  inStock: boolean;
  brand: { name: string; slug: string } | null;
  image: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
};

export type ProductDetail = ProductSummary & {
  sku: string;
  description: string | null;
  stockQuantity: number;
  categories: { name: string; slug: string }[];
  images: { url: string; altText: string | null }[];
  variants: {
    id: string;
    sku: string;
    price?: number;
    stockQuantity: number;
    imageUrl: string | null;
    attributes: { name: string; value: string; colorHex: string | null }[];
  }[];
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    createdAt: string;
    customer: { name: string };
  }[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
  children: { id: string; name: string; slug: string; imageUrl: string | null }[];
};

export type Brand = { id: string; name: string; slug: string; logoUrl: string | null };

export type CartItem = {
  id: string;
  quantity: number;
  product: { id: string; name: string; slug: string; image: string | null };
  variant: { id: string; sku: string; attributes: { name: string; value: string }[] } | null;
  unitPrice: number;
  lineTotal: number;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  currency: string;
};
