const path = require('path');
const ParserComparison = require('../utils/parserComparison');
const EnhancedResumeParser = require('../utils/enhancedResumeParser');

/**
 * Test script to compare different PDF parsing methods
 * Usage: node scripts/testParserComparison.js [filePath]
 */
async function testParserComparison() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('❌ Please provide a file path');
    console.log('Usage: node scripts/testParserComparison.js <filePath>');
    process.exit(1);
  }

  if (!require('fs').existsSync(filePath)) {
    console.log('❌ File not found:', filePath);
    process.exit(1);
  }

  console.log('🚀 Starting PDF Parser Comparison Test');
  console.log('=' .repeat(60));
  
  try {
    // Initialize comparison utility
    const comparison = new ParserComparison();
    
    // Determine MIME type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'application/pdf';
    
    if (ext === '.docx') {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (ext === '.txt') {
      mimeType = 'text/plain';
    } else if (ext === '.html' || ext === '.htm') {
      mimeType = 'text/html';
    }

    // Run comparison
    const results = await comparison.compareParsingMethods(filePath, mimeType);
    
    // Get best method
    const bestMethod = comparison.getBestMethod();
    
    if (bestMethod) {
      console.log('\n🎯 RECOMMENDED PARSING METHOD');
      console.log('=' .repeat(40));
      console.log(`Method: ${bestMethod.method}`);
      console.log(`Quality: ${bestMethod.quality}/100`);
      console.log(`Speed: ${bestMethod.duration}ms`);
      console.log(`Text Length: ${bestMethod.textLength} characters`);
      
      // Save results
      const outputPath = path.join(__dirname, '../temp/parser_comparison_results.json');
      await comparison.saveResults(outputPath);
    } else {
      console.log('\n❌ No successful parsing methods found');
    }

    // Test the enhanced parser directly
    console.log('\n🔍 Testing Enhanced Resume Parser Directly');
    console.log('=' .repeat(50));
    
    const parser = new EnhancedResumeParser();
    const parseResult = await parser.parseResume(filePath, mimeType);
    
    if (parseResult.success) {
      console.log('✅ Enhanced parser succeeded');
      console.log(`Method: ${parseResult.parsingMethod}`);
      console.log(`Confidence: ${parseResult.confidence}/100`);
      console.log(`Text Length: ${parseResult.text.length} characters`);
      console.log(`Pages: ${parseResult.pages}`);
      
      // Show text preview
      const preview = parseResult.text.substring(0, 200).replace(/\n/g, ' ');
      console.log(`Preview: ${preview}...`);
    } else {
      console.log('❌ Enhanced parser failed:', parseResult.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testParserComparison().then(() => {
  console.log('\n✅ Parser comparison test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
