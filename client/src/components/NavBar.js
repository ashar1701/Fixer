"use client"

import { useState } from "react"
import { AppBar, Toolbar, Button, Box, IconButton, styled } from "@mui/material"
import { Link } from "react-router-dom"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"

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
  borderRadius: "50%",
  backgroundColor: "black",
  marginRight: 16,
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

  return (
    <StyledAppBar position="static">
      <Toolbar>
        {/* Logo */}
        <Logo component={Link} to="/" />

        {/* Navigation Links */}
        <Box sx={{ display: "flex", flexGrow: 1, ml: 2 }}>
          <NavButton component={Link} to="/" active={activeTab === "for-you"} onClick={() => setActiveTab("for-you")}>
            For You
          </NavButton>
          <NavButton active={activeTab === "filters"} onClick={() => setActiveTab("filters")}>
            Filters
          </NavButton>
        </Box>

        {/* Thumbs Up Icon */}
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

        {/* Auth Buttons */}
        <Box sx={{ display: "flex", ml: 2 }}>
          <AuthButton component={Link} to="/login">
            Log in
          </AuthButton>
          <AuthButton component={Link} to="/signup">
            Sign Up
          </AuthButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  )
}

export default NavBar