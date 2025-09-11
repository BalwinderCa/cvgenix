const fs = require('fs');
const path = require('path');
const ParserComparison = require('../utils/parserComparison');
const EnhancedResumeParser = require('../utils/enhancedResumeParser');
const SimpleATSAnalyzer = require('../utils/simpleATSAnalyzer');

/**
 * Comprehensive test script for all resumes
 * Tests enhanced parsing and ATS analysis
 */
async function testAllResumes() {
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

  console.log('🚀 COMPREHENSIVE RESUME PARSING TEST');
  console.log('=' .repeat(80));
  console.log(`📁 Found ${resumeFiles.length} resume files to test`);
  console.log('');

  const results = [];
  const comparison = new ParserComparison();
  const parser = new EnhancedResumeParser();
  const analyzer = new SimpleATSAnalyzer();

  // Test each resume
  for (let i = 0; i < resumeFiles.length; i++) {
    const filePath = resumeFiles[i];
    const fileName = path.basename(filePath);
    
    console.log(`\n📄 TESTING RESUME ${i + 1}/${resumeFiles.length}: ${fileName}`);
    console.log('=' .repeat(60));

    try {
      // Test 1: Parser Comparison
      console.log('🔍 Running parser comparison...');
      const comparisonResults = await comparison.compareParsingMethods(filePath);
      const bestMethod = comparison.getBestMethod();

      // Test 2: Enhanced Parser Direct Test
      console.log('\n🔍 Testing enhanced parser directly...');
      const parseResult = await parser.parseResume(filePath, 'application/pdf');

      // Test 3: ATS Analysis (if parsing succeeded)
      let atsResult = null;
      if (parseResult.success) {
        console.log('\n🤖 Running ATS analysis...');
        try {
          atsResult = await analyzer.analyzeResume({
            filePath: filePath,
            mimeType: 'application/pdf'
          }, 'technology', 'Senior');
        } catch (atsError) {
          console.log('⚠️ ATS analysis failed:', atsError.message);
        }
      }

      // Store results
      const result = {
        fileName: fileName,
        filePath: filePath,
        comparisonResults: comparisonResults,
        bestMethod: bestMethod,
        parseResult: parseResult,
        atsResult: atsResult,
        summary: {
          parsingSuccess: parseResult.success,
          parsingMethod: parseResult.parsingMethod,
          confidence: parseResult.confidence,
          textLength: parseResult.text ? parseResult.text.length : 0,
          atsScore: atsResult ? atsResult.atsScore : null,
          atsGrade: atsResult ? atsResult.overallGrade : null
        }
      };

      results.push(result);

      // Print summary for this resume
      console.log('\n📊 SUMMARY FOR', fileName);
      console.log('-' .repeat(40));
      console.log(`✅ Parsing Success: ${parseResult.success ? 'YES' : 'NO'}`);
      if (parseResult.success) {
        console.log(`🔧 Method Used: ${parseResult.parsingMethod}`);
        console.log(`📈 Confidence: ${parseResult.confidence}/100`);
        console.log(`📝 Text Length: ${parseResult.text.length} characters`);
        console.log(`📄 Pages: ${parseResult.pages || 'Unknown'}`);
      }
      if (atsResult) {
        console.log(`🎯 ATS Score: ${atsResult.atsScore}/100`);
        console.log(`🏆 ATS Grade: ${atsResult.overallGrade}`);
        console.log(`🤖 Models Used: ${atsResult.modelsUsed ? atsResult.modelsUsed.join(', ') : 'Unknown'}`);
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
  console.log('\n\n🏆 COMPREHENSIVE TEST RESULTS');
  console.log('=' .repeat(80));

  const successfulParses = results.filter(r => r.summary.parsingSuccess);
  const failedParses = results.filter(r => !r.summary.parsingSuccess);
  const successfulATS = results.filter(r => r.atsResult);

  console.log(`📊 OVERALL STATISTICS:`);
  console.log(`   Total Resumes: ${results.length}`);
  console.log(`   Successful Parses: ${successfulParses.length}`);
  console.log(`   Failed Parses: ${failedParses.length}`);
  console.log(`   Successful ATS Analysis: ${successfulATS.length}`);
  console.log(`   Success Rate: ${Math.round((successfulParses.length / results.length) * 100)}%`);

  if (successfulParses.length > 0) {
    const avgConfidence = successfulParses.reduce((sum, r) => sum + (r.summary.confidence || 0), 0) / successfulParses.length;
    const avgTextLength = successfulParses.reduce((sum, r) => sum + (r.summary.textLength || 0), 0) / successfulParses.length;
    
    console.log(`\n📈 PARSING QUALITY:`);
    console.log(`   Average Confidence: ${Math.round(avgConfidence)}/100`);
    console.log(`   Average Text Length: ${Math.round(avgTextLength)} characters`);
  }

  if (successfulATS.length > 0) {
    const avgATSScore = successfulATS.reduce((sum, r) => sum + (r.summary.atsScore || 0), 0) / successfulATS.length;
    console.log(`\n🎯 ATS ANALYSIS:`);
    console.log(`   Average ATS Score: ${Math.round(avgATSScore)}/100`);
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
      if (result.summary.atsScore) {
        console.log(`   ATS Score: ${result.summary.atsScore}/100 (${result.summary.atsGrade})`);
      }
    } else {
      console.log(`   Error: ${result.summary.error || 'Unknown error'}`);
    }
  });

  // Save detailed results
  const outputPath = path.join(__dirname, '../temp/comprehensive_test_results.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalResumes: results.length,
    successfulParses: successfulParses.length,
    failedParses: failedParses.length,
    successfulATS: successfulATS.length,
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
  if (successfulATS.length > 0) {
    const lowATS = successfulATS.filter(r => (r.summary.atsScore || 0) < 60);
    if (lowATS.length > 0) {
      console.log(`   ⚠️  ${lowATS.length} resumes have low ATS scores - need optimization`);
    }
  }

  console.log(`\n✅ Comprehensive testing completed!`);
}

// Run the test
testAllResumes().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
