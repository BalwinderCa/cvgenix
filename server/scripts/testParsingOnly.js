const fs = require('fs');
const path = require('path');
const ParserComparison = require('../utils/parserComparison');
const EnhancedResumeParser = require('../utils/enhancedResumeParser');

/**
 * Test script focused on parsing capabilities only (no ATS analysis)
 */
async function testParsingOnly() {
  const resumesDir = path.join(__dirname, '../../resumes');
  
  if (!fs.existsSync(resumesDir)) {
    console.log('❌ Resumes directory not found:', resumesDir);
    process.exit(1);
  }

  const resumeFiles = fs.readdirSync(resumesDir)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .map(file => path.join(resumesDir, file));

  if (resumeFiles.length === 0) {
    console.log('❌ No PDF files found in resumes directory');
    process.exit(1);
  }

  console.log('🚀 PDF PARSING TEST (Parsing Only)');
  console.log('=' .repeat(60));
  console.log(`📁 Found ${resumeFiles.length} resume files to test`);
  console.log('');

  const results = [];
  const comparison = new ParserComparison();
  const parser = new EnhancedResumeParser();

  // Test each resume
  for (let i = 0; i < resumeFiles.length; i++) {
    const filePath = resumeFiles[i];
    const fileName = path.basename(filePath);
    
    console.log(`\n📄 TESTING RESUME ${i + 1}/${resumeFiles.length}: ${fileName}`);
    console.log('=' .repeat(50));

    try {
      // Test 1: Parser Comparison
      console.log('🔍 Running parser comparison...');
      const comparisonResults = await comparison.compareParsingMethods(filePath);
      const bestMethod = comparison.getBestMethod();

      // Test 2: Enhanced Parser Direct Test
      console.log('\n🔍 Testing enhanced parser directly...');
      const parseResult = await parser.parseResume(filePath, 'application/pdf');

      // Store results
      const result = {
        fileName: fileName,
        filePath: filePath,
        comparisonResults: comparisonResults,
        bestMethod: bestMethod,
        parseResult: parseResult,
        summary: {
          parsingSuccess: parseResult.success,
          parsingMethod: parseResult.parsingMethod,
          confidence: parseResult.confidence,
          textLength: parseResult.text ? parseResult.text.length : 0,
          pages: parseResult.pages || 0
        }
      };

      results.push(result);

      // Print summary for this resume
      console.log('\n📊 SUMMARY FOR', fileName);
      console.log('-' .repeat(30));
      console.log(`✅ Parsing Success: ${parseResult.success ? 'YES' : 'NO'}`);
      if (parseResult.success) {
        console.log(`🔧 Method Used: ${parseResult.parsingMethod}`);
        console.log(`📈 Confidence: ${parseResult.confidence}/100`);
        console.log(`📝 Text Length: ${parseResult.text.length} characters`);
        console.log(`📄 Pages: ${parseResult.pages || 'Unknown'}`);
        
        // Show text preview
        const preview = parseResult.text.substring(0, 150).replace(/\n/g, ' ');
        console.log(`📖 Preview: ${preview}...`);
      } else {
        console.log(`❌ Error: ${parseResult.error}`);
      }

      // Show comparison results
      if (bestMethod) {
        console.log(`\n🏆 Best Method from Comparison: ${bestMethod.method}`);
        console.log(`   Quality: ${bestMethod.quality}/100`);
        console.log(`   Speed: ${bestMethod.duration}ms`);
      }

    } catch (error) {
      console.error(`❌ Error testing ${fileName}:`, error.message);
      results.push({
        fileName: fileName,
        filePath: filePath,
        error: error.message,
        summary: {
          parsingSuccess: false,
          error: error.message
        }
      });
    }
  }

  // Generate comprehensive report
  console.log('\n\n🏆 PARSING TEST RESULTS');
  console.log('=' .repeat(60));

  const successfulParses = results.filter(r => r.summary.parsingSuccess);
  const failedParses = results.filter(r => !r.summary.parsingSuccess);

  console.log(`📊 OVERALL STATISTICS:`);
  console.log(`   Total Resumes: ${results.length}`);
  console.log(`   Successful Parses: ${successfulParses.length}`);
  console.log(`   Failed Parses: ${failedParses.length}`);
  console.log(`   Success Rate: ${Math.round((successfulParses.length / results.length) * 100)}%`);

  if (successfulParses.length > 0) {
    const avgConfidence = successfulParses.reduce((sum, r) => sum + (r.summary.confidence || 0), 0) / successfulParses.length;
    const avgTextLength = successfulParses.reduce((sum, r) => sum + (r.summary.textLength || 0), 0) / successfulParses.length;
    
    console.log(`\n📈 PARSING QUALITY:`);
    console.log(`   Average Confidence: ${Math.round(avgConfidence)}/100`);
    console.log(`   Average Text Length: ${Math.round(avgTextLength)} characters`);
  }

  // Method usage statistics
  const methodUsage = {};
  successfulParses.forEach(r => {
    const method = r.summary.parsingMethod || 'unknown';
    methodUsage[method] = (methodUsage[method] || 0) + 1;
  });

  console.log(`\n🔧 PARSING METHOD USAGE:`);
  Object.entries(methodUsage).forEach(([method, count]) => {
    console.log(`   ${method}: ${count} times`);
  });

  // Detailed results for each resume
  console.log(`\n📋 DETAILED RESULTS:`);
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.fileName}`);
    console.log(`   Status: ${result.summary.parsingSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (result.summary.parsingSuccess) {
      console.log(`   Method: ${result.summary.parsingMethod}`);
      console.log(`   Confidence: ${result.summary.confidence}/100`);
      console.log(`   Text Length: ${result.summary.textLength} chars`);
      console.log(`   Pages: ${result.summary.pages}`);
    } else {
      console.log(`   Error: ${result.summary.error || 'Unknown error'}`);
    }
  });

  // Save detailed results
  const outputPath = path.join(__dirname, '../temp/parsing_test_results.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalResumes: results.length,
    successfulParses: successfulParses.length,
    failedParses: failedParses.length,
    successRate: Math.round((successfulParses.length / results.length) * 100),
    methodUsage: methodUsage,
    results: results
  };

  // Ensure temp directory exists
  const tempDir = path.dirname(outputPath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  await fs.promises.writeFile(outputPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed results saved to: ${outputPath}`);

  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (failedParses.length > 0) {
    console.log(`   ⚠️  ${failedParses.length} resumes failed to parse - check file formats`);
  }
  if (successfulParses.length > 0) {
    const lowConfidence = successfulParses.filter(r => (r.summary.confidence || 0) < 70);
    if (lowConfidence.length > 0) {
      console.log(`   ⚠️  ${lowConfidence.length} resumes have low confidence scores - may need OCR`);
    }
  }

  console.log(`\n✅ Parsing test completed!`);
}

// Run the test
testParsingOnly().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
