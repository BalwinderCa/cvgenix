const mongoose = require('mongoose');
const Template = require('../models/Template');

// Function to convert Text objects to Textbox objects in canvas data
function convertTextToTextbox(canvasData) {
  if (!canvasData || !canvasData.objects) {
    return canvasData;
  }

  const updatedObjects = canvasData.objects.map(obj => {
    // If it's a text object, convert it to textbox
    if (obj.type === 'text' && obj.text) {
      return {
        ...obj,
        type: 'textbox',
        // Ensure textbox has proper dimensions
        width: obj.width || 200,
        height: obj.height || 50,
        // Add textbox-specific properties
        splitByGrapheme: true,
        // Preserve all existing properties
        fontSize: obj.fontSize || 16,
        fontFamily: obj.fontFamily || 'Arial',
        fill: obj.fill || '#000000',
        fontWeight: obj.fontWeight || 'normal',
        fontStyle: obj.fontStyle || 'normal',
        textAlign: obj.textAlign || 'left',
        lineHeight: obj.lineHeight || 1.2,
        charSpacing: obj.charSpacing || 0,
        underline: obj.underline || false,
        // Preserve positioning
        left: obj.left || 0,
        top: obj.top || 0,
        originX: obj.originX || 'left',
        originY: obj.originY || 'top',
        // Preserve other properties
        selectable: obj.selectable !== false,
        evented: obj.evented !== false,
        lockMovementX: obj.lockMovementX || false,
        lockMovementY: obj.lockMovementY || false,
        lockRotation: obj.lockRotation !== false,
        lockScalingX: obj.lockScalingX || false,
        lockScalingY: obj.lockScalingY || false
      };
    }
    return obj;
  });

  return {
    ...canvasData,
    objects: updatedObjects
  };
}

async function updateTemplatesForEditing() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb');
    console.log('✅ Connected to MongoDB Atlas');

    // Find all canvas templates
    const templates = await Template.find({ 
      renderEngine: 'canvas',
      canvasData: { $exists: true, $ne: null }
    });

    console.log(`📋 Found ${templates.length} canvas templates to update`);

    let updatedCount = 0;

    for (const template of templates) {
      try {
        console.log(`\n🔄 Processing template: ${template.name}`);
        
        // Convert text objects to textbox objects
        const updatedCanvasData = convertTextToTextbox(template.canvasData);
        
        // Check if any changes were made
        const hasChanges = JSON.stringify(template.canvasData) !== JSON.stringify(updatedCanvasData);
        
        if (hasChanges) {
          // Count text objects that were converted
          const originalTextObjects = template.canvasData?.objects?.filter(obj => obj.type === 'text') || [];
          const newTextboxObjects = updatedCanvasData?.objects?.filter(obj => obj.type === 'textbox') || [];
          
          console.log(`  📝 Converting ${originalTextObjects.length} text objects to textbox objects`);
          
          // Update the template
          await Template.findByIdAndUpdate(template._id, {
            canvasData: updatedCanvasData
          });
          
          updatedCount++;
          console.log(`  ✅ Updated template: ${template.name}`);
        } else {
          console.log(`  ⏭️  No text objects found in: ${template.name}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error updating template ${template.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Update complete!`);
    console.log(`📊 Summary:`);
    console.log(`  - Total templates processed: ${templates.length}`);
    console.log(`  - Templates updated: ${updatedCount}`);
    console.log(`  - Templates unchanged: ${templates.length - updatedCount}`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error updating templates:', error);
    process.exit(1);
  }
}

// Run the script
updateTemplatesForEditing();
