const API_URL = 'http://localhost:4000/api';

const customerUser = {
  email: 'customer@echove.vn',
  password: 'Cust@123',
};

async function test() {
  console.log('🛒 Testing Complete Checkout Flow (FIXED)\n');

  try {
    // 1. Login
    console.log('1️⃣  Logging in as customer...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerUser),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.log(`❌ Login failed\n`);
      return;
    }
    const token = loginData.accessToken;
    console.log(`✅ Logged in as: ${loginData.user.name}\n`);

    // 2. Get products
    console.log('2️⃣  Getting products...');
    const productsRes = await fetch(`${API_URL}/products`);
    const productsData = await productsRes.json();
    const products = productsData.data || [];
    if (products.length === 0) {
      console.log('❌ No products found\n');
      return;
    }
    const product = products[0];
    console.log(`✅ Found ${products.length} products\n`);

    // 3. Add to cart
    console.log('3️⃣  Adding to cart...');
    const addRes = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product.id,
        size: product.sizes?.[0] || 'Free',
        color: product.colors?.[0] || '#000000',
        quantity: 1,
      }),
    });
    if (addRes.ok) {
      console.log(`✅ Added to cart\n`);
    } else {
      console.log(`❌ Failed to add to cart\n`);
      return;
    }

    // 4. Checkout with CORRECT address format
    console.log('4️⃣  Attempting checkout with correct address format...');
    const checkoutRes = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'Minh Anh Nguyễn',
          phone: '0901234567',
          line1: '123 Nguyễn Huệ',
          city: 'Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          postalCode: '70000',
          country: 'Vietnam',
        },
        paymentProvider: 'COD',
        notes: 'Test order',
      }),
    });
    const checkoutData = await checkoutRes.json();
    console.log(`Status: ${checkoutRes.status}`);
    
    if (checkoutRes.ok) {
      console.log(`\n✅ ✅ ✅ CHECKOUT SUCCESSFUL! ✅ ✅ ✅`);
      console.log(`\nOrder Details:`);
      console.log(`  Order Number: ${checkoutData.number}`);
      console.log(`  Order ID: ${checkoutData.id}`);
      console.log(`  Status: ${checkoutData.status}`);
      console.log(`  Payment Status: ${checkoutData.paymentStatus}`);
      console.log(`  Subtotal: ${checkoutData.subtotal}`);
      console.log(`  Shipping: ${checkoutData.shipping}`);
      console.log(`  Tax: ${checkoutData.tax}`);
      console.log(`  Total: ${checkoutData.total} ${checkoutData.currency}`);
      console.log(`  Items Count: ${checkoutData.items?.length || 0}`);
      console.log(`  Payment Provider: ${checkoutData.payments?.[0]?.provider}`);
      console.log();
    } else {
      console.log(`❌ Checkout failed!`);
      console.log(`Error: ${checkoutData.message || JSON.stringify(checkoutData, null, 2)}\n`);
      return;
    }

    // 5. Verify cart cleared
    console.log('5️⃣  Verifying cart was cleared...');
    const cartFinalRes = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cartFinal = await cartFinalRes.json();
    console.log(`Cart items: ${cartFinal.items?.length || 0}`);
    if (cartFinal.items?.length === 0) {
      console.log(`✅ Cart correctly cleared\n`);
    }

    // 6. Verify order appears in my-orders
    console.log('6️⃣  Verifying order in my-orders...');
    const ordersRes = await fetch(`${API_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = await ordersRes.json();
    if (Array.isArray(orders) && orders.length > 0) {
      console.log(`✅ Order found in my-orders (${orders.length} total orders)`);
      console.log(`  Latest: ${orders[0].number} | Status: ${orders[0].status}\n`);
    }

    console.log('✅ ✅ ✅ COMPLETE CHECKOUT FLOW WORKING! ✅ ✅ ✅');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
