import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Pagination,
  InputAdornment,
  Badge,
  CardActionArea,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  Sort as SortIcon,
  Palette as PaletteIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingIcon,
  NewReleases as NewIcon,
  LocalOffer as PremiumIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Template {
  id: number;
  name: string;
  description: string;
  preview_image: string;
  category: string;
  is_premium: boolean;
  is_featured: boolean;
  rating: number;
  rating_count: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  price?: number;
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
}

interface TemplateCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  template_count: number;
}

const Templates: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchFavorites();
  }, [currentPage, selectedCategory, sortBy, showPremiumOnly, showFreeOnly]);

  const fetchTemplates = async () => {
    try {
      let url = `/templates/templates/?page=${currentPage}`;
      
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (sortBy) {
        url += `&ordering=${sortBy}`;
      }
      
      if (showPremiumOnly) {
        url += '&is_premium=true';
      }
      
      if (showFreeOnly) {
        url += '&is_premium=false';
      }

      const response = await api.get(url);
      setTemplates(response.data.results || []);
      setTotalPages(Math.ceil((response.data.count || 0) / 12)); // Assuming 12 items per page
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/templates/categories/');
      setCategories(response.data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/templates/favorites/');
      setFavorites(response.data.results?.map((fav: any) => fav.template) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(1);
    fetchTemplates();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (templateId: number) => {
    try {
      if (favorites.includes(templateId)) {
        await api.delete(`/templates/templates/${templateId}/favorite/`);
        setFavorites(favorites.filter(id => id !== templateId));
        toast.success('Removed from favorites');
      } else {
        await api.post(`/templates/templates/${templateId}/favorite/`);
        setFavorites([...favorites, templateId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      // Navigate to resume builder with selected template
      // This would typically involve navigation or state management
      toast.success(`Template "${template.name}" selected for new resume`);
      // You could implement navigation here: navigate(`/resume-builder?template=${template.id}`);
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to use template');
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setOpenPreview(true);
  };

  const handleRateTemplate = async (templateId: number, rating: number) => {
    try {
      await api.post(`/templates/templates/${templateId}/rate/`, { rating });
      toast.success('Rating submitted successfully');
      fetchTemplates(); // Refresh to get updated ratings
    } catch (error) {
      console.error('Error rating template:', error);
      toast.error('Failed to submit rating');
    }
  };

  const renderTemplateCard = (template: Template) => (
    <Card key={template.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => handlePreviewTemplate(template)}>
        <CardMedia
          component="img"
          height="200"
          image={template.preview_image || '/placeholder-template.jpg'}
          alt={template.name}
          sx={{ objectFit: 'cover' }}
        />
      </CardActionArea>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h2" noWrap>
            {template.name}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(template.id);
            }}
          >
            {favorites.includes(template.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
          {template.description}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <Rating
            value={template.rating}
            readOnly
            size="small"
            precision={0.5}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({template.rating_count})
          </Typography>
        </Box>
        
        <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
          <Chip
            label={template.category}
            size="small"
            variant="outlined"
            icon={<CategoryIcon />}
          />
          {template.is_premium && (
            <Chip
              label="Premium"
              size="small"
              color="secondary"
              icon={<PremiumIcon />}
            />
          )}
          {template.is_featured && (
            <Chip
              label="Featured"
              size="small"
              color="primary"
              icon={<StarIcon />}
            />
          )}
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {template.usage_count} uses
          </Typography>
          {template.price ? (
            <Typography variant="h6" color="primary">
              ${template.price}
            </Typography>
          ) : (
            <Typography variant="h6" color="success.main">
              Free
            </Typography>
          )}
        </Box>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<PreviewIcon />}
          onClick={() => handlePreviewTemplate(template)}
          fullWidth
        >
          Preview
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleUseTemplate(template)}
          fullWidth
        >
          Use Template
        </Button>
      </CardActions>
    </Card>
  );

  const renderTemplateList = (template: Template) => (
    <ListItem key={template.id} divider>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <CardMedia
          component="img"
          width="120"
          height="80"
          image={template.preview_image || '/placeholder-template.jpg'}
          alt={template.name}
          sx={{ objectFit: 'cover', mr: 2, borderRadius: 1 }}
        />
        
        <Box sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              {template.name}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleToggleFavorite(template.id)}
            >
              {favorites.includes(template.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {template.description}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2}>
            <Rating value={template.rating} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              {template.rating_count} reviews
            </Typography>
            <Chip label={template.category} size="small" variant="outlined" />
            {template.is_premium && <Chip label="Premium" size="small" color="secondary" />}
            <Typography variant="body2" color="text.secondary">
              {template.usage_count} uses
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {template.price ? (
            <Typography variant="h6" color="primary">
              ${template.price}
            </Typography>
          ) : (
            <Typography variant="h6" color="success.main">
              Free
            </Typography>
          )}
          <Button
            size="small"
            variant="contained"
            onClick={() => handleUseTemplate(template)}
          >
            Use Template
          </Button>
        </Box>
      </Box>
    </ListItem>
  );

  const renderPreviewDialog = () => (
    <Dialog
      open={openPreview}
      onClose={() => setOpenPreview(false)}
      maxWidth="lg"
      fullWidth
    >
      {selectedTemplate && (
        <>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">{selectedTemplate.name}</Typography>
              <IconButton onClick={() => setOpenPreview(false)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <CardMedia
                  component="img"
                  height="400"
                  image={selectedTemplate.preview_image || '/placeholder-template.jpg'}
                  alt={selectedTemplate.name}
                  sx={{ objectFit: 'contain', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Template Details
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedTemplate.description}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Rating
                    value={selectedTemplate.rating}
                    onChange={(_, value) => value && handleRateTemplate(selectedTemplate.id, value)}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({selectedTemplate.rating_count} reviews)
                  </Typography>
                </Box>
                
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip label={selectedTemplate.category} variant="outlined" />
                  {selectedTemplate.is_premium && <Chip label="Premium" color="secondary" />}
                  {selectedTemplate.is_featured && <Chip label="Featured" color="primary" />}
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Usage:</strong> {selectedTemplate.usage_count} times
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Created:</strong> {new Date(selectedTemplate.created_at).toLocaleDateString()}
                </Typography>
                
                {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Tags:</strong>
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {selectedTemplate.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      handleUseTemplate(selectedTemplate);
                      setOpenPreview(false);
                    }}
                  >
                    Use This Template
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        </>
      )}
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Resume Templates
      </Typography>
      
      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="usage">Most Used</MenuItem>
                  <MenuItem value="name">Name A-Z</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={showPremiumOnly}
                    onChange={(e) => setShowPremiumOnly(e.target.checked)}
                  />
                }
                label="Premium Only"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={showFreeOnly}
                    onChange={(e) => setShowFreeOnly(e.target.checked)}
                  />
                }
                label="Free Only"
              />
              
              <IconButton
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <ListIcon /> : <GridIcon />}
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Templates Display */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {templates.map(renderTemplateCard)}
        </Grid>
      ) : (
        <Paper>
          <List>
            {templates.map(renderTemplateList)}
          </List>
        </Paper>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {renderPreviewDialog()}
    </Container>
  );
};

export default Templates;
