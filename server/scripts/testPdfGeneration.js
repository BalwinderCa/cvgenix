const resumePdfService = require('../services/resumePdfService');
const fs = require('fs');
const path = require('path');

const testPdfGeneration = async () => {
  try {
    console.log('🧪 Testing PDF generation...');
    
    // Get sample data
    const sampleData = resumePdfService.getSampleResumeData();
    console.log('📄 Sample data loaded');
    
    // Test template loading
    const templates = resumePdfService.getAvailableTemplates();
    console.log(`📋 Available templates: ${templates.length}`);
    templates.forEach(template => {
      console.log(`  - ${template.name} (${template.id})`);
    });
    
    // Test PDF generation
    console.log('🚀 Generating PDF...');
    const result = await resumePdfService.generatePdf(sampleData, 'professional-classic');
    
    if (result.success) {
      console.log('✅ PDF generated successfully!');
      console.log(`📊 Size: ${result.size} bytes`);
      
      // Save test PDF
      const testPdfPath = path.join(__dirname, '../temp/test-resume.pdf');
      fs.writeFileSync(testPdfPath, result.pdfBuffer);
      console.log(`💾 Test PDF saved to: ${testPdfPath}`);
    } else {
      console.error('❌ PDF generation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testPdfGeneration();
