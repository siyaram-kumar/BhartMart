import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'bharatmart';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(DB_NAME);
}

const CATEGORIES = [
  { id: 'grocery', slug: 'grocery', name: 'Grocery & FMCG', icon: '🛒', color: 'from-amber-400 to-orange-500', tagline: 'Kirana wholesale' },
  { id: 'apparel', slug: 'apparel', name: 'Apparel & Fashion', icon: '👕', color: 'from-pink-400 to-rose-500', tagline: 'Bulk clothing' },
  { id: 'mobile', slug: 'mobile', name: 'Mobile & Electronics', icon: '📱', color: 'from-sky-400 to-indigo-500', tagline: 'Accessories bulk' },
];

const SEED_PRODUCTS = [
  // Grocery
  { id: 'p-rice-01', category: 'grocery', name: 'Premium Basmati Rice (25kg Bag)', brand: 'GrainKing', sku: 'GK-BASM-25', image: 'https://images.unsplash.com/photo-1709236550338-e2bcc3beee70', gallery: ['https://images.unsplash.com/photo-1709236550338-e2bcc3beee70','https://images.unsplash.com/photo-1457414104202-9d4b4908f285','https://images.unsplash.com/photo-1719532520316-4cc0d8886ab7'], supplier: 'Delhi Grains Traders', supplierId: 'sup-01', supplierLogo: '🌾', verified: true, gstVerified: true, location: 'Delhi', years: 12, retail: 2200, moq: 5, unit: 'Bag', stock: 5000, rating: 4.8, reviews: 892, orders: 12000, dispatch: '24 Hours', gstPercent: 5, tiers: [{min:1,max:4,price:2200},{min:5,max:99,price:1850},{min:100,max:499,price:1665},{min:500,max:null,price:1572}], specs: {Weight:'25 Kg', Packaging:'Jute Bag', ShelfLife:'12 Months', Origin:'India'}, trending: true },
  { id: 'p-oil-01', category: 'grocery', name: 'Sunflower Refined Oil (15L Tin)', brand: 'FreshPure', sku: 'FP-SUN-15', image: 'https://images.unsplash.com/photo-1515706886582-54c73c5eaf41', gallery: ['https://images.unsplash.com/photo-1515706886582-54c73c5eaf41'], supplier: 'Mumbai Foods Ltd', supplierId: 'sup-02', supplierLogo: '🌻', verified: true, gstVerified: true, location: 'Mumbai', years: 18, retail: 1850, moq: 10, unit: 'Tin', stock: 2400, rating: 4.7, reviews: 540, orders: 8300, dispatch: '48 Hours', gstPercent: 5, tiers: [{min:1,max:9,price:1850},{min:10,max:49,price:1720},{min:50,max:199,price:1620},{min:200,max:null,price:1540}], specs: {Volume:'15 Litre', Packaging:'Tin', ShelfLife:'9 Months'}, trending: true },
  { id: 'p-spice-01', category: 'grocery', name: 'Assorted Masala Pack (12 Spices)', brand: 'SpiceRoot', sku: 'SR-MSL-12', image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488', gallery: ['https://images.unsplash.com/photo-1506368249639-73a05d6f6488','https://images.unsplash.com/photo-1716816211590-c15a328a5ff0'], supplier: 'Kerala Spice Co', supplierId: 'sup-03', supplierLogo: '🌶', verified: true, gstVerified: true, location: 'Kochi', years: 22, retail: 450, moq: 50, unit: 'Pack', stock: 15000, rating: 4.9, reviews: 1240, orders: 24000, dispatch: '24 Hours', gstPercent: 12, tiers: [{min:1,max:49,price:450},{min:50,max:199,price:380},{min:200,max:999,price:335},{min:1000,max:null,price:295}], specs: {Weight:'2 Kg (12x160g)', Packaging:'Sealed Pouches'}, trending: true },
  { id: 'p-sugar-01', category: 'grocery', name: 'White Refined Sugar (50kg Sack)', brand: 'SweetGrain', sku: 'SG-WHT-50', image: 'https://images.unsplash.com/photo-1457414104202-9d4b4908f285', gallery: ['https://images.unsplash.com/photo-1457414104202-9d4b4908f285'], supplier: 'UP Sugar Mills', supplierId: 'sup-04', supplierLogo: '🍬', verified: true, gstVerified: true, location: 'Kanpur', years: 30, retail: 2650, moq: 10, unit: 'Sack', stock: 3800, rating: 4.6, reviews: 320, orders: 5400, dispatch: '48 Hours', gstPercent: 5, tiers: [{min:1,max:9,price:2650},{min:10,max:49,price:2450},{min:50,max:null,price:2280}], specs: {Weight:'50 Kg', Packaging:'PP Sack'} },
  { id: 'p-pulses-01', category: 'grocery', name: 'Toor Dal Unpolished (30kg)', brand: 'FarmRaw', sku: 'FR-TOOR-30', image: 'https://images.unsplash.com/photo-1719532520316-4cc0d8886ab7', gallery: ['https://images.unsplash.com/photo-1719532520316-4cc0d8886ab7'], supplier: 'Maharashtra Agro', supplierId: 'sup-05', supplierLogo: '🌱', verified: true, gstVerified: true, location: 'Pune', years: 14, retail: 3800, moq: 5, unit: 'Bag', stock: 1800, rating: 4.7, reviews: 260, orders: 4100, dispatch: '24 Hours', gstPercent: 0, tiers: [{min:1,max:4,price:3800},{min:5,max:49,price:3450},{min:50,max:null,price:3180}], specs: {Weight:'30 Kg', Type:'Unpolished'} },
  { id: 'p-tea-01', category: 'grocery', name: 'Assam CTC Tea Bulk (10kg)', brand: 'AssamGold', sku: 'AG-CTC-10', image: 'https://images.pexels.com/photos/32281630/pexels-photo-32281630.jpeg', gallery: ['https://images.pexels.com/photos/32281630/pexels-photo-32281630.jpeg'], supplier: 'Assam Tea Estate', supplierId: 'sup-06', supplierLogo: '🍵', verified: true, gstVerified: true, location: 'Guwahati', years: 40, retail: 2400, moq: 5, unit: 'Bag', stock: 2100, rating: 4.9, reviews: 680, orders: 9200, dispatch: '48 Hours', gstPercent: 5, tiers: [{min:1,max:4,price:2400},{min:5,max:49,price:2180},{min:50,max:null,price:1980}], specs: {Weight:'10 Kg', Grade:'BOP'}, trending: true },

  // Apparel
  { id: 'p-tshirt-01', category: 'apparel', name: 'Pure Cotton Blank T-Shirts (Pack of 100)', brand: 'CottonMill', sku: 'CM-TSH-100', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f', gallery: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f','https://images.unsplash.com/photo-1555529771-835f59fc5efe'], supplier: 'Tirupur Textiles', supplierId: 'sup-11', supplierLogo: '👕', verified: true, gstVerified: true, location: 'Tirupur', years: 15, retail: 15000, moq: 1, unit: 'Pack', stock: 500, rating: 4.8, reviews: 1200, orders: 3400, dispatch: '3-5 Days', gstPercent: 5, tiers: [{min:1,max:99,price:12500},{min:100,max:499,price:11250},{min:500,max:null,price:10625}], specs: {Fabric:'100% Cotton', GSM:'180', Sizes:'S,M,L,XL,XXL', Colors:'Multi'}, trending: true },
  { id: 'p-shirt-01', category: 'apparel', name: 'Formal Cotton Shirts (Bulk 50pc)', brand: 'CottonMill', sku: 'CM-FSH-50', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f', gallery: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f'], supplier: 'Tirupur Textiles', supplierId: 'sup-11', supplierLogo: '👔', verified: true, gstVerified: true, location: 'Tirupur', years: 15, retail: 22500, moq: 1, unit: 'Pack', stock: 320, rating: 4.7, reviews: 480, orders: 1600, dispatch: '3-5 Days', gstPercent: 5, tiers: [{min:1,max:49,price:19500},{min:50,max:199,price:17800},{min:200,max:null,price:16500}], specs: {Fabric:'Cotton Poplin', Sizes:'M,L,XL,XXL', Colors:'White, Blue, Grey'} },
  { id: 'p-saree-01', category: 'apparel', name: 'Handloom Cotton Sarees (Pack 20)', brand: 'WeaveKart', sku: 'WK-SR-20', image: 'https://images.unsplash.com/photo-1631856956423-2b95dae0ba74', gallery: ['https://images.unsplash.com/photo-1631856956423-2b95dae0ba74','https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5'], supplier: 'Surat Weavers Hub', supplierId: 'sup-12', supplierLogo: '🥻', verified: true, gstVerified: true, location: 'Surat', years: 25, retail: 28000, moq: 1, unit: 'Pack', stock: 180, rating: 4.9, reviews: 340, orders: 2100, dispatch: '5-7 Days', gstPercent: 5, tiers: [{min:1,max:9,price:24500},{min:10,max:49,price:22500},{min:50,max:null,price:20800}], specs: {Fabric:'Handloom Cotton', Length:'6.3m', Designs:'Assorted'}, trending: true },
  { id: 'p-kurta-01', category: 'apparel', name: 'Cotton Kurta Set Wholesale (30pc)', brand: 'EthnicHub', sku: 'EH-KRT-30', image: 'https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7', gallery: ['https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7'], supplier: 'Jaipur Ethnic Wear', supplierId: 'sup-13', supplierLogo: '🕌', verified: true, gstVerified: true, location: 'Jaipur', years: 10, retail: 18500, moq: 1, unit: 'Pack', stock: 240, rating: 4.7, reviews: 220, orders: 950, dispatch: '3-5 Days', gstPercent: 12, tiers: [{min:1,max:9,price:16000},{min:10,max:49,price:14500},{min:50,max:null,price:13200}], specs: {Fabric:'Cotton', Sizes:'M,L,XL,XXL'} },
  { id: 'p-jeans-01', category: 'apparel', name: 'Denim Jeans Wholesale (Pack 24)', brand: 'BlueDenim', sku: 'BD-JN-24', image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe', gallery: ['https://images.unsplash.com/photo-1555529771-835f59fc5efe'], supplier: 'Ludhiana Denim Co', supplierId: 'sup-14', supplierLogo: '👖', verified: true, gstVerified: true, location: 'Ludhiana', years: 20, retail: 16800, moq: 1, unit: 'Pack', stock: 410, rating: 4.6, reviews: 380, orders: 1800, dispatch: '3-5 Days', gstPercent: 12, tiers: [{min:1,max:9,price:14500},{min:10,max:99,price:13200},{min:100,max:null,price:12100}], specs: {Fabric:'Denim 12oz', Fit:'Regular', Sizes:'30-38'} },

  // Mobile
  { id: 'p-cable-01', category: 'mobile', name: 'Fast Charging Type-C Cable 65W', brand: 'TechPro', sku: 'TP-CBL-65W', image: 'https://images.unsplash.com/photo-1731616103600-3fe7ccdc5a59', gallery: ['https://images.unsplash.com/photo-1731616103600-3fe7ccdc5a59','https://images.unsplash.com/photo-1725304382197-663ae3864750'], supplier: 'TechPro Electronics', supplierId: 'sup-21', supplierLogo: '⚡', verified: true, gstVerified: true, location: 'Noida', years: 8, retail: 65, moq: 500, unit: 'Piece', stock: 50000, rating: 4.9, reviews: 892, orders: 25000, dispatch: '24 Hours', gstPercent: 18, tiers: [{min:500,max:999,price:55},{min:1000,max:4999,price:45},{min:5000,max:null,price:38}], specs: {Length:'1m', Connector:'Type-C', Power:'65W', Warranty:'6 Months'}, trending: true },
  { id: 'p-charger-01', category: 'mobile', name: '33W Fast Wall Charger Adapter', brand: 'TechPro', sku: 'TP-CHG-33W', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0', gallery: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0','https://images.unsplash.com/photo-1573739022854-abceaeb585dc'], supplier: 'TechPro Electronics', supplierId: 'sup-21', supplierLogo: '⚡', verified: true, gstVerified: true, location: 'Noida', years: 8, retail: 180, moq: 200, unit: 'Piece', stock: 22000, rating: 4.7, reviews: 620, orders: 14000, dispatch: '24 Hours', gstPercent: 18, tiers: [{min:200,max:499,price:155},{min:500,max:1999,price:135},{min:2000,max:null,price:118}], specs: {Power:'33W', Ports:'Type-C', Warranty:'1 Year'}, trending: true },
  { id: 'p-pb-01', category: 'mobile', name: '20000mAh Power Bank Bulk Lot', brand: 'PowerX', sku: 'PX-PB-20K', image: 'https://images.unsplash.com/photo-1573739022854-abceaeb585dc', gallery: ['https://images.unsplash.com/photo-1573739022854-abceaeb585dc'], supplier: 'PowerX Distributors', supplierId: 'sup-22', supplierLogo: '🔋', verified: true, gstVerified: true, location: 'Bangalore', years: 6, retail: 890, moq: 50, unit: 'Piece', stock: 4200, rating: 4.6, reviews: 340, orders: 6800, dispatch: '48 Hours', gstPercent: 18, tiers: [{min:50,max:199,price:820},{min:200,max:999,price:740},{min:1000,max:null,price:680}], specs: {Capacity:'20000mAh', Output:'22.5W', Warranty:'1 Year'} },
  { id: 'p-earphone-01', category: 'mobile', name: 'TWS Earbuds Bluetooth 5.3 (Bulk)', brand: 'SoundOne', sku: 'SO-TWS-53', image: 'https://images.unsplash.com/photo-1515940175183-6798529cb860', gallery: ['https://images.unsplash.com/photo-1515940175183-6798529cb860'], supplier: 'SoundOne Audio', supplierId: 'sup-23', supplierLogo: '🎧', verified: true, gstVerified: true, location: 'Delhi', years: 5, retail: 650, moq: 100, unit: 'Piece', stock: 8500, rating: 4.5, reviews: 520, orders: 11000, dispatch: '48 Hours', gstPercent: 18, tiers: [{min:100,max:499,price:580},{min:500,max:1999,price:495},{min:2000,max:null,price:435}], specs: {Version:'5.3', Playback:'30 Hours', Warranty:'6 Months'}, trending: true },
  { id: 'p-cover-01', category: 'mobile', name: 'Silicone Phone Covers Assorted (200pc)', brand: 'CoverKart', sku: 'CK-SIL-200', image: 'https://images.unsplash.com/photo-1725304382197-663ae3864750', gallery: ['https://images.unsplash.com/photo-1725304382197-663ae3864750'], supplier: 'CoverKart Wholesale', supplierId: 'sup-24', supplierLogo: '📱', verified: true, gstVerified: true, location: 'Mumbai', years: 4, retail: 4800, moq: 1, unit: 'Pack', stock: 620, rating: 4.4, reviews: 180, orders: 2400, dispatch: '24 Hours', gstPercent: 18, tiers: [{min:1,max:9,price:4200},{min:10,max:49,price:3600},{min:50,max:null,price:3100}], specs: {Material:'Silicone', Quantity:'200 Pieces Assorted'} },
];

