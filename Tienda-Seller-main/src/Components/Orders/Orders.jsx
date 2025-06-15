import React, { useState, useEffect } from "react";
import "./Orders.css";
import { toast } from "react-toastify";
import parcel_icon from "../../assets/parcel_icon.png";
import { io } from "socket.io-client"; // Import Socket.IO client

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const socket = io("https://ip-tienda-han-backend.onrender.com"); // Connect to Socket.IO server

  // Fetch all orders (transactions)
  const fetchAllOrders = async () => {
    try {
      const response = await fetch("https://ip-tienda-han-backend.onrender.com/api/transactions"); // Fetch transaction data
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const filteredOrders = data
        .filter((order) => order.status !== "pending")
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort from latest to oldest
      setOrders(filteredOrders); // Ensure data is an array
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders");
    }
  };

  // Function to send email notification to seller
  const sendDeliveryEmail = async (orderDetails) => {
    try {
      const emailData = {
        to: "alliyahanis07@gmail.com",
        subject: `Order Delivered - Transaction ID: ${orderDetails.transactionId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #4CAF50; text-align: center;">🎉 Order Delivered Successfully!</h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
              <p><strong>Transaction ID:</strong> ${orderDetails.transactionId}</p>
              <p><strong>Customer Name:</strong> ${orderDetails.name || "Unknown User"}</p>
              <p><strong>Item:</strong> ${orderDetails.item}</p>
              <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
              <p><strong>Amount:</strong> ₱${orderDetails.amount}</p>
              <p><strong>Delivery Address:</strong> ${orderDetails.address || "Address Not Available"}</p>
              <p><strong>Contact Number:</strong> ${orderDetails.contact || "No Phone Number"}</p>
              <p><strong>Order Date:</strong> ${new Date(orderDetails.date).toLocaleDateString()}</p>
              <p><strong>Delivery Status:</strong> <span style="color: #4CAF50; font-weight: bold;">DELIVERED</span></p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 15px; background-color: #e8f5e8; border-radius: 5px;">
              <p style="color: #4CAF50; font-weight: bold; margin: 0;">This order has been successfully delivered to the customer!</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
              <p>This is an automated notification from your Han Store system.</p>
            </div>
          </div>
        `
      };

      const response = await fetch("https://ip-tienda-han-backend.onrender.com/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      console.log("Delivery email sent successfully to seller");
    } catch (error) {
      console.error("Error sending delivery email:", error);
      // Don't show toast error for email failure to avoid disrupting the main flow
    }
  };

  const statusHandler = async (event, transactionId) => {
    const newStatus = event.target.value;

    // Show confirmation dialog before updating status
    if (window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
      try {
        const response = await fetch(
          `https://ip-tienda-han-backend.onrender.com/api/transactions/${transactionId}`,
          {
            method: "PATCH", // Using PATCH to update
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }), // Send new status
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update status");
        }

        // Update local state to reflect the status change
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.transactionId === transactionId
              ? { ...order, status: newStatus }
              : order
          )
        );

        // Send email notification if status is changed to "Delivered"
        if (newStatus === "Delivered") {
          const deliveredOrder = orders.find(order => order.transactionId === transactionId);
          if (deliveredOrder) {
            await sendDeliveryEmail({
              ...deliveredOrder,
              status: newStatus // Update with new status
            });
            toast.success("Order status updated and seller notified via email!");
          }
        } else {
          toast.success("Order status updated successfully!");
        }

      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Error updating order status");
      }
    }
  };

  useEffect(() => {
    fetchAllOrders(); // Initial fetch of orders

    // Listen for updates from the server via Socket.IO
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.transactionId === updatedOrder.transactionId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect(); // Disconnect the socket
    };
  }, []); // Empty dependency array to run only once on mount

  return (
    <div className="container">
      <div className="order add">
        <h3>Order Page</h3>
        <div className="order-list">
          {orders.length === 0 ? (
            <p>No orders available</p>
          ) : (
            orders.map((order, index) => (
              <div key={index} className="order-item">
                <img src={parcel_icon} alt="parcel icon" />
                <div>
                  <p className="order-item-food">
                    {order.item} {/* Display the correct item */}
                  </p>

                  <p className="order-item-name">
                    {order.name || "Unknown User"}
                  </p>

                  <div className="order-item-address">
                    <p>{order.address || "Address Not Available"}</p>
                  </div>

                  <p className="order-item-phone">
                    {order.contact || "No Phone Number"}
                  </p>
                </div>

                <p>
                  Quantity: {order.quantity}
                  {/* Display the actual quantity of items ordered */}
                </p>
                <p>₱{order.amount || "Amount Not Available"}</p>

                {/* Order status update dropdown */}
                <select
                  onChange={(event) => statusHandler(event, order.transactionId)}
                  value={order.status}
                >
                  <option value="Cart Processing">Cart Processing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;