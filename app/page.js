'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, Bell, User, Store, MapPin, Star, Shield, Truck, CheckCircle2, Sparkles, ChevronRight, Menu, X, Plus, Minus, Share2, MessageCircle, Phone, Home, Grid3x3, ClipboardList, ArrowLeft, Filter, BadgeCheck, Award, TrendingUp, IndianRupee, Download, FileText, CircleCheck, Package, LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { FirebaseLoginModal } from '@/components/FirebaseLoginModal'
import { BuyerDashboard } from '@/components/BuyerDashboard'

const HERO_IMG = 'https://images.unsplash.com/photo-1627915589334-14a3c3e3a741'
const money = (n) => '₹' + Number(n).toLocaleString('en-IN')
const priceFor = (product, qty) => {
  const tier = product.tiers?.find(t => qty >= t.min && (t.max == null || qty <= t.max))
  return tier ? tier.price : product.retail
}

function useLocalUser() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    try { const u = localStorage.getItem('bm_user'); if (u) setUser(JSON.parse(u)) } catch {}
  }, [])
  const login = (u) => { localStorage.setItem('bm_user', JSON.stringify(u)); setUser(u) }
  const logout = () => { localStorage.removeItem('bm_user'); setUser(null) }
  return { user, login, logout }
}

const Row = ({ l, r }) => <div className="flex justify-between text-slate-600"><span>{l}</span><span>{r}</span></div>
const Field = ({ l, v, on }) => (
  <div>
    <label className="text-xs font-medium text-slate-600">{l}</label>
    <Input value={v} onChange={e => on(e.target.value)} className="mt-1 h-11 rounded-xl" />
  </div>
)

function Header({ setView, cart, notifCount, user, onOpenLogin, onOpenCart, onOpenNotif, onSearch }) {
  const [q, setQ] = useState('')
  const submit = (e) => { e?.preventDefault(); onSearch(q); setView({ name: 'search', q }) }
  const cartCount = cart?.items?.reduce((s, i) => s + i.qty, 0) || 0
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-3">
        <button onClick={() => setView({ name: 'home' })} className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-500 grid place-items-center shadow-md">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-lg leading-none bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent">BharatMART</div>
            <div className="text-[10px] text-slate-500 font-medium">B2B Wholesale</div>
          </div>
        </button>
        <form onSubmit={submit} className="hidden md:flex flex-1 max-w-2xl mx-auto relative">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products, suppliers, brands..." className="pl-11 pr-24 h-11 rounded-full border-slate-200 bg-slate-50 focus:bg-white" />
            <Button type="submit" size="sm" className="absolute right-1 top-1 h-9 rounded-full bg-teal-700 hover:bg-teal-800 px-5">Search</Button>
          </div>
        </form>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button onClick={() => toast.info('Seller onboarding coming soon!')} variant="ghost" className="hidden md:inline-flex text-teal-700 hover:text-teal-800 hover:bg-teal-50 font-medium">
            <Store className="w-4 h-4 mr-1.5" /> Start Selling
          </Button>
          {user && (
            <>
              <button onClick={onOpenCart} className="relative w-10 h-10 rounded-full hover:bg-slate-100 grid place-items-center">
                <ShoppingCart className="w-5 h-5 text-slate-700" />
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold grid place-items-center">{cartCount}</span>}
              </button>
              <button onClick={onOpenNotif} className="relative w-10 h-10 rounded-full hover:bg-slate-100 grid place-items-center">
                <Bell className="w-5 h-5 text-slate-700" />
                {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold grid place-items-center">{notifCount}</span>}
              </button>
            </>
          )}
          {user ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white grid place-items-center font-semibold text-sm">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          ) : (
            <Button onClick={onOpenLogin} className="btn-primary rounded-full h-10 px-5"><User className="w-4 h-4 mr-1.5" /> Sign In</Button>
          )}
        </div>
      </div>
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={submit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products or suppliers..." className="pl-11 h-11 rounded-full border-slate-200 bg-slate-50" />
        </form>
      </div>
    </header>
  )
}

