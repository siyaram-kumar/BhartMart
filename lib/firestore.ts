'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, where, orderBy, onSnapshot, doc, setDoc, deleteDoc,
  getDoc, getDocs, addDoc, serverTimestamp, updateDoc, limit,
} from 'firebase/firestore';
import type { Product, Category, Cart, CartItem, Order, Notification } from '@/lib/types';

// Live products (approved only for public)
export function useProducts(filter?: { category?: string; trending?: boolean; q?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const constraints: any[] = [where('status', '==', 'approved')];
    if (filter?.category) constraints.push(where('category', '==', filter.category));
    if (filter?.trending) constraints.push(where('trending', '==', true));
    const q = query(collection(db, 'products'), ...constraints);
    const unsub = onSnapshot(q, (snap) => {
      let list = snap.docs.map(d => ({ ...(d.data() as Product), id: d.id }));
      if (filter?.q) {
        const re = new RegExp(filter.q, 'i');
        list = list.filter(p => re.test(p.name) || re.test(p.brand) || re.test(p.supplier) || re.test(p.category));
      }
      setProducts(list);
      setLoading(false);
    }, (err) => { console.error('products listener', err); setLoading(false); });
    return () => unsub();
  }, [filter?.category, filter?.trending, filter?.q]);
  return { products, loading };
}

export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    (async () => {
      const ref = doc(db, 'products', productId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const p = { ...(snap.data() as Product), id: snap.id };
        setProduct(p);
        // fetch related
        const relQ = query(collection(db, 'products'), where('category', '==', p.category), where('status', '==', 'approved'), limit(6));
        const relSnap = await getDocs(relQ);
        setRelated(relSnap.docs.map(d => ({ ...(d.data() as Product), id: d.id })).filter(x => x.id !== p.id));
      }
      setLoading(false);
    })();
  }, [productId]);
  return { product, related, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categories'), async (snap) => {
      const cats = snap.docs.map(d => ({ ...(d.data() as Category), id: d.id }));
      // For each cat, count products
      for (const c of cats) {
        try {
          const cnt = await getDocs(query(collection(db, 'products'), where('category', '==', c.slug), where('status', '==', 'approved')));
          c.productCount = cnt.size;
        } catch {}
      }
      setCategories(cats);
    });
    return () => unsub();
  }, []);
  return { categories };
}

// Cart real-time
export function useCart(userId: string | null) {
  const [cart, setCart] = useState<Cart>({ userId: userId || '', items: [] });
  useEffect(() => {
    if (!userId) { setCart({ userId: '', items: [] }); return; }
    const unsub = onSnapshot(doc(db, 'carts', userId), (snap) => {
      if (snap.exists()) setCart(snap.data() as Cart);
      else setCart({ userId, items: [] });
    });
    return () => unsub();
  }, [userId]);
  return cart;
}

export async function setCartItem(userId: string, productId: string, qty: number, product: Product) {
  const ref = doc(db, 'carts', userId);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? (snap.data() as Cart).items : [];
  const idx = existing.findIndex(i => i.productId === productId);
  if (idx >= 0) existing[idx] = { productId, qty, product };
  else existing.push({ productId, qty, product });
  await setDoc(ref, { userId, items: existing, updatedAt: serverTimestamp() }, { merge: true });
}

export async function removeCartItem(userId: string, productId: string) {
  const ref = doc(db, 'carts', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const items = (snap.data() as Cart).items.filter(i => i.productId !== productId);
  await setDoc(ref, { userId, items, updatedAt: serverTimestamp() }, { merge: true });
}

export async function clearCart(userId: string) {
  await setDoc(doc(db, 'carts', userId), { userId, items: [], updatedAt: serverTimestamp() }, { merge: true });
}

// Orders
export async function createOrder(payload: Omit<Order, 'id' | 'createdAt' | 'expectedDelivery' | 'status' | 'timeline'>) {
  const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const order: Order = {
    ...payload,
    id: orderId,
    status: 'placed',
    timeline: [
      { step: 'placed', label: 'Order Placed', at: now.toISOString(), done: true },
      { step: 'verified', label: 'Order Verification', at: null, done: false },
      { step: 'packed', label: 'Supplier Processing', at: null, done: false },
      { step: 'shipped', label: 'Dispatched', at: null, done: false },
      { step: 'delivered', label: 'Delivered', at: null, done: false },
    ],
    createdAt: serverTimestamp(),
    expectedDelivery: new Date(now.getTime() + 6 * 24 * 3600 * 1000).toISOString(),
  };
  await setDoc(doc(db, 'orders', orderId), order);
  // notification
  await addDoc(collection(db, 'notifications'), {
    userId: payload.userId,
    title: 'Order Placed',
    message: `Your order ${orderId} has been placed successfully.`,
    type: 'order',
    read: false,
    createdAt: serverTimestamp(),
  });
  // clear cart
  await clearCart(payload.userId);
  return order;
}

export function useUserOrders(userId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    if (!userId) { setOrders([]); return; }
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...(d.data() as Order), id: d.id }));
      list.sort((a, b) => {
        const av = a.createdAt?.toMillis?.() || 0;
        const bv = b.createdAt?.toMillis?.() || 0;
        return bv - av;
      });
      setOrders(list);
    });
    return () => unsub();
  }, [userId]);
  return orders;
}

export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, 'orders', orderId), async (snap) => {
      if (!snap.exists()) return;
      const o = { ...(snap.data() as Order), id: snap.id };
      // Auto-advance timeline (demo, 1 min/step)
      const createdMs = o.createdAt?.toMillis?.() || Date.now();
      const ageMin = (Date.now() - createdMs) / 60000;
      const steps = ['placed', 'verified', 'packed', 'shipped', 'delivered'];
      const advanceIdx = Math.min(4, Math.floor(ageMin / 1));
      let changed = false;
      for (let i = 0; i <= advanceIdx; i++) {
        if (!o.timeline[i].done) { o.timeline[i].done = true; o.timeline[i].at = new Date().toISOString(); changed = true; }
      }
      o.status = steps[advanceIdx];
      if (changed) {
        try { await updateDoc(doc(db, 'orders', orderId), { timeline: o.timeline, status: o.status }); } catch {}
      }
      setOrder(o);
    });
    return () => unsub();
  }, [orderId]);
  return order;
}

// Notifications
export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    if (!userId) { setNotifications([]); return; }
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...(d.data() as Notification), id: d.id }));
      list.sort((a, b) => {
        const av = a.createdAt?.toMillis?.() || 0;
        const bv = b.createdAt?.toMillis?.() || 0;
        return bv - av;
      });
      // add promotional global notifs (client-side, not stored)
      const promos: Notification[] = [
        { id: 'promo-1', userId, title: '🎉 Festival Sale is LIVE!', message: 'Flat 15% off on Grocery bulk orders. Code: BHARAT15', type: 'promo', read: false, createdAt: { toMillis: () => Date.now() - 3600000 } as any },
        { id: 'promo-2', userId, title: '⚡ Flash Deal', message: 'Free shipping on Mobile accessories above ₹50,000', type: 'promo', read: false, createdAt: { toMillis: () => Date.now() - 7200000 } as any },
      ];
      setNotifications([...list, ...promos]);
    });
    return () => unsub();
  }, [userId]);
  return notifications;
}

export async function markNotificationRead(id: string) {
  try { await updateDoc(doc(db, 'notifications', id), { read: true }); } catch {}
}

export async function deleteNotification(id: string) {
  try { await deleteDoc(doc(db, 'notifications', id)); } catch {}
}
