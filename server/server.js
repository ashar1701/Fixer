const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const admin = require("./firebaseAdmin");

const app = express();
const PORT = process.env.PORT || 5000; // default to port 5000

// middleware
app.use(cors()); // enable Cross-Origin Resource Sharing
app.use(express.json()); // parse JSON request bodies

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach user data to the request
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};


app.get("/protected", verifyToken, (req, res) => {
    res.json({ message: `Welcome, ${req.user.email}!` });
});

// array variables to store json listing data
const FILE_PATHS = [
    { csv: "./csv/listing_info_200.csv", json: "./json/listing_info_200.json" }, // listing info w/ IDs, 200 sample size
    { csv: "./csv/amenities_booleans.csv", json: "./json/amenities_booleans.json" } // listing IDs matched to bool flags for amenities
]

// function for converting CSV to JSON
const convertCSVtoJSON = (file) => {
    return new Promise((resolve, reject) => {
        let jsonData = []; // variable to store temp json data

        if (!fs.existsSync(file.csv)) { // cant find the file
            console.error(`File not found: ${file.csv}`);
            return reject(`File not found: ${file.csv}`);
        }

        console.log(`Processing: ${file.csv}`); // state which file is being processed

        fs.createReadStream(file.csv) // file reader
            .pipe(csv()) // pipe ;)
            .on("data", (row) => { // each row
                if (row["address"] && row["address"].trim() !== "") // if there is no address, drop the entry
                    jsonData.push(row);
            })
            .on("end", () => {  // finished reading file, store data in json
                fs.writeFileSync(file.json, JSON.stringify(jsonData, null, 2));
                console.log(`Converted: ${file.csv} -> ${file.json}`);
                resolve();
            })
            .on("error", (err) => { // !!! ERROR !!!
                console.error(`Error processing ${file.csv}:`, err);
                reject(err);
            });
    });
};

/* ----- Routes ----- */

// route for converting the csv data to json (local storage)
app.get("/api/convert-csv", async (req, res) => {
    try {
        for (const file of FILE_PATHS) {
            await convertCSVtoJSON(file);
        }
        res.json({ message: "CSV files successfully converted to JSON!" });
    } catch (error) {
        res.status(500).json({ error: "Error converting CSV files", details: error });
    }
});

// Helper function to merge listings and amenities data by rentunit_id.
function mergeListingsData(listings, amenities) {
    const amenitiesMap = {};
    amenities.forEach(item => {
        amenitiesMap[item.rentunit_id] = item;
    });
    return listings.map(listing => ({
        ...listing,
        ...(amenitiesMap[listing.rentunit_id] || {})
    }));
}

// route for getting all listings (merged by id)
app.get("/api/listings/all", (req, res) => {
    const listingsPath = "./json/listing_info_200.json";
    const amenitiesPath = "./json/amenities_booleans.json";

    fs.readFile(listingsPath, "utf8", (err, listingsData) => {
        if (err) {
            console.error("Error reading listings JSON file:", err);
            return res.status(500).json({ error: "Failed to retrieve listings." });
        }
        fs.readFile(amenitiesPath, "utf8", (err, amenitiesData) => {
            if (err) {
                console.error("Error reading amenities JSON file:", err);
                return res.status(500).json({ error: "Failed to retrieve amenities." });
            }
            try {
                const listings = JSON.parse(listingsData);
                const amenities = JSON.parse(amenitiesData);
                const mergedListings = mergeListingsData(listings, amenities);
                res.json(mergedListings);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                res.status(500).json({ error: "Invalid JSON format." });
            }
        });
    });
});

