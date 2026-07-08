'use client';
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus, Minus, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/lib/firestore';
import { uploadProductImage } from '@/lib/storage';
import { saveProduct } from '@/lib/seller';
import type { Product, PricingTier } from '@/lib/types';

export function AddProductModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing?: Product | null }) {
  const { user, profile } = useAuth();
  const { categories } = useCategories();
  const isEdit = !!editing;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('grocery');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('Piece');
  const [moq, setMoq] = useState(1);
  const [retail, setRetail] = useState(100);
  const [stock, setStock] = useState(0);
  const [gstPercent, setGstPercent] = useState(18);
  const [dispatch, setDispatch] = useState('24 Hours');
  const [description, setDescription] = useState('');
  const [tiers, setTiers] = useState<PricingTier[]>([{ min: 1, max: null, price: 100 }]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name); setCategory(editing.category); setBrand(editing.brand || '');
      setSku(editing.sku || ''); setUnit(editing.unit); setMoq(editing.moq);
      setRetail(editing.retail); setStock(editing.stock); setGstPercent(editing.gstPercent || 0);
      setDispatch(editing.dispatch || '24 Hours'); setDescription(editing.specs?.Description || '');
      setTiers(editing.tiers?.length ? editing.tiers : [{ min: 1, max: null, price: editing.retail }]);
      setImages(editing.gallery?.length ? editing.gallery : (editing.image ? [editing.image] : []));
    } else {
      setName(''); setCategory('grocery'); setBrand(''); setSku(''); setUnit('Piece');
      setMoq(1); setRetail(100); setStock(0); setGstPercent(18); setDispatch('24 Hours');
      setDescription(''); setTiers([{ min: 1, max: null, price: 100 }]); setImages([]);
    }
  }, [open, editing]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    try {
      const tempId = editing?.id || ('p-' + Date.now());
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} > 5MB skipped`); continue; }
        const url = await uploadProductImage(tempId, f);
        urls.push(url);
      }
      setImages(prev => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (e: any) {
      console.error(e); toast.error(e?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const addTier = () => setTiers([...tiers, { min: (tiers[tiers.length - 1]?.max || 100) + 1, max: null, price: retail }]);
  const removeTier = (i: number) => setTiers(tiers.filter((_, idx) => idx !== i));
  const updateTier = (i: number, k: keyof PricingTier, v: any) => {
    const t = [...tiers]; (t[i] as any)[k] = v === '' ? null : (k === 'price' || k === 'min' || k === 'max' ? Number(v) : v); setTiers(t);
  };

  const submit = async () => {
    if (!user) return toast.error('Sign in first');
    if (!name.trim()) return toast.error('Product name required');
    if (images.length === 0) return toast.error('Upload at least 1 product image');
    if (retail <= 0) return toast.error('Retail price must be > 0');
    if (moq < 1) return toast.error('MOQ must be at least 1');

    setSaving(true);
    try {
      const p: Product = {
        id: editing?.id || '',
        category,
        name: name.trim(),
        brand: brand.trim() || 'Generic',
        sku: sku || ('SKU-' + Date.now().toString().slice(-6)),
        image: images[0],
        gallery: images,
        supplier: profile?.businessName || 'My Store',
        supplierId: user.uid,
        supplierLogo: (profile as any)?.supplierLogo || '🏪',
        verified: true,
        gstVerified: !!(profile as any)?.gstNumber,
        location: (profile as any)?.companyDetails?.city || 'India',
        years: 1,
        retail,
        moq,
        unit,
        stock,
        rating: editing?.rating || 4.5,
        reviews: editing?.reviews || 0,
        orders: editing?.orders || 0,
        dispatch,
        gstPercent,
        tiers: tiers.map(t => ({ min: Number(t.min), max: t.max === null || t.max === undefined ? null : Number(t.max), price: Number(t.price) })),
        specs: description ? { Description: description } : {},
        trending: editing?.trending || false,
        status: 'pending', // needs admin approval
      };
      await saveProduct(p);
      toast.success(isEdit ? 'Product updated' : 'Product submitted for approval');
      onClose();
    } catch (e: any) {
      console.error(e); toast.error(e?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-0">
        <div className="hero-gradient p-5 text-white sticky top-0 z-10">
          <DialogTitle className="text-xl font-bold text-white">{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <p className="text-white/80 text-xs mt-0.5">Products go for admin approval before appearing publicly.</p>
        </div>
        <div className="p-6 space-y-4">
          {/* Images */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-2">Product Images * (up to 5MB each)</label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button onClick={() => fileInput.current?.click()} disabled={uploading} className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50 grid place-items-center text-slate-400">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-teal-600" /> : <ImagePlus className="w-6 h-6" />}
              </button>
              <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => handleUpload(e.target.files)} />
            </div>
          </div>

          {/* Basic info */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Product Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Premium Basmati Rice (25kg Bag)" className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500">
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Brand</label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="GrainKing" className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">SKU / Product Code</label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Auto-generated if empty" className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Unit *</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-3">
                {['Piece', 'Pack', 'Bag', 'Box', 'Kg', 'Tin', 'Litre', 'Sack', 'Bundle', 'Roll'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Retail Price (₹) *</label>
              <Input type="number" value={retail} onChange={(e) => setRetail(Number(e.target.value) || 0)} className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">MOQ *</label>
              <Input type="number" value={moq} onChange={(e) => setMoq(Number(e.target.value) || 1)} className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Stock Available</label>
              <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value) || 0)} className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">GST %</label>
              <select value={gstPercent} onChange={(e) => setGstPercent(Number(e.target.value))} className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-3">
                {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Dispatch Time</label>
              <select value={dispatch} onChange={(e) => setDispatch(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-3">
                {['24 Hours', '48 Hours', '3-5 Days', '5-7 Days', '7-14 Days'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Product details, materials, use cases..." className="mt-1 rounded-xl" />
            </div>
          </div>

          {/* Pricing tiers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600">Bulk Pricing Tiers</label>
              <Button onClick={addTier} size="sm" variant="outline" className="h-7 rounded-full text-xs"><Plus className="w-3 h-3 mr-1" /> Add tier</Button>
            </div>
            <div className="space-y-2">
              {tiers.map((t, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                  <Input type="number" value={t.min} onChange={(e) => updateTier(i, 'min', e.target.value)} placeholder="Min qty" className="h-10 rounded-xl" />
                  <Input type="number" value={t.max ?? ''} onChange={(e) => updateTier(i, 'max', e.target.value)} placeholder="Max qty (blank = ∞)" className="h-10 rounded-xl" />
                  <Input type="number" value={t.price} onChange={(e) => updateTier(i, 'price', e.target.value)} placeholder="Price/unit" className="h-10 rounded-xl" />
                  <button onClick={() => removeTier(i)} disabled={tiers.length <= 1} className="w-9 h-9 rounded-lg hover:bg-rose-50 text-rose-500 grid place-items-center disabled:opacity-30"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {isEdit && <Badge className="bg-amber-100 text-amber-700">On save, product goes back to "pending" for re-approval</Badge>}

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1 rounded-full h-11">Cancel</Button>
            <Button onClick={submit} disabled={saving} className="flex-1 rounded-full h-11 bg-teal-700 hover:bg-teal-800 font-semibold">{saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Submit for Approval')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
