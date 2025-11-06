const express = require('express');
const FAQ = require('../models/FAQ');

const router = express.Router();

// @route   GET /api/faqs
// @desc    Get FAQs - optionally filtered by featured/active status
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { featured, active, category } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by active status (default to true if not specified)
    if (active !== undefined) {
      query.isActive = active === 'true';
    } else {
      query.isActive = true; // Default to active only
    }
    
    // Filter by featured status if requested
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Fetch FAQs from database
    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 }) // Sort by order first, then by creation date
      .lean(); // Use lean() for better performance
    
    console.log(`[FAQs API] Found ${faqs.length} FAQs matching query`);
    
    // Transform to frontend format
    const formattedFAQs = faqs.map(faq => ({
      _id: faq._id.toString(),
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive,
      isFeatured: faq.isFeatured,
      views: faq.views,
      helpful: faq.helpful,
      notHelpful: faq.notHelpful
    }));
    
    res.json({
      success: true,
      data: formattedFAQs,
      count: formattedFAQs.length
    });
  } catch (error) {
    console.error('[FAQs API] Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQs',
      message: error.message
    });
  }
});

// @route   GET /api/faqs/featured
// @desc    Get featured FAQs for homepage
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    // Get active and featured FAQs, sorted by order
    const faqs = await FAQ.find({
      isActive: true,
      isFeatured: true
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    console.log(`[FAQs API] Found ${faqs.length} featured FAQs`);
    
    // Transform to frontend format
    const formattedFAQs = faqs.map(faq => ({
      _id: faq._id.toString(),
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order
    }));
    
    res.json({
      success: true,
      data: formattedFAQs,
      count: formattedFAQs.length
    });
  } catch (error) {
    console.error('[FAQs API] Error fetching featured FAQs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured FAQs',
      message: error.message
    });
  }
});

module.exports = router;

