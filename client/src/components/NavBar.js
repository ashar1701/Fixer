"use client"

import { useState } from "react"
import { AppBar, Toolbar, Button, Box, IconButton, styled, Tooltip } from "@mui/material"
import { Link } from "react-router-dom"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { useAuth } from "../authentication/AuthContext"
import { useNavigate } from 'react-router-dom';
import logo from "../img/fxr-high-resolution-logo-grayscale.svg"

// Styled components
const StyledAppBar = styled(AppBar)({
  backgroundColor: "#ffffff",
  boxShadow: "none",
  borderBottom: "1px solid #e0e0e0",
  color: "#333",
})

const Logo = styled(Box)({
  width: 48,
  height: 48,
  backgroundColor: "transparent",
  marginRight: 16,
  backgroundImage: `url(${logo})`, // Update this path to your image
  backgroundSize: 'cover',
  backgroundPosition: 'center',
})

const NavButton = styled(Button)(({ active }) => ({
  textTransform: "none",
  fontSize: "16px",
  padding: "8px 16px",
  margin: "0 4px",
  color: active ? "#1976d2" : "#666",
  backgroundColor: "transparent",
  position: "relative",
  transition: "all 0.3s ease",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    width: active ? "100%" : "0%",
    height: "2px",
    backgroundColor: "#1976d2",
    transition: "all 0.3s ease",
    transform: "translateX(-50%)",
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: "#1976d2",
    "&::after": {
      width: "100%",
    },
  },
  "&:active": {
    backgroundColor: "rgba(25, 118, 210, 0.1)",
  },
}))

const AuthButton = styled(Button)({
  backgroundColor: "black",
  color: "white",
  borderRadius: "20px",
  padding: "6px 16px",
  margin: "0 4px",
  textTransform: "none",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#333",
  },
  "&:active": {
    transform: "scale(0.95)",
    backgroundColor: "#1a1a1a",
  },
})

const NavBar = () => {
  const [activeTab, setActiveTab] = useState("for-you")
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate();

  return (
    <StyledAppBar position="static">
      <Toolbar>
        {/* Logo */}
        <Logo component={Link} to="/dashboard" />

        {/* Navigation Links */}
        <Box sx={{ display: "flex", flexGrow: 1, ml: 2 }}>
          <NavButton active={activeTab === "for-you"} onClick={() => {
            setActiveTab("for-you");
            navigate("/listings/foryou");
          }}>
            For You
          </NavButton>
          <NavButton active={activeTab === "filters"} onClick={() => {
            setActiveTab("filters");
            navigate("/listings/filter");
          }}>
            Filters
          </NavButton>
        </Box>

        {/* Thumbs Up Icon */}
        <Tooltip title="Saved Listings" placement="bottom">
          <IconButton
            title="Saved Listings"
            aria-label="like"
            component={Link}
            to="/saved"
            sx={{
              color: "#1976d2",
              "&:active": {
                transform: "scale(0.9)",
              },
            }}
          >
            <ThumbUpIcon />
          </IconButton>
        </Tooltip>

        {/* Auth Buttons */}
        <Box sx={{ display: "flex", ml: 2 }}>
          {isAuthenticated ? (
            <IconButton
              title="Profile"
              aria-label="profile"
              component={Link}
              to="/profile"
              sx={{
                color: "#1976d2",
                "&:active": {
                  transform: "scale(0.9)",
                },
              }}
            >
              <AccountCircleIcon sx={{ fontSize: "35px" }} />
            </IconButton>
          ) : (
            <>
              <AuthButton component={Link} to="/login">
                Log in
              </AuthButton>
              <AuthButton component={Link} to="/signup">
                Sign Up
              </AuthButton>
            </>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  )
}

export default NavBar