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
      const { amount, currency, userEmail } = req.body;
      const accessToken = await getAccessToken();
  
      // Step 1: Create an order with payment_source
      const orderResponse = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
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
              email_address: userEmail, // Direktang gagamitin ang email ng user
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
  
      res.status(200).json({
        message: "Payment captured successfully",
        data: captureResponse.data,
      });
  
    } catch (error) {
      console.error("PayPal charge error:", error);
      res.status(500).json({ message: "Payment failed", error: error.message });
    }
  });
  

module.exports = router;
