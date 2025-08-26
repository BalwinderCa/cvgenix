import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Description,
  ViewModule as Template,
  TrendingUp,
  CheckCircle,
  Schedule,
  Star,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock data - replace with real API calls
  const stats = {
    totalResumes: 3,
    totalTemplates: 12,
    completionRate: 75,
    atsScore: 85,
  };

  const recentResumes = [
    {
      id: 1,
      title: 'Software Developer Resume',
      lastModified: '2 hours ago',
      status: 'draft',
    },
    {
      id: 2,
      title: 'Product Manager Resume',
      lastModified: '1 day ago',
      status: 'published',
    },
    {
      id: 3,
      title: 'Data Scientist Resume',
      lastModified: '3 days ago',
      status: 'published',
    },
  ];

  const quickActions = [
    {
      title: 'Create New Resume',
      description: 'Start building a professional resume',
      icon: <AddIcon />,
      action: () => navigate('/resume-builder'),
      color: 'primary',
    },
    {
      title: 'Browse Templates',
      description: 'Explore professional templates',
      icon: <Template />,
      action: () => navigate('/templates'),
      color: 'secondary',
    },
    {
      title: 'Update Profile',
      description: 'Keep your information current',
      icon: <Person />,
      action: () => navigate('/profile'),
      color: 'success',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome back, {user?.first_name || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your resume builder account.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Resumes
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                    {stats.totalResumes}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Description />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Templates Available
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                    {stats.totalTemplates}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <Template />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Profile Completion
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                    {stats.completionRate}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.completionRate}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Average ATS Score
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                    {stats.atsScore}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Quick Actions
          </Typography>
        </Grid>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
              onClick={action.action}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: `${action.color}.main`, mr: 2 }}>
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    {action.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {action.description}
                </Typography>
                <Button
                  variant="outlined"
                  color={action.color as any}
                  size="small"
                  startIcon={<AddIcon />}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Resumes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Resumes
              </Typography>
              <List>
                {recentResumes.map((resume, index) => (
                  <React.Fragment key={resume.id}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => navigate(`/resume-builder/${resume.id}`)}
                    >
                      <ListItemIcon>
                        <Description color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={resume.title}
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Schedule fontSize="small" />
                            {resume.lastModified}
                          </Box>
                        }
                      />
                      <Chip
                        label={resume.status}
                        color={getStatusColor(resume.status) as any}
                        size="small"
                      />
                    </ListItem>
                    {index < recentResumes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Tips & Insights
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>💡 Pro Tip:</strong> Keep your resume updated with recent achievements and skills to improve your ATS score.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>📊 Analytics:</strong> Your resumes have been viewed 12 times this month.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>⭐ Recommendation:</strong> Try our "Modern Professional" template for better results.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