// route to filter ids based on user critera selection
// Expected request body example:
// {
//   "priceRange": [100, 1000],
//   "bedrooms": 1,
//   "proximity": 50,
//   "utilitiesIncluded": true,
//   "leaseTerms": { "fourMonths": true, "eightMonths": false, "twelvePlusMonths": false }
// }
app.post("/api/listings/filter", (req, res) => {
    const { priceRange, bedrooms, proximity, utilitiesIncluded, leaseTerms } = req.body;
    const listingsPath = "./json/listing_info_200.json";
    const amenitiesPath = "./json/amenities_booleans.json";

    fs.readFile(listingsPath, "utf8", (err, listingsData) => {
        if (err) {
            console.error("Error reading listings JSON file:", err);
            return res.status(500).json({ error: "Failed to retrieve listings." });
        }
        fs.readFile(amenitiesPath, "utf8", (err, amenitiesData) => {
            if (err) {
                console.error("Error reading amenities JSON file:", err);
                return res.status(500).json({ error: "Failed to retrieve amenities." });
            }
            try {
                const listings = JSON.parse(listingsData);
                const amenities = JSON.parse(amenitiesData);
                const mergedListings = mergeListingsData(listings, amenities);

                // Apply filtering based on user preferences.
                const filteredListings = mergedListings.filter(listing => {
                    let matches = true;

                    // Price Range filtering: Convert listing.rent to a number.
                    if (priceRange && Array.isArray(priceRange) && priceRange.length === 2) {
                        const [minPrice, maxPrice] = priceRange;
                        const price = parseFloat(listing.rent);
                        if (isNaN(price) || price < minPrice || price > maxPrice) {
                            matches = false;
                        }
                    }

                    // Bedrooms filtering: Compare listing.bedrooms_vacant.
                    if (bedrooms) {
                        const listingBedrooms = parseInt(listing.bedrooms_vacant, 10);
                        if (isNaN(listingBedrooms) || listingBedrooms !== parseInt(bedrooms, 10)) {
                            matches = false;
                        }
                    }

                    // Proximity filtering: Compare listing.distance (assuming in km).
                    if (proximity) {
                        const distance = parseFloat(listing.distance);
                        if (isNaN(distance) || distance > parseFloat(proximity)) {
                            matches = false;
                        }
                    }

                    // Utilities filtering: Check if listing has utilities.
                    if (typeof utilitiesIncluded === "boolean" && utilitiesIncluded === true) {
                        if (listing["Utilities Incl"] !== "1") {
                            matches = false;
                        }
                    }

                    // Lease Terms filtering: If any lease term is selected, listing.lease_term should match one.
                    if (leaseTerms) {
                        const allowedTerms = [];
                        if (leaseTerms.fourMonths) allowedTerms.push(4);
                        if (leaseTerms.eightMonths) allowedTerms.push(8);
                        if (leaseTerms.twelvePlusMonths) allowedTerms.push(12); // For simplicity, check for exactly 12.
                        if (allowedTerms.length > 0) {
                            const term = parseInt(listing.lease_term, 10);
                            if (!allowedTerms.includes(term)) {
                                matches = false;
                            }
                        }
                    }

                    return matches;
                });

                res.json(filteredListings);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                res.status(500).json({ error: "Invalid JSON format." });
            }
        });
    });
});

// Route: Get Listings by Multiple IDs via GET query parameter
app.get("/api/listings/by-ids", (req, res) => {
    const idsParam = req.query.ids;
    if (!idsParam) {
        return res.status(400).json({ error: "Missing query parameter: ids" });
    }
    // Expecting ids as a comma-separated list, e.g., "276,123,456"
    const ids = idsParam.split(",").map(id => id.trim());

    const listingsPath = "./json/listing_info_200.json";
    const amenitiesPath = "./json/amenities_booleans.json";

    fs.readFile(listingsPath, "utf8", (err, listingsData) => {
        if (err) {
            console.error("Error reading listings JSON file:", err);
            return res.status(500).json({ error: "Failed to retrieve listings." });
        }
        fs.readFile(amenitiesPath, "utf8", (err, amenitiesData) => {
            if (err) {
                console.error("Error reading amenities JSON file:", err);
                return res.status(500).json({ error: "Failed to retrieve amenities." });
            }
            try {
                const listings = JSON.parse(listingsData);
                const amenities = JSON.parse(amenitiesData);
                const mergedListings = mergeListingsData(listings, amenities);
                // Filter listings whose rentunit_id is in the ids array (as strings)
                const filteredListings = mergedListings.filter(item =>
                    ids.includes(item.rentunit_id)
                );
                res.json(filteredListings);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                return res.status(500).json({ error: "Invalid JSON format." });
            }
        });
    });
});


/* ----- model route ----- */
const { spawn } = require('child_process');
const path = require('path');

// route to run the Python model and return recommended rentunit IDs
app.get('/api/model/recommend', (req, res) => {
    // Path to the Python interpreter inside your venv (adjust for your OS)
    const pythonPath = path.join(__dirname, 'model', 'venv', 'Scripts', 'python');
    // Path to the model script
    const modelScript = path.join(__dirname, 'model', 'model.py');
    // Set the working directory to the 'model' folder so that relative paths in model.py work
    const options = { cwd: path.join(__dirname, 'model') };

    console.log('Using Python interpreter:', pythonPath);
    console.log('Using model script:', modelScript);
    console.log('Working directory:', options.cwd);

    const pythonProcess = spawn(pythonPath, [modelScript], options);

    let output = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
        try {
            // Use a regular expression to extract the first JSON object from the output.
            const jsonMatch = output.match(/{[\s\S]*}/);
            if (!jsonMatch) {
                throw new Error("No JSON object found in model output");
            }
            const parsedOutput = JSON.parse(jsonMatch[0]);
            res.json(parsedOutput);
        } catch (err) {
            console.error('Error parsing model output:', err, 'Full output:', output);
            res.status(500).json({ error: 'Failed to parse model output.' });
        }
    });
});


// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
