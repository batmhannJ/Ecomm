// src/Components/SellerRequest/SellerRequest.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerSearchBar from "../SearchBar/SellerSearchBar";
import { toast } from "react-toastify";
import "./SellerRequest.css";
//import "./ViewUserModal.css";

function SellerRequest() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [originalSellers, setOriginalSellers] = useState([]); // To keep original seller data

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

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
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
        `https://ip-tienda-han-backend.onrender.com/api/superadmin/search?term=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      
      // Since backend already filters for pending only, no need to filter again
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

  const handleClearSearch = () => {
    setSearchTerm("");
    setSellers(originalSellers);
  };

  return (
    <div className="seller-management-container">
      <h1>Manage Admin Requests</h1>
      
      {/* Custom Search Bar with Button */}
      <div className="search-container" style={{ marginBottom: '20px', marginRight: '100px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by ID, Email, Name, or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            flex: '1',
            maxWidth: '300px'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>
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
                {/*<td>{seller.name}</td>*/}
                <td>{seller.email}</td>
                {/*<td>
                  <img
                    src={`http://localhost:4000/upload/${seller.idPicture}`} // Adjust this path to match your server's setup
                    alt="ID Picture"
                    style={{ width: "100px", height: "auto" }} // You can adjust the size as needed
                  />
                </td>*/}
                {/* Ensure 'idProfile' exists in Seller model */}
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