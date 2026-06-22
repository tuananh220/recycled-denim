import { PrismaClient, PostStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ECHOVE database…');

  // ---------- Users ----------
  const users = [
    { email: 'admin@echove.vn',     name: 'Admin ECHOVE',  password: 'Admin@123',  role: Role.ADMIN },
    { email: 'staff@echove.vn',     name: 'Nhân viên',      password: 'Staff@123',  role: Role.STAFF },
    { email: 'designer@echove.vn',  name: 'Nhà thiết kế',   password: 'Design@123', role: Role.DESIGNER },
    { email: 'warehouse@echove.vn', name: 'Kho',           password: 'Ware@123',   role: Role.WAREHOUSE },
    { email: 'customer@echove.vn',  name: 'Minh Anh',       password: 'Cust@123',   role: Role.CUSTOMER },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email, name: u.name, role: u.role, emailVerified: true,
        passwordHash: await bcrypt.hash(u.password, 10),
      },
    });
  }
  const admin = await prisma.user.findUnique({ where: { email: 'admin@echove.vn' } });

  // ---------- Categories (ECHOVE) ----------
  const cats = [
    { name: 'Túi',       slug: 'tui',       description: 'Túi xách & cross-body từ jean cũ tái chế.' },
    { name: 'Jacket',    slug: 'jacket',    description: 'Áo khoác denim patchwork độc bản.' },
    { name: 'Quần',      slug: 'quan',      description: 'Quần jean refurbished — không pair nào giống nhau.' },
    { name: 'Phụ kiện',  slug: 'phu-kien',  description: 'Mũ, dây lưng, ốp điện thoại từ vải denim thừa.' },
    { name: 'Custom',    slug: 'custom',    description: 'Sản phẩm thiết kế riêng theo yêu cầu khách hàng.' },
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const tuiCat = await prisma.category.findUnique({ where: { slug: 'tui' } });

  // ---------- 1 Sample product (Vietnamese) ----------
  // Just a starting point — admin can delete & add real products via UI.
  const sample = {
    slug: 'tui-tote-saigon-01',
    name: 'Tote Sài Gòn 01',
    description:
      'Túi tote crossbody crafted hoàn toàn thủ công từ ống quần jean Levi\'s 501 cũ. ' +
      'Mỗi chiếc là độc bản — vết phai, đường may sờn đều giữ nguyên câu chuyện của chiếc jean ban đầu. ' +
      'Lót vải bố không tẩy, dây da bò thật.',
    price: 480000, // 480.000 VNĐ
    compareAtPrice: 590000,
    sizes: ['Free'],
    colors: ['#1f3a5f', '#0f2540'],
    recycledPercent: 95, isFeatured: true,
    categoryId: tuiCat!.id,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200',
    ],
  };

  const { images, ...productData } = sample;
  const product = await prisma.product.upsert({
    where: { slug: sample.slug },
    update: {},
    create: {
      ...productData,
      images: { create: images.map((url, i) => ({ url, position: i, alt: sample.name })) },
    },
  });
  for (const size of sample.sizes) {
    for (const color of sample.colors) {
      await prisma.inventory.upsert({
        where: { productId_size_color: { productId: product.id, size, color } },
        update: {},
        create: {
          productId: product.id, size, color, quantity: 3, // mỗi variant 3 cái — 1-of-1 vibe
          sku: `${sample.slug}-${size}-${color.replace('#', '')}`.toUpperCase(),
        },
      });
    }
  }

  // ---------- Additional test products with inventory ----------
  const additionalProducts = [
    {
      slug: 'tui-echove-crossbody',
      name: 'Túi Echove',
      description: 'Túi đeo chéo vintage từ jean cũ Levi\'s.',
      price: 350000,
      compareAtPrice: 450000,
      sizes: ['Free'],
      colors: ['#1f3a5f', '#0f2540'],
      categoryId: tuiCat!.id,
      images: ['https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=1200'],
    },
    {
      slug: 'ao-khoac-denim-patchwork',
      name: 'Áo Khoác Patchwork',
      description: 'Áo khoác denim patchwork độc bản từ những chiếc jean khác nhau.',
      price: 850000,
      compareAtPrice: 1100000,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Blue'],
      categoryId: tuiCat!.id,
      images: ['https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200'],
    },
  ];

  for (const prodData of additionalProducts) {
    const { images, sizes, colors, ...rest } = prodData;
    const p = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {},
      create: {
        ...rest,
        images: { create: images.map((url, i) => ({ url, position: i })) },
        isActive: true,
      },
    });
    for (const size of sizes) {
      for (const color of colors) {
        await prisma.inventory.upsert({
          where: { productId_size_color: { productId: p.id, size, color } },
          update: {},
          create: {
            productId: p.id, size, color, quantity: 5,
            sku: `${prodData.slug}-${size}-${color}`.toUpperCase(),
          },
        });
      }
    }
  }

  // ---------- Coupons ----------
  await prisma.coupon.upsert({
    where: { code: 'CHAO10' },
    update: {},
    create: { code: 'CHAO10', type: 'PERCENT', value: 10, isActive: true },
  });
  await prisma.coupon.upsert({
    where: { code: 'TAISINH' },
    update: {},
    create: { code: 'TAISINH', type: 'FIXED', value: 100000, isActive: true },
  });

  // ---------- Banner ----------
  const existingBanner = await prisma.banner.findFirst({ where: { title: 'Jean cũ, chuyện mới.' } });
  if (!existingBanner) {
    await prisma.banner.create({
      data: {
        title: 'Jean cũ, chuyện mới.',
        subtitle: 'SS26 · 1-of-1 Drop — Mỗi sản phẩm là một bản thể duy nhất',
        imageUrl: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1920',
        ctaText: 'Khám phá ngay',
        ctaUrl: '/shop',
      },
    });
  }

  // ---------- Blog posts (Vietnamese) ----------
  const posts = [
    {
      slug: 'cau-chuyen-echove',
      title: 'Câu chuyện ECHOVE — Từ chiếc jean cũ đến hành trình tái sinh',
      excerpt: 'Vì sao chúng tôi tin rằng mỗi chiếc jean cũ đều xứng đáng có một cuộc đời thứ hai.',
      coverImageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1600',
      tags: ['Bền vững', 'Câu chuyện'],
      content: `# ECHOVE bắt đầu từ một chiếc jean

Một ngày năm 2024, founder của ECHOVE — Minh — dọn tủ quần áo và nhận ra mình có **8 chiếc jean** không còn mặc nữa. Một số đã rách, một số chỉ là "không vừa nữa", nhưng **không có chiếc nào đáng vứt đi**.

Đó là khoảnh khắc ECHOVE ra đời.

## Tên gọi

**ECHOVE** = *Echo* (tiếng vang phản hồi từ môi trường) + *Chove* (tiếng Bồ Đào Nha, nghĩa là "mưa" — gột rửa, tuần hoàn, tái sinh).

## Sứ mệnh

Chúng tôi tin rằng:

- Thời trang nhanh đã giết chết quá nhiều vải vóc.
- Mỗi chiếc jean cũ đều mang trong mình **một câu chuyện** — và câu chuyện đó xứng đáng được kể tiếp.
- Bền vững không phải là từ khóa marketing — đó là cách chúng ta sống.

## Cách chúng tôi làm

> "Chúng tôi không bán quần áo. Chúng tôi bán những câu chuyện được khâu lại."

Mỗi sản phẩm ECHOVE đều là **1-of-1** — không có cái thứ hai giống hệt. Mỗi đường may, mỗi vết phai đều giữ nguyên dấu vết của chiếc jean ban đầu.

Hành trình của bạn với ECHOVE bắt đầu từ đây.`,
    },
    {
      slug: 'gen-z-va-thoi-trang-ben-vung',
      title: 'Gen Z và thời trang bền vững — Khi cá tính gặp ý thức môi trường',
      excerpt: 'Tại sao thế hệ Gen Z tại Việt Nam đang dẫn đầu xu hướng upcycled fashion?',
      coverImageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600',
      tags: ['Gen Z', 'Xu hướng'],
      content: `# Gen Z định nghĩa lại "thời trang"

Khảo sát của McKinsey 2025 cho thấy: **73% Gen Z toàn cầu** sẵn sàng trả thêm 10-20% cho thời trang bền vững. Tại Việt Nam, con số này cũng đang tăng nhanh.

## Vì sao?

- **Cá tính**: không ai muốn mặc đồ giống y hệt người khác. Upcycled = độc bản.
- **Ý thức**: lớn lên cùng tin tức về biến đổi khí hậu, Gen Z hiểu rõ tác động của fast fashion.
- **Storytelling**: mỗi món đồ có câu chuyện riêng để chia sẻ trên social media.

## ECHOVE đứng ở đâu?

Chúng tôi tin rằng **bền vững không có nghĩa là nhàm chán**. ECHOVE kết hợp:

- Thiết kế Gen Z (oversized, patchwork, raw edges)
- Nguyên liệu 100% tái chế từ jean cũ
- Mỗi sản phẩm 1-of-1, không bao giờ sản xuất lại

> Cũ người, chất ta.`,
    },
    {
      slug: 'huong-dan-gui-jean-cu-cho-echove',
      title: 'Hướng dẫn gửi jean cũ cho ECHOVE — Nhận voucher 100.000₫',
      excerpt: 'Chương trình take-back: gửi jean cũ, nhận voucher, góp phần giảm rác thải dệt may.',
      coverImageUrl: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=1600',
      tags: ['Chương trình', 'Bền vững'],
      content: `# Đem jean cũ. Nhận voucher mới.

Mỗi chiếc jean bạn gửi đến ECHOVE sẽ:
- Được tái sinh thành sản phẩm 1-of-1 mới
- Đổi lại bạn nhận **voucher 100.000₫** (mã: \`TAISINH\`) cho đơn hàng tiếp theo

## Cách tham gia

1. **Gói gọn** jean cũ của bạn (bất kỳ thương hiệu, bất kỳ tình trạng — kể cả rách)
2. **Gửi về**: ECHOVE Atelier — Quận 2, TP. Hồ Chí Minh
   - Hoặc đem trực tiếp đến showroom (đặt lịch qua email)
3. **Nhận voucher** qua email trong 3-5 ngày làm việc

## Loại jean nào nhận?

- ✅ Mọi thương hiệu (Levi's, Uniqlo, local, no-brand…)
- ✅ Mọi tình trạng (sờn, rách, bạc màu — càng nhiều "câu chuyện" càng tốt)
- ✅ Tối thiểu 1 chiếc, không giới hạn tối đa

## Sau khi nhận

Đội ngũ ECHOVE sẽ:
1. Phân loại theo độ dày vải, màu, kích thước
2. Vẽ sketch lên giấy can để planning cut pattern
3. Cắt thủ công — không có 2 sản phẩm giống nhau
4. May tay tại Atelier Quận 2

Mỗi chiếc jean bạn gửi có thể trở thành: **1 túi tote**, **2 ốp điện thoại**, hoặc **1 phần của jacket patchwork**.

Cùng nhau, chúng ta sẽ giảm **1 tấn rác thải dệt may mỗi năm**. Bạn sẵn sàng chưa?`,
    },
  ];

  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p, status: PostStatus.PUBLISHED, publishedAt: new Date(), authorId: admin!.id,
      },
    });
  }

  // ---------- FAQ (Vietnamese) ----------
  const faqs = [
    { category: 'Vận chuyển', position: 1, question: 'Thời gian giao hàng bao lâu?',
      answer: 'Nội thành TP.HCM & Hà Nội: **1-2 ngày**. Tỉnh khác: **3-5 ngày**. **Miễn phí ship** cho đơn từ 500.000₫.' },
    { category: 'Vận chuyển', position: 2, question: 'ECHOVE có ship quốc tế không?',
      answer: 'Hiện tại chúng tôi chỉ ship nội địa Việt Nam. Quốc tế sẽ mở vào Q3/2026.' },

    { category: 'Đổi trả', position: 1, question: 'Chính sách đổi trả như thế nào?',
      answer: 'Bạn có **14 ngày** để đổi/trả sản phẩm chưa qua sử dụng, còn nguyên tag. Vì mỗi sản phẩm là 1-of-1, đổi sản phẩm khác phải cùng giá trị.' },
    { category: 'Đổi trả', position: 2, question: 'Sản phẩm sản xuất theo yêu cầu (Custom) có đổi được không?',
      answer: 'Sản phẩm Custom **không hỗ trợ đổi trả** vì được thiết kế riêng. Vui lòng xác nhận kỹ trước khi đặt.' },

    { category: 'Bền vững', position: 1, question: 'Nguyên liệu ECHOVE từ đâu?',
      answer: '**80-95%** từ jean cũ thu gom qua chương trình **take-back**, **5-20%** từ vải bố/da bò non-leather để tăng độ bền. Không dùng hóa chất tẩy.' },
    { category: 'Bền vững', position: 2, question: 'Gửi jean cũ cho ECHOVE thế nào?',
      answer: 'Gửi đến địa chỉ ECHOVE Atelier - Quận 2, TP.HCM. Nhận **voucher 100.000₫** (mã `TAISINH`) cho đơn tiếp theo. Xem chi tiết tại trang [Câu chuyện ECHOVE](/about).' },

    { category: 'AI Try-On', position: 1, question: 'Ảnh tôi upload có an toàn không?',
      answer: 'Ảnh bạn upload được **mã hóa** và **tự động xóa sau 30 ngày**. Chúng tôi không bao giờ chia sẻ với bên thứ ba.' },
    { category: 'AI Try-On', position: 2, question: 'Tại sao ảnh AI nhìn không hoàn hảo?',
      answer: 'Để ảnh đẹp nhất: chụp **đứng thẳng**, **ánh sáng tốt**, **nền sạch**, mặc đồ form sát. Mục đích chính là tham khảo dáng/màu, không phải ảnh marketing.' },

    { category: 'Sản phẩm', position: 1, question: 'Vì sao mỗi sản phẩm chỉ có 1 cái?',
      answer: 'Vì chúng tôi sản xuất từ jean cũ — mỗi chiếc jean có **vết phai, đường may, kích thước khác nhau**. Cắt 2 cái giống hệt là **không thể**. Đó cũng là điều khiến mỗi sản phẩm ECHOVE trở nên độc bản.' },
    { category: 'Sản phẩm', position: 2, question: 'Tôi có thể đặt thiết kế riêng không?',
      answer: 'Có! Vào trang **[Design Studio](/design)** — kéo thả patch, vẽ chữ, chọn màu. Sau khi submit, đội designer sẽ phản hồi trong 24h với bản sketch và báo giá.' },
  ];

  for (const f of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!existing) await prisma.faq.create({ data: f });
  }

  // ---------- Testimonials (Vietnamese) ----------
  const testimonials = [
    { authorName: 'Linh Đan', authorRole: 'Stylist · TP.HCM', position: 1, rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      quote: 'Có chiếc túi ECHOVE Tote Sài Gòn được nửa năm rồi, lúc nào mang ra đường cũng có người hỏi mua. Cảm giác sở hữu 1-of-1 thật sự rất khác.' },
    { authorName: 'Nam Hoàng', authorRole: 'Nhiếp ảnh · Hà Nội', position: 2, rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      quote: 'Mình tự thiết kế jacket qua Design Studio, designer ECHOVE còn refine lại đẹp hơn ý mình tưởng. Đúng nghĩa "designed by you, crafted by us".' },
    { authorName: 'Mai Phương', authorRole: 'Sinh viên · TP.HCM', position: 3, rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      quote: 'Gửi 3 chiếc jean cũ của ba, ba tháng sau nhận về một chiếc tote và 2 ốp điện thoại. Cảm xúc khó tả — đồ của ba vẫn còn ở bên mình.' },
  ];
  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { authorName: t.authorName } });
    if (!existing) await prisma.testimonial.create({ data: t });
  }

  console.log('✅ Seed complete — ECHOVE ready');
  console.log(`   • ${users.length} users seeded`);
  console.log(`   • ${cats.length} categories: ${cats.map(c => c.name).join(', ')}`);
  console.log(`   • 1 sample product: ${sample.name} (xóa được qua admin)`);
  console.log(`   • ${posts.length} blog posts, ${faqs.length} FAQs, ${testimonials.length} testimonials`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
