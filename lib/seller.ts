'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, where, onSnapshot, doc, setDoc, deleteDoc, updateDoc,
  serverTimestamp, getDocs,
} from 'firebase/firestore';
import type { Product, Order } from '@/lib/types';

// All products owned by this seller (any status)
export function useSellerProducts(sellerId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!sellerId) { setProducts([]); setLoading(false); return; }
    const q = query(collection(db, 'products'), where('supplierId', '==', sellerId));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...(d.data() as Product), id: d.id }));
      list.sort((a, b) => {
        const av = (a as any).createdAt?.toMillis?.() || 0;
        const bv = (b as any).createdAt?.toMillis?.() || 0;
        return bv - av;
      });
      setProducts(list);
      setLoading(false);
    }, (err) => { console.error('seller products', err); setLoading(false); });
    return () => unsub();
  }, [sellerId]);
  return { products, loading };
}

// Orders that contain at least one product from this seller
export function useSellerOrders(sellerProductIds: string[]) {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    if (sellerProductIds.length === 0) { setOrders([]); return; }
    // Firestore doesn't allow array-contains on nested, so we fetch all recent orders and filter client-side.
    // For MVP scale this is fine; later we’ll add a per-order sellerIds[] denormalized field.
    const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
      const list = snap.docs.map(d => ({ ...(d.data() as Order), id: d.id }));
      const filtered = list.filter(o => o.items?.some((it: any) => sellerProductIds.includes(it.productId)));
      filtered.sort((a, b) => {
        const av = (a as any).createdAt?.toMillis?.() || 0;
        const bv = (b as any).createdAt?.toMillis?.() || 0;
        return bv - av;
      });
      setOrders(filtered);
    });
    return () => unsub();
  }, [sellerProductIds.join(',')]);
  return orders;
}

export async function saveProduct(p: Product) {
  const id = p.id || ('p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6));
  const payload = { ...p, id, updatedAt: serverTimestamp(), createdAt: (p as any).createdAt || serverTimestamp() };
  await setDoc(doc(db, 'products', id), payload, { merge: true });
  return id;
}

export async function updateProductStock(productId: string, stock: number) {
  await updateDoc(doc(db, 'products', productId), { stock, updatedAt: serverTimestamp() });
}

export async function updateProductStatus(productId: string, status: 'pending' | 'approved' | 'rejected') {
  await updateDoc(doc(db, 'products', productId), { status, updatedAt: serverTimestamp() });
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, 'products', productId));
}

// Upgrade current user to seller role + save business info
export async function upgradeToSeller(uid: string, business: {
  businessName: string; gstNumber?: string; city?: string; state?: string; pincode?: string; supplierLogo?: string;
}) {
  await setDoc(doc(db, 'users', uid), {
    role: 'seller',
    businessName: business.businessName,
    gstNumber: business.gstNumber || '',
    companyDetails: { city: business.city || '', state: business.state || '', pincode: business.pincode || '' },
    supplierLogo: business.supplierLogo || '🏪',
    upgradedAt: serverTimestamp(),
  }, { merge: true });
}
