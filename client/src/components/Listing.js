import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  IconButton, 
  Box, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button 
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import tempHouseImage from "../img/temp-house.jpeg";

const Listing = ({ price, beds, address, comments }) => {
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const savedListings = JSON.parse(localStorage.getItem("thumbsUpListings")) || [];
    const isSaved = savedListings.some((listing) => listing.address === address);
    setThumbsUpClicked(isSaved);
  }, [address]);

  const handleThumbsUpClick = (e) => {
    e.stopPropagation(); // Prevent triggering card click
    setThumbsUpClicked(!thumbsUpClicked);

    const savedListings = JSON.parse(localStorage.getItem("thumbsUpListings")) || [];
    if (!thumbsUpClicked) {
      savedListings.push({ price, beds, address, comments });
    } else {
      const index = savedListings.findIndex((listing) => listing.address === address);
      if (index !== -1) {
        savedListings.splice(index, 1);
      }
    }
    localStorage.setItem("thumbsUpListings", JSON.stringify(savedListings));
  };

  const handleCardClick = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Card className="listing-card" onClick={handleCardClick} sx={{ cursor: "pointer", fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <CardContent sx={{ padding: 0 }}>
          <CardMedia
            component="img"
            height="194"
            image={tempHouseImage}
            alt="placeholder"
            sx={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
            <Box>
              <Typography variant="h3" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                ${price}
              </Typography>
              <Typography variant="h5" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                {beds} Bed
              </Typography>
              <Typography variant="h5" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                {address}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Save Listing">
                <IconButton onClick={handleThumbsUpClick} color={thumbsUpClicked ? "primary" : "default"}>
                  <ThumbUpIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={openModal}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: { width: '600px', maxHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Listing Details</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto' }}>
          {/* Display image with objectFit to avoid cropping */}
          <CardMedia
            component="img"
            image={tempHouseImage}
            alt="placeholder"
            sx={{ mb: 2, objectFit: 'contain', maxHeight: '250px', width: '100%' }}
          />
          <Typography variant="h4" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            ${price}
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            {beds} Bed
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            {address}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, fontFamily: 'Helvetica, Arial, sans-serif' }}>
            {comments}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Listing;
