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
  const [googleData, setGoogleData] = useState(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  useEffect(() => {
    const savedListings = JSON.parse(localStorage.getItem("thumbsUpListings")) || [];
    const isSaved = savedListings.some((listing) => listing.address === address);
    setThumbsUpClicked(isSaved);
  }, [address]);

  // Fetch the Google Maps data when the modal opens
  useEffect(() => {
    if (openModal) {
      setLoadingGoogle(true);
      fetch(`/api/googlemaps?address=${encodeURIComponent(address)}`)
        .then((res) => res.json())
        .then((data) => {
          setGoogleData(data);
          setLoadingGoogle(false);
        })
        .catch((error) => {
          console.error("Error fetching Google Maps data:", error);
          setLoadingGoogle(false);
        });
    }
  }, [openModal, address]);

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

  // Format the comprehensive Google Maps data into readable sections.
  const renderGoogleData = (data) => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Geocode:
        </Typography>
        {data.geocode ? (
          <Typography variant="body2">
            Latitude: {data.geocode.lat} | Longitude: {data.geocode.lng}
          </Typography>
        ) : (
          <Typography variant="body2" color="error">
            No geocode data available.
          </Typography>
        )}

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Distance to Western University:
        </Typography>
        {data.distance && data.distance.error ? (
          <Typography variant="body2" color="error">
            {data.distance.error}
          </Typography>
        ) : (
          <Typography variant="body2">
            {data.distance.distance} in {data.distance.duration}
          </Typography>
        )}

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Bus Routes:
        </Typography>
        {data.bus_routes && data.bus_routes.error ? (
          <Typography variant="body2" color="error">
            {data.bus_routes.error}
          </Typography>
        ) : data.bus_routes && data.bus_routes.length > 0 ? (
          data.bus_routes.map((route, idx) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>Summary:</strong> {route.summary}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {route.duration}, <strong>Distance:</strong> {route.distance}
              </Typography>
              <Typography variant="body2">
                <strong>Departure:</strong> {route.departure_time}, <strong>Arrival:</strong> {route.arrival_time}
              </Typography>
              {route.steps && route.steps.length > 0 && (
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body2">
                    <strong>Bus Steps:</strong>
                  </Typography>
                  {route.steps.map((step, sIdx) => (
                    <Typography key={sIdx} variant="body2">
                      Bus {step.bus_number} ({step.bus_name}) – Departs {step.departure_stop} at {step.departure_time} | Arrives {step.arrival_stop} (Stops: {step.num_stops})
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2">No bus route data available.</Typography>
        )}

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Nearby Places:
        </Typography>
        {data.nearby_places && data.nearby_places.length > 0 ? (
          data.nearby_places.map((place, idx) => (
            <Typography key={idx} variant="body2">
              {place.name} – {place.address}
            </Typography>
          ))
        ) : (
          <Typography variant="body2">No nearby places found.</Typography>
        )}

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Distances to Universities:
        </Typography>
        {data.calculate_distances && data.calculate_distances.length > 0 ? (
          data.calculate_distances.map((entry, idx) => (
            <Typography key={idx} variant="body2">
              {entry.University}:{" "}
              {entry.error
                ? entry.error
                : `${entry.distance} in ${entry.duration}`}
            </Typography>
          ))
        ) : (
          <Typography variant="body2">No university distance data available.</Typography>
        )}
      </Box>
    );
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

          {/* Formatted Google Maps Information */}
          <Typography variant="h6" sx={{ mt: 2, fontFamily: 'Helvetica, Arial, sans-serif' }}>
            Google Maps Information:
          </Typography>
          {loadingGoogle ? (
            <Typography variant="body1" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              Loading Google Maps data...
            </Typography>
          ) : googleData ? (
            renderGoogleData(googleData)
          ) : (
            <Typography variant="body1" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              No data available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Listing;
