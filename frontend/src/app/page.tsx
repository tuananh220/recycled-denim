import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Recycle, Sparkles, Palette, Leaf, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrustBadges } from '@/components/marketing/trust-badges';
import { Testimonials } from '@/components/marketing/testimonials';
import { InstagramFeed } from '@/components/marketing/instagram-feed';
import { TvcVideo } from '@/components/marketing/tvc-video';
import { BRAND } from '@/lib/brand';

async function getFeatured() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?pageSize=4`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

export default async function Home() {
  const featured = await getFeatured();

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0 denim-grain" />
        <Image
          src="https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=2000&q=80"
          alt="ECHOVE recycled denim" fill priority sizes="100vw"
          className="object-cover opacity-60 mix-blend-overlay"
        />
        <div className="relative container h-full flex flex-col justify-end pb-20 text-denim-ecru">
          <Badge className="border-denim-ecru text-denim-ecru w-fit mb-6">SS26 · 1-OF-1 DROP</Badge>
          <h1 className="text-6xl md:text-8xl font-serif leading-[0.95]">
            Jean cũ,<br />
            <span className="italic font-light">chuyện mới.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-denim-ecru/80">
            {BRAND.mission}
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Button asChild size="lg" variant="outline" className="border-denim-ecru text-denim-ecru hover:bg-denim-ecru hover:text-indigo-900">
              <Link href="/shop">Khám phá bộ sưu tập <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-denim-ecru hover:bg-white/10">
              <Link href="#about">Câu chuyện ECHOVE</Link>
            </Button>
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* ============ ABOUT US (Main focus) ============ */}
      <section id="about" className="container py-24 lg:py-32">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-center">
          {/* Left — text */}
          <div>
            <p className="text-xs uppercase tracking-widest text-denim-rust">About ECHOVE</p>
            <h2 className="font-serif text-5xl md:text-6xl mt-4 leading-[1.05]">
              Mỗi chiếc jean<br />
              <span className="italic font-light">là một bản thể duy nhất.</span>
            </h2>
            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                ECHOVE — kết hợp giữa <em className="text-foreground">Echo</em> (tiếng vang phản hồi từ môi trường) và <em className="text-foreground">Chove</em> (tiếng mưa trong tiếng Bồ Đào Nha) —
                ra đời từ niềm tin rằng <strong className="text-foreground">mỗi chiếc jean cũ đều có một câu chuyện</strong> đáng được kể lại.
              </p>
              <p>
                Chúng tôi thu gom denim đã qua sử dụng, tái sinh thành phụ kiện và trang phục độc bản
                — không bộ sưu tập nào lặp lại. Mỗi thiết kế đều mang trong mình lịch sử của người chủ cũ,
                cộng với tinh thần Gen Z hiện đại.
              </p>
              <p className="font-serif text-2xl italic text-foreground/90 pt-2">
                "Cũ người, chất ta."
              </p>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-border">
              <MiniStat value="100%" label="Tái chế" />
              <MiniStat value="1-of-1" label="Mỗi sản phẩm" />
              <MiniStat value="Gen Z" label="HN & HCM" />
            </div>

            <div className="mt-10 flex gap-3">
              <Button asChild><Link href="/about">Tìm hiểu thêm</Link></Button>
              <Button asChild variant="outline"><Link href="/stories">Đọc câu chuyện</Link></Button>
            </div>
          </div>

          {/* Right — TVC Video */}
          <div className="space-y-3">
            <TvcVideo caption="ECHOVE — TVC 2026" />
            <p className="text-xs text-muted-foreground text-center italic">
              "Jean cũ, chuyện mới." — Hành trình tái sinh denim của ECHOVE.
            </p>
          </div>
        </div>
      </section>

      {/* ============ PILLARS ============ */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container py-24 grid md:grid-cols-3 gap-12">
          {[
            { icon: Recycle, title: 'Kinh tế tuần hoàn', desc: 'Thu gom denim cũ — tái sinh thành phụ kiện và trang phục độc bản, không bộ sưu tập nào lặp lại.' },
            { icon: Sparkles, title: 'AI Virtual Try-On',  desc: 'Thử trực tiếp món đồ qua ảnh của bạn — không cần phòng thay đồ, không lo size sai.' },
            { icon: Palette,  title: 'Tự thiết kế',         desc: 'Studio kéo-thả trên trình duyệt: thêm patch, vẽ, in chữ — designer ECHOVE sẽ may tay riêng cho bạn.' },
          ].map((p) => (
            <div key={p.title} className="animate-fade-up">
              <p.icon className="h-7 w-7 text-denim-rust" />
              <h3 className="mt-4 text-2xl font-serif">{p.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="container py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-denim-rust">Mới về</p>
            <h2 className="text-4xl md:text-5xl mt-2 font-serif">Bộ sưu tập nổi bật</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-widest hover:text-denim-rust">Xem tất cả →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {featured.length === 0 && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer aspect-[3/4]" />
          ))}
          {featured.slice(0, 4).map((p: any) => (
            <Link key={p.id} href={`/shop/${p.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                  src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'}
                  alt={p.name} fill sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-background/80 backdrop-blur px-2 py-1">
                  1-of-1
                </span>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="font-medium">{Number(p.price).toLocaleString('vi-VN')}₫</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Testimonials />

      {/* ============ CTA BAND ============ */}
      <section className="bg-indigo-900 text-denim-ecru py-24">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Leaf className="h-6 w-6 mb-4 text-denim-ecru/80" />
            <h2 className="font-serif text-5xl leading-tight">
              Đem jean cũ cho ECHOVE.<br />
              <span className="italic font-light">Nhận voucher tái sinh.</span>
            </h2>
            <p className="mt-4 text-denim-ecru/70 max-w-md">
              Gửi quần jean cũ của bạn (bất kỳ thương hiệu) đến ECHOVE — bạn sẽ nhận 100.000₫ voucher
              + một câu chuyện mới cho chiếc jean ấy.
            </p>
            <Button asChild size="lg" variant="outline" className="mt-8 border-denim-ecru text-denim-ecru hover:bg-denim-ecru hover:text-indigo-900">
              <Link href="/contact">Tham gia chương trình</Link>
            </Button>
          </div>
          <div className="relative aspect-square">
            <Image src="https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1000"
              alt="ECHOVE take-back program" fill className="object-cover" sizes="(max-width:768px) 100vw, 40vw" />
          </div>
        </div>
      </section>

      {/* ============ LOCATION ============ */}
      <section className="container py-20 text-center">
        <MapPin className="h-5 w-5 mx-auto text-denim-rust" />
        <p className="text-xs uppercase tracking-widest text-denim-rust mt-3">Atelier</p>
        <h2 className="font-serif text-3xl md:text-4xl mt-3">{BRAND.address}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{BRAND.audience} · Đặt lịch tham quan studio: {BRAND.email}</p>
      </section>

      <InstagramFeed />
    </>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl">{value}</p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
