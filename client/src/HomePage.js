import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Ping the backend to convert CSV to JSON
    fetch('/api/convert-csv')
      .then((res) => res.json())
      .then((data) => console.log('Backend convert CSV response:', data))
      .catch((error) => console.error('Error pinging /api/convert-csv:', error));
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" sx={{ mb: 4, fontFamily: 'Helvetica, Arial, sans-serif' }}>
        Welcome to Fixer
      </Typography>
      <Box>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
          onClick={() => navigate('/login')}
        >
          Log In
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
