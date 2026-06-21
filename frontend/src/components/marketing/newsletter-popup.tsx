'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Mail, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STORAGE_KEY = 'echove.newsletterShown';
const DISMISS_DAYS = 7;

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const last = Number(stored);
      if (Date.now() - last < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }
    const timer = setTimeout(() => setOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    navigator.clipboard?.writeText('CHAO10').catch(() => {});
    setSubmitted(true);
    toast.success('Chào mừng đến ECHOVE — mã CHAO10 đã được copy');
    setTimeout(close, 3500);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-3xl p-0 grid md:grid-cols-2 gap-0 overflow-hidden">
        <div className="relative hidden md:block aspect-square">
          <Image
            src="https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1000"
            alt="ECHOVE" fill className="object-cover" sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/70 to-transparent" />
          <p className="absolute bottom-6 left-6 text-denim-ecru text-xs uppercase tracking-widest">SS26 · 1-of-1 Drop</p>
        </div>

        <div className="p-10 flex flex-col justify-center">
          {!submitted ? (
            <>
              <Sparkles className="h-6 w-6 text-denim-rust mb-4" />
              <h2 className="font-sans text-4xl leading-tight">
                Giảm 10%<br />
                <span className="font-light">cho lần đầu mua.</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-3 mb-6">
                Đăng ký nhận thông báo drop mới và chương trình đổi jean cũ lấy voucher.
              </p>
              <form onSubmit={onSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email" placeholder="email@cua-ban.com" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">Nhận giảm 10%</Button>
              </form>
              <button onClick={close} className="text-xs text-muted-foreground mt-4 underline-offset-4 hover:underline">
                Không, cảm ơn
              </button>
            </>
          ) : (
            <div className="text-center animate-fade-up">
              <div className="text-5xl">🎉</div>
              <h2 className="font-sans text-3xl mt-4">Chào mừng đến ECHOVE!</h2>
              <p className="text-sm text-muted-foreground mt-2">Mã giảm giá của bạn:</p>
              <p className="font-mono text-2xl tracking-widest mt-3 px-4 py-3 border-2 border-dashed border-indigo-900 inline-block">
                CHAO10
              </p>
              <p className="text-xs text-muted-foreground mt-3">(đã copy vào clipboard)</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
