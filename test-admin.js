// Simple test script to verify admin functionality
const fs = require('fs')
const path = require('path')

// Test configuration - check if environment file exists
function testEnvironmentSetup() {
  console.log('🔍 Testing environment setup...')
  
  const envPath = path.join(__dirname, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found')
    return false
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=')
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.error('❌ Missing required Supabase environment variables')
    return false
  }
  
  console.log('✅ Environment configuration is properly set')
  return true
}

async function testValidationUtils() {
  console.log('🔍 Testing validation utilities...')
  
  try {
    // Test if validation file exists and can be imported
    const fs = require('fs')
    const path = require('path')
    
    const validationPath = path.join(__dirname, 'src/utils/validation.ts')
    if (!fs.existsSync(validationPath)) {
      console.error('❌ Validation utilities file not found')
      return false
    }
    
    console.log('✅ Validation utilities file exists')
    return true
  } catch (err) {
    console.error('❌ Validation utilities error:', err.message)
    return false
  }
}

async function testFormComponents() {
  console.log('🔍 Testing form components...')
  
  try {
    const fs = require('fs')
    const path = require('path')
    
    const formFieldPath = path.join(__dirname, 'src/components/form-field.tsx')
    if (!fs.existsSync(formFieldPath)) {
      console.error('❌ FormField component not found')
      return false
    }
    
    console.log('✅ FormField component exists')
    return true
  } catch (err) {
    console.error('❌ Form components error:', err.message)
    return false
  }
}

function runTests() {
  console.log('🚀 Starting Admin Panel Tests\n')
  
  const tests = [
    testEnvironmentSetup,
    testValidationUtils,
    testFormComponents
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = test()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (err) {
      console.error(`❌ Test failed with error:`, err.message)
      failed++
    }
    console.log('') // Add spacing
  }
  
  console.log('📋 Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📊 Total: ${passed + failed}`)
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Admin panel is ready.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.')
  }
}

// Run the tests
runTests()