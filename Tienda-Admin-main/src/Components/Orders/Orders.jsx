import React, { useState, useEffect } from "react";
import "./Orders.css";
import { toast } from "react-toastify";
import parcel_icon from "../../assets/parcel_icon.png";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const processPayPalPayment = async (order) => {
    try {
      const response = await fetch("https://ip-tienda-han-backend.onrender.com/api/paypal/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: order.amount, // Total amount to be charged
          currency: "PHP",
          userEmail: "hannahjoyreyes08@gmail.com", // Email ng user na gagamitin sa PayPal
        }),
      });

      const data = await response.json(); // Ensure response is parsed properly
  
      if (!response.ok) {
        console.error("PayPal Error Response:", data);
        throw new Error("Failed to process PayPal payment");
      }
      console.log("PayPal Success Response:", data);

      toast.success("Payment successfully processed via PayPal!");
    } catch (error) {
      console.error("Error processing PayPal payment:", error);
      toast.error("Payment failed via PayPal");
    }
  };
  

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
  
  // Update the order status
  const statusHandler = async (event, transactionId) => {
    const newStatus = event.target.value;
  
    if (window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
      try {
        const response = await fetch(
          `https://ip-tienda-han-backend.onrender.com/api/transactions/${transactionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to update status");
        }
  
        // Kunin ang updated na order
        const updatedOrder = orders.find((order) => order.transactionId === transactionId);
  
        // Kapag COD at naging "Delivered", auto-process PayPal payment
        if (updatedOrder.paymentMethod === "COD" && newStatus === "Delivered") {
          await processPayPalPayment(updatedOrder);
        }
  
        // Update ang local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.transactionId === transactionId
              ? { ...order, status: newStatus }
              : order
          )
        );
  
        toast.success("Order status updated successfully!");
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Error updating order status");
      }
    }
  };
  

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div class="container">
      <div className="order add">
        <h3>Order Page</h3>
        {orders.length === 0 ? (
          <p>No orders available</p>
        ) : (
          orders.map((order, index) => (
            <div key={index} className="order-item">
              <img src={parcel_icon} alt="parcel icon" />
              <div>
                <p className="order-item-food">
                  {order.item} {/* Display the correct quantity */}
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
                Quantity: {order.quantity}{" "}
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
  );
};

export default Orders;
