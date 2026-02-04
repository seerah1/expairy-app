/**
 * API Test Script
 * Systematic testing of all backend endpoints
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = null;
let testUserId = null;
let testItemId = null;

// Test results
const results = {
  passed: [],
  failed: [],
};

const log = (message) => console.log(`\n${message}`);
const logSuccess = (test) => {
  console.log(`✓ ${test}`);
  results.passed.push(test);
};
const logError = (test, error) => {
  console.log(`✗ ${test}`);
  console.log(`  Error: ${error.message || error}`);
  results.failed.push({ test, error: error.message || error });
};

// Test 1: Health Check
async function testHealthCheck() {
  try {
    const response = await axios.get('http://localhost:3000/health');
    if (response.data.success) {
      logSuccess('Health check endpoint');
    } else {
      logError('Health check endpoint', 'Unexpected response');
    }
  } catch (error) {
    logError('Health check endpoint', error);
  }
}

// Test 2: User Registration
async function testRegister() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!',
      name: 'Test User',
    });

    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      testUserId = response.data.data.user.id;
      logSuccess('User registration');
    } else {
      logError('User registration', 'No token received');
    }
  } catch (error) {
    logError('User registration', error.response?.data?.message || error.message);
  }
}

// Test 3: User Login
async function testLogin() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@expirytracker.com',
      password: 'Admin123!',
    });

    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      testUserId = response.data.data.user.id;
      logSuccess('User login');
    } else {
      logError('User login', 'No token received');
    }
  } catch (error) {
    logError('User login', error.response?.data?.message || error.message);
  }
}

// Test 4: Get User Profile
async function testGetProfile() {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && response.data.data.email) {
      logSuccess('Get user profile');
    } else {
      logError('Get user profile', 'Invalid response');
    }
  } catch (error) {
    logError('Get user profile', error.response?.data?.message || error.message);
  }
}

// Test 5: Create Food Item
async function testCreateFoodItem() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await axios.post(
      `${API_URL}/food-items`,
      {
        name: 'Test Milk',
        category: 'Dairy',
        expiryDate: tomorrow.toISOString().split('T')[0],
        quantity: '1 liter',
        storageType: 'Refrigerator',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success && response.data.data.id) {
      testItemId = response.data.data.id;
      logSuccess('Create food item');
    } else {
      logError('Create food item', 'No item ID received');
    }
  } catch (error) {
    logError('Create food item', error.response?.data?.message || error.message);
  }
}

// Test 6: Get All Food Items
async function testGetFoodItems() {
  try {
    const response = await axios.get(`${API_URL}/food-items`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && Array.isArray(response.data.data)) {
      logSuccess(`Get all food items (${response.data.data.length} items)`);
    } else {
      logError('Get all food items', 'Invalid response');
    }
  } catch (error) {
    logError('Get all food items', error.response?.data?.message || error.message);
  }
}

// Test 7: Get Single Food Item
async function testGetFoodItem() {
  if (!testItemId) {
    logError('Get single food item', 'No test item ID available');
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/food-items/${testItemId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && response.data.data.id === testItemId) {
      logSuccess('Get single food item');
    } else {
      logError('Get single food item', 'Invalid response');
    }
  } catch (error) {
    logError('Get single food item', error.response?.data?.message || error.message);
  }
}

// Test 8: Update Food Item
async function testUpdateFoodItem() {
  if (!testItemId) {
    logError('Update food item', 'No test item ID available');
    return;
  }

  try {
    const response = await axios.put(
      `${API_URL}/food-items/${testItemId}`,
      {
        name: 'Updated Test Milk',
        quantity: '2 liters',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success && response.data.data.name === 'Updated Test Milk') {
      logSuccess('Update food item');
    } else {
      logError('Update food item', 'Item not updated correctly');
    }
  } catch (error) {
    logError('Update food item', error.response?.data?.message || error.message);
  }
}

// Test 9: Get Dashboard Overview
async function testDashboardOverview() {
  try {
    const response = await axios.get(`${API_URL}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && response.data.data.statistics) {
      logSuccess('Get dashboard overview');
    } else {
      logError('Get dashboard overview', 'Invalid response');
    }
  } catch (error) {
    logError('Get dashboard overview', error.response?.data?.message || error.message);
  }
}

// Test 10: Get Dashboard Statistics
async function testDashboardStatistics() {
  try {
    const response = await axios.get(`${API_URL}/dashboard/statistics`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && response.data.data.totalItems !== undefined) {
      logSuccess('Get dashboard statistics');
    } else {
      logError('Get dashboard statistics', 'Invalid response');
    }
  } catch (error) {
    logError('Get dashboard statistics', error.response?.data?.message || error.message);
  }
}

// Test 11: Delete Food Item
async function testDeleteFoodItem() {
  if (!testItemId) {
    logError('Delete food item', 'No test item ID available');
    return;
  }

  try {
    const response = await axios.delete(`${API_URL}/food-items/${testItemId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      logSuccess('Delete food item');
    } else {
      logError('Delete food item', 'Invalid response');
    }
  } catch (error) {
    logError('Delete food item', error.response?.data?.message || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('BACKEND API TEST SUITE');
  console.log('='.repeat(60));

  log('Testing Health & Authentication...');
  await testHealthCheck();
  await testLogin();
  await testGetProfile();

  log('\nTesting Food Items CRUD...');
  await testCreateFoodItem();
  await testGetFoodItems();
  await testGetFoodItem();
  await testUpdateFoodItem();

  log('\nTesting Dashboard...');
  await testDashboardOverview();
  await testDashboardStatistics();

  log('\nTesting Cleanup...');
  await testDeleteFoodItem();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Passed: ${results.passed.length}`);
  console.log(`✗ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed Tests:');
    results.failed.forEach(({ test, error }) => {
      console.log(`  - ${test}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
