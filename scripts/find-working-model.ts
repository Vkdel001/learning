import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Find which model actually works for lesson generation
 */

async function testModel(genAI: GoogleGenerativeAI, modelName: string): Promise<boolean> {
  try {
    console.log(`\n📤 Testing: ${modelName}`);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `Create a short lesson about binary numbers. Include:
- A brief explanation (2 sentences)
- 2 examples
- 3 key points

Return as JSON with fields: explanation, examples, keyPoints`;

    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 20000);
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      timeout
    ]);

    const text = result.response.text();
    
    // Check if response contains JSON
    if (text.includes('{') && text.includes('explanation')) {
      console.log(`   ✅ SUCCESS! This model works for lesson generation`);
      console.log(`   Response length: ${text.length} chars`);
      console.log(`   Tokens: ${result.response.usageMetadata?.totalTokenCount || 0}`);
      return true;
    } else {
      console.log(`   ⚠️  Response doesn't look like JSON`);
      return false;
    }

  } catch (error: any) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.log(`   ❌ Model not available`);
    } else if (error.message.includes('429')) {
      console.log(`   ⚠️  Rate limited`);
    } else if (error.message.includes('Timeout')) {
      console.log(`   ❌ Timed out (high traffic)`);
    } else {
      console.log(`   ❌ Error: ${error.message.substring(0, 80)}`);
    }
    return false;
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    return;
  }

  console.log('🔍 Finding Working Model for Lesson Generation\n');
  console.log('Testing models that support generateContent...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  // Get list of available models
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  
  const data = await response.json();
  
  // Filter models that support generateContent
  const compatibleModels = data.models
    ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m: any) => m.name.replace('models/', ''))
    .filter((name: string) => 
      // Focus on flash models (faster and cheaper)
      name.includes('flash') || name.includes('gemini-2') || name.includes('gemini-3')
    ) || [];

  console.log(`Found ${compatibleModels.length} compatible models\n`);

  const workingModels: string[] = [];

  // Test each model
  for (const modelName of compatibleModels) {
    const works = await testModel(genAI, modelName);
    if (works) {
      workingModels.push(modelName);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '═'.repeat(80));
  console.log('RESULTS');
  console.log('═'.repeat(80));

  if (workingModels.length > 0) {
    console.log('\n✅ Working models for lesson generation:');
    workingModels.forEach((model, idx) => {
      console.log(`   ${idx + 1}. ${model}`);
    });
    
    console.log(`\n📝 RECOMMENDED: Add this to your .env file:`);
    console.log(`   GEMINI_MODEL=${workingModels[0]}`);
  } else {
    console.log('\n❌ No working models found');
    console.log('   This might be due to:');
    console.log('   - Rate limiting (wait and try again)');
    console.log('   - High traffic on all models');
    console.log('   - API key restrictions');
  }
}

main();
