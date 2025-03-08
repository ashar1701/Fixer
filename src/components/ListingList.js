import Listing from "./Listing";
import { Grid2 } from "@mui/material";

const ListingList = () => {
    return (
        <div className='listing-list'>
            <Grid2 container spacing={2}>
                <Grid2 item xs={4}>
                    <Listing price="750,000" beds="4" baths="3" address="1234 Main St" />
                </Grid2>
                <Grid2 item xs={4}>
                    <Listing price="1,200,000" beds="5" baths="4" address="5678 Elm St" />
                </Grid2>
                <Grid2 item xs={4}>
                    <Listing price="250,000" beds="1" baths="1" address="895 Box Cres" />
                </Grid2>
                <Grid2 item xs={4}>
                    <Listing price="1,200,000" beds="5" baths="4" address="72 Bane St" />
                </Grid2>
                <Grid2 item xs={4}>
                    <Listing price="3,500,000" beds="6" baths="5" address="143 Number St" />
                </Grid2>
                <Grid2 item xs={4}>
                    <Listing price="180,000" beds="1" baths="1" address="35 Button Cres" />
                </Grid2>
                <Grid2 item xs={4}>
                    <Listing price="150,000" beds="2" baths="1" address="589 Bonga St" />
                </Grid2>
                <Grid2 item xs={4}>
                    <Listing price="3,000,000" beds="6" baths="3" address="1203 Plate Cres" />
                </Grid2>
                <Grid2 item xs={4}>
                    <Listing price="1,100,000" beds="3" baths="2" address="394 Forest Dr" />
                </Grid2>
            </Grid2>
        </div>
    );
}

export default ListingList;