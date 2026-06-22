const API_URL = 'http://localhost:4000/api';

const adminUser = { email: 'admin@echove.vn', password: 'Admin@123' };
const customerEmail = `customer-${Date.now()}@test.com`;

async function test() {
  console.log('✨ Testing Fixed Admin Product Creation\n');

  try {
    // Admin login
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminUser),
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.accessToken;

    // Get category
    const catRes = await fetch(`${API_URL}/categories`);
    const cats = await catRes.json();
    const tuiCat = cats.find(c => c.slug === 'tui');

    // Admin creates product with inventory quantity
    console.log('1️⃣  Admin creating product with inventory...');
    const createRes = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Túi Admin Fix Test',
        slug: `tui-fix-${Date.now()}`,
        description: 'Product with auto inventory',
        price: 300000,
        sizes: ['Free'],
        colors: ['#FF0000', '#00FF00'],
        categoryId: tuiCat.id,
        initialInventoryQty: 10,
      }),
    });
    const product = await createRes.json();
    console.log(`Status: ${createRes.status}`);
    console.log(`Product: ${product.name}\n`);

    // Check inventory
    console.log('2️⃣  Checking inventory...');
    const invRes = await fetch(`${API_URL}/inventory/product/${product.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const inventory = await invRes.json();
    console.log(`Inventory items: ${Array.isArray(inventory) ? inventory.length : 0}`);
    if (Array.isArray(inventory) && inventory.length > 0) {
      console.log(`✅ Inventory created automatically:`);
      inventory.forEach((inv, i) => {
        console.log(`   ${i+1}. Size: ${inv.size} | Color: ${inv.color} | Qty: ${inv.quantity}`);
      });
    }
    console.log();

    // Customer checkout test
    console.log('3️⃣  Customer registration...');
    const custRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: 'Test123456!',
        name: 'Test Customer',
      }),
    });
    const custData = await custRes.json();
    const custToken = custData.accessToken;
    console.log(`✅ Customer registered\n`);

    // Add to cart
    console.log('4️⃣  Adding admin product to cart...');
    const addRes = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        productId: product.id,
        size: 'Free',
        color: '#FF0000',
        quantity: 1,
      }),
    });
    console.log(`Status: ${addRes.status}`);
    console.log(`✅ Added to cart\n`);

    // Checkout
    console.log('5️⃣  Attempting checkout...');
    const checkoutRes = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'Test',
          phone: '0901234567',
          line1: '123 Test',
          city: 'HCM',
          district: 'Q1',
          ward: 'P1',
          postalCode: '70000',
          country: 'Vietnam',
        },
        paymentProvider: 'COD',
      }),
    });
    const checkoutData = await checkoutRes.json();
    console.log(`Status: ${checkoutRes.status}`);
    
    if (checkoutRes.ok) {
      console.log(`✅ ✅ ✅ CHECKOUT SUCCESSFUL WITH ADMIN PRODUCT! ✅ ✅ ✅\n`);
      console.log(`Order: ${checkoutData.number} | Total: ${checkoutData.total}`);
    } else {
      console.log(`❌ Error: ${checkoutData.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
