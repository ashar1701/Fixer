import React, { useState } from 'react';
import Listing from './Listing';
import { Box, Button, Typography } from '@mui/material';
import ModalSurvey from './ModalSurvey';

const listings = [
  { price: "750,000", beds: "4", baths: "3", address: "1234 Main St" },
  { price: "1,200,000", beds: "5", baths: "4", address: "5678 Elm St" },
  { price: "250,000", beds: "1", baths: "1", address: "895 Box Cres" },
  { price: "1,200,000", beds: "5", baths: "4", address: "72 Bane St" },
  { price: "3,500,000", beds: "6", baths: "5", address: "143 Number St" },
  { price: "180,000", beds: "1", baths: "1", address: "35 Button Cres" },
  { price: "150,000", beds: "2", baths: "1", address: "589 Bonga St" },
  { price: "3,000,000", beds: "6", baths: "3", address: "1203 Plate Cres" },
  { price: "1,100,000", beds: "3", baths: "6", address: "394 Forest Dr" },
  { price: "1,500,000", beds: "5", baths: "1", address: "2367 Tree St" },
  { price: "1,700,000", beds: "7", baths: "5", address: "37594 Leaf Dr" },
  { price: "1,000,000", beds: "2", baths: "2", address: "67 Ground Rd" }
];

const ListingList = () => {
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <div className="listing-list">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',  // Push button to the right
            alignItems: 'center',
            width: '100%',
            maxWidth: '1400px',  // Match the grid width
            margin: '0 auto',  // Center the container
            padding: '10px',
          }}
        >
            <Typography variant="h1" class='saved-listings' sx={{ marginRight: '10px' }}>Listings</Typography>   
            <Button
                variant="contained"
                onClick={handleOpenModal}
                sx={{ maxHeight: '50px', padding: '6px 16px' }} // Optional padding to maintain consistent button size
            >
                Change Preferences
            </Button>
        </Box>

      {/* Grid layout with 4 columns per row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)', // 4 items per row
          gap: 2, // Adjust spacing between items
          padding: 2,
          justifyContent: 'center',
          maxWidth: '1400px',
          paddingTop: '0px'
        }}
      >
        {listings.map((listing, index) => (
          <Box key={index} sx={{ width: '100%' }}>
            <Listing {...listing} />
          </Box>
        ))}
      </Box>

      <ModalSurvey open={openModal} handleClose={handleCloseModal} />
    </div>
  );
};

export default ListingList;
