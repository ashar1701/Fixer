import { 
    Card,
    CardContent,
    CardMedia,
    Typography,
    IconButton,
    Grid2
 } from '@mui/material';
 import ThumbUpIcon from '@mui/icons-material/ThumbUp';
 import tempHouseImage from '../img/temp-house.jpeg';
 import { useState, useEffect } from 'react';

const Listing = ({ price, beds, baths, address }) => {
    const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

    useEffect(() => {
        const savedListings = JSON.parse(localStorage.getItem('thumbsUpListings')) || [];
        const isSaved = savedListings.some(listing => listing.address === address);
        setThumbsUpClicked(isSaved);
    }, [address]);

    const handleThumbsUpClick = () => {
        setThumbsUpClicked(!thumbsUpClicked);

        const savedListings = JSON.parse(localStorage.getItem('thumbsUpListings')) || [];
        if (!thumbsUpClicked) {
            savedListings.push({ price, beds, baths, address });
        } else {
            const index = savedListings.findIndex(listing => listing.address === address);
            if (index !== -1) {
                savedListings.splice(index, 1);
            }
        }
        localStorage.setItem('thumbsUpListings', JSON.stringify(savedListings));
    };

    return <div className='listing'>
        <Card class= "listing-card">
            <CardContent sx={{ padding: '0px' }}>
                <CardMedia
                    component="img"
                    height = '194px'
                    image={tempHouseImage}
                    alt='temp'
                    sx={{
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px'
                    }}
                />
                <Grid2 container justifyContent={'space-between'}>
                    <Grid2>
                        <div class="listing-textarea" style={{ marginTop: '10px', paddingLeft: '10px' }}>
                            <Typography class='listing-text' variant="h3">${price}</Typography>
                            <Typography class='listing-text' variant="h5">{beds} Bed | {baths} Bath</Typography>
                            <Typography class='listing-text' variant="h5">{address}</Typography>
                        </div>
                    </Grid2>
                    <Grid2>
                        <div class="listing-buttons" style={{ marginTop: '10px', paddingRight: '10px' }}>
                            <IconButton onClick={handleThumbsUpClick} color={thumbsUpClicked ? "primary" : "default"}>
                                <ThumbUpIcon />
                            </IconButton>
                        </div>
                    </Grid2>
                </Grid2>
                <Typography class='listing-description' variant="h5">Modern kitchen, open living space, hardwood floors & a cozy fireplace. Spacious backyard in a quiet neighborhood. Close to parks & shops!</Typography>

            </CardContent>
        </Card>
    </div>
}

export default Listing;