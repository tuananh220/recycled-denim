const API_URL = 'http://localhost:4000/api';

// Test data - using seeded warehouse user
const warehouseUser = {
  email: 'warehouse@echove.vn',
  password: 'Ware@123',
};

async function test() {
  console.log('🧪 Testing Warehouse Functionality\n');

  try {
    // 1. Login as warehouse user
    console.log('1️⃣  Logging in as warehouse staff...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(warehouseUser),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.log(`❌ Login failed: ${loginData.message}\n`);
      return;
    }
    const token = loginData.accessToken;
    const user = loginData.user;
    console.log(`✅ Logged in as: ${user.name} (Role: ${user.role})\n`);

    // 2. Get all inventory
    console.log('2️⃣  Fetching all inventory...');
    const inventoryRes = await fetch(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const inventory = await inventoryRes.json();
    console.log(`Status: ${inventoryRes.status}`);
    console.log(`Total inventory items: ${Array.isArray(inventory) ? inventory.length : 0}\n`);
    
    if (Array.isArray(inventory) && inventory.length > 0) {
      console.log('📦 Inventory Items:');
      inventory.forEach((item, i) => {
        console.log(`${i+1}. Product: ${item.product?.name || item.productId} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}`);
      });
      console.log();

      // 3. Get inventory by specific product
      const productId = inventory[0].productId;
      console.log(`3️⃣  Getting detailed inventory for product: ${inventory[0].product?.name}...`);
      const productInvRes = await fetch(`${API_URL}/inventory/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productInv = await productInvRes.json();
      console.log(`Status: ${productInvRes.status}`);
      console.log(`Variants found: ${Array.isArray(productInv) ? productInv.length : 0}`);
      if (Array.isArray(productInv) && productInv.length > 0) {
        console.log(`\nVariants:\n`);
        productInv.forEach((variant, i) => {
          console.log(`  ${i+1}. Size: ${variant.size} | Color: ${variant.color} | Qty: ${variant.quantity} | SKU: ${variant.sku}`);
        });
      }
      console.log();

      // 4. Update quantity
      const itemToUpdate = productInv[0];
      const currentQty = itemToUpdate.quantity;
      const newQty = currentQty + 5;
      
      console.log(`4️⃣  Updating inventory quantity...`);
      console.log(`Item: ${inventory[0].product?.name} | Size: ${itemToUpdate.size} | Color: ${itemToUpdate.color}`);
      console.log(`Current Qty: ${currentQty} → New Qty: ${newQty}`);
      
      const updateRes = await fetch(`${API_URL}/inventory/${itemToUpdate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });
      const updateData = await updateRes.json();
      console.log(`Status: ${updateRes.status}`);
      if (updateRes.ok) {
        console.log(`✅ Successfully updated to: ${updateData.quantity}\n`);
      } else {
        console.log(`❌ Error: ${updateData.message}\n`);
      }

      // 5. Try invalid quantity (negative)
      console.log(`5️⃣  Testing validation - trying to set negative quantity...`);
      const invalidRes = await fetch(`${API_URL}/inventory/${itemToUpdate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: -5 }),
      });
      const invalidData = await invalidRes.json();
      console.log(`Status: ${invalidRes.status}`);
      if (!invalidRes.ok) {
        console.log(`✅ Correctly rejected: ${invalidData.message}\n`);
      } else {
        console.log(`❌ Should have rejected negative quantity\n`);
      }

      // 6. Test authorization - try with customer token
      console.log(`6️⃣  Testing authorization - trying to access with CUSTOMER role...`);
      const customerRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'customer@echove.vn', password: 'Cust@123' }),
      });
      const customerData = await customerRes.json();
      const customerToken = customerData.accessToken;

      const unauthorizedRes = await fetch(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      console.log(`Status: ${unauthorizedRes.status}`);
      if (unauthorizedRes.status === 403) {
        console.log(`✅ Correctly denied access to CUSTOMER role\n`);
      } else {
        console.log(`⚠️  Unexpected status: ${unauthorizedRes.status}\n`);
      }

    } else {
      console.log('⚠️  No inventory data found\n');
    }

    console.log('✅ All warehouse functionality tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

test();
