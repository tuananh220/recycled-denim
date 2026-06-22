const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📊 Inventory Debug\n');

  const inventory = await prisma.inventory.findMany({
    include: { product: { select: { name: true } } },
  });

  console.log(`Total inventory items: ${inventory.length}\n`);
  inventory.forEach((item, i) => {
    console.log(`${i+1}. Product: ${item.product.name}`);
    console.log(`   ID: ${item.id}`);
    console.log(`   Size: "${item.size}" | Color: "${item.color}"`);
    console.log(`   Quantity: ${item.quantity}`);
    console.log(`   SKU: ${item.sku}`);
    console.log();
  });

  const cartItems = await prisma.cartItem.findMany({
    include: { product: { select: { name: true, slug: true } }, cart: { select: { user: { select: { email: true } } } } },
  });

  console.log(`\nTotal cart items: ${cartItems.length}\n`);
  cartItems.forEach((item, i) => {
    console.log(`${i+1}. User: ${item.cart.user.email}`);
    console.log(`   Product: ${item.product.name}`);
    console.log(`   Size: "${item.size}" | Color: "${item.color}"`);
    console.log(`   Quantity: ${item.quantity}`);
    console.log();
  });
}

main().finally(() => prisma.$disconnect());