async function seedIfNeeded() {
  const db = await getDb();
  const count = await db.collection('products').countDocuments();
  if (count === 0) {
    await db.collection('products').insertMany(SEED_PRODUCTS);
  }
  const catCount = await db.collection('categories').countDocuments();
  if (catCount === 0) {
    await db.collection('categories').insertMany(CATEGORIES);
  }
}

function json(data, status=200) {
  return NextResponse.json(data, { status });
}

async function readBody(req) {
  try { return await req.json(); } catch { return {}; }
}

async function handle(req, ctx) {
  await seedIfNeeded();
  const db = await getDb();
  const params = ctx?.params ? await ctx.params : {};
  const path = (params?.path || []).join('/');
  const method = req.method;
  const url = new URL(req.url);

  // GET /api/  health
  if (!path && method === 'GET') return json({ ok: true, service: 'BharatMART API', version: '1.0' });

  // Categories
  if (path === 'categories' && method === 'GET') {
    const cats = await db.collection('categories').find({}, { projection: { _id: 0 } }).toArray();
    for (const c of cats) {
      c.productCount = await db.collection('products').countDocuments({ category: c.slug });
    }
    return json({ categories: cats });
  }

  // Products list
  if (path === 'products' && method === 'GET') {
    const q = url.searchParams.get('q');
    const cat = url.searchParams.get('category');
    const trending = url.searchParams.get('trending');
    const filter = {};
    if (cat) filter.category = cat;
    if (trending) filter.trending = true;
    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [{ name: re }, { brand: re }, { supplier: re }, { category: re }];
    }
    const products = await db.collection('products').find(filter, { projection: { _id: 0 } }).limit(60).toArray();
    return json({ products });
  }

  // Product details
  if (path.startsWith('products/') && method === 'GET') {
    const id = path.split('/')[1];
    const product = await db.collection('products').findOne({ id }, { projection: { _id: 0 } });
    if (!product) return json({ error: 'not found' }, 404);
    const related = await db.collection('products').find({ category: product.category, id: { $ne: id } }, { projection: { _id: 0 } }).limit(6).toArray();
    return json({ product, related });
  }

  // Auth - mock OTP
  if (path === 'auth/otp' && method === 'POST') {
    const body = await readBody(req);
    if (!body.mobile || String(body.mobile).length < 10) return json({ error: 'invalid mobile' }, 400);
    // Mock: any 4-digit accepted, but return "1234" as demo
    return json({ ok: true, message: 'OTP sent to ' + body.mobile, demoOtp: '1234' });
  }
  if (path === 'auth/verify' && method === 'POST') {
    const body = await readBody(req);
    if (!body.mobile || !body.otp) return json({ error: 'missing' }, 400);
    if (String(body.otp).length !== 4) return json({ error: 'invalid otp' }, 400);
    const userId = 'user-' + String(body.mobile).slice(-6);
    const user = { id: userId, mobile: body.mobile, name: body.name || 'Buyer ' + String(body.mobile).slice(-4), createdAt: new Date().toISOString() };
    await db.collection('users').updateOne({ id: userId }, { $set: user }, { upsert: true });
    const token = 'tok-' + uuidv4();
    return json({ ok: true, token, user });
  }

  // Cart
  if (path.startsWith('cart/') && method === 'GET') {
    const userId = path.split('/')[1];
    const cart = await db.collection('carts').findOne({ userId }, { projection: { _id: 0 } });
    return json({ cart: cart || { userId, items: [] } });
  }
  if (path === 'cart/add' && method === 'POST') {
    const b = await readBody(req);
    if (!b.userId || !b.productId || !b.qty) return json({ error: 'missing' }, 400);
    const product = await db.collection('products').findOne({ id: b.productId }, { projection: { _id: 0 } });
    if (!product) return json({ error: 'no product' }, 404);
    const cart = (await db.collection('carts').findOne({ userId: b.userId })) || { userId: b.userId, items: [] };
    const idx = cart.items.findIndex(i => i.productId === b.productId);
    if (idx >= 0) cart.items[idx].qty = b.qty;
    else cart.items.push({ productId: b.productId, qty: b.qty, product });
    await db.collection('carts').updateOne({ userId: b.userId }, { $set: { userId: b.userId, items: cart.items } }, { upsert: true });
    return json({ ok: true, cart: { userId: b.userId, items: cart.items } });
  }
  if (path === 'cart/remove' && method === 'POST') {
    const b = await readBody(req);
    const cart = (await db.collection('carts').findOne({ userId: b.userId })) || { items: [] };
    cart.items = cart.items.filter(i => i.productId !== b.productId);
    await db.collection('carts').updateOne({ userId: b.userId }, { $set: { userId: b.userId, items: cart.items } }, { upsert: true });
    return json({ ok: true, cart });
  }

  // Orders
  if (path === 'orders' && method === 'POST') {
    const b = await readBody(req);
    if (!b.userId || !b.items || !b.address) return json({ error: 'missing' }, 400);
    const orderId = 'ORD-' + Math.floor(100000 + Math.random()*900000);
    const now = new Date();
    const order = {
      id: orderId,
      userId: b.userId,
      items: b.items,
      address: b.address,
      payment: b.payment || 'UPI',
      subtotal: b.subtotal,
      gst: b.gst,
      shipping: b.shipping,
      total: b.total,
      status: 'placed',
      timeline: [
        { step: 'placed', label: 'Order Placed', at: now.toISOString(), done: true },
        { step: 'verified', label: 'Order Verification', at: null, done: false },
        { step: 'packed', label: 'Supplier Processing', at: null, done: false },
        { step: 'shipped', label: 'Dispatched', at: null, done: false },
        { step: 'delivered', label: 'Delivered', at: null, done: false },
      ],
      createdAt: now.toISOString(),
      expectedDelivery: new Date(now.getTime() + 6*24*3600*1000).toISOString(),
    };
    await db.collection('orders').insertOne(order);
    await db.collection('carts').updateOne({ userId: b.userId }, { $set: { items: [] } });
    // add notification
    await db.collection('notifications').insertOne({ id: uuidv4(), userId: b.userId, title: 'Order Placed', message: `Your order ${orderId} has been placed successfully.`, type: 'order', read: false, createdAt: now.toISOString() });
    return json({ ok: true, order });
  }
  if (path.startsWith('orders/') && method === 'GET') {
    const orderId = path.split('/')[1];
    if (orderId === 'user') {
      const uid = url.searchParams.get('userId');
      const orders = await db.collection('orders').find({ userId: uid }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      return json({ orders });
    }
    const order = await db.collection('orders').findOne({ id: orderId }, { projection: { _id: 0 } });
    if (!order) return json({ error: 'not found' }, 404);
    // Auto-advance timeline based on time passed (for demo)
    const ageMin = (Date.now() - new Date(order.createdAt).getTime())/60000;
    const steps = ['placed','verified','packed','shipped','delivered'];
    const advanceIdx = Math.min(4, Math.floor(ageMin/1)); // 1 min per step
    let changed = false;
    for (let i=0;i<=advanceIdx;i++) {
      if (!order.timeline[i].done) { order.timeline[i].done = true; order.timeline[i].at = new Date().toISOString(); changed = true; }
    }
    order.status = steps[advanceIdx];
    if (changed) await db.collection('orders').updateOne({ id: orderId }, { $set: { timeline: order.timeline, status: order.status } });
    return json({ order });
  }

  // Notifications
  if (path.startsWith('notifications/') && method === 'GET') {
    const userId = path.split('/')[1];
    const notifs = await db.collection('notifications').find({ userId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(50).toArray();
    // Add global promo notifications
    const promos = [
      { id: 'promo-1', userId, title: '🎉 Festival Sale is LIVE!', message: 'Flat 15% off on Grocery bulk orders. Code: BHARAT15', type: 'promo', read: false, createdAt: new Date(Date.now()-3600000).toISOString() },
      { id: 'promo-2', userId, title: '⚡ Flash Deal', message: 'Free shipping on Mobile accessories above ₹50,000', type: 'promo', read: false, createdAt: new Date(Date.now()-7200000).toISOString() },
    ];
    return json({ notifications: [...notifs, ...promos] });
  }

  return json({ error: 'not found', path, method }, 404);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
