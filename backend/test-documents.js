/**
 * Document API Test Suite
 * Tests all document endpoints including file upload/download
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

// Test credentials
const TEST_USER = {
  email: 'admin@expirytracker.com',
  password: 'Admin123!',
};

let authToken = '';
let testDocumentId = null;
let testFilePath = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`Testing: ${testName}`, 'blue');
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'yellow');
}

// Create a test PDF file
function createTestFile() {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  testFilePath = path.join(testDir, 'test-passport.pdf');

  // Create a simple PDF-like file (not a real PDF, but for testing)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Passport Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
306
%%EOF`;

  fs.writeFileSync(testFilePath, pdfContent);
  logInfo(`Created test file: ${testFilePath}`);
  return testFilePath;
}

// Clean up test files
function cleanupTestFiles() {
  if (testFilePath && fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    logInfo('Cleaned up test file');
  }

  const testDir = path.join(__dirname, 'test-files');
  if (fs.existsSync(testDir)) {
    fs.rmdirSync(testDir);
  }
}

// Test 1: Login
async function testLogin() {
  logTest('User Login');

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);

    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      logSuccess('Login successful');
      logInfo(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError('Login failed: No token received');
      return false;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 2: List documents (should be empty initially)
async function testListDocuments() {
  logTest('List Documents (Initial)');

  try {
    const response = await axios.get(`${BASE_URL}/documents`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      logSuccess(`Found ${response.data.data.length} documents`);
      logInfo(`Pagination: ${JSON.stringify(response.data.pagination)}`);
      return true;
    } else {
      logError('Failed to list documents');
      return false;
    }
  } catch (error) {
    logError(`List documents failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Create document with file upload
async function testCreateDocument() {
  logTest('Create Document with File Upload');

  try {
    const form = new FormData();
    form.append('type', 'Passport');
    form.append('number', 'P12345678');
    form.append('expiryDate', '2027-12-31');
    form.append('issueDate', '2022-01-01');
    form.append('issuingAuthority', 'Government of Test Country');
    form.append('notes', 'Test passport document for API testing');
    form.append('file', fs.createReadStream(testFilePath));

    const response = await axios.post(`${BASE_URL}/documents`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success && response.data.data.id) {
      testDocumentId = response.data.data.id;
      logSuccess('Document created successfully');
      logInfo(`Document ID: ${testDocumentId}`);
      logInfo(`Type: ${response.data.data.type}`);
      logInfo(`Number: ${response.data.data.number}`);
      logInfo(`Status: ${response.data.data.status}`);
      logInfo(`File: ${response.data.data.file_name}`);
      return true;
    } else {
      logError('Failed to create document');
      return false;
    }
  } catch (error) {
    logError(`Create document failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.errors) {
      console.log('Validation errors:', error.response.data.errors);
    }
    return false;
  }
}

// Test 4: Get single document
async function testGetDocument() {
  logTest('Get Single Document');

  try {
    const response = await axios.get(`${BASE_URL}/documents/${testDocumentId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && response.data.data) {
      logSuccess('Document retrieved successfully');
      logInfo(`Type: ${response.data.data.type}`);
      logInfo(`Number: ${response.data.data.number}`);
      logInfo(`Expiry: ${response.data.data.expiry_date}`);
      logInfo(`Status: ${response.data.data.status}`);
      logInfo(`Remaining days: ${response.data.data.remaining_days}`);
      return true;
    } else {
      logError('Failed to get document');
      return false;
    }
  } catch (error) {
    logError(`Get document failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Update document
async function testUpdateDocument() {
  logTest('Update Document');

  try {
    const response = await axios.put(
      `${BASE_URL}/documents/${testDocumentId}`,
      {
        notes: 'Updated notes for test passport',
        issuingAuthority: 'Updated Government Authority',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      logSuccess('Document updated successfully');
      logInfo(`Updated notes: ${response.data.data.notes}`);
      logInfo(`Updated authority: ${response.data.data.issuing_authority}`);
      return true;
    } else {
      logError('Failed to update document');
      return false;
    }
  } catch (error) {
    logError(`Update document failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: List documents with filters
async function testListDocumentsWithFilters() {
  logTest('List Documents with Filters');

  try {
    // Test filter by type
    const response = await axios.get(`${BASE_URL}/documents?type=Passport&sort=expiry_asc`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      logSuccess(`Found ${response.data.data.length} passport documents`);
      if (response.data.data.length > 0) {
        logInfo(`First document: ${response.data.data[0].type} - ${response.data.data[0].number}`);
      }
      return true;
    } else {
      logError('Failed to list documents with filters');
      return false;
    }
  } catch (error) {
    logError(`List with filters failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Download document file
async function testDownloadFile() {
  logTest('Download Document File');

  try {
    const response = await axios.get(`${BASE_URL}/documents/${testDocumentId}/download`, {
      headers: { Authorization: `Bearer ${authToken}` },
      responseType: 'arraybuffer',
    });

    if (response.status === 200 && response.data) {
      logSuccess('File downloaded successfully');
      logInfo(`Content-Type: ${response.headers['content-type']}`);
      logInfo(`File size: ${response.data.length} bytes`);
      return true;
    } else {
      logError('Failed to download file');
      return false;
    }
  } catch (error) {
    logError(`Download file failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 8: Create document without file (optional file)
async function testCreateDocumentWithoutFile() {
  logTest('Create Document without File');

  try {
    const response = await axios.post(
      `${BASE_URL}/documents`,
      {
        type: 'Driver License',
        number: 'DL987654321',
        expiryDate: '2026-06-30',
        issueDate: '2021-06-30',
        issuingAuthority: 'DMV Test State',
        notes: 'Driver license without file attachment',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success && response.data.data.id) {
      logSuccess('Document created without file');
      logInfo(`Document ID: ${response.data.data.id}`);
      logInfo(`Type: ${response.data.data.type}`);
      logInfo(`Has file: ${response.data.data.file_path ? 'Yes' : 'No'}`);
      return true;
    } else {
      logError('Failed to create document without file');
      return false;
    }
  } catch (error) {
    logError(`Create without file failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 9: Test validation errors
async function testValidationErrors() {
  logTest('Test Validation Errors');

  try {
    // Try to create document with invalid data
    await axios.post(
      `${BASE_URL}/documents`,
      {
        type: 'invalid_type',
        number: '', // Empty number
        expiryDate: 'invalid-date',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    logError('Validation should have failed but did not');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Validation errors caught correctly');
      logInfo(`Errors: ${JSON.stringify(error.response.data.errors || error.response.data.message)}`);
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      return false;
    }
  }
}

// Test 10: Delete document
async function testDeleteDocument() {
  logTest('Delete Document');

  try {
    const response = await axios.delete(`${BASE_URL}/documents/${testDocumentId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      logSuccess('Document deleted successfully');

      // Verify deletion
      try {
        await axios.get(`${BASE_URL}/documents/${testDocumentId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        logError('Document still exists after deletion');
        return false;
      } catch (error) {
        if (error.response?.status === 404) {
          logSuccess('Verified: Document no longer exists');
          return true;
        }
      }
    } else {
      logError('Failed to delete document');
      return false;
    }
  } catch (error) {
    logError(`Delete document failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 11: Check dashboard includes documents
async function testDashboardIntegration() {
  logTest('Dashboard Integration');

  try {
    const response = await axios.get(`${BASE_URL}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && response.data.data) {
      logSuccess('Dashboard retrieved successfully');
      logInfo(`Total items: ${response.data.data.totalItems || 0}`);
      logInfo(`Total documents: ${response.data.data.totalDocuments || 0}`);

      if (response.data.data.documentsByType) {
        logInfo('Documents by type:');
        Object.entries(response.data.data.documentsByType).forEach(([type, count]) => {
          console.log(`  - ${type}: ${count}`);
        });
      }

      return true;
    } else {
      logError('Failed to get dashboard');
      return false;
    }
  } catch (error) {
    logError(`Dashboard failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n');
  log('═══════════════════════════════════════════════════════════', 'blue');
  log('   DOCUMENT TRACKING API TEST SUITE - PHASE 6', 'blue');
  log('═══════════════════════════════════════════════════════════', 'blue');
  console.log('\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Create test file
  createTestFile();

  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'List Documents (Initial)', fn: testListDocuments },
    { name: 'Create Document with File', fn: testCreateDocument },
    { name: 'Get Single Document', fn: testGetDocument },
    { name: 'Update Document', fn: testUpdateDocument },
    { name: 'List Documents with Filters', fn: testListDocumentsWithFilters },
    { name: 'Download Document File', fn: testDownloadFile },
    { name: 'Create Document without File', fn: testCreateDocumentWithoutFile },
    { name: 'Test Validation Errors', fn: testValidationErrors },
    { name: 'Delete Document', fn: testDeleteDocument },
    { name: 'Dashboard Integration', fn: testDashboardIntegration },
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Clean up
  cleanupTestFiles();

  // Print summary
  console.log('\n');
  log('═══════════════════════════════════════════════════════════', 'blue');
  log('   TEST SUMMARY', 'blue');
  log('═══════════════════════════════════════════════════════════', 'blue');
  console.log('\n');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`,
      results.failed === 0 ? 'green' : 'yellow');
  console.log('\n');

  if (results.failed === 0) {
    log('🎉 ALL TESTS PASSED! Phase 6 is working correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Please review the errors above.', 'red');
  }

  console.log('\n');
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  cleanupTestFiles();
  process.exit(1);
});
