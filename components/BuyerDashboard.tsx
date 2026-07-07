'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders, useCart } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, ShoppingCart, Heart, MapPin, LogOut, User as UserIcon, IndianRupee, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const money = (n: number) => '₹' + Number(n).toLocaleString('en-IN');

export function BuyerDashboard({ setView }: { setView: (v: any) => void }) {
  const { user, profile, signOut } = useAuth();
  const orders = useUserOrders(user?.uid || null);
  const cart = useCart(user?.uid || null);

  if (!user) return (
    <div className="py-20 text-center">
      <UserIcon className="w-16 h-16 mx-auto text-slate-300 mb-3" />
      <p className="text-slate-500">Please sign in to view dashboard</p>
    </div>
  );

  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'delivered').length;

  const doLogout = async () => {
    await signOut();
    toast.success('Signed out');
    setView({ name: 'home' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
      <button onClick={() => setView({ name: 'home' })} className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700 mb-3"><ArrowLeft className="w-4 h-4" /> Home</button>

      {/* Profile header */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 rounded-3xl p-6 md:p-8 text-white mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur grid place-items-center text-2xl font-bold">
            {(profile?.displayName || user.email || user.phoneNumber || 'U')[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white/70">Welcome back,</div>
            <div className="text-xl md:text-2xl font-bold">{profile?.displayName || user.email?.split('@')[0] || user.phoneNumber || 'Buyer'}</div>
            <div className="text-sm text-white/80 mt-0.5">{user.email || user.phoneNumber}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
              <span className="capitalize">{profile?.role || 'buyer'}</span>
            </div>
          </div>
          <Button onClick={doLogout} variant="outline" className="rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { i: Package, l: 'Total Orders', v: orders.length, c: 'from-blue-400 to-blue-600' },
          { i: TrendingUp, l: 'Active Orders', v: activeOrders, c: 'from-amber-400 to-orange-500' },
          { i: ShoppingCart, l: 'Cart Items', v: cart.items.length, c: 'from-teal-400 to-teal-600' },
          { i: IndianRupee, l: 'Total Spent', v: money(totalSpent), c: 'from-emerald-400 to-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.c} grid place-items-center mb-3`}><s.i className="w-5 h-5 text-white" /></div>
            <div className="text-2xl font-bold text-slate-900">{s.v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Recent Orders</h2>
          {orders.length > 0 && <span className="text-xs text-slate-500">Live updates • {orders.length} total</span>}
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p>No orders yet</p>
            <Button onClick={() => setView({ name: 'home' })} className="mt-3 rounded-full bg-teal-700 hover:bg-teal-800">Start Shopping</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 10).map(o => (
              <button key={o.id} onClick={() => setView({ name: 'orderSuccess', orderId: o.id })} className="w-full text-left rounded-2xl border border-slate-100 p-4 hover:border-teal-300 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.id}</div>
                    <div className="text-xs text-slate-500">{o.items.length} items • {o.address?.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal-700">{money(o.total)}</div>
                    <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-[10px] mt-0.5">{o.status?.toUpperCase()}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                  {o.items.slice(0, 5).map((i: any) => <img key={i.productId} src={i.image} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
