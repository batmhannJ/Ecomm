import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";

const PayPalCheckout = ({ totalAmount, onPaymentSuccess }) => {
  return (
    <PayPalScriptProvider options={{ "client-id": "AZHXvh50TSv6IaOBD6EDYYjAIYXKB3MhH6MnYeUL6cSCk5a-Cg01hJi5jGcKHyyCDy2B1HcgQn4um5JT", currency: "PHP" }}>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: "PHP",
                  value: totalAmount.toFixed(2),
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then(async (details) => {
            console.log("Transaction completed by " + details.payer.name.given_name);
            alert("Payment successful! Thank you for your purchase.");
            if (onPaymentSuccess) {
              await onPaymentSuccess(details);
            }

            setTimeout(() => {
              if (window.opener) {
                window.close();
              } else {
                window.location.href = "/myorders?orderSuccess=true"; 
              }
            }, 5000);
            
          });
        }}
        onError={(err) => {
          console.error("PayPal Checkout Error:", err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalCheckout;
