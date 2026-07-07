// Core domain types
export type UserRole = 'buyer' | 'seller' | 'admin' | 'superadmin';

export interface AppUser {
  uid: string;
  email?: string | null;
  phone?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role: UserRole;
  businessName?: string;
  gstNumber?: string;
  companyDetails?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt?: any;
  lastLogin?: any;
}

export interface PricingTier { min: number; max: number | null; price: number; }

export interface Product {
  id: string;
  category: string;
  name: string;
  brand: string;
  sku: string;
  image: string;
  gallery: string[];
  supplier: string;
  supplierId: string;
  supplierLogo?: string;
  verified: boolean;
  gstVerified: boolean;
  location: string;
  years: number;
  retail: number;
  moq: number;
  unit: string;
  stock: number;
  rating: number;
  reviews: number;
  orders: number;
  dispatch: string;
  gstPercent: number;
  tiers: PricingTier[];
  specs: Record<string, string>;
  trending?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  productCount?: number;
}

export interface CartItem { productId: string; qty: number; product: Product; }
export interface Cart { userId: string; items: CartItem[]; updatedAt?: any; }

export interface OrderItem {
  productId: string; name: string; image: string; supplier: string;
  qty: number; unit: number; subtotal: number; gst: number; gstPercent: number;
}
export interface Address {
  name: string; mobile: string; pincode: string; address: string;
  city: string; state: string; landmark?: string; type: string;
}
export interface OrderTimelineStep { step: string; label: string; at: string | null; done: boolean; }
export interface Order {
  id: string; userId: string;
  items: OrderItem[]; address: Address; payment: string;
  subtotal: number; gst: number; shipping: number; total: number;
  status: string; timeline: OrderTimelineStep[];
  createdAt: any; expectedDelivery: string;
}

export interface Notification {
  id: string; userId: string;
  title: string; message: string;
  type: 'order' | 'promo' | 'system';
  read: boolean; createdAt: any;
}
