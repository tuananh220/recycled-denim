import { PrismaClient, PostStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding INDIGO database…');

  // ---------- Users ----------
  const users = [
    { email: 'admin@indigo.dev', name: 'Admin', password: 'Admin@123', role: Role.ADMIN },
    { email: 'staff@indigo.dev', name: 'Staff', password: 'Staff@123', role: Role.STAFF },
    { email: 'designer@indigo.dev', name: 'Designer', password: 'Design@123', role: Role.DESIGNER },
    { email: 'warehouse@indigo.dev', name: 'Warehouse', password: 'Ware@123', role: Role.WAREHOUSE },
    { email: 'customer@indigo.dev', name: 'Jane Customer', password: 'Cust@123', role: Role.CUSTOMER },
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
  const admin = await prisma.user.findUnique({ where: { email: 'admin@indigo.dev' } });

  // ---------- Categories ----------
  const cats = [
    { name: 'Jeans', slug: 'jeans' },
    { name: 'Jackets', slug: 'jackets' },
    { name: 'Shirts', slug: 'shirts' },
    { name: 'Skirts', slug: 'skirts' },
    { name: 'Accessories', slug: 'accessories' },
  ];
  for (const c of cats) await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  const jeans = await prisma.category.findUnique({ where: { slug: 'jeans' } });
  const jackets = await prisma.category.findUnique({ where: { slug: 'jackets' } });

  // ---------- Products ----------
  const sample = [
    {
      slug: 'reclaim-straight-jean',
      name: 'Reclaim Straight Jean',
      description: 'Crafted from 92% post-consumer recycled denim. A timeless straight cut with a slight taper at the ankle.',
      price: 128, compareAtPrice: 158,
      sizes: ['XS','S','M','L','XL'],
      colors: ['#1f3a5f','#0f2540','#3a3a3a'],
      recycledPercent: 92, isFeatured: true,
      categoryId: jeans!.id,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200',
        'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1200',
      ],
    },
    {
      slug: 'horizon-oversized-jacket',
      name: 'Horizon Oversized Jacket',
      description: 'Heavyweight recycled denim trucker, oversized fit, raw selvedge hem.',
      price: 186, compareAtPrice: null,
      sizes: ['S','M','L','XL'],
      colors: ['#3b5b80','#1a2c3f'],
      recycledPercent: 85, isFeatured: true,
      categoryId: jackets!.id,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200',
      ],
    },
    {
      slug: 'tide-wide-leg',
      name: 'Tide Wide-Leg',
      description: 'Fluid wide-leg silhouette in soft recycled indigo. Hits high on the waist.',
      price: 142,
      sizes: ['XS','S','M','L'],
      colors: ['#2d4a6b','#0e1f33'],
      recycledPercent: 90,
      categoryId: jeans!.id,
      images: ['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=1200'],
    },
  ];

  for (const p of sample) {
    const { images, ...data } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, images: { create: images.map((url, i) => ({ url, position: i, alt: p.name })) } },
    });
    for (const size of p.sizes) {
      for (const color of p.colors) {
        await prisma.inventory.upsert({
          where: { productId_size_color: { productId: product.id, size, color } },
          update: {},
          create: {
            productId: product.id, size, color, quantity: 25,
            sku: `${p.slug}-${size}-${color.replace('#','')}`.toUpperCase(),
          },
        });
      }
    }
  }

  // ---------- Coupon & Banner ----------
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: { code: 'WELCOME10', type: 'PERCENT', value: 10, isActive: true },
  });

  const existingBanner = await prisma.banner.findFirst({ where: { title: 'Worn. Reborn.' } });
  if (!existingBanner) {
    await prisma.banner.create({
      data: {
        title: 'Worn. Reborn.',
        subtitle: 'Spring drop — 92% recycled denim',
        imageUrl: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1920',
        ctaText: 'Shop the drop',
        ctaUrl: '/shop',
      },
    });
  }

  // ---------- Blog posts ----------
  const posts = [
    {
      slug: 'the-second-life-of-denim',
      title: 'The Second Life of Denim',
      excerpt: 'How we transform 12 tonnes of discarded jeans every month into our signature recycled denim.',
      coverImageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1600',
      tags: ['Sustainability', 'Craft'],
      content: `# The Second Life of Denim

Every pair you wear started as someone else's. We collect post-consumer denim from take-back programs across Asia and Europe, shred it into fibres, and reweave it with a touch of organic cotton for strength.

## Why recycled?

A single new pair of jeans costs **7,500 litres of water** to make. Ours uses **92% less** — because the fibre already exists.

## Our process

1. Collect denim through partner take-back stations
2. Mechanical shredding (no harsh chemicals)
3. Spin into yarn with 8% organic cotton binder
4. Dye with natural indigo from fermented Indigofera leaves
5. Weave on heritage shuttle looms

We're proud of it. Wear it forward.`,
    },
    {
      slug: 'inside-the-ai-fitting-room',
      title: 'Inside the AI fitting room',
      excerpt: 'Why we built a virtual try-on — and how it cuts returns by 38%.',
      coverImageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600',
      tags: ['Technology', 'AI'],
      content: `# Inside the AI fitting room

Fast fashion returns produce 5 billion lbs of landfill waste a year. We thought there had to be a better way.

Our virtual try-on uses diffusion-based garment transfer to render exactly how a piece would sit on **your** body — not a model's.

The results: 38% fewer returns in our pilot cohort, and customers report feeling **more confident** at checkout.`,
    },
    {
      slug: 'designer-spotlight-mei-l',
      title: 'Designer spotlight — Mei L.',
      excerpt: 'Meet the designer behind the SS26 Reborn capsule.',
      coverImageUrl: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1600',
      tags: ['Stories', 'Designer'],
      content: `# Designer spotlight: Mei L.

Mei joined INDIGO in 2024 after a decade at heritage Japanese denim houses. Her SS26 capsule explores **subtractive design** — removing instead of adding.

> "True luxury today is restraint. We don't need more clothes — we need better ones, made from what already exists."

— Mei L.`,
    },
  ];

  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: admin!.id,
      },
    });
  }

  // ---------- FAQ ----------
  const faqs = [
    { category: 'Shipping', position: 1, question: 'How long does shipping take?',
      answer: 'Standard shipping is **3-7 business days** within the US, **7-14 days** internationally. Free on orders over $200.' },
    { category: 'Shipping', position: 2, question: 'Do you ship worldwide?',
      answer: 'Yes — we ship to 60+ countries. Duties and taxes are calculated at checkout for transparency.' },
    { category: 'Returns', position: 1, question: 'What is your return policy?',
      answer: 'You have **60 days** from delivery to return unworn items for a full refund. Free return labels for US orders.' },
    { category: 'Returns', position: 2, question: 'Can I exchange for a different size?',
      answer: 'Absolutely. Initiate an exchange from your order page and we\'ll cover the shipping both ways.' },
    { category: 'Sustainability', position: 1, question: 'How is your denim "recycled"?',
      answer: 'Each garment is woven from **80-92%** post-consumer denim that we collect from take-back stations, mechanically shred, and re-spin into yarn.' },
    { category: 'Sustainability', position: 2, question: 'Do you offer a take-back program?',
      answer: 'Yes! Send any old jeans (any brand) back to us in any INDIGO order envelope and we\'ll credit your account $20.' },
    { category: 'AI Try-On', position: 1, question: 'Is my photo stored?',
      answer: 'Your photo is encrypted at rest and **automatically deleted after 30 days**. We never share it with third parties.' },
    { category: 'AI Try-On', position: 2, question: 'Why doesn\'t my try-on look perfect?',
      answer: 'Best results come from a well-lit, front-facing photo with a plain background, wearing form-fitting clothing.' },
  ];
  for (const f of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!existing) await prisma.faq.create({ data: f });
  }

  // ---------- Testimonials ----------
  const testimonials = [
    { authorName: 'Aisha Patel', authorRole: 'Stylist · NYC', position: 1, rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      quote: 'The Reclaim Straight is the only jean I\'ve worn for a year straight. They hold their shape and the colour deepens beautifully.' },
    { authorName: 'Marcus Yu', authorRole: 'Photographer · Tokyo', position: 2, rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      quote: 'Tried 6 sizes virtually before buying. AI nailed the fit on the first try. Saved me three returns.' },
    { authorName: 'Léa Martin', authorRole: 'Architect · Paris', position: 3, rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      quote: 'I love that my jeans used to be someone else\'s. The story makes them mine in a different way.' },
  ];
  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { authorName: t.authorName } });
    if (!existing) await prisma.testimonial.create({ data: t });
  }

  console.log('✅ Seed complete');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
