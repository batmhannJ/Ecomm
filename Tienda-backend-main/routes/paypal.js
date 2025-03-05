const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();


const PAYPAL_CLIENT_ID = "AZHXvh50TSv6IaOBD6EDYYjAIYXKB3MhH6MnYeUL6cSCk5a-Cg01hJi5jGcKHyyCDy2B1HcgQn4um5JT";
const PAYPAL_SECRET = "EOMgIpqgolvwt558kUHf2w-vjqqlF7sLI5BAzxkeNdGsUYalJCBtD0E7-ASHxplQFRdXO-SN6PwUIH3Z";
const PAYPAL_API = "https://api-m.paypal.com"; // Live environment

const SELLER_EMAIL = "reyeshannahjoy82@gmail.com"; // Dito papasok ang pera

// Function to get PayPal access token
const getAccessToken = async () => {
  try {
    const response = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    throw new Error("Failed to get PayPal access token");
  }
};

router.post("/charge", async (req, res) => {
    try {
      const { amount, currency } = req.body;
      const accessToken = await getAccessToken();
  
      console.log("Creating PayPal order...");
  
      // Step 1: Create an order
      const orderResponse = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders`,
        {
          intent: "CAPTURE", // Direktang i-ca-capture
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount,
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                user_action: "PAY_NOW",
              },
              email_address: "hannahjoyreyes08@gmail.com",
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Order Created:", orderResponse.data);
  
      // Step 2: Auto-capture payment
      const captureResponse = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders/${orderResponse.data.id}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Payment Captured:", captureResponse.data);
  
      res.status(200).json({
        message: "Payment captured successfully",
        data: captureResponse.data,
      });
  
    } catch (error) {
      console.error("PayPal charge error:", error.response?.data || error);
      res.status(500).json({ message: "Payment failed", error: error.message });
    }
  });
  

module.exports = router;