function Hero({ setView }) {
  return (
    <section className="relative overflow-hidden hero-gradient text-white">
      <div className="absolute inset-0 opacity-25 mix-blend-overlay" style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md mb-5 rounded-full px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> India's smartest B2B marketplace
          </Badge>
          <h1 className="font-poppins font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-tight">
            B2B Wholesale<br />
            <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">Made Easy.</span>
          </h1>
          <p className="mt-5 text-lg text-white/90 max-w-lg font-light">
            Source directly from 100,000+ verified suppliers. Bulk pricing, GST invoices, secure payments — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => setView({ name: 'category', category: 'grocery' })} className="h-12 px-7 rounded-full bg-white text-teal-800 hover:bg-amber-100 font-semibold shadow-xl">Start Buying <ChevronRight className="w-4 h-4 ml-1" /></Button>
            <Button onClick={() => toast.info('Seller onboarding coming soon!')} variant="outline" className="h-12 px-7 rounded-full bg-transparent border-white/40 text-white hover:bg-white/10 font-semibold">Become Seller</Button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
            {[{ icon: Shield, t: '100% Verified' }, { icon: CheckCircle2, t: 'Secure Pay' }, { icon: Truck, t: 'Fast Delivery' }].map((b, i) => (
              <div key={i} className="glass rounded-2xl p-3 text-center">
                <b.icon className="w-5 h-5 mx-auto mb-1 text-white" />
                <div className="text-xs font-medium text-white">{b.t}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block relative h-[440px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-0 right-0 w-64 glass rounded-2xl p-4 animate-float">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-400 grid place-items-center text-xl">⚡</div>
              <div><div className="text-sm font-semibold">Fast Charging Cable</div><div className="text-xs text-white/80">MOQ 500 · ₹38/pc</div></div>
            </div>
            <div className="mt-3 text-xs text-white/90 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-300 text-amber-300" /> 4.9 · 25K+ orders</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="absolute top-32 left-4 w-64 glass rounded-2xl p-4 animate-float-delay">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-pink-400 grid place-items-center text-xl">👕</div>
              <div><div className="text-sm font-semibold">Cotton T-Shirts (100pc)</div><div className="text-xs text-white/80">Wholesale ₹12,500</div></div>
            </div>
            <div className="mt-3 text-xs text-white/90 flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-emerald-300" /> Verified Supplier</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="absolute bottom-4 right-8 w-64 glass rounded-2xl p-4 animate-float">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-400 grid place-items-center text-xl">🛒</div>
              <div><div className="text-sm font-semibold">Basmati Rice 25kg</div><div className="text-xs text-white/80">From ₹1,572/bag</div></div>
            </div>
            <div className="mt-3 text-xs text-white/90 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-300" /> Trending</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Categories({ cats, setView }) {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Shop by Category</h2>
          <p className="text-slate-500 mt-1">Phase 1 launch categories — more coming soon</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {cats.map((c, i) => (
          <motion.button key={c.id} onClick={() => setView({ name: 'category', category: c.slug })}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="group relative rounded-3xl overflow-hidden card-hover text-left bg-white border border-slate-100">
            <div className={`h-40 bg-gradient-to-br ${c.color} relative flex items-center justify-center`}>
              <div className="text-7xl">{c.icon}</div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs text-white font-semibold">{c.productCount || 0}+ products</div>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">{c.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{c.tagline}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

function ProductCard({ p, onOpen, onAdd }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl border border-slate-100 overflow-hidden card-hover flex flex-col">
      <button onClick={() => onOpen(p)} className="relative aspect-square overflow-hidden bg-slate-100">
        <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
        {p.trending && <Badge className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600 rounded-full">🔥 Trending</Badge>}
        {p.verified && <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur grid place-items-center"><BadgeCheck className="w-4 h-4 text-emerald-600" /></div>}
      </button>
      <div className="p-4 flex flex-col flex-1">
        <button onClick={() => onOpen(p)} className="text-left">
          <h3 className="font-medium text-sm text-slate-900 line-clamp-2 min-h-[40px]">{p.name}</h3>
        </button>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-1"><span className="text-base">{p.supplierLogo}</span> {p.supplier}</div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded"><Star className="w-3 h-3 fill-current" /> {p.rating}</span>
          <span className="text-slate-500">{(p.orders / 1000).toFixed(1)}K orders</span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-teal-700">{money(p.tiers?.[p.tiers.length - 1]?.price || p.retail)}<span className="text-xs font-normal text-slate-500">/{p.unit}</span></div>
            <div className="text-[11px] text-slate-500">MOQ: {p.moq} {p.unit}</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onOpen(p)} variant="outline" className="flex-1 rounded-full h-9 text-xs border-slate-200">View</Button>
          <Button size="sm" onClick={() => onAdd(p)} className="flex-1 rounded-full h-9 text-xs bg-teal-700 hover:bg-teal-800">Add</Button>
        </div>
      </div>
    </motion.div>
  )
}

function HomePage({ cats, products, onOpenProduct, onAddQuick, setView }) {
  const trending = products.filter(p => p.trending).slice(0, 8)
  const grouped = {
    grocery: products.filter(p => p.category === 'grocery').slice(0, 4),
    apparel: products.filter(p => p.category === 'apparel').slice(0, 4),
    mobile: products.filter(p => p.category === 'mobile').slice(0, 4),
  }
  return (
    <>
      <Hero setView={setView} />
      <Categories cats={cats} setView={setView} />
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-orange-500" /> Trending Now</h2>
            <p className="text-slate-500 mt-1">Best-selling wholesale products this week</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trending.map(p => <ProductCard key={p.id} p={p} onOpen={onOpenProduct} onAdd={onAddQuick} />)}
        </div>
      </section>
      {cats.map(c => (
        <section key={c.id} className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">{c.icon} {c.name}</h2>
            <Button onClick={() => setView({ name: 'category', category: c.slug })} variant="ghost" className="text-teal-700 hover:text-teal-800">View all <ChevronRight className="w-4 h-4" /></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {grouped[c.slug]?.map(p => <ProductCard key={p.id} p={p} onOpen={onOpenProduct} onAdd={onAddQuick} />)}
          </div>
        </section>
      ))}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Why BharatMART?</h2>
          <p className="text-white/80 mb-8">Everything you need to grow your wholesale business</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ i: Shield, t: 'Verified Suppliers', d: 'GST & KYC verified' }, { i: Award, t: 'Trade Assurance', d: 'Buyer protection' }, { i: Truck, t: 'Pan-India Delivery', d: '25K+ cities served' }, { i: FileText, t: 'GST Invoicing', d: 'Tax compliant' }].map((f, i) => (
              <div key={i} className="glass-dark rounded-2xl p-5">
                <f.i className="w-8 h-8 mb-3 text-amber-300" />
                <div className="font-semibold">{f.t}</div>
                <div className="text-sm text-white/70 mt-0.5">{f.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['100K+', 'Suppliers'], ['5M+', 'Products'], ['25K+', 'Cities'], ['10M+', 'Orders']].map(([n, l], i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-amber-300">{n}</div>
                <div className="text-sm text-white/80 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-500 grid place-items-center"><Store className="w-4 h-4 text-white" /></div>
              <span className="font-bold text-lg">BharatMART</span>
            </div>
            <p className="text-slate-500">India's premium B2B wholesale marketplace.</p>
          </div>
          {[['Buyers', ['Browse Products', 'Categories', 'RFQ', 'Buyer Protection']], ['Suppliers', ['Become Seller', 'Seller Dashboard', 'GST Support', 'Pricing']], ['Company', ['About', 'Blog', 'Contact', 'Privacy']]].map(([h, items]) => (
            <div key={h}>
              <div className="font-semibold mb-3">{h}</div>
              <ul className="space-y-2 text-slate-500">{items.map(x => <li key={x} className="hover:text-teal-700 cursor-pointer">{x}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">© 2026 BharatMART · Made in India 🇮🇳</div>
      </footer>
    </>
  )
}

function ListingPage({ title, products, onOpenProduct, onAddQuick, setView }) {
  const [sort, setSort] = useState('relevance')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState(0)
  const filtered = useMemo(() => {
    let arr = [...products]
    const getP = (p) => (p.tiers?.[p.tiers.length - 1]?.price || p.retail)
    if (minPrice) arr = arr.filter(p => getP(p) >= Number(minPrice))
    if (maxPrice) arr = arr.filter(p => getP(p) <= Number(maxPrice))
    if (minRating) arr = arr.filter(p => p.rating >= minRating)
    if (sort === 'price-asc') arr.sort((a, b) => getP(a) - getP(b))
    if (sort === 'price-desc') arr.sort((a, b) => getP(b) - getP(a))
    if (sort === 'rating') arr.sort((a, b) => b.rating - a.rating)
    if (sort === 'orders') arr.sort((a, b) => b.orders - a.orders)
    return arr
  }, [products, sort, minPrice, maxPrice, minRating])

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <button onClick={() => setView({ name: 'home' })} className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700 mb-3"><ArrowLeft className="w-4 h-4" /> Back to Home</button>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">{filtered.length} products</span>
          <select value={sort} onChange={e => setSort(e.target.value)} className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="orders">Best Selling</option>
          </select>
        </div>
      </div>
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="hidden lg:block bg-white rounded-2xl border border-slate-100 p-5 h-fit sticky top-24">
          <div className="font-semibold mb-3 flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</div>
          <div className="mb-4">
            <div className="text-xs font-medium mb-2 text-slate-600">Price Range</div>
            <div className="flex gap-2">
              <Input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="h-9 text-sm rounded-lg" />
              <Input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="h-9 text-sm rounded-lg" />
            </div>
          </div>
          <div className="mb-4">
            <div className="text-xs font-medium mb-2 text-slate-600">Minimum Rating</div>
            {[0, 4, 4.5, 4.8].map(r => (
              <button key={r} onClick={() => setMinRating(r)} className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 ${minRating === r ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}>
                {r === 0 ? 'All Ratings' : `${r}★ & above`}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => { setMinPrice(''); setMaxPrice(''); setMinRating(0) }} className="w-full rounded-full h-9 text-sm">Clear</Button>
        </aside>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCard key={p.id} p={p} onOpen={onOpenProduct} onAdd={onAddQuick} />)}
          {filtered.length === 0 && <div className="col-span-full text-center py-16 text-slate-500">No products match filters.</div>}
        </div>
      </div>
    </div>
  )
}

function ProductDetails({ product, related, onAdd, onBuy, setView }) {
  const [qty, setQty] = useState(product.moq)
  const [gallery, setGallery] = useState(0)
  useEffect(() => { setQty(product.moq); setGallery(0) }, [product.id])
  const unit = priceFor(product, qty)
  const subtotal = unit * qty
  const gst = Math.round(subtotal * (product.gstPercent || 0) / 100)
  const shipping = subtotal > 50000 ? 0 : (product.category === 'mobile' ? 900 : 500)
  const total = subtotal + gst + shipping
  const savings = (product.retail - unit) * qty
  const tierIdx = product.tiers?.findIndex(t => qty >= t.min && (t.max == null || qty <= t.max))

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 pb-28 lg:pb-8">
      <button onClick={() => setView({ name: 'category', category: product.category })} className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700 mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8">
        <div>
          <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100">
            <img src={product.gallery?.[gallery] || product.image} alt="" className="w-full h-full object-cover" />
          </div>
          {product.gallery?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.gallery.map((g, i) => (
                <button key={i} onClick={() => setGallery(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${gallery === i ? 'border-teal-600' : 'border-transparent'}`}>
                  <img src={g} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {product.verified && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full"><BadgeCheck className="w-3 h-3 mr-1" />Verified Supplier</Badge>}
            {product.gstVerified && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full">GST Verified</Badge>}
            {product.trending && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 rounded-full">🔥 Trending</Badge>}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{product.name}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> <b>{product.rating}</b> <span className="text-slate-500">({product.reviews} reviews)</span></span>
            <span className="text-slate-500">{(product.orders / 1000).toFixed(1)}K+ Orders</span>
            <span className="text-emerald-600 font-medium">In Stock: {product.stock.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 text-sm text-slate-500">Brand: <b className="text-slate-800">{product.brand}</b> · SKU: {product.sku} · Dispatch: {product.dispatch}</div>
          <div className="mt-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-5 border border-teal-100">
            <div className="text-xs text-slate-500 font-medium mb-2">BULK PRICING</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {product.tiers?.map((t, i) => (
                <div key={i} className={`rounded-xl px-3 py-2 text-center border ${tierIdx === i ? 'bg-teal-700 text-white border-teal-700' : 'bg-white border-slate-200'}`}>
                  <div className="text-[11px] opacity-80">{t.min}{t.max ? `-${t.max}` : '+'} {product.unit}</div>
                  <div className="font-bold">{money(t.price)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold">Quantity ({product.unit})</div>
              <div className="text-xs text-slate-500">MOQ: {product.moq}</div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center border border-slate-200 rounded-full overflow-hidden">
                <button onClick={() => setQty(Math.max(product.moq, qty - 1))} className="w-10 h-10 grid place-items-center hover:bg-slate-100"><Minus className="w-4 h-4" /></button>
                <input value={qty} onChange={e => setQty(Math.max(product.moq, Number(e.target.value) || product.moq))} className="w-20 text-center h-10 outline-none font-semibold" type="number" />
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 grid place-items-center hover:bg-slate-100"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[product.moq, product.moq * 5, product.moq * 10, product.moq * 50].filter(v => v).map(v => (
                  <button key={v} onClick={() => setQty(v)} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700">{v}+</button>
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm">
              <Row l={`Price/${product.unit}`} r={<b className="text-teal-700">{money(unit)}</b>} />
              <Row l="Subtotal" r={money(subtotal)} />
              <Row l={`GST (${product.gstPercent || 0}%)`} r={gst === 0 ? <span className="text-emerald-600">₹0</span> : money(gst)} />
              <Row l="Shipping" r={shipping === 0 ? <span className="text-emerald-600">FREE</span> : money(shipping)} />
              <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-bold"><span>Total Payable</span><span className="text-teal-700">{money(total)}</span></div>
              {savings > 0 && <div className="mt-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-2 rounded-lg">💰 You save {money(savings)} on this bulk order!</div>}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button onClick={() => onAdd(product, qty)} variant="outline" className="h-11 rounded-full border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold">Add to Cart</Button>
              <Button onClick={() => onBuy(product, qty)} className="h-11 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">Buy Now</Button>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Button variant="ghost" size="sm" onClick={() => toast.info('Chat opened (demo)')} className="text-xs"><MessageCircle className="w-4 h-4 mr-1" /> Chat</Button>
              <Button variant="ghost" size="sm" onClick={() => toast.info('Calling supplier (demo)')} className="text-xs"><Phone className="w-4 h-4 mr-1" /> Call</Button>
              <Button variant="ghost" size="sm" onClick={() => toast.info('Shared')} className="text-xs"><Share2 className="w-4 h-4 mr-1" /> Share</Button>
            </div>
          </div>
          <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 grid place-items-center text-2xl">{product.supplierLogo}</div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{product.supplier}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5"><MapPin className="w-3 h-3" /> {product.location} · {product.years} yrs on platform</div>
              <div className="flex gap-1 mt-1">
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]">Verified</Badge>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px]">GST</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">View Store</Button>
          </div>
        </div>
      </div>
      <Tabs defaultValue="specs" className="mt-10">
        <TabsList className="bg-white border border-slate-200 rounded-full p-1">
          <TabsTrigger value="specs" className="rounded-full">Specifications</TabsTrigger>
          <TabsTrigger value="desc" className="rounded-full">Description</TabsTrigger>
          <TabsTrigger value="protection" className="rounded-full">Buyer Protection</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 grid sm:grid-cols-2 gap-y-3 gap-x-8">
            {Object.entries(product.specs || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                <span className="text-slate-500">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="desc" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-700 leading-relaxed">
            High quality {product.name} sourced directly from {product.supplier}, {product.location}. Ideal for wholesale buyers, retailers and B2B distributors. Ships within {product.dispatch}. Full GST invoice provided. Trade Assurance active.
          </div>
        </TabsContent>
        <TabsContent value="protection" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 grid sm:grid-cols-2 gap-3">
            {[['🛡', 'Verified Supplier'], ['💳', 'Secure Payment'], ['📄', 'GST Invoice'], ['🔄', 'Refund Protection'], ['📦', 'Trade Assurance'], ['✅', 'Quality Guarantee']].map(([e, t]) => (
              <div key={t} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><span className="text-2xl">{e}</span> <b className="text-sm">{t}</b></div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      {related?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} p={p} onOpen={(x) => setView({ name: 'product', id: x.id })} onAdd={onAdd} />)}
          </div>
        </div>
      )}
      <div className="lg:hidden fixed bottom-14 inset-x-0 bg-white border-t border-slate-200 p-3 grid grid-cols-2 gap-2 z-30">
        <Button onClick={() => onAdd(product, qty)} variant="outline" className="rounded-full border-teal-600 text-teal-700">Add to Cart</Button>
        <Button onClick={() => onBuy(product, qty)} className="rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs">Buy Now · {money(total)}</Button>
      </div>
    </div>
  )
}

function CartDrawer({ open, onClose, cart, refresh, user, setView }) {
  const items = cart?.items || []
  const calc = items.map(i => {
    const unit = priceFor(i.product, i.qty)
    const subtotal = unit * i.qty
    const gst = Math.round(subtotal * (i.product.gstPercent || 0) / 100)
    return { ...i, unit, subtotal, gst }
  })
  const subtotal = calc.reduce((s, i) => s + i.subtotal, 0)
  const gst = calc.reduce((s, i) => s + i.gst, 0)
  const shipping = subtotal > 50000 ? 0 : (subtotal > 0 ? 500 : 0)
  const total = subtotal + gst + shipping
  const changeQty = async (item, newQty) => {
    if (newQty < item.product.moq) return
    await fetch('/api/cart/add', { method: 'POST', body: JSON.stringify({ userId: user.id, productId: item.productId, qty: newQty }) })
    refresh()
  }
  const remove = async (pid) => {
    await fetch('/api/cart/remove', { method: 'POST', body: JSON.stringify({ userId: user.id, productId: pid }) })
    refresh()
  }
  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-slate-100">
          <SheetTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-teal-700" /> Your Cart ({items.length})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && <div className="text-center py-12 text-slate-500">Your cart is empty</div>}
          {calc.map(i => (
            <div key={i.productId} className="flex gap-3 bg-white rounded-2xl border border-slate-100 p-3">
              <img src={i.product.image} className="w-20 h-20 rounded-xl object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium line-clamp-2">{i.product.name}</div>
                <div className="text-xs text-slate-500">{i.product.supplier}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-slate-200 rounded-full">
                    <button onClick={() => changeQty(i, i.qty - 1)} className="w-7 h-7 grid place-items-center"><Minus className="w-3 h-3" /></button>
                    <span className="w-10 text-center text-sm font-medium">{i.qty}</span>
                    <button onClick={() => changeQty(i, i.qty + 1)} className="w-7 h-7 grid place-items-center"><Plus className="w-3 h-3" /></button>
                  </div>
                  <div className="text-sm font-bold text-teal-700">{money(i.subtotal)}</div>
                </div>
                <button onClick={() => remove(i.productId)} className="text-xs text-rose-500 hover:underline mt-1">Remove</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="border-t border-slate-100 p-4 space-y-2 bg-slate-50">
            <Row l="Subtotal" r={money(subtotal)} />
            <Row l="GST" r={money(gst)} />
            <Row l="Shipping" r={shipping === 0 ? <span className="text-emerald-600">FREE</span> : money(shipping)} />
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200"><span>Total</span><span className="text-teal-700">{money(total)}</span></div>
            <Button onClick={() => { onClose(); setView({ name: 'checkout' }) }} className="w-full h-12 rounded-full bg-teal-700 hover:bg-teal-800 font-semibold mt-2">Proceed to Checkout <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function LoginModal({ open, onClose, onLogin }) {
  const [step, setStep] = useState(1)
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoOtp, setDemoOtp] = useState('')
  useEffect(() => { if (!open) { setStep(1); setMobile(''); setOtp(''); setName(''); setDemoOtp('') } }, [open])
  const sendOtp = async () => {
    if (mobile.length < 10) return toast.error('Enter valid 10-digit mobile')
    setLoading(true)
    const r = await fetch('/api/auth/otp', { method: 'POST', body: JSON.stringify({ mobile }) })
    const d = await r.json()
    setLoading(false)
    if (d.ok) { setStep(2); setDemoOtp(d.demoOtp); toast.success('OTP sent! Demo: ' + d.demoOtp) }
  }
  const verify = async () => {
    if (otp.length !== 4) return toast.error('Enter 4-digit OTP')
    setLoading(true)
    const r = await fetch('/api/auth/verify', { method: 'POST', body: JSON.stringify({ mobile, otp, name: name || undefined }) })
    const d = await r.json()
    setLoading(false)
    if (d.ok) { onLogin(d.user); toast.success('Welcome to BharatMART!'); onClose() }
    else toast.error(d.error || 'Failed')
  }
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <div className="hero-gradient p-6 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur grid place-items-center mb-3"><Store className="w-6 h-6" /></div>
          <DialogTitle className="text-2xl font-bold text-white">Welcome to BharatMART</DialogTitle>
          <p className="text-white/80 text-sm mt-1">Sign in to shop wholesale</p>
        </div>
        <div className="p-6">
          {step === 1 && (
            <>
              <label className="text-xs font-medium text-slate-600">Mobile Number</label>
              <div className="mt-1 flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <span className="px-3 text-sm text-slate-600 bg-slate-50 h-11 grid place-items-center">🇮🇳 +91</span>
                <input value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" className="flex-1 h-11 px-3 outline-none" />
              </div>
              <label className="text-xs font-medium text-slate-600 mt-3 block">Your Name (optional)</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Kumar" className="mt-1 rounded-xl h-11" />
              <Button disabled={loading} onClick={sendOtp} className="w-full mt-4 h-12 rounded-full bg-teal-700 hover:bg-teal-800 font-semibold">{loading ? 'Sending...' : 'Send OTP'}</Button>
              <div className="mt-3 text-[11px] text-slate-400 text-center">Demo login — no real SMS. Use OTP <b>1234</b>.</div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="text-sm text-slate-600 mb-2">Enter OTP sent to <b>+91 {mobile}</b></div>
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} placeholder="••••" className="w-full h-14 text-center text-2xl tracking-[0.5em] border-2 border-slate-200 rounded-xl focus:border-teal-600 outline-none font-bold" />
              {demoOtp && <div className="mt-2 text-xs text-amber-600 text-center">Demo OTP: <b>{demoOtp}</b></div>}
              <Button disabled={loading} onClick={verify} className="w-full mt-4 h-12 rounded-full bg-teal-700 hover:bg-teal-800 font-semibold">{loading ? 'Verifying...' : 'Verify & Continue'}</Button>
              <button onClick={() => setStep(1)} className="w-full mt-2 text-sm text-slate-500 hover:text-teal-700">Change mobile number</button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CheckoutPage({ user, cart, refresh, setView }) {
  const [step, setStep] = useState(1)
  const [addr, setAddr] = useState({ name: user?.name || '', mobile: user?.mobile || '', pincode: '', address: '', city: '', state: '', landmark: '', type: 'Shop' })
  const [payment, setPayment] = useState('UPI')
  const [placing, setPlacing] = useState(false)
  const items = cart?.items || []
  const calc = items.map(i => {
    const unit = priceFor(i.product, i.qty)
    const subtotal = unit * i.qty
    const gst = Math.round(subtotal * (i.product.gstPercent || 0) / 100)
    return { productId: i.productId, name: i.product.name, image: i.product.image, supplier: i.product.supplier, qty: i.qty, unit, subtotal, gst, gstPercent: i.product.gstPercent || 0 }
  })
  const subtotal = calc.reduce((s, i) => s + i.subtotal, 0)
  const gst = calc.reduce((s, i) => s + i.gst, 0)
  const shipping = subtotal > 50000 ? 0 : (subtotal > 0 ? 500 : 0)
  const total = subtotal + gst + shipping
  const placeOrder = async () => {
    setPlacing(true)
    const r = await fetch('/api/orders', { method: 'POST', body: JSON.stringify({ userId: user.id, items: calc, address: addr, payment, subtotal, gst, shipping, total }) })
    const d = await r.json()
    setPlacing(false)
    if (d.ok) { toast.success('Order placed successfully!'); refresh(); setView({ name: 'orderSuccess', orderId: d.order.id }) }
    else toast.error('Failed to place order')
  }
  if (items.length === 0) return (
    <div className="max-w-md mx-auto py-20 text-center">
      <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-3" />
      <p className="text-slate-500">Your cart is empty</p>
      <Button onClick={() => setView({ name: 'home' })} className="mt-4 rounded-full bg-teal-700">Continue Shopping</Button>
    </div>
  )
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
      <button onClick={() => setView({ name: 'home' })} className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700 mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Checkout</h1>
      <div className="flex items-center gap-2 mb-6 text-sm">
        {['Address', 'Payment', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full grid place-items-center font-bold text-xs ${step > i ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-500'}`}>{step > i ? '✓' : i + 1}</div>
            <span className={step === i + 1 ? 'font-semibold' : 'text-slate-500'}>{s}</span>
            {i < 2 && <ChevronRight className="w-4 h-4 text-slate-300" />}
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-teal-700" /><h2 className="font-semibold text-lg">Delivery Address</h2></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field l="Full Name" v={addr.name} on={v => setAddr({ ...addr, name: v })} />
                <Field l="Mobile" v={addr.mobile} on={v => setAddr({ ...addr, mobile: v })} />
                <Field l="PIN Code" v={addr.pincode} on={v => setAddr({ ...addr, pincode: v.replace(/\D/g, '').slice(0, 6) })} />
                <Field l="City" v={addr.city} on={v => setAddr({ ...addr, city: v })} />
                <Field l="State" v={addr.state} on={v => setAddr({ ...addr, state: v })} />
                <Field l="Landmark (optional)" v={addr.landmark} on={v => setAddr({ ...addr, landmark: v })} />
                <div className="sm:col-span-2"><Field l="Full Address (House/Shop, Street, Area)" v={addr.address} on={v => setAddr({ ...addr, address: v })} /></div>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium text-slate-600 mb-2">Address Type</div>
                <div className="flex gap-2 flex-wrap">
                  {['Home', 'Office', 'Shop', 'Warehouse', 'Other'].map(t => (
                    <button key={t} onClick={() => setAddr({ ...addr, type: t })} className={`px-4 py-1.5 text-sm rounded-full border ${addr.type === t ? 'bg-teal-700 border-teal-700 text-white' : 'bg-white border-slate-200 hover:border-teal-300'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <Button onClick={() => { if (!addr.name || !addr.mobile || !addr.pincode || !addr.address || !addr.city || !addr.state) return toast.error('Please fill all required fields'); setStep(2) }} className="mt-6 h-12 rounded-full bg-teal-700 hover:bg-teal-800 px-8 font-semibold">Continue to Payment</Button>
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-4"><IndianRupee className="w-5 h-5 text-teal-700" /><h2 className="font-semibold text-lg">Payment Method</h2></div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[['UPI', '📱', 'Google Pay, PhonePe, Paytm'], ['Card', '💳', 'Credit / Debit Card'], ['NetBanking', '🏦', 'All major banks'], ['Wallet', '👛', 'Paytm, Amazon Pay']].map(([k, e, d]) => (
                  <button key={k} onClick={() => setPayment(k)} className={`text-left p-4 rounded-2xl border-2 ${payment === k ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}>
                    <div className="text-2xl">{e}</div>
                    <div className="font-semibold mt-1">{k}</div>
                    <div className="text-xs text-slate-500">{d}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Shield className="w-4 h-4 text-emerald-600" /> Secure Payment · Buyer Protection · GST Invoice</div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-full">Back</Button>
                <Button onClick={() => setStep(3)} className="rounded-full bg-teal-700 hover:bg-teal-800 px-8 font-semibold">Review Order</Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-4"><ClipboardList className="w-5 h-5 text-teal-700" /><h2 className="font-semibold text-lg">Review & Place Order</h2></div>
              <div className="text-sm mb-4">
                <div className="text-slate-500 mb-1">Deliver to · <b className="text-slate-700">{addr.type}</b></div>
                <div className="font-medium">{addr.name} · +91 {addr.mobile}</div>
                <div className="text-slate-600">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</div>
                <div className="text-slate-500 text-xs mt-1">Payment: <b>{payment}</b></div>
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-3 max-h-72 overflow-y-auto">
                {calc.map(i => (
                  <div key={i.productId} className="flex gap-3 text-sm">
                    <img src={i.image} className="w-14 h-14 rounded-lg object-cover" alt="" />
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{i.name}</div>
                      <div className="text-xs text-slate-500">{i.supplier} · Qty {i.qty} × {money(i.unit)}</div>
                    </div>
                    <div className="font-semibold">{money(i.subtotal)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-full">Back</Button>
                <Button disabled={placing} onClick={placeOrder} className="rounded-full bg-amber-500 hover:bg-amber-600 px-8 font-semibold text-white">{placing ? 'Placing...' : `Place Order · ${money(total)}`}</Button>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 h-fit lg:sticky lg:top-24">
          <div className="font-semibold mb-3">Order Summary</div>
          <div className="space-y-2 text-sm">
            <Row l={`Items (${items.length})`} r={money(subtotal)} />
            <Row l="GST" r={money(gst)} />
            <Row l="Shipping" r={shipping === 0 ? <span className="text-emerald-600">FREE</span> : money(shipping)} />
            <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-teal-700">{money(total)}</span></div>
          </div>
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
            <span><b>Trade Assurance active</b><br />Verified supplier · Refund protection · Secure payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderTracking({ orderId, setView }) {
  const [order, setOrder] = useState(null)
  useEffect(() => {
    let alive = true
    const fetchOrder = async () => {
      const r = await fetch('/api/orders/' + orderId)
      const d = await r.json()
      if (alive && d.order) setOrder(d.order)
    }
    fetchOrder()
    const t = setInterval(fetchOrder, 15000)
    return () => { alive = false; clearInterval(t) }
  }, [orderId])
  if (!order) return <div className="py-20 text-center text-slate-500">Loading order...</div>
  const currentIdx = order.timeline.findIndex(t => !t.done)
  const activeIdx = currentIdx === -1 ? order.timeline.length - 1 : currentIdx
  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-8 text-center mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-16 h-16 bg-white/20 backdrop-blur rounded-full grid place-items-center mx-auto mb-3">
          <CircleCheck className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
        <p className="mt-1 text-white/85">Thank you for your purchase on BharatMART</p>
        <div className="mt-5 inline-flex flex-wrap gap-6 bg-white/15 backdrop-blur rounded-2xl px-6 py-3 text-sm">
          <div><div className="text-white/70 text-xs">Order ID</div><b>{order.id}</b></div>
          <div><div className="text-white/70 text-xs">Amount</div><b>{money(order.total)}</b></div>
          <div><div className="text-white/70 text-xs">Expected Delivery</div><b>{new Date(order.expectedDelivery).toDateString().slice(4)}</b></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Live Order Tracking</h2>
            <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">{order.status.toUpperCase()}</Badge>
          </div>
          <div className="space-y-4">
            {order.timeline.map((t, i) => {
              const icons = [Package, Shield, ClipboardList, Truck, Home]
              const Icon = icons[i]
              const isActive = i === activeIdx && !t.done
              const isDone = t.done
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full grid place-items-center ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-teal-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {i < order.timeline.length - 1 && <div className={`w-0.5 flex-1 min-h-[24px] ${isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className={`font-semibold ${isDone ? 'text-slate-900' : isActive ? 'text-teal-700' : 'text-slate-400'}`}>{t.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.at ? new Date(t.at).toLocaleString() : 'Pending'}</div>
                    {isActive && <div className="text-xs text-teal-600 mt-1">In progress...</div>}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 p-3 bg-amber-50 text-amber-700 text-xs rounded-xl">⏱ Demo: timeline auto-advances ~1 min per step to showcase live tracking. Refreshes every 15s.</div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="font-semibold mb-3">Order Items ({order.items.length})</div>
            <div className="space-y-3">
              {order.items.map(i => (
                <div key={i.productId} className="flex gap-3 text-sm">
                  <img src={i.image} className="w-14 h-14 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">{i.name}</div>
                    <div className="text-xs text-slate-500">Qty {i.qty} × {money(i.unit)}</div>
                  </div>
                  <div className="font-semibold whitespace-nowrap">{money(i.subtotal)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 mt-3 pt-3 space-y-1 text-sm">
              <Row l="Subtotal" r={money(order.subtotal)} />
              <Row l="GST" r={money(order.gst)} />
              <Row l="Shipping" r={order.shipping === 0 ? <span className="text-emerald-600">FREE</span> : money(order.shipping)} />
              <div className="flex justify-between font-bold pt-1"><span>Total</span><span className="text-teal-700">{money(order.total)}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="font-semibold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-600" /> Trade Assurance Active</div>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>✓ Verified Supplier</li>
              <li>✓ Secure Payment</li>
              <li>✓ Quality Protection</li>
              <li>✓ Refund Protection</li>
              <li>✓ GST Invoice</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => toast.success('Invoice downloaded (demo)')} variant="outline" className="rounded-full"><Download className="w-4 h-4 mr-1" /> Invoice</Button>
            <Button onClick={() => setView({ name: 'home' })} className="rounded-full bg-teal-700 hover:bg-teal-800">Continue Shopping</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotifDrawer({ open, onClose, user }) {
  const [notifs, setNotifs] = useState([])
  useEffect(() => {
    if (!open || !user) return
    fetch('/api/notifications/' + user.id).then(r => r.json()).then(d => setNotifs(d.notifications || []))
  }, [open, user])
  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-slate-100">
          <SheetTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-teal-700" /> Notifications</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifs.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No notifications</div>}
          {notifs.map(n => (
            <div key={n.id} className={`p-4 rounded-2xl border ${n.type === 'promo' ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-sm">{n.title}</div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-slate-600 mt-1">{n.message}</div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function BottomNav({ view, setView, cartCount, user, onOpenLogin, onOpenCart }) {
  const items = [
    { k: 'home', l: 'Home', i: Home, on: () => setView({ name: 'home' }) },
    { k: 'categories', l: 'Categories', i: Grid3x3, on: () => setView({ name: 'category', category: 'grocery' }) },
    { k: 'orders', l: 'Orders', i: ClipboardList, on: () => user ? setView({ name: 'orders' }) : onOpenLogin() },
    { k: 'cart', l: 'Cart', i: ShoppingCart, on: () => user ? onOpenCart() : onOpenLogin(), badge: cartCount },
    { k: 'account', l: 'Account', i: User, on: () => user ? setView({ name: 'dashboard' }) : onOpenLogin() },
  ]
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30">
      <div className="grid grid-cols-5">
        {items.map(it => {
          const active = view.name === it.k
          return (
            <button key={it.k} onClick={it.on} className={`py-2 flex flex-col items-center gap-0.5 relative ${active ? 'text-teal-700' : 'text-slate-500'}`}>
              <div className="relative">
                <it.i className="w-5 h-5" />
                {it.badge > 0 && <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full grid place-items-center">{it.badge}</span>}
              </div>
              <span className="text-[10px] font-medium">{it.l}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function OrdersPage({ user, setView }) {
  const [orders, setOrders] = useState([])
  useEffect(() => { fetch('/api/orders/user?userId=' + user.id).then(r => r.json()).then(d => setOrders(d.orders || [])) }, [user])
  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
      <button onClick={() => setView({ name: 'home' })} className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700 mb-3"><ArrowLeft className="w-4 h-4" /> Home</button>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 && <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-100">No orders yet</div>}
      <div className="space-y-3">
        {orders.map(o => (
          <button key={o.id} onClick={() => setView({ name: 'orderSuccess', orderId: o.id })} className="w-full text-left bg-white rounded-2xl border border-slate-100 p-4 hover:border-teal-300 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{o.id}</div>
                <div className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">{o.status?.toUpperCase()}</Badge>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {o.items.slice(0, 4).map(i => <img key={i.productId} src={i.image} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />)}
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-slate-500">{o.items.length} items</span>
              <span className="font-bold text-teal-700">{money(o.total)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function App() {
  // Firebase auth
  const { user: fbUser, profile, loading: authLoading } = useAuth()
  // Adapter to keep existing components unchanged - map Firebase user to legacy shape
  const user = fbUser ? {
    id: fbUser.uid,
    uid: fbUser.uid,
    name: profile?.displayName || fbUser.displayName || fbUser.email?.split('@')[0] || (fbUser.phoneNumber ? 'Buyer ' + fbUser.phoneNumber.slice(-4) : 'Buyer'),
    email: fbUser.email,
    mobile: fbUser.phoneNumber?.replace('+91', '') || '',
    role: profile?.role || 'buyer',
  } : null

  const [view, setView] = useState({ name: 'home' })
  const [cats, setCats] = useState([])
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({ items: [] })
  const [notifCount, setNotifCount] = useState(0)
  const [loginOpen, setLoginOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [productDetail, setProductDetail] = useState(null)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCats(d.categories || []))
    fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || []))
  }, [])
  const refreshCart = () => {
    if (!user) return setCart({ items: [] })
    fetch('/api/cart/' + user.id).then(r => r.json()).then(d => setCart(d.cart || { items: [] }))
  }
  const refreshNotif = () => {
    if (!user) return setNotifCount(0)
    fetch('/api/notifications/' + user.id).then(r => r.json()).then(d => setNotifCount((d.notifications || []).filter(n => !n.read).length))
  }
  useEffect(() => { refreshCart(); refreshNotif() }, [user?.id])
  useEffect(() => {
    if (view.name === 'product' && view.id) {
      setProductDetail(null)
      fetch('/api/products/' + view.id).then(r => r.json()).then(d => setProductDetail(d))
    }
  }, [view])

  // On login success, execute pending action (add-to-cart or buy-now)
  useEffect(() => {
    if (user && pendingAction) {
      const { type, product, qty } = pendingAction
      const q = qty || product.moq
      fetch('/api/cart/add', { method: 'POST', body: JSON.stringify({ userId: user.id, productId: product.id, qty: q }) })
        .then(r => r.json())
        .then(d => {
          if (d.ok) { setCart(d.cart); toast.success('Added to cart') }
          setPendingAction(null)
          if (type === 'buy') setTimeout(() => setView({ name: 'checkout' }), 200)
        })
    }
  }, [user?.id, pendingAction])

  const openProduct = (p) => setView({ name: 'product', id: p.id })

  const addToCart = async (product, qty) => {
    if (!user) {
      setPendingAction({ type: 'add', product, qty: qty || product.moq })
      setLoginOpen(true)
      toast.info('Please sign in to add to cart')
      return
    }
    const q = qty || product.moq
    const r = await fetch('/api/cart/add', { method: 'POST', body: JSON.stringify({ userId: user.id, productId: product.id, qty: q }) })
    const d = await r.json()
    if (d.ok) { setCart(d.cart); toast.success('Added to cart') }
  }
  const buyNow = async (product, qty) => {
    if (!user) { setPendingAction({ type: 'buy', product, qty }); setLoginOpen(true); return }
    await addToCart(product, qty)
    setTimeout(() => setView({ name: 'checkout' }), 300)
  }

  const filteredProducts = useMemo(() => {
    if (view.name === 'category') return products.filter(p => p.category === view.category)
    if (view.name === 'search' && view.q) {
      const re = new RegExp(view.q, 'i')
      return products.filter(p => re.test(p.name) || re.test(p.brand) || re.test(p.supplier) || re.test(p.category))
    }
    return products
  }, [products, view])

  return (
    <div className="min-h-screen bg-slate-50 pb-16 lg:pb-0">
      <Header
        setView={setView} cart={cart} notifCount={notifCount} user={user}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onOpenNotif={() => setNotifOpen(true)}
        onSearch={(q) => setView({ name: 'search', q })}
      />
      <main>
        {view.name === 'home' && <HomePage cats={cats} products={products} onOpenProduct={openProduct} onAddQuick={addToCart} setView={setView} />}
        {view.name === 'category' && <ListingPage title={cats.find(c => c.slug === view.category)?.name || 'Products'} products={filteredProducts} onOpenProduct={openProduct} onAddQuick={addToCart} setView={setView} />}
        {view.name === 'search' && <ListingPage title={`Search: "${view.q}"`} products={filteredProducts} onOpenProduct={openProduct} onAddQuick={addToCart} setView={setView} />}
        {view.name === 'product' && (productDetail?.product ? <ProductDetails product={productDetail.product} related={productDetail.related} onAdd={addToCart} onBuy={buyNow} setView={setView} /> : <div className="py-20 text-center text-slate-400">Loading product...</div>)}
        {view.name === 'checkout' && <CheckoutPage user={user} cart={cart} refresh={refreshCart} setView={setView} />}
        {view.name === 'orderSuccess' && <OrderTracking orderId={view.orderId} setView={setView} />}
        {view.name === 'orders' && user && <OrdersPage user={user} setView={setView} />}
        {view.name === 'dashboard' && <BuyerDashboard setView={setView} />}
      </main>
      <BottomNav view={view} setView={setView} cartCount={cart.items?.reduce((s, i) => s + i.qty, 0) || 0} user={user} onOpenLogin={() => setLoginOpen(true)} onOpenCart={() => setCartOpen(true)} />
      <FirebaseLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} refresh={refreshCart} user={user} setView={setView} />
      <NotifDrawer open={notifOpen} onClose={() => setNotifOpen(false)} user={user} />
    </div>
  )
}

export default App
