

export type Category = 'EVO WALL POSTER & FRAMES' | 'CAR FRAMES AND WALL POSTERS' | 'ANIME FRAMES AND WALLPOSTERS' | 'SUPERHERO FRAMES AND POSTERS' | 'CUSTOM FRAMES';

export type FrameFinish = 'Black' | 'White' | 'Oak' | 'Walnut';
export type PosterSize = 'A4' | 'A3';
export type FrameSize = 'A4' | 'A3';

export interface FrameOption {
  size: FrameSize;
  finish: FrameFinish;
  price: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  hint: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  // This can represent the base price (e.g., for A4)
  price: number; 
  category: Category;
  images: ProductImage[];
  stock: number;
  tags: string[];
  isTrending?: boolean;
}

export interface SelectedProduct extends Product {
  quantity: number;
}

export interface CartItem {
  id: string; // Unique within a bundle, e.g. `bundleId-productId-index`
  product: Product; // Can be a standard product or a generated one for custom items
  quantity: number; // Dynamic quantity

  posterSize: PosterSize;
  frame?: FrameOption;
  isFree: boolean;
  price: number; // calculated price
}

export interface CustomCartItemInput {
    name: string;
    previewUrl: string;
    posterSize: PosterSize;
    isFramed: boolean;
    quantity: number;
}

export interface CartBundle {
    id: string; // e.g. `bundle-timestamp`
    name: string; // e.g. `Custom Bundle 1`
    items: CartItem[];
    subtotal: number;
    total: number;
    discount: number;
    appliedDeal: BundleDeal | null;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  items: CartBundle[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface BundleDeal {
  buy: number;
  get: number;
  total: number;
}

export interface ProductFromDB {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    category: Category;
    stock: number;
    tags: string; // Stored as a comma-separated string
    images: string; // Stored as a JSON array of strings (URLs)
    isTrending: 0 | 1;
    createdAt: string;
}

export interface OrderFromDB {
    id: string;
    customerEmail: string;
    shippingAddress: string;
    paymentMethod: string;
    items: string; // JSON of CartBundle[]
    total: number;
    status: OrderStatus;
    createdAt: string;
}


// --- Homepage Settings Types ---

export interface HeroSettings {
    headline: string;
    subheadline: string;
    videoUrl: string;
}

export interface MegaDealSettings {
    buy: number;
    get: number;
    total: number;
    active: boolean;
}
