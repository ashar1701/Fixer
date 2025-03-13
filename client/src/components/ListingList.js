import React, { useState, useEffect } from "react";
import Listing from "./Listing";
import { Box, Button, Typography } from "@mui/material";
import ModalSurvey from "./ModalSurvey";

const ListingList = () => {
  const [listings, setListings] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  // Fetch all listings from the backend
  const fetchAllListings = () => {
    fetch("/api/listings/all")
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch((error) => console.error("Error fetching listings:", error));
  };

  // Fetch filtered listings based on user preferences
  const fetchFilteredListings = (preferences) => {
    fetch("/api/listings/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    })
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch((error) => console.error("Error fetching filtered listings:", error));
  };

  // Fetch listings on mount
  useEffect(() => {
    fetchAllListings();
  }, []);

  // When the survey modal closes, update the listings based on preferences
  const handleModalClose = () => {
    setOpenModal(false);
    const savedPreferences = JSON.parse(localStorage.getItem("preferences"));
    if (savedPreferences) {
      fetchFilteredListings(savedPreferences);
    } else {
      fetchAllListings();
    }
  };

  const handleOpenModal = () => setOpenModal(true);

  return (
    <div className="listing-list">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "10px",
        }}
      >
        <Typography
          variant="h4"
          className="saved-listings"
          sx={{ marginRight: "10px", fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
          View All Listings
        </Typography>
        <Button variant="contained" onClick={handleOpenModal} sx={{ maxHeight: "50px", padding: "6px 16px" }}>
          Change Preferences
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          padding: 2,
          justifyContent: "center",
          maxWidth: "1400px",
          paddingTop: "0px",
        }}
      >
        {listings.map((listing, index) => (
          <Box key={index} sx={{ width: "100%" }}>
            <Listing
              price={listing.rent}
              beds={listing.bedrooms_vacant}
              address={listing.address}
              comments={listing.comments}
            />
          </Box>
        ))}
      </Box>

      <ModalSurvey open={openModal} handleClose={handleModalClose} />
    </div>
  );
};

export default ListingList;
