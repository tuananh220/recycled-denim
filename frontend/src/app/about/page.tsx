import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Recycle, Droplets, Wind, Heart } from 'lucide-react';

export const metadata = {
  title: 'Câu chuyện ECHOVE',
  description: 'ECHOVE — Thương hiệu thời trang tuần hoàn tiên phong tại Việt Nam, biến jean cũ thành sản phẩm độc bản.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=2000"
          alt="" fill priority sizes="100vw" className="object-cover"
        />
        <div className="absolute inset-0 bg-indigo-950/40" />
        <div className="relative container h-full flex flex-col justify-end pb-16 text-denim-ecru">
          <p className="text-xs uppercase tracking-widest opacity-80">Câu chuyện của chúng tôi</p>
          <h1 className="font-sans text-5xl md:text-7xl mt-4 max-w-2xl">
            Chúng tôi không sản xuất denim mới.<br />
            <span className="font-light">Chúng tôi tái sinh nó.</span>
          </h1>
        </div>
      </section>

      {/* Manifesto */}
      <section className="container py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-denim-rust">Tuyên ngôn</p>
          <h2 className="font-sans text-4xl md:text-5xl mt-3">
            Bền vững<br />không phải xu hướng.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            ECHOVE ra đời năm 2024 từ một câu hỏi đơn giản:
            <em className="text-foreground"> "Vì sao chúng ta phải vứt đi những chiếc jean còn nguyên 80% chất lượng,
            chỉ vì không vừa nữa?"</em>
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Mỗi năm Việt Nam thải ra <strong className="text-foreground">hơn 200.000 tấn rác thải dệt may</strong>,
            phần lớn là quần áo còn dùng được. ECHOVE thu gom jean cũ từ chương trình take-back,
            tái sinh thành <strong className="text-foreground">phụ kiện và trang phục độc bản (1-of-1)</strong> —
            mỗi sản phẩm là duy nhất, không bộ sưu tập nào lặp lại.
          </p>
        </div>
        <div className="relative aspect-[4/5]">
          <Image src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200" alt="" fill className="object-cover" sizes="50vw" />
        </div>
      </section>

      {/* Impact metrics */}
      <section className="bg-indigo-900 text-denim-ecru py-24">
        <div className="container">
          <h2 className="font-sans text-4xl md:text-5xl text-center">Tác động của chúng tôi.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <Impact icon={Recycle} value="1.2 tấn" label="Jean cũ tái chế mỗi năm" />
            <Impact icon={Droplets} value="92%" label="Tiết kiệm nước so với denim mới" />
            <Impact icon={Wind} value="0.4 kg" label="CO₂ / sản phẩm (so với 33kg TB)" />
            <Impact icon={Heart} value="500+" label="Khách hàng Gen Z tin tưởng" />
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container py-24">
        <p className="text-xs uppercase tracking-widest text-denim-rust">Quy trình</p>
        <h2 className="font-sans text-4xl md:text-5xl mt-3 max-w-2xl">
          Từ jean cũ của bạn<br />đến chiếc tiếp theo bạn yêu.
        </h2>
        <div className="grid md:grid-cols-5 gap-6 mt-12">
          {[
            { n: '01', t: 'Thu gom',    d: 'Chương trình take-back tại Hà Nội & TP.HCM gom jean cũ — mọi thương hiệu.' },
            { n: '02', t: 'Phân loại',  d: 'Phân loại theo độ dày vải, màu sắc, kích thước. Loại bỏ phần không dùng được.' },
            { n: '03', t: 'Sketch',     d: 'Designer vẽ pattern lên giấy can, tính toán cut tối ưu cho từng chiếc jean.' },
            { n: '04', t: 'Cắt may',    d: 'Cắt thủ công tại Atelier ECHOVE — Quận 2 TP.HCM. May tay từng đường kim.' },
            { n: '05', t: 'Hoàn thiện', d: 'Kiểm tra chất lượng, đóng gói trong túi vải bố tái sử dụng được.' },
          ].map((s) => (
            <div key={s.n} className="border-t-2 border-indigo-900 pt-4">
              <p className="font-mono text-xs text-denim-rust">{s.n}</p>
              <p className="font-medium mt-1">{s.t}</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24 text-center">
        <h2 className="font-sans text-4xl">Đem jean cũ. Nhận voucher mới.</h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Gửi jean cũ của bạn đến ECHOVE — chúng tôi tặng voucher <strong>100.000 VNĐ</strong> cho đơn hàng tiếp theo.
        </p>
        <Button asChild size="lg" className="mt-8"><Link href="/contact">Tham gia ngay</Link></Button>
      </section>
    </>
  );
}

function Impact({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="text-center">
      <Icon className="h-6 w-6 mx-auto opacity-80" />
      <p className="font-sans text-5xl mt-4">{value}</p>
      <p className="text-xs uppercase tracking-widest mt-2 opacity-70 max-w-[180px] mx-auto">{label}</p>
    </div>
  );
}
