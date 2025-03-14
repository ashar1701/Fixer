import React, { useState, useEffect } from 'react';
import Listing from './Listing';
import { Box, Button, Typography } from '@mui/material';

const RecommendedListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch recommendations from the model route and then fetch listings details for those IDs.
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // First call the model route to get the recommended rentunit IDs.
      const modelResponse = await fetch('/api/model/recommend');
      const modelData = await modelResponse.json();
      // Extract the array from the returned object
      const recommendedIds = modelData.recommended_rentunit_ids || [];

      // Assuming recommendedIds is an array of IDs, e.g. [276, 123, 456]
      const queryParam = recommendedIds.join(",");
      const listingsResponse = await fetch(`/api/listings/by-ids?ids=${queryParam}`);
      const listingsData = await listingsResponse.json();

      // Ensure the listingsData is an array.
      const listingsArray = Array.isArray(listingsData) ? listingsData : [];
      setListings(listingsArray);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="listing-list">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '10px',
        }}
      >
        <Typography variant="h1" class="recommended-listings-title">
          Recommended Listings
        </Typography>
        <Button variant="contained" onClick={fetchRecommendations} sx={{ maxHeight: '50px', padding: '6px 16px' }}>
          Refresh Recommendations
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
          padding: 2,
          justifyContent: 'center',
          maxWidth: '1400px',
        }}
      >
        {loading ? (
          <Typography variant="h6">Loading recommendations...</Typography>
        ) : (
          listings.map((listing) => (
            <Box key={listing.rentunit_id} sx={{ width: '100%' }}>
              <Listing
                price={listing.rent}
                beds={listing.bedrooms_vacant}
                address={listing.address}
                comments={listing.comments}
              />
            </Box>
          ))
        )}
      </Box>
    </div>
  );
};

export default RecommendedListings;
