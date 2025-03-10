import React, { useEffect, useState } from 'react';
import Listing from './components/Listing.js';
import { Grid2, Typography } from '@mui/material';

const ThumbsUp = () => {
    const [savedListings, setSavedListings] = useState([]);

    useEffect(() => {
        const listings = JSON.parse(localStorage.getItem('thumbsUpListings')) || [];
        setSavedListings(listings);
    }, []);

    return (
        <div>
            <Typography variant="h1" class="saved-listings">Saved Listings</Typography>
            <Grid2 container spacing={2} justifyContent="center" alignItems="center">
                {savedListings.map((listing, index) => (
                    <Grid2 item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Listing
                            price={listing.price}
                            beds={listing.beds}
                            baths={listing.baths}
                            address={listing.address}
                        />
                    </Grid2>
                ))}
            </Grid2>
        </div>
    );
};

export default ThumbsUp;