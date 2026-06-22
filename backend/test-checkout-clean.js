const API_URL = 'http://localhost:4000/api';

// Use a fresh customer
const freshCustomer = {
  email: 'testcustomer@test.com',
  password: 'Test123456!',
};

async function test() {
  console.log('🛒 Testing Complete Checkout Flow (Fresh Customer)\n');

  try {
    // 1. Register fresh customer
    console.log('1️⃣  Registering fresh customer...');
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...freshCustomer,
        name: 'Test Customer',
      }),
    });
    const regData = await regRes.json();
    if (!regRes.ok) {
      console.log(`❌ Registration failed: ${regData.message}\n`);
      return;
    }
    const token = regData.accessToken;
    console.log(`✅ Registered successfully\n`);

    // 2. Get products
    console.log('2️⃣  Getting products...');
    const productsRes = await fetch(`${API_URL}/products`);
    const productsData = await productsRes.json();
    const products = productsData.data || [];
    if (products.length === 0) {
      console.log('❌ No products\n');
      return;
    }
    const product = products[0];
    console.log(`✅ Found ${products.length} products`);
    console.log(`   Using: ${product.name}\n`);

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
    if (!addRes.ok) {
      console.log(`❌ Add to cart failed\n`);
      return;
    }
    console.log(`✅ Added to cart\n`);

    // 4. Checkout
    console.log('4️⃣  Attempting checkout...');
    const checkoutRes = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'Test Customer',
          phone: '0901234567',
          line1: '123 Test Street',
          city: 'Test City',
          district: 'Test District',
          ward: 'Test Ward',
          postalCode: '12345',
          country: 'Vietnam',
        },
        paymentProvider: 'COD',
      }),
    });
    const checkoutData = await checkoutRes.json();
    console.log(`Status: ${checkoutRes.status}`);
    
    if (checkoutRes.ok) {
      console.log(`\n✅ ✅ ✅ CHECKOUT SUCCESSFUL! ✅ ✅ ✅\n`);
      console.log(`Order Details:`);
      console.log(`  Number: ${checkoutData.number}`);
      console.log(`  Status: ${checkoutData.status}`);
      console.log(`  Total: ${checkoutData.total}`);
      console.log(`  Items: ${checkoutData.items?.length}`);
      console.log(`  Payment: ${checkoutData.payments?.[0]?.provider}\n`);
    } else {
      console.log(`❌ Checkout failed!`);
      console.log(`Error: ${checkoutData.message}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
