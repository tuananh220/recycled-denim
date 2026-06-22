const API_URL = 'http://localhost:4000/api';

const freshCustomer = {
  email: `customer-${Date.now()}@test.com`,
  password: 'Test123456!',
};

async function test() {
  console.log('🛒 Testing Complete Checkout Flow\n');

  try {
    // 1. Register
    console.log('1️⃣  Registering customer...');
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...freshCustomer, name: 'Test Customer' }),
    });
    const regData = await regRes.json();
    const token = regData.accessToken;
    console.log(`✅ Registered: ${freshCustomer.email}\n`);

    // 2. Get "Tote Sài Gòn 01" product
    console.log('2️⃣  Getting Tote product...');
    const toteRes = await fetch(`${API_URL}/products/tui-tote-saigon-01`);
    const tote = await toteRes.json();
    console.log(`✅ Found: ${tote.name}`);
    console.log(`   Sizes: ${tote.sizes?.join(', ')}`);
    console.log(`   Colors: ${tote.colors?.join(', ')}\n`);

    // 3. Add to cart with correct size/color
    console.log('3️⃣  Adding to cart...');
    const cartRes = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: tote.id,
        size: 'Free',
        color: '#1f3a5f',
        quantity: 1,
      }),
    });
    if (!cartRes.ok) {
      console.log(`❌ Failed\n`);
      return;
    }
    console.log(`✅ Added to cart\n`);

    // 4. Checkout
    console.log('4️⃣  Checking out...');
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
    
    if (checkoutRes.ok) {
      console.log(`\n✅ ✅ ✅ CHECKOUT SUCCESSFUL ✅ ✅ ✅\n`);
      console.log(`📋 Order Created:`);
      console.log(`   Order #: ${checkoutData.number}`);
      console.log(`   Status: ${checkoutData.status}`);
      console.log(`   Items: ${checkoutData.items?.length}`);
      console.log(`   Subtotal: ${checkoutData.subtotal}`);
      console.log(`   Shipping: ${checkoutData.shipping}`);
      console.log(`   Tax: ${checkoutData.tax}`);
      console.log(`   Total: ${checkoutData.total}\n`);
      return true;
    } else {
      console.log(`❌ Checkout error: ${checkoutData.message}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
