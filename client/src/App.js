import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ListingList from "./components/ListingList.js";
import NavBar from "./components/NavBar.js";
import Login from "./Login.js";
import SignUp from "./SignUp.js";
import Dashboard from "./Dashboard";
import ThumbsUp from "./ThumbsUp.js";
import { AuthProvider, useAuth } from './authentication/AuthContext';
import ProtectedRoute from './authentication/ProtectedRoute';
import RecommendedListings from "./components/RecommendedListings.js";

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <NavBar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/saved" element={<ProtectedRoute element={<ThumbsUp />} />} />
          <Route path="/listings/filter" element={<ProtectedRoute element={<ListingList />} />} />
          <Route path="/listings/foryou" element={<ProtectedRoute element={<RecommendedListings />} />} />
          <Route path="/" element={<Navigate to="/listings/filter" />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;