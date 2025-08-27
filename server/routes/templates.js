const express = require('express');
const router = express.Router();

// Predefined templates data
const templates = [
  {
    id: 'modern',
    name: 'Modern',
    category: 'Professional',
    description: 'Clean and contemporary design with bold typography',
    preview: '/templates/modern-preview.png',
    colors: ['#2c3e50', '#3498db', '#ecf0f1'],
    features: ['Professional layout', 'Bold headings', 'Clean spacing']
  },
  {
    id: 'classic',
    name: 'Classic',
    category: 'Traditional',
    description: 'Timeless design perfect for conservative industries',
    preview: '/templates/classic-preview.png',
    colors: ['#000000', '#333333', '#666666'],
    features: ['Traditional layout', 'Serif fonts', 'Formal appearance']
  },
  {
    id: 'creative',
    name: 'Creative',
    category: 'Design',
    description: 'Eye-catching design for creative professionals',
    preview: '/templates/creative-preview.png',
    colors: ['#e74c3c', '#f39c12', '#9b59b6'],
    features: ['Colorful accents', 'Modern typography', 'Visual hierarchy']
  },
  {
    id: 'minimal',
    name: 'Minimal',
    category: 'Clean',
    description: 'Simple and elegant design focusing on content',
    preview: '/templates/minimal-preview.png',
    colors: ['#2c3e50', '#95a5a6', '#ecf0f1'],
    features: ['Minimal design', 'Plenty of white space', 'Focus on content']
  },
  {
    id: 'executive',
    name: 'Executive',
    category: 'Professional',
    description: 'Sophisticated design for senior-level positions',
    preview: '/templates/executive-preview.png',
    colors: ['#34495e', '#2980b9', '#7f8c8d'],
    features: ['Executive layout', 'Professional colors', 'Strategic spacing']
  },
  {
    id: 'tech',
    name: 'Tech',
    category: 'Technology',
    description: 'Modern design perfect for tech professionals',
    preview: '/templates/tech-preview.png',
    colors: ['#1a1a1a', '#00d4ff', '#ffffff'],
    features: ['Tech-focused design', 'Code-friendly layout', 'Modern aesthetics']
  }
];

// Get all templates
router.get('/', (req, res) => {
  res.json({ templates });
});

// Get template by ID
router.get('/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  res.json({ template });
});

// Get templates by category
router.get('/category/:category', (req, res) => {
  const categoryTemplates = templates.filter(t => 
    t.category.toLowerCase() === req.params.category.toLowerCase()
  );
  
  res.json({ templates: categoryTemplates });
});

module.exports = router;
