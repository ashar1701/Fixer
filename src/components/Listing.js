import { 
    Card,
    CardContent,
    Typography
 } from '@mui/material';

const Listing = () => {
    return <div className='listing'>
        <Card class= "listing-card">
            <CardContent>
                <Typography variant="h3">Listing</Typography>
            </CardContent>
        </Card>
    </div>
}

export default Listing;