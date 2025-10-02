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
    // Add pricing rule information
    appliedPricingRules?: AppliedPricingRule[];
    couponCode?: string;
    couponDiscount?: number;
}

export interface AppliedPricingRule {
    id: string;
    name: string;
    description?: string;
    ruleType: 'percentage_discount' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
    value?: number;
    discountAmount: number;
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

// Add new interfaces for pricing rules and coupons
export interface PricingRule {
  id: string;
  name: string;
  description?: string;
  ruleType: 'percentage_discount' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  value?: number; // discount percentage or fixed amount
  targetType: 'cart' | 'product' | 'category' | 'bundle';
  targetValue?: string[]; // specific product IDs, category names, or bundle IDs
  minOrderValue?: number; // minimum order value for the rule to apply
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minOrderValue?: number; // minimum order value for coupon to apply
  usageLimit?: number; // maximum number of times this coupon can be used
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PricingRuleFromDB {
  id: number;
  name: string;
  description?: string;
  ruleType: 'percentage_discount' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  value?: number;
  targetType: 'cart' | 'product' | 'category' | 'bundle';
  targetValue?: string; // JSON string of target values
  minOrderValue?: number;
  startDate?: string;
  endDate?: string;
  isActive: 0 | 1;
  sortOrder: number;
  createdAt: string;
}

export interface CouponFromDB {
  id: number;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: 0 | 1;
  createdAt: string;
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

// Add new interfaces for categories and curated bundles
export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CuratedBundle {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productIds: string[]; // Array of product IDs
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CategoryFromDB {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isVisible: 0 | 1;
  sortOrder: number;
  createdAt: string;
}

export interface CuratedBundleFromDB {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productIds: string; // JSON string of product IDs
  imageUrl?: string;
  isActive: 0 | 1;
  sortOrder: number;
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