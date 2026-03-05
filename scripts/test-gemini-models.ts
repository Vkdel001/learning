import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test script to list available Gemini models
 */

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    console.error('Current value:', apiKey);
    return;
  }

  console.log('🔍 Testing Gemini API...');
  console.log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}\n`);

  const genAI = new GoogleGenerativeAI(apiKey);

  // First, try to list available models
  console.log('📋 Attempting to list available models...\n');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      if (response.status === 400 || response.status === 403) {
        console.error('\n⚠️  Your API key might be invalid or doesn\'t have access.');
        console.error('Get a new key from: https://makersuite.google.com/app/apikey');
      }
      return;
    }
    
    const data = await response.json();
    console.log('✅ Available models:');
    data.models?.forEach((model: any) => {
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`   - ${model.name.replace('models/', '')}`);
      }
    });
    console.log();
    
    // Try the first available model
    if (data.models && data.models.length > 0) {
      const firstModel = data.models.find((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (firstModel) {
        const modelName = firstModel.name.replace('models/', '');
        console.log(`\n🧪 Testing with: ${modelName}...`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello in one word');
        const response = result.response;
        const text = response.text();
        
        console.log(`✅ Success!`);
        console.log(`   Response: ${text}`);
        console.log(`   Tokens: ${response.usageMetadata?.totalTokenCount || 'N/A'}`);
        console.log(`\n✅ Use this model name in your code: "${modelName}"`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('API key')) {
      console.error('\n⚠️  API key issue detected.');
      console.error('1. Check your API key at: https://makersuite.google.com/app/apikey');
      console.error('2. Make sure the key is enabled');
      console.error('3. Update GEMINI_API_KEY in .env file');
    }
  }
}

main();
