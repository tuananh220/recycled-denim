'use client';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Type, Image as ImageIcon, Trash2, Save, Send, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export function DesignEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('My recycled denim');
  const [color, setColor] = useState('#1f3a5f');

  useEffect(() => {
    let isMounted = true;
    let canvas: any;

    (async () => {
      // Import only the browser build of fabric to avoid pulling jsdom/canvas
      const mod: any = await import('fabric/dist/fabric.min.js');
      const fabric = mod.fabric || mod.default?.fabric || mod.default || mod;
      if (!isMounted || !canvasRef.current) return;

      canvas = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 720,
        backgroundColor: color,
        preserveObjectStacking: true,
      });
      fabricRef.current = canvas;

      // Garment background image
      fabric.Image.fromURL(
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
        (img: any) => {
          img.scaleToWidth(560);
          img.set({ left: 20, top: 20, selectable: false, evented: false, opacity: 0.95 });
          canvas.add(img);
          canvas.sendToBack(img);
        },
        { crossOrigin: 'anonymous' },
      );
    })();

    return () => {
      isMounted = false;
      try { fabricRef.current?.dispose(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getFabric() {
    const mod: any = await import('fabric/dist/fabric.min.js');
    return mod.fabric || mod.default?.fabric || mod.default || mod;
  }

  function applyBg() {
    fabricRef.current?.setBackgroundColor(color, () => fabricRef.current?.renderAll());
  }

  async function addText() {
    const fabric = await getFabric();
    const text = new fabric.IText('YOUR TEXT', {
      left: 220, top: 320, fill: '#f5efe6', fontFamily: 'serif', fontSize: 36,
    });
    fabricRef.current?.add(text).setActiveObject(text);
  }

  async function addPatch(url: string) {
    const fabric = await getFabric();
    fabric.Image.fromURL(
      url,
      (img: any) => {
        img.scaleToWidth(120);
        img.set({ left: 240, top: 360 });
        fabricRef.current?.add(img).setActiveObject(img);
      },
      { crossOrigin: 'anonymous' },
    );
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addPatch(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeActive() {
    const c = fabricRef.current;
    const obj = c?.getActiveObject();
    if (obj) { c.remove(obj); c.discardActiveObject().renderAll(); }
  }

  async function save(submit = false) {
    const c = fabricRef.current; if (!c) return;
    const designJson = c.toJSON();
    const previewUrl = c.toDataURL({ format: 'png', quality: 0.8 });
    try {
      const { data } = await api.post('/designs', { title, designJson, previewUrl });
      if (submit) await api.patch(`/designs/${data.id}/submit`);
      toast.success(submit ? 'Submitted for review' : 'Saved');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Save failed');
    }
  }

  const patches = [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
  ];

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8">
      {/* Tools */}
      <aside className="space-y-6">
        <div>
          <Label className="mb-1.5 block">Design title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block flex items-center gap-2"><Palette className="h-3 w-3" /> Background</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12" />
            <Button variant="outline" size="sm" onClick={applyBg}>Apply</Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest">Add elements</p>
          <Button variant="outline" className="w-full" onClick={addText}><Type className="h-4 w-4" /> Text</Button>
          <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
            <ImageIcon className="h-4 w-4" /> Upload patch
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest mb-2">Patches library</p>
          <div className="grid grid-cols-3 gap-2">
            {patches.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <button key={src} onClick={() => addPatch(src)} className="aspect-square overflow-hidden border border-border">
                <img src={src} alt="patch" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={removeActive}><Trash2 className="h-4 w-4" /> Delete selected</Button>
        <div className="border-t border-border pt-4 space-y-2">
          <Button className="w-full" onClick={() => save(false)}><Save className="h-4 w-4" /> Save draft</Button>
          <Button className="w-full" variant="outline" onClick={() => save(true)}><Send className="h-4 w-4" /> Submit for review</Button>
        </div>
      </aside>

      {/* Canvas */}
      <div className="overflow-auto bg-muted p-4 flex justify-center">
        <canvas ref={canvasRef} className="shadow-lg" />
      </div>
    </div>
  );
}
