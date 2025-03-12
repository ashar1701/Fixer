import React, { useEffect, useState } from 'react';
import Listing from './components/Listing.js';
import { Box, Typography } from '@mui/material';

const ThumbsUp = () => {
    const [savedListings, setSavedListings] = useState([]);

    useEffect(() => {
        const listings = JSON.parse(localStorage.getItem('thumbsUpListings')) || [];
        setSavedListings(listings);
    }, []);

    return (
        <div>
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
                <Typography variant="h1" class="saved-listings">Saved Listings</Typography>
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)', // 4 items per row
                    gap: 2, // Adjust spacing between items
                    padding: 2,
                    justifyContent: 'center', // Center the grid horizontally
                    maxWidth: '1400px', // Set a maximum width for the grid container
                    margin: '0 auto' // Center the grid container within its parent
                }}
            >
                {savedListings.map((listing, index) => (
                    <Box key={index} sx={{ width: '100%' }}>
                        <Listing
                            price={listing.price}
                            beds={listing.beds}
                            baths={listing.baths}
                            address={listing.address}
                        />
                    </Box>
                ))}
            </Box>
        </div>
    );
};

export default ThumbsUp;