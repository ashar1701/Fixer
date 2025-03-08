import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ListingList from "./components/ListingList.js";
import NavBar from "./components/NavBar.js";
import Login from "./Login.js";
import SignUp from "./SignUp.js";

function App() {
  return (
    <Router>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<ListingList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;