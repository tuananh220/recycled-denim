'use client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormValues { name: string; email: string; subject: string; message: string }

export default function ContactPage() {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>();

  async function onSubmit(v: FormValues) {
    // TODO: wire to backend /contact endpoint or 3rd-party (Formspree, Resend)
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Message sent — we\'ll reply within 24h.');
    reset();
  }

  return (
    <div className="container py-16 grid lg:grid-cols-[1fr_360px] gap-12 max-w-5xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-denim-rust">Contact</p>
        <h1 className="font-serif text-5xl mt-3 mb-8">Get in touch.</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="mb-1.5 block">Name</Label><Input {...register('name', { required: true })} /></div>
            <div><Label className="mb-1.5 block">Email</Label><Input type="email" {...register('email', { required: true })} /></div>
          </div>
          <div><Label className="mb-1.5 block">Subject</Label><Input {...register('subject', { required: true })} /></div>
          <div><Label className="mb-1.5 block">Message</Label><Textarea rows={6} {...register('message', { required: true })} /></div>
          <Button size="lg" disabled={formState.isSubmitting}>{formState.isSubmitting ? 'Sending…' : 'Send message'}</Button>
        </form>
      </div>

      <aside className="lg:border-l lg:border-border lg:pl-12 space-y-8">
        <ContactRow icon={Mail}     label="Email"   value="hello@indigo.dev" />
        <ContactRow icon={Phone}    label="Phone"   value="+84 236 1234 567" />
        <ContactRow icon={MapPin}   label="Atelier" value={'42 Bach Dang St.\nDa Nang, Vietnam'} />

        <div className="pt-4 border-t border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Customer support</p>
          <p className="text-sm">Mon–Fri · 9am – 6pm ICT</p>
          <p className="text-sm text-muted-foreground mt-1">Response within 24 hours.</p>
        </div>
      </aside>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="h-5 w-5 text-denim-rust flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm mt-1 whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
}
