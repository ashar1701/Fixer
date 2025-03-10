import React, { useEffect, useState } from "react";
import { auth } from "./firebase";

const Dashboard = () => {
  const [protectedData, setProtectedData] = useState(null);

  const fetchProtectedData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("User not logged in");
        return;
      }

      // Get Firebase authentication token
      const token = await user.getIdToken();

      // Send request to backend
      const response = await fetch("http://localhost:5000/protected", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setProtectedData(data);
    } catch (error) {
      console.error("Error fetching protected data:", error);
    }
  };

  useEffect(() => {
    fetchProtectedData();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {protectedData ? (
        <p>{protectedData.message}</p>
      ) : (
        <p>Loading protected data...</p>
      )}
    </div>
  );
};

export default Dashboard;
