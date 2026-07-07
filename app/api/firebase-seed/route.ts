// One-time seed API - writes 16 products + 3 categories to Firestore using client SDK
// (works while Firestore is in test mode). Idempotent.
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { SEED_PRODUCTS, SEED_CATEGORIES } from '@/lib/seedData';

export async function GET() { return handle(); }
export async function POST() { return handle(); }

async function handle() {
  try {
    // check if already seeded
    const existing = await getDocs(collection(db, 'products'));
    if (existing.size >= SEED_PRODUCTS.length) {
      return NextResponse.json({ ok: true, message: 'Already seeded', productCount: existing.size });
    }
    // seed categories
    for (const cat of SEED_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.slug), { ...cat, createdAt: serverTimestamp() }, { merge: true });
    }
    // seed products
    let count = 0;
    for (const p of SEED_PRODUCTS) {
      await setDoc(doc(db, 'products', p.id), { ...p, createdAt: serverTimestamp() }, { merge: true });
      count++;
    }
    return NextResponse.json({ ok: true, message: 'Seeded', products: count, categories: SEED_CATEGORIES.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
