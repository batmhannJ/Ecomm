const express = require("express");

const axios = require("axios");
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const { PlaceOrder, verifyOrder, userOrders, listOrders, updateStatus } = require('../controllers/orderController');

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware, PlaceOrder);
orderRouter.get('/verify', verifyOrder)
orderRouter.post('/userorders', authMiddleware, userOrders)
orderRouter.get('/list', listOrders)
orderRouter.post('/status', updateStatus)


const PAYPAL_CLIENT_ID = "AZHXvh50TSv6IaOBD6EDYYjAIYXKB3MhH6MnYeUL6cSCk5a-Cg01hJi5jGcKHyyCDy2B1HcgQn4um5JT";
const PAYPAL_SECRET = "EOMgIpqgolvwt558kUHf2w-vjqqlF7sLI5BAzxkeNdGsUYalJCBtD0E7-ASHxplQFRdXO-SN6PwUIH3Z";
const PAYPAL_API = "https://api-m.paypal.com"; // Live environment


const getPayPalAccessToken = async () => {
    try {
      const response = await axios.post(
        `${PAYPAL_API}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error("PayPal Access Token Error:", error);
      return null;
    }
  };


router.post("/paypal/payout", async (req, res) => {
    console.log("Received payout request:", req.body); // ✅ Debugging line

    const { orderId, amount } = req.body;
  
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return res.status(500).json({ success: false, message: "Failed to authenticate with PayPal." });
    }
  
    try {
      const payoutResponse = await axios.post(
        `${PAYPAL_API}/v1/payments/payouts`,
        {
          sender_batch_header: {
            email_subject: "You have received a payment!",
          },
          items: [
            {
              recipient_type: "EMAIL",
              receiver: "reyeshannahjoy82@gmail.com", // Replace with seller's PayPal email
              amount: {
                value: amount,
                currency: "PHP",
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
  
      res.json({ success: true, payoutBatchId: payoutResponse.data.batch_header.payout_batch_id });
    } catch (error) {
      console.error("PayPal Payout Error:", error);
      res.status(500).json({ success: false, message: "Failed to process PayPal payout." });
    }
  });
  

  router.post("/paypal/authorize", async (req, res) => {
    console.log("Received authorization request:", req.body);
    const { totalAmount, transactionId } = req.body; // ✅ Receive transactionId
  
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return res.status(500).json({ success: false, message: "Failed to authenticate with PayPal." });
    }
  
    try {
      const orderResponse = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders`,
        {
          intent: "AUTHORIZE", // ✅ Hold funds, do not capture yet
          purchase_units: [
            {
            reference_id: transactionId, // ✅ Use transactionId as PayPal Order ID
              amount: {
                currency_code: "PHP",
                value: totalAmount.toFixed(2),
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
      console.log("✅ PayPal Authorization Successful:", orderResponse.data); // ✅ Debug log

      res.json({ success: true, orderId: transactionId }); // ✅ Return transactionId as PayPal order ID
    } catch (error) {
      console.error("PayPal Authorization Error:", error.response?.data || error);
      res.status(500).json({ success: false, message: "Failed to authorize PayPal payment." });
    }
  });
  
  router.post("/paypal/capture", async (req, res) => {
    console.log("🔍 Capturing PayPal Payment:", req.body); // ✅ Debug log
  
    const { orderId } = req.body; // ✅ transactionId is used as orderId
  
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return res.status(500).json({ success: false, message: "Failed to authenticate with PayPal." });
    }
  
    try {
      const captureResponse = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, // ✅ Use transactionId
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("✅ PayPal Capture Successful:", captureResponse.data); // ✅ Debug log
  
      res.json({ success: true, details: captureResponse.data });
    } catch (error) {
      console.error("❌ PayPal Capture Error:", error.response?.data || error);
      res.status(500).json({ success: false, message: "Failed to capture PayPal payment." });
    }
  });
  
  

module.exports = orderRouter;