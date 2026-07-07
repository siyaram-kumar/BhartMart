'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { upgradeToSeller } from '@/lib/seller';

export function BecomeSellerModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone?: () => void }) {
  const { user, refreshProfile } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!open) { setBusinessName(''); setGstNumber(''); setCity(''); setState(''); setPincode(''); } }, [open]);

  const submit = async () => {
    if (!user) return toast.error('Please sign in first');
    if (!businessName) return toast.error('Business name is required');
    setSaving(true);
    try {
      await upgradeToSeller(user.uid, { businessName, gstNumber, city, state, pincode });
      await refreshProfile();
      toast.success('Welcome to BharatMART Sellers!');
      onDone?.();
      onClose();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to upgrade');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <div className="hero-gradient p-6 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur grid place-items-center mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">Become a Seller</DialogTitle>
          <p className="text-white/80 text-sm mt-1">Start selling wholesale on BharatMART</p>
        </div>
        <div className="p-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Business Name *</label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Delhi Grains Traders" className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">GST Number (optional)</label>
            <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" className="mt-1 h-11 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Delhi" className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">State</label>
              <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Delhi" className="mt-1 h-11 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">PIN Code</label>
            <Input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="110001" className="mt-1 h-11 rounded-xl" />
          </div>
          <Button disabled={saving} onClick={submit} className="w-full h-12 rounded-full bg-teal-700 hover:bg-teal-800 font-semibold">
            {saving ? 'Setting up...' : 'Start Selling'}
          </Button>
          <p className="text-[11px] text-slate-400 text-center">By continuing you accept BharatMART seller terms.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
