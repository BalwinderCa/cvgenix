const path = require('path');
const AIStructuredParser = require('../utils/aiStructuredParser');

/**
 * Test script for AI-Enhanced Structured Parser
 */
async function testAIParser() {
  console.log('🤖 Testing AI-Enhanced Structured Parser...');
  console.log('=' .repeat(60));
  
  const parser = new AIStructuredParser();
  
  // Test with Balwinder's resume
  const testFile = path.join(__dirname, '../../resumes/Balwinder Singh Full Stack Developer.pdf');
  
  try {
    console.log(`📄 Testing with: ${path.basename(testFile)}`);
    console.log('⏳ Processing... (this may take a moment for AI processing)');
    
    const result = await parser.parsePDF(testFile);
    
    if (result.success) {
      console.log('\n✅ PARSING SUCCESSFUL!');
      console.log('=' .repeat(60));
      
      console.log('\n📊 RESULTS:');
      console.log(`Method: ${result.method}`);
      console.log(`Confidence: ${result.confidence}/100`);
      console.log(`Quality: ${result.quality}/100`);
      console.log(`Text Length: ${result.text.length} characters`);
      
      if (result.sections && result.sections.length > 0) {
        console.log(`Sections Found: ${result.sections.join(', ')}`);
      }
      
      if (result.metadata) {
        console.log(`Pages Processed: ${result.metadata.pages}`);
        console.log(`Text Elements: ${result.metadata.totalElements}`);
        if (result.metadata.aiProcessingTime) {
          console.log(`AI Processing Time: ${result.metadata.aiProcessingTime}ms`);
        }
      }
      
      console.log('\n📖 ORGANIZED RESUME TEXT:');
      console.log('=' .repeat(80));
      console.log(result.text);
      console.log('=' .repeat(80));
      
      // Save result to file for comparison
      const fs = require('fs');
      const outputFile = path.join(__dirname, '../../ai_parser_result.txt');
      fs.writeFileSync(outputFile, result.text);
      console.log(`\n💾 Result saved to: ${outputFile}`);
      
    } else {
      console.log('\n❌ PARSING FAILED!');
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
    
    if (error.message.includes('Missing credentials')) {
      console.log('\n💡 TIP: Make sure OPENAI_API_KEY is set in your environment variables');
      console.log('   You can set it with: export OPENAI_API_KEY="your-api-key-here"');
    }
  }
}

// Run the test
if (require.main === module) {
  testAIParser().catch(console.error);
}

module.exports = { testAIParser };
