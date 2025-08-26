import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Palette as PaletteIcon,
  FormatSize as FontIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface ResumeSection {
  id?: number;
  section_type: string;
  title: string;
  content: string;
  order: number;
  is_visible: boolean;
  custom_styles?: string;
}

interface Resume {
  id?: number;
  title: string;
  template: number;
  sections: ResumeSection[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  preview_image: string;
  category: string;
  is_premium: boolean;
}

const ResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'new' | 'edit' | 'template'>('new');
  const [previewMode, setPreviewMode] = useState(false);

  // Form states
  const [resumeForm, setResumeForm] = useState({
    title: '',
    template: 1,
  });

  const [sectionForm, setSectionForm] = useState<ResumeSection>({
    section_type: 'summary',
    title: '',
    content: '',
    order: 0,
    is_visible: true,
  });

  const [editingSection, setEditingSection] = useState<ResumeSection | null>(null);

  useEffect(() => {
    fetchResumes();
    fetchTemplates();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes/resumes/');
      setResumes(response.data.results || []);
      if (response.data.results && response.data.results.length > 0) {
        setCurrentResume(response.data.results[0]);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates/templates/');
      setTemplates(response.data.results || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const handleCreateResume = async () => {
    setSaving(true);
    try {
      const response = await api.post('/resumes/resumes/', resumeForm);
      const newResume = response.data;
      setResumes([...resumes, newResume]);
      setCurrentResume(newResume);
      setOpenDialog(false);
      toast.success('Resume created successfully');
    } catch (error) {
      console.error('Error creating resume:', error);
      toast.error('Failed to create resume');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResume = async () => {
    if (!currentResume) return;
    
    setSaving(true);
    try {
      const response = await api.patch(`/resumes/resumes/${currentResume.id}/`, {
        title: currentResume.title,
        template: currentResume.template,
      });
      setCurrentResume(response.data);
      toast.success('Resume saved successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = () => {
    setDialogType('new');
    setEditingSection(null);
    setSectionForm({
      section_type: 'summary',
      title: '',
      content: '',
      order: currentResume?.sections?.length || 0,
      is_visible: true,
    });
    setOpenDialog(true);
  };

  const handleEditSection = (section: ResumeSection) => {
    setDialogType('edit');
    setEditingSection(section);
    setSectionForm(section);
    setOpenDialog(true);
  };

  const handleSaveSection = async () => {
    if (!currentResume) return;

    try {
      let response;
      if (editingSection) {
        // Update existing section
        response = await api.patch(`/resumes/resumes/${currentResume.id}/sections/${editingSection.id}/`, sectionForm);
      } else {
        // Create new section
        response = await api.post(`/resumes/resumes/${currentResume.id}/sections/`, sectionForm);
      }
      
      // Refresh resume data
      const resumeResponse = await api.get(`/resumes/resumes/${currentResume.id}/`);
      setCurrentResume(resumeResponse.data);
      setOpenDialog(false);
      toast.success(`Section ${editingSection ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error(`Failed to ${editingSection ? 'update' : 'add'} section`);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!currentResume || !window.confirm('Are you sure you want to delete this section?')) return;

    try {
      await api.delete(`/resumes/resumes/${currentResume.id}/sections/${sectionId}/`);
      
      // Refresh resume data
      const response = await api.get(`/resumes/resumes/${currentResume.id}/`);
      setCurrentResume(response.data);
      toast.success('Section deleted successfully');
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };

  const handleToggleSectionVisibility = async (section: ResumeSection) => {
    if (!currentResume) return;

    try {
      const updatedSection = { ...section, is_visible: !section.is_visible };
      await api.patch(`/resumes/resumes/${currentResume.id}/sections/${section.id}/`, updatedSection);
      
      // Refresh resume data
      const response = await api.get(`/resumes/resumes/${currentResume.id}/`);
      setCurrentResume(response.data);
    } catch (error) {
      console.error('Error updating section visibility:', error);
      toast.error('Failed to update section visibility');
    }
  };

  const handleExportResume = async (format: 'pdf' | 'docx') => {
    if (!currentResume) return;

    try {
      const response = await api.post(`/resumes/resumes/${currentResume.id}/export/`, {
        format: format,
      });
      
      // Handle file download
      const blob = new Blob([response.data], { type: `application/${format}` });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentResume.title}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Resume exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting resume:', error);
      toast.error('Failed to export resume');
    }
  };

  const renderSectionContent = (section: ResumeSection) => {
    switch (section.section_type) {
      case 'summary':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Professional Summary</Typography>
            <Typography variant="body1">{section.content}</Typography>
          </Box>
        );
      case 'experience':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Work Experience</Typography>
            <Typography variant="body1">{section.content}</Typography>
          </Box>
        );
      case 'education':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Education</Typography>
            <Typography variant="body1">{section.content}</Typography>
          </Box>
        );
      case 'skills':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Skills</Typography>
            <Typography variant="body1">{section.content}</Typography>
          </Box>
        );
      case 'projects':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Projects</Typography>
            <Typography variant="body1">{section.content}</Typography>
          </Box>
        );
      case 'certifications':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Certifications</Typography>
            <Typography variant="body1">{section.content}</Typography>
          </Box>
        );
      default:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>{section.title}</Typography>
            <Typography variant="body1">{section.content}</Typography>
          </Box>
        );
    }
  };

  const renderDialog = () => {
    if (dialogType === 'new' || dialogType === 'edit') {
      return (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingSection ? 'Edit Section' : 'Add New Section'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Section Type</InputLabel>
                  <Select
                    value={sectionForm.section_type}
                    onChange={(e) => setSectionForm({ ...sectionForm, section_type: e.target.value })}
                    label="Section Type"
                  >
                    <MenuItem value="summary">Professional Summary</MenuItem>
                    <MenuItem value="experience">Work Experience</MenuItem>
                    <MenuItem value="education">Education</MenuItem>
                    <MenuItem value="skills">Skills</MenuItem>
                    <MenuItem value="projects">Projects</MenuItem>
                    <MenuItem value="certifications">Certifications</MenuItem>
                    <MenuItem value="custom">Custom Section</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Section Title"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Content"
                  value={sectionForm.content}
                  onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                  placeholder="Enter the content for this section..."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={sectionForm.is_visible}
                      onChange={(e) => setSectionForm({ ...sectionForm, is_visible: e.target.checked })}
                    />
                  }
                  label="Visible in resume"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSection} variant="contained" color="primary">
              {editingSection ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    if (dialogType === 'template') {
      return (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Create New Resume</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Resume Title"
                  value={resumeForm.title}
                  onChange={(e) => setResumeForm({ ...resumeForm, title: e.target.value })}
                  placeholder="e.g., Software Engineer Resume"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Choose Template</Typography>
                <Grid container spacing={2}>
                  {templates.map((template) => (
                    <Grid item xs={12} sm={6} md={4} key={template.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: resumeForm.template === template.id ? 2 : 1,
                          borderColor: resumeForm.template === template.id ? 'primary.main' : 'divider',
                        }}
                        onClick={() => setResumeForm({ ...resumeForm, template: template.id })}
                      >
                        <CardContent>
                          <Typography variant="h6">{template.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {template.description}
                          </Typography>
                          {template.is_premium && (
                            <Chip label="Premium" color="secondary" size="small" sx={{ mt: 1 }} />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateResume}
              variant="contained"
              color="primary"
              disabled={!resumeForm.title || saving}
            >
              {saving ? <CircularProgress size={20} /> : 'Create Resume'}
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Resume Builder</Typography>
        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              setDialogType('template');
              setResumeForm({ title: '', template: 1 });
              setOpenDialog(true);
            }}
            variant="contained"
            sx={{ mr: 1 }}
          >
            New Resume
          </Button>
          {currentResume && (
            <>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSaveResume}
                variant="outlined"
                disabled={saving}
                sx={{ mr: 1 }}
              >
                {saving ? <CircularProgress size={20} /> : 'Save'}
              </Button>
              <Button
                startIcon={<PreviewIcon />}
                onClick={() => setPreviewMode(!previewMode)}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => handleExportResume('pdf')}
                variant="outlined"
              >
                Export PDF
              </Button>
            </>
          )}
        </Box>
      </Box>

      {!currentResume ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Resume Selected
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first resume or select an existing one to get started.
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              setDialogType('template');
              setResumeForm({ title: '', template: 1 });
              setOpenDialog(true);
            }}
            variant="contained"
            size="large"
          >
            Create New Resume
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Left Panel - Resume List */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                My Resumes
              </Typography>
              <List>
                {resumes.map((resume) => (
                  <ListItem
                    key={resume.id}
                    button
                    selected={currentResume?.id === resume.id}
                    onClick={() => setCurrentResume(resume)}
                  >
                    <ListItemText
                      primary={resume.title}
                      secondary={`Updated ${new Date(resume.updated_at).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Center Panel - Builder */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {currentResume.title}
                </Typography>
                <IconButton onClick={handleAddSection} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>

              {currentResume.sections && currentResume.sections.length > 0 ? (
                <List>
                  {currentResume.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <Accordion key={section.id} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box display="flex" alignItems="center" width="100%">
                            <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                              {section.title || section.section_type}
                            </Typography>
                            <Box>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSectionVisibility(section);
                                }}
                                size="small"
                              >
                                {section.is_visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                              </IconButton>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSection(section);
                                }}
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section.id!);
                                }}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {renderSectionContent(section)}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No sections added yet
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddSection}
                    variant="outlined"
                  >
                    Add First Section
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Panel - Preview */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: 'fit-content', position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Resume Preview
              </Typography>
              <Box sx={{ border: 1, borderColor: 'divider', p: 2, minHeight: 400 }}>
                <Typography variant="h5" gutterBottom>
                  {currentResume.title}
                </Typography>
                {currentResume.sections
                  ?.filter(section => section.is_visible)
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <Box key={section.id} sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {section.title || section.section_type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {section.content.substring(0, 100)}
                        {section.content.length > 100 && '...'}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {renderDialog()}
    </Container>
  );
};

export default ResumeBuilder;
