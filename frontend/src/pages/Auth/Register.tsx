import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Register: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Register
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Registration page coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
