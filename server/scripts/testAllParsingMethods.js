const path = require('path');
const EnhancedResumeParser = require('../utils/enhancedResumeParser');
const StructuredParserNoAI = require('../utils/structuredParserNoAI');

/**
 * Comprehensive test script to compare all parsing methods
 */
async function testAllParsingMethods() {
  console.log('🔍 Testing All Parsing Methods...');
  console.log('=' .repeat(80));
  
  const testFile = path.join(__dirname, '../../resumes/Balwinder Singh Full Stack Developer.pdf');
  const parser = new EnhancedResumeParser();
  
  console.log(`📄 Testing with: ${path.basename(testFile)}`);
  console.log(`🤖 AI Available: ${parser.hasAI ? 'Yes' : 'No'}`);
  console.log('');
  
  // Test individual methods
  const methods = [
    { name: 'Enhanced Parser (Multi-method)', method: () => parser.parseResume(testFile, 'application/pdf') },
    { name: 'Structured Parser (No AI)', method: () => parser.parsePDFWithStructuredNoAI(testFile) },
    { name: 'PDF2JSON Method', method: () => parser.parsePDFWithPDF2JSON(testFile) },
    { name: 'PDF-Parse Method', method: () => parser.parsePDFWithPDFParse(testFile) }
  ];
  
  const results = [];
  
  for (const { name, method } of methods) {
    console.log(`🔄 Testing ${name}...`);
    
    try {
      const startTime = Date.now();
      const result = await method();
      const processingTime = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ ${name} - SUCCESS`);
        console.log(`   Quality: ${result.quality || 'N/A'}/100`);
        console.log(`   Confidence: ${result.confidence || 'N/A'}/100`);
        console.log(`   Text Length: ${result.text.length} characters`);
        console.log(`   Processing Time: ${processingTime}ms`);
        
        results.push({
          name,
          success: true,
          quality: result.quality || 0,
          confidence: result.confidence || 0,
          textLength: result.text.length,
          processingTime,
          text: result.text,
          method: result.parsingMethod || result.method || name
        });
      } else {
        console.log(`❌ ${name} - FAILED: ${result.error}`);
        results.push({
          name,
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.log(`💥 ${name} - ERROR: ${error.message}`);
      results.push({
        name,
        success: false,
        error: error.message
      });
    }
    
    console.log('');
  }
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('=' .repeat(80));
  
  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length > 0) {
    // Sort by quality
    successfulResults.sort((a, b) => b.quality - a.quality);
    
    console.log('🏆 RANKING BY QUALITY:');
    successfulResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}`);
      console.log(`   Quality: ${result.quality}/100 | Confidence: ${result.confidence}/100 | Length: ${result.textLength} chars | Time: ${result.processingTime}ms`);
    });
    
    // Show best result
    const bestResult = successfulResults[0];
    console.log('\n🥇 BEST RESULT:');
    console.log(`Method: ${bestResult.name}`);
    console.log(`Quality: ${bestResult.quality}/100`);
    console.log(`Text Length: ${bestResult.textLength} characters`);
    
    console.log('\n📖 BEST RESULT TEXT (first 800 characters):');
    console.log('=' .repeat(80));
    console.log(bestResult.text.substring(0, 800));
    if (bestResult.text.length > 800) {
      console.log('...');
    }
    console.log('=' .repeat(80));
    
    // Save best result
    const fs = require('fs');
    const outputFile = path.join(__dirname, '../../best_parsing_result.txt');
    fs.writeFileSync(outputFile, bestResult.text);
    console.log(`\n💾 Best result saved to: ${outputFile}`);
    
  } else {
    console.log('❌ No methods succeeded');
  }
  
  // Show failed methods
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    console.log('\n❌ FAILED METHODS:');
    failedResults.forEach(result => {
      console.log(`- ${result.name}: ${result.error}`);
    });
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (parser.hasAI) {
    console.log('✅ AI parser is available - this will provide the best results');
    console.log('💡 Set OPENAI_API_KEY environment variable to use AI-enhanced parsing');
  } else {
    console.log('⚠️ AI parser not available (no API key)');
    console.log('💡 To get the best results, set OPENAI_API_KEY environment variable');
  }
  
  if (successfulResults.length > 0) {
    const bestMethod = successfulResults[0];
    console.log(`🏆 Current best method: ${bestMethod.name} (Quality: ${bestMethod.quality}/100)`);
  }
}

// Run the test
if (require.main === module) {
  testAllParsingMethods().catch(console.error);
}

module.exports = { testAllParsingMethods };
