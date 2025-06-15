// src/Components/SearchBar/SellerSearchBar.jsx
import React, { useState } from "react";
import "./SearchBar.css"; // Optional CSS for styling

const SellerSearchBar = ({ onSearch }) => {
 const [searchTerm, setSearchTerm] = useState("");
 
   const handleSubmit = (e) => {
     e.preventDefault();
 
     if (!searchTerm.trim()) {
       toast.warning("Please enter a search term."); // Notify user
       return; // Stop function execution
     }
 
     onSearch(searchTerm); // Call the onSearch function passed from props
   };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for users..."
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default SellerSearchBar;
