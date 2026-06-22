const API_URL = 'http://localhost:4000/api';

const customerUser = {
  email: 'customer@echove.vn',
  password: 'Cust@123',
};

async function test() {
  console.log('🛒 Testing Complete Checkout Flow\n');

  try {
    // 1. Login as customer
    console.log('1️⃣  Logging in as customer...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerUser),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.log(`❌ Login failed: ${loginData.message}\n`);
      return;
    }
    const token = loginData.accessToken;
    const userId = loginData.user.id;
    console.log(`✅ Logged in as: ${loginData.user.name}\n`);

    // 2. Get current cart
    console.log('2️⃣  Getting current cart...');
    const cartRes = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cart = await cartRes.json();
    console.log(`Status: ${cartRes.status}`);
    console.log(`Cart items: ${cart.items?.length || 0}`);
    console.log();

    // 3. Get all products
    console.log('3️⃣  Getting products...');
    const productsRes = await fetch(`${API_URL}/products`);
    const productsData = await productsRes.json();
    const products = productsData.data || [];
    console.log(`Status: ${productsRes.status}`);
    console.log(`Found: ${products.length} products (Total in DB: ${productsData.meta?.total || 0})`);
    
    if (products.length === 0) {
      console.log('❌ No active products found\n');
      return;
    }

    const product = products[0];
    console.log(`Selected product: ${product.name}`);
    console.log(`  - Sizes: ${product.sizes?.join(', ') || 'N/A'}`);
    console.log(`  - Colors: ${product.colors?.join(', ') || 'N/A'}\n`);

    // 4. Add item to cart
    console.log('4️⃣  Adding product to cart...');
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
    const addData = await addRes.json();
    console.log(`Status: ${addRes.status}`);
    if (addRes.ok) {
      console.log(`✅ Added to cart\n`);
    } else {
      console.log(`❌ Error: ${addData.message || JSON.stringify(addData)}\n`);
      return;
    }

    // 5. Verify cart has items
    console.log('5️⃣  Verifying cart...');
    const cartCheckRes = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cartCheck = await cartCheckRes.json();
    console.log(`Cart items: ${cartCheck.items?.length || 0}`);
    if (cartCheck.items?.length === 0) {
      console.log('❌ Cart is empty after adding item!\n');
      return;
    }
    cartCheck.items.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.product?.name} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}`);
    });
    console.log(`✅ Cart has ${cartCheck.items.length} item(s)\n`);

    // 6. Attempt checkout
    console.log('6️⃣  Attempting checkout...');
    const checkoutRes = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'Minh Anh',
          email: 'customer@echove.vn',
          phone: '0901234567',
          line1: '123 Nguyễn Huệ',
          city: 'TP. HCM',
          country: 'Vietnam',
        },
        paymentProvider: 'COD',
        notes: 'Test order',
      }),
    });
    const checkoutData = await checkoutRes.json();
    console.log(`Status: ${checkoutRes.status}`);
    
    if (checkoutRes.ok) {
      console.log(`✅ Checkout successful!`);
      console.log(`Order Details:`);
      console.log(`  Order ID: ${checkoutData.id}`);
      console.log(`  Order Number: ${checkoutData.number}`);
      console.log(`  Status: ${checkoutData.status}`);
      console.log(`  Total: ${checkoutData.total} ${checkoutData.currency}`);
      console.log(`  Items: ${checkoutData.items?.length || 0}\n`);
    } else {
      console.log(`❌ Checkout failed!`);
      console.log(`Error: ${checkoutData.message || JSON.stringify(checkoutData, null, 2)}\n`);
      return;
    }

    // 7. Verify order was created
    console.log('7️⃣  Verifying order was created...');
    const ordersRes = await fetch(`${API_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = await ordersRes.json();
    console.log(`Total orders: ${Array.isArray(orders) ? orders.length : 0}`);
    if (Array.isArray(orders) && orders.length > 0) {
      const lastOrder = orders[0];
      console.log(`Last order: ${lastOrder.number} | Status: ${lastOrder.status}\n`);
    }

    // 8. Check if cart was cleared
    console.log('8️⃣  Checking if cart was cleared...');
    const cartFinalRes = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cartFinal = await cartFinalRes.json();
    console.log(`Cart items after checkout: ${cartFinal.items?.length || 0}`);
    if (cartFinal.items?.length === 0) {
      console.log(`✅ Cart correctly cleared after checkout\n`);
    } else {
      console.log(`⚠️  Cart still has items after checkout\n`);
    }

    console.log('✅ Complete checkout flow test finished!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

test();
