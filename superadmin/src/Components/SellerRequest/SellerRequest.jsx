// src/Components/SellerRequest/SellerRequest.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerSearchBar from "../SearchBar/SellerSearchBar";
import { toast } from "react-toastify";
import "./SellerRequest.css";

function SellerRequest() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [originalSellers, setOriginalSellers] = useState([]);
  const [searching, setSearching] = useState(false);

  const adminToken = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!adminToken) {
      toast.error("Admin not authenticated. Please log in.");
      return;
    }
    fetchPendingSellers();
  }, [adminToken]);

  const fetchPendingSellers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ip-tienda-han-backend.onrender.com/api/superadmin/pending",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      const fetchedSellers = Array.isArray(response.data) ? response.data : [];
      setSellers(fetchedSellers);
      setOriginalSellers(fetchedSellers);
    } catch (error) {
      console.error("Error fetching pending admin:", error);
      setError("Failed to fetch pending admin.");
      toast.error("Failed to fetch pending admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (id) => {
    if (!window.confirm("Are you sure you want to approve this admin?"))
      return;

    setApproving(true);
    try {
      const response = await axios.patch(
        `https://ip-tienda-han-backend.onrender.com/api/superadmin/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      
      toast.success(
        `Admin ${response.data.admin.name} approved successfully.`
      );
      setSellers(sellers.filter((seller) => seller._id !== id));
      setOriginalSellers(
        originalSellers.filter((seller) => seller._id !== id)
      );
    } catch (error) {
      console.error("Error approving admin:", error);
      toast.error("Error approving admin.");
    } finally {
      setApproving(false);
    }
  };

  const handleDeleteSeller = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const response = await axios.delete(
        `https://ip-tienda-han-backend.onrender.com/api/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Admin deleted successfully.");
        fetchPendingSellers();
      } else {
        toast.error("Failed to delete admin.");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Error deleting admin.");
    }
  };

  // Updated handleSearch function to receive searchTerm as parameter
  const handleSearch = async (searchTerm) => {
    setSearching(true);
    try {
      // If search term is empty, reset to original sellers
      if (!searchTerm || searchTerm.trim() === "") {
        setSellers(originalSellers);
        setSearching(false);
        return;
      }

      // Make API call for server-side search of pending sellers only
      const response = await axios.get(
        `https://ip-tienda-han-backend.onrender.com/api/superadmin/search?term=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      
      setSellers(response.data);
      
    } catch (error) {
      console.error("Error searching sellers:", error);
      toast.error("Search failed. Please try again.");
      
      // Fallback to local search if API fails
      const filteredSellers = originalSellers.filter(seller => 
        seller._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (seller.name && seller.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setSellers(filteredSellers);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="seller-management-container">
      <h1>Manage Admin Requests</h1>
      
      <SellerSearchBar onSearch={handleSearch} />
      
      {searching && <p>Searching...</p>}
      
      {loading ? (
        <p>Loading pending admins...</p>
      ) : sellers.length === 0 ? (
        <p>No pending admin requests.</p>
      ) : (
        <table className="seller-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller._id}>
                <td>{seller._id}</td>
                <td>{seller.email}</td>
                <td>
                  <button
                    className="action-button approve"
                    onClick={() => handleApproveSeller(seller._id)}
                    disabled={approving}
                  >
                    Approve
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteSeller(seller._id)}
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SellerRequest;