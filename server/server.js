const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; // Default to port 5000

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Routes
app.get("/api/", (req, res) => {
  res.send("Welcome to the Off-Campus Housing API!");
});

// Placeholder for housing listings route
app.get("/api/listings", (req, res) => {
  res.json({ message: "This will return all listings." });
});

// Placeholder for user preferences (for recommendation model)
app.post("/api/recommendations", (req, res) => {
  const { preferences } = req.body;
  res.json({ message: "Model will process these preferences.", preferences });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
