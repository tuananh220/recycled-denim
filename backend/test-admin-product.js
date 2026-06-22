const API_URL = 'http://localhost:4000/api';

const adminUser = {
  email: 'admin@echove.vn',
  password: 'Admin@123',
};

const customerEmail = `customer-${Date.now()}@test.com`;

async function test() {
  console.log('👨‍💼 Testing Admin Product Creation & Checkout\n');

  try {
    // 1. Admin login
    console.log('1️⃣  Admin login...');
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminUser),
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.accessToken;
    console.log(`✅ Admin logged in\n`);

    // 2. Get category
    console.log('2️⃣  Getting category...');
    const catRes = await fetch(`${API_URL}/categories`);
    const cats = await catRes.json();
    const tuiCat = cats.find(c => c.slug === 'tui');
    console.log(`✅ Found category: ${tuiCat.name}\n`);

    // 3. Create product via admin
    console.log('3️⃣  Admin creating new product...');
    const createRes = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Túi Test từ Admin',
        slug: `tui-admin-test-${Date.now()}`,
        description: 'Sản phẩm test được tạo từ admin dashboard',
        price: 250000,
        compareAtPrice: 350000,
        sizes: ['Free'],
        colors: ['#333333', '#666666'],
        categoryId: tuiCat.id,
        imageUrls: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200'],
      }),
    });
    const product = await createRes.json();
    console.log(`Status: ${createRes.status}`);
    if (createRes.ok) {
      console.log(`✅ Product created: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Slug: ${product.slug}\n`);
    } else {
      console.log(`❌ Failed: ${product.message}\n`);
      return;
    }

    // 4. Check inventory
    console.log('4️⃣  Checking inventory for this product...');
    const inventoryRes = await fetch(`${API_URL}/inventory/product/${product.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const inventory = await inventoryRes.json();
    console.log(`Status: ${inventoryRes.status}`);
    console.log(`Inventory count: ${Array.isArray(inventory) ? inventory.length : 0}`);
    if (Array.isArray(inventory) && inventory.length > 0) {
      console.log(`✅ Inventory exists:`);
      inventory.forEach((inv, i) => {
        console.log(`   ${i+1}. Size: ${inv.size} | Color: ${inv.color} | Qty: ${inv.quantity}`);
      });
    } else {
      console.log(`⚠️  NO INVENTORY DATA - This is the problem!\n`);
    }
    console.log();

    // 5. Customer tries to checkout
    console.log('5️⃣  Customer registration...');
    const custRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: 'Test123456!',
        name: 'Test Customer',
      }),
    });
    const custData = await custRegRes.json();
    const custToken = custData.accessToken;
    console.log(`✅ Customer registered\n`);

    // 6. Add admin-created product to cart
    console.log('6️⃣  Customer adding admin product to cart...');
    const addRes = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        productId: product.id,
        size: 'Free',
        color: '#333333',
        quantity: 1,
      }),
    });
    if (addRes.ok) {
      console.log(`✅ Added to cart\n`);
    } else {
      console.log(`❌ Failed to add\n`);
      return;
    }

    // 7. Try checkout
    console.log('7️⃣  Customer attempting checkout...');
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
      console.log(`✅ Checkout successful\n`);
    } else {
      console.log(`❌ Checkout failed!`);
      console.log(`Error: ${checkoutData.message}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
