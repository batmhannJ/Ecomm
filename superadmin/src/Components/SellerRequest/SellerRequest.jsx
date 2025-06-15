// src/Components/SellerRequest/SellerRequest.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerSearchBar from "../SearchBar/SellerSearchBar";
import { toast } from "react-toastify";
import "./SellerRequest.css";
import "./ViewUserModal.css";

function SellerRequest() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [originalSellers, setOriginalSellers] = useState([]); // To keep original seller data
  const [viewSeller, setViewSeller] = useState(null);

  const adminToken = localStorage.getItem("admin_token"); // Ensure the key matches when storing

  useEffect(() => {
    if (!adminToken) {
      toast.error("Admin not authenticated. Please log in.");
      // Optionally, redirect to admin login page
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
      setOriginalSellers(fetchedSellers); // Save the original list for filtering
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
        `https://ip-tienda-han-backend.onrender.com/api/superadmin/${id}/approve`, // Ensure this route matches your backend
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
      // Remove the approved seller from the list
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

  const handleViewSeller = (seller) => {
    setViewSeller(seller);
  };

  const handleSearch = async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim() === "") {
        setSellers(originalSellers);
        return;
      }

      const response = await axios.get(
        `https://ip-tienda-han-backend.onrender.com/api/superadmin/search?term=${searchTerm}`,
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
        (seller.name && seller.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (seller.phone && seller.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setSellers(filteredSellers);
    }
  };

  return (
    <div className="user-management-container">
      <h1>Manage Admin Requests</h1>
      <SellerSearchBar onSearch={handleSearch} />
      
      {loading ? (
        <p>Loading pending admins...</p>
      ) : sellers.length === 0 ? (
        <p>No pending admin requests.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller._id}>
                <td>{seller._id}</td>
                <td>{seller.name || 'N/A'}</td>
                <td>{seller.email}</td>
                <td>{seller.phone || 'N/A'}</td>
                <td>
                  <button
                    className="action-button view"
                    onClick={() => handleViewSeller(seller)}
                  >
                    View
                  </button>
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

      {viewSeller && (
        <div className="view-user-overlay">
          <div className="view-user-details">
            <h2>View Admin Request</h2>
            <button
              type="button"
              className="close-button"
              onClick={() => setViewSeller(null)}
            >
              X
            </button>
            <div className="user-detail">
              <strong>ID:</strong> {viewSeller._id}
            </div>
            <div className="user-detail">
              <strong>Name:</strong> {viewSeller.name || 'N/A'}
            </div>
            <div className="user-detail">
              <strong>Email:</strong> {viewSeller.email}
            </div>
            <div className="user-detail">
              <strong>Contact:</strong> {viewSeller.phone || 'N/A'}
            </div>
            <div className="user-detail">
              <strong>Status:</strong> Pending Approval
            </div>
            {viewSeller.password && (
              <div className="user-detail">
                <strong>Password:</strong> {'*'.repeat(viewSeller.password.length)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerRequest;