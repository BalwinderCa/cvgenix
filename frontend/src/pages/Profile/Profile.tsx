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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  Assignment as ProjectIcon,
  CardMembership as CertIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Education {
  id?: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa: string;
  description: string;
}

interface Experience {
  id?: number;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  is_current: boolean;
}

interface Skill {
  id?: number;
  name: string;
  category: string;
  level: string;
}

interface Project {
  id?: number;
  title: string;
  description: string;
  url: string;
  technologies: string;
  start_date: string;
  end_date: string;
}

interface Certification {
  id?: number;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
  credential_url: string;
}

interface Profile {
  id?: number;
  about: string;
  headline: string;
  phone: string;
  location: string;
  website: string;
  linkedin_url: string;
  github_url: string;
  twitter_url: string;
  portfolio_url: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'education' | 'experience' | 'skill' | 'project' | 'certification'>('education');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    about: '',
    headline: '',
    phone: '',
    location: '',
    website: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    portfolio_url: '',
  });

  const [educationForm, setEducationForm] = useState<Education>({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    gpa: '',
    description: '',
  });

  const [experienceForm, setExperienceForm] = useState<Experience>({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false,
  });

  const [skillForm, setSkillForm] = useState<Skill>({
    name: '',
    category: '',
    level: '',
  });

  const [projectForm, setProjectForm] = useState<Project>({
    title: '',
    description: '',
    url: '',
    technologies: '',
    start_date: '',
    end_date: '',
  });

  const [certificationForm, setCertificationForm] = useState<Certification>({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/profiles/');
      if (response.data.results && response.data.results.length > 0) {
        const userProfile = response.data.results[0];
        setProfile(userProfile);
        setBasicInfo({
          about: userProfile.about || '',
          headline: userProfile.headline || '',
          phone: userProfile.phone || '',
          location: userProfile.location || '',
          website: userProfile.website || '',
          linkedin_url: userProfile.linkedin_url || '',
          github_url: userProfile.github_url || '',
          twitter_url: userProfile.twitter_url || '',
          portfolio_url: userProfile.portfolio_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    setSaving(true);
    try {
      const response = await api.patch(`/profiles/profiles/${profile?.id}/`, basicInfo);
      setProfile(response.data);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const openAddDialog = (type: typeof dialogType) => {
    setDialogType(type);
    setEditingItem(null);
    resetForm(type);
    setOpenDialog(true);
  };

  const openEditDialog = (type: typeof dialogType, item: any) => {
    setDialogType(type);
    setEditingItem(item);
    setFormData(type, item);
    setOpenDialog(true);
  };

  const resetForm = (type: typeof dialogType) => {
    switch (type) {
      case 'education':
        setEducationForm({
          institution: '',
          degree: '',
          field_of_study: '',
          start_date: '',
          end_date: '',
          gpa: '',
          description: '',
        });
        break;
      case 'experience':
        setExperienceForm({
          company: '',
          position: '',
          start_date: '',
          end_date: '',
          description: '',
          is_current: false,
        });
        break;
      case 'skill':
        setSkillForm({
          name: '',
          category: '',
          level: '',
        });
        break;
      case 'project':
        setProjectForm({
          title: '',
          description: '',
          url: '',
          technologies: '',
          start_date: '',
          end_date: '',
        });
        break;
      case 'certification':
        setCertificationForm({
          name: '',
          issuing_organization: '',
          issue_date: '',
          expiry_date: '',
          credential_id: '',
          credential_url: '',
        });
        break;
    }
  };

  const setFormData = (type: typeof dialogType, item: any) => {
    switch (type) {
      case 'education':
        setEducationForm(item);
        break;
      case 'experience':
        setExperienceForm(item);
        break;
      case 'skill':
        setSkillForm(item);
        break;
      case 'project':
        setProjectForm(item);
        break;
      case 'certification':
        setCertificationForm(item);
        break;
    }
  };

  const handleSaveItem = async () => {
    try {
      let response;
      if (editingItem) {
        // Update existing item
        response = await api.patch(`/profiles/${dialogType}/${editingItem.id}/`, getFormData());
      } else {
        // Create new item
        response = await api.post(`/profiles/${dialogType}/`, getFormData());
      }
      
      await fetchProfile(); // Refresh profile data
      setOpenDialog(false);
      toast.success(`${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} ${editingItem ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error(`Error saving ${dialogType}:`, error);
      toast.error(`Failed to ${editingItem ? 'update' : 'add'} ${dialogType}`);
    }
  };

  const getFormData = () => {
    switch (dialogType) {
      case 'education':
        return educationForm;
      case 'experience':
        return experienceForm;
      case 'skill':
        return skillForm;
      case 'project':
        return projectForm;
      case 'certification':
        return certificationForm;
    }
  };

  const handleDeleteItem = async (type: string, id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/profiles/${type}/${id}/`);
        await fetchProfile(); // Refresh profile data
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        toast.error(`Failed to delete ${type}`);
      }
    }
  };

  const renderDialog = () => {
    const dialogTitle = editingItem ? `Edit ${dialogType}` : `Add ${dialogType}`;
    
    return (
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {dialogType === 'education' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Institution"
                  value={educationForm.institution}
                  onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Degree"
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Field of Study"
                  value={educationForm.field_of_study}
                  onChange={(e) => setEducationForm({ ...educationForm, field_of_study: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GPA"
                  value={educationForm.gpa}
                  onChange={(e) => setEducationForm({ ...educationForm, gpa: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={educationForm.start_date}
                  onChange={(e) => setEducationForm({ ...educationForm, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={educationForm.end_date}
                  onChange={(e) => setEducationForm({ ...educationForm, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={educationForm.description}
                  onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {dialogType === 'experience' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={experienceForm.company}
                  onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={experienceForm.position}
                  onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={experienceForm.start_date}
                  onChange={(e) => setExperienceForm({ ...experienceForm, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={experienceForm.end_date}
                  onChange={(e) => setExperienceForm({ ...experienceForm, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  disabled={experienceForm.is_current}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={experienceForm.description}
                  onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {dialogType === 'skill' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Skill Name"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                >
                  <option value="technical">Technical</option>
                  <option value="soft">Soft Skills</option>
                  <option value="language">Language</option>
                  <option value="framework">Framework</option>
                  <option value="tool">Tool</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Level"
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </TextField>
              </Grid>
            </Grid>
          )}

          {dialogType === 'project' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Title"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Technologies Used"
                  value={projectForm.technologies}
                  onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project URL"
                  value={projectForm.url}
                  onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={projectForm.start_date}
                  onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={projectForm.end_date}
                  onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {dialogType === 'certification' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Certification Name"
                  value={certificationForm.name}
                  onChange={(e) => setCertificationForm({ ...certificationForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Issuing Organization"
                  value={certificationForm.issuing_organization}
                  onChange={(e) => setCertificationForm({ ...certificationForm, issuing_organization: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Issue Date"
                  value={certificationForm.issue_date}
                  onChange={(e) => setCertificationForm({ ...certificationForm, issue_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expiry Date"
                  value={certificationForm.expiry_date}
                  onChange={(e) => setCertificationForm({ ...certificationForm, expiry_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Credential ID"
                  value={certificationForm.credential_id}
                  onChange={(e) => setCertificationForm({ ...certificationForm, credential_id: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Credential URL"
                  value={certificationForm.credential_url}
                  onChange={(e) => setCertificationForm({ ...certificationForm, credential_url: e.target.value })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained" color="primary">
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile Management
      </Typography>

      {/* Basic Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Basic Information</Typography>
          {!editMode ? (
            <Button
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              variant="outlined"
            >
              Edit
            </Button>
          ) : (
            <Box>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSaveBasicInfo}
                variant="contained"
                sx={{ mr: 1 }}
                disabled={saving}
              >
                {saving ? <CircularProgress size={20} /> : 'Save'}
              </Button>
              <Button
                startIcon={<CancelIcon />}
                onClick={() => setEditMode(false)}
                variant="outlined"
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="About"
              value={basicInfo.about}
              onChange={(e) => setBasicInfo({ ...basicInfo, about: e.target.value })}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Headline"
              value={basicInfo.headline}
              onChange={(e) => setBasicInfo({ ...basicInfo, headline: e.target.value })}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={basicInfo.phone}
              onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              value={basicInfo.location}
              onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website"
              value={basicInfo.website}
              onChange={(e) => setBasicInfo({ ...basicInfo, website: e.target.value })}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="LinkedIn URL"
              value={basicInfo.linkedin_url}
              onChange={(e) => setBasicInfo({ ...basicInfo, linkedin_url: e.target.value })}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="GitHub URL"
              value={basicInfo.github_url}
              onChange={(e) => setBasicInfo({ ...basicInfo, github_url: e.target.value })}
              disabled={!editMode}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Education */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center">
                  <SchoolIcon sx={{ mr: 1 }} />
                  Education
                </Typography>
                <IconButton onClick={() => openAddDialog('education')} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
              <List>
                {profile?.education?.map((edu) => (
                  <ListItem key={edu.id} divider>
                    <ListItemText
                      primary={edu.institution}
                      secondary={
                        <>
                          {edu.degree} in {edu.field_of_study}
                          <br />
                          {edu.start_date} - {edu.end_date}
                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => openEditDialog('education', edu)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteItem('education', edu.id!)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {(!profile?.education || profile.education.length === 0) && (
                  <ListItem>
                    <ListItemText secondary="No education entries yet" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Experience */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center">
                  <WorkIcon sx={{ mr: 1 }} />
                  Experience
                </Typography>
                <IconButton onClick={() => openAddDialog('experience')} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
              <List>
                {profile?.experience?.map((exp) => (
                  <ListItem key={exp.id} divider>
                    <ListItemText
                      primary={exp.position}
                      secondary={
                        <>
                          {exp.company}
                          <br />
                          {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => openEditDialog('experience', exp)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteItem('experience', exp.id!)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {(!profile?.experience || profile.experience.length === 0) && (
                  <ListItem>
                    <ListItemText secondary="No experience entries yet" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center">
                  <CodeIcon sx={{ mr: 1 }} />
                  Skills
                </Typography>
                <IconButton onClick={() => openAddDialog('skill')} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {profile?.skills?.map((skill) => (
                  <Chip
                    key={skill.id}
                    label={`${skill.name}${skill.level ? ` (${skill.level})` : ''}`}
                    color="primary"
                    variant="outlined"
                    onDelete={() => handleDeleteItem('skills', skill.id!)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
                {(!profile?.skills || profile.skills.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No skills added yet
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Projects */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center">
                  <ProjectIcon sx={{ mr: 1 }} />
                  Projects
                </Typography>
                <IconButton onClick={() => openAddDialog('project')} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
              <List>
                {profile?.projects?.map((project) => (
                  <ListItem key={project.id} divider>
                    <ListItemText
                      primary={project.title}
                      secondary={
                        <>
                          {project.technologies}
                          <br />
                          {project.start_date} - {project.end_date}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => openEditDialog('project', project)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteItem('projects', project.id!)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {(!profile?.projects || profile.projects.length === 0) && (
                  <ListItem>
                    <ListItemText secondary="No projects added yet" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Certifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center">
                  <CertIcon sx={{ mr: 1 }} />
                  Certifications
                </Typography>
                <IconButton onClick={() => openAddDialog('certification')} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
              <List>
                {profile?.certifications?.map((cert) => (
                  <ListItem key={cert.id} divider>
                    <ListItemText
                      primary={cert.name}
                      secondary={
                        <>
                          {cert.issuing_organization}
                          <br />
                          {cert.issue_date} - {cert.expiry_date}
                          {cert.credential_id && ` • ID: ${cert.credential_id}`}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => openEditDialog('certification', cert)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteItem('certifications', cert.id!)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {(!profile?.certifications || profile.certifications.length === 0) && (
                  <ListItem>
                    <ListItemText secondary="No certifications added yet" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {renderDialog()}
    </Container>
  );
};

export default Profile;
