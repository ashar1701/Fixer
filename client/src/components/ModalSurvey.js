import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, Slider, Checkbox, FormControlLabel, FormGroup } from "@mui/material";

const ModalSurvey = ({ open, handleClose }) => {
  const [priceRange, setPriceRange] = useState([100, 1000]);
  const [bedrooms, setBedrooms] = useState(1);
  const [proximity, setProximity] = useState(50);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [leaseTerms, setLeaseTerms] = useState({
    fourMonths: false,
    eightMonths: false,
    twelvePlusMonths: false,
  });

  useEffect(() => {
    const savedPreferences = JSON.parse(localStorage.getItem('preferences'));
    if (savedPreferences) {
      setPriceRange(savedPreferences.priceRange || [100, 1000]);
      setBedrooms(savedPreferences.bedrooms || 1);
      setProximity(savedPreferences.proximity || 50);
      setUtilitiesIncluded(savedPreferences.utilitiesIncluded || false);
      setLeaseTerms(savedPreferences.leaseTerms || {
        fourMonths: false,
        eightMonths: false,
        twelvePlusMonths: false,
      });
    }
  }, []);

  const handleSavePreferences = () => {
    const preferences = {
      priceRange,
      bedrooms,
      proximity,
      utilitiesIncluded,
      leaseTerms,
    };
    localStorage.setItem('preferences', JSON.stringify(preferences));
    handleClose();
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleProximityChange = (event, newValue) => {
    setProximity(newValue);
  };

  const handleLeaseTermsChange = (event) => {
    setLeaseTerms({
      ...leaseTerms,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: '10px',
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h5" component="h2" marginBottom={2}>
          Preferences
        </Typography>

        {/* Price Range Slider */}
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
        />

        {/* Number of Bedrooms */}
        <Typography marginTop={2} gutterBottom>Number of Bedrooms</Typography>
        <Slider
          value={bedrooms}
          onChange={(event, newValue) => setBedrooms(newValue)}
          valueLabelDisplay="auto"
          min={1}
          max={5}
          marks={[
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
            { value: 4, label: '4' },
            { value: 5, label: '5+' },
          ]}
        />

        {/* Proximity to University */}
        <Typography marginTop={2} gutterBottom>Proximity to University (km)</Typography>
        <Slider
          value={proximity}
          onChange={handleProximityChange}
          valueLabelDisplay="auto"
          min={0}
          max={50}
        />

        {/* Utilities Included */}
        <FormControlLabel
          control={
            <Checkbox
              checked={utilitiesIncluded}
              onChange={(event) => setUtilitiesIncluded(event.target.checked)}
            />
          }
          label="Utilities Included"
        />

        {/* Lease Terms */}
        <Typography gutterBottom fontWeight={600} marginTop={2}>Lease Terms</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={leaseTerms.fourMonths}
                onChange={handleLeaseTermsChange}
                name="fourMonths"
              />
            }
            label="4 Months"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={leaseTerms.eightMonths}
                onChange={handleLeaseTermsChange}
                name="eightMonths"
              />
            }
            label="8 Months"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={leaseTerms.twelvePlusMonths}
                onChange={handleLeaseTermsChange}
                name="twelvePlusMonths"
              />
            }
            label="12+ Months"
          />
        </FormGroup>

        <Button onClick={handleSavePreferences} sx={{ mt: 2 }}>
          Save Preferences
        </Button>
      </Box>
    </Modal>
  );
};

export default ModalSurvey;