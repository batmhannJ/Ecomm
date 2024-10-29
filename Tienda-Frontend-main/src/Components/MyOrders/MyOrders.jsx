import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./MyOrders.css";
import io from "socket.io-client";

const getUserIdFromToken = () => {
  const authToken = localStorage.getItem("auth-token");
  if (authToken) {
    const payload = JSON.parse(atob(authToken.split(".")[1]));
    return payload.user.id;
  }
  return null;
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const params = url.searchParams;
  const userId = getUserIdFromToken();
  const status = params.get("status");

  useEffect(() => {
    handleTransactionStatus(status);
  }, [status]);

  const handleTransactionStatus = (status) => {
    switch (status) {
      case "Failed":
        toast.warn("The transaction Failed.");
        break;
      case "Success":
        toast.success("The transaction has been processed successfully.");
        break;
      case "Cancelled":
        toast.info("The transaction has been cancelled.");
        break;
      default:
    }
  };

  // Function to fetch all user orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `https://tienda-backend-au3t.onrender.com/api/transactions/userTransactions/${userId}`
      );
      const fetchedOrders = Array.isArray(response.data) ? response.data : [];
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and real-time update listener setup
  useEffect(() => {
    // Initial fetch of orders
    fetchOrders();

    // Initialize Socket.IO
    const socket = io("https://tienda-backend-au3t.onrender.com");

    // Listen for real-time updates on order status
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.transactionId === updatedOrder.transactionId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
    });

    // Poll every 10 seconds to ensure real-time updates
    const intervalId = setInterval(fetchOrders, 10000);

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="my-order-container">
      <h1>My Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.transactionId}</td>
                  <td>{order.date}</td>
                  <td>{order.item}</td>
                  <td>{order.quantity}</td>
                  <td>{order.amount}</td>
                  <td>{order.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOrders;
