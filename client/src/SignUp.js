import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import ModalSurvey from './components/ModalSurvey';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      setOpenModal(true); // Show the modal
      // Save to localStorage to indicate the user has signed up
      localStorage.setItem('hasSignedUp', 'true');
      navigate('/listings/filter'); // Redirect to the ListingList page
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 8, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, bgcolor: '#1976D2', ':hover': { bgcolor: '#1565C0' } }}
          >
            Sign Up
          </Button>
        </Box>
      </Paper>
      <ModalSurvey open={openModal} handleClose={handleCloseModal} />
    </Container>
  );
};

export default SignUp;