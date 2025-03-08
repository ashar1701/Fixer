const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const PORT = process.env.PORT || 5000; // default to port 5000

// middleware
app.use(cors()); // enable Cross-Origin Resource Sharing
app.use(express.json()); // parse JSON request bodies

// array variables to store json listing data
const FILE_PATHS = [
    { csv: "./csv/listing_info_200.csv", json: "./json/listing_info_200.json" }, // listing info w/ IDs, 200 sample size
    { csv: "./csv/amenities_booleans.csv", json: "./json/amenities_booleans.json" } // listing IDs matched to bool flags for amenities
]

// function for converting Kam to Islam
const convertCSVtoJSON = (file) => {
    return new Promise((resolve, reject) => {
        let jsonData = [];

        if (!fs.existsSync(file.csv)) {
            console.error(`File not found: ${file.csv}`);
            return reject(`File not found: ${file.csv}`);
        }

        console.log(`Processing: ${file.csv}`);

        fs.createReadStream(file.csv)
            .pipe(csv())
            .on("data", (row) => {
                if (row["address"] && row["address"].trim() !== "")
                    jsonData.push(row);
            })
            .on("end", () => {
                fs.writeFileSync(file.json, JSON.stringify(jsonData, null, 2));
                console.log(`Converted: ${file.csv} -> ${file.json}`);
                resolve();
            })
            .on("error", (err) => {
                console.error(`Error processing ${file.csv}:`, err);
                reject(err);
            });
    });
};

/* --- Routes --- */

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

// default skeleton route
app.get("/api/", (req, res) => {
    res.send("Welcome to the Off-Campus Housing API!");
});

// route for retrieving all listings and their info
app.get("/api/listings/all", (req, res) => {
    const jsonFilePath = "./json/listing_info_200.json";

    fs.readFile(jsonFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading listings JSON file:", err);
            return res.status(500).json({ error: "Failed to retrieve listings." });
        }

        try {
            const listings = JSON.parse(data); // parse JSON string to object
            res.json(listings); // send data as JSON response
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            res.status(500).json({ error: "Invalid JSON format." });
        }
    });
});

// route for retrieving listing by its id
app.get("/api/listings/:id", (req, res) => {
    const jsonFilePath = "./json/listing_info_200.json";
    const listingId = req.params.id; // get ID from URL parameter

    fs.readFile(jsonFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading listings JSON file:", err);
            return res.status(500).json({ error: "Failed to retrieve listings." });
        }

        try {
            const listings = JSON.parse(data); // parse JSON file
            const listing = listings.find((item) => item.rentunit_id === listingId);

            if (!listing) {
                return res.status(404).json({ error: "Listing not found." });
            }

            res.json(listing); // send the found listing
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            res.status(500).json({ error: "Invalid JSON format." });
        }
    });
});

// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
