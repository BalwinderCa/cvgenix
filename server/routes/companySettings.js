const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/company-settings
// @desc    Get company settings (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getCompanySettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company settings'
    });
  }
});

// @route   PUT /api/company-settings
// @desc    Update company settings (admin only)
// @access  Private (Admin)
router.put('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Ensure type is 'company'
    const updateData = { ...req.body, type: 'company' };
    
    // Update or create company settings
    const settings = await Settings.findOneAndUpdate(
      { type: 'company' },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Company settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company settings'
    });
  }
});

module.exports = router;

