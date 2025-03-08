import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box 
} from '@mui/material';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <AppBar position="static" class="navbar">
            <Toolbar>
                <Typography class="navbar-text" variant="h3" sx={{ flexGrow: 1 }}>
                    Logo
                </Typography>
                <Box sx={{ display: 'flex', flexGrow: 1 }}>
                    <Button color="inherit" component={Link} to="/">Explore</Button>
                    <Button color="inherit">Filters</Button>
                </Box>
                <Button color="inherit" component={Link} to="/login">Log In</Button>
                <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;