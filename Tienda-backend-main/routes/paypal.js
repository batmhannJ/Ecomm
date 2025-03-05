const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const PAYPAL_CLIENT_ID = "AZHXvh50TSv6IaOBD6EDYYjAIYXKB3MhH6MnYeUL6cSCk5a-Cg01hJi5jGcKHyyCDy2B1HcgQn4um5JT";
const PAYPAL_SECRET = "EOMgIpqgolvwt558kUHf2w-vjqqlF7sLI5BAzxkeNdGsUYalJCBtD0E7-ASHxplQFRdXO-SN6PwUIH3Z";
const PAYPAL_API = "https://api-m.paypal.com"; // Live environment

// Function to get PayPal access token
const getAccessToken = async () => {
  const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
    auth: {
      username: PAYPAL_CLIENT_ID,
      password: PAYPAL_SECRET,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data.access_token;
};

// PayPal charge endpoint
router.post("/charge", async (req, res) => {
  try {
    const { amount, currency, userEmail } = req.body;

    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount,
            },
            payee: {
              email_address: userEmail, // Email ng seller na tatanggap ng payment
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ message: "Payment successful", data: response.data });
  } catch (error) {
    console.error("PayPal payment error:", error);
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
});

module.exports = router;
