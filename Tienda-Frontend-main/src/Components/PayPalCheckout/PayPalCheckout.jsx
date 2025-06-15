import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";

const PayPalCheckout = ({ totalAmount, onPaymentSuccess }) => {
  const initialOptions = {
    "client-id": "AbXtYpGvq8DoiaoNknMCN2MNzmp9Q2DeVkJq8RluWM5D5LgwiDzztIId1gVHMJP5n2i6KezCeiAJ04dE",
    currency: "PHP",
    intent: "capture",
    // Force PayPal login instead of guest checkout
    "disable-funding": "credit,card,paylater,bancontact,blik,eps,giropay,ideal,mercadopago,mybank,p24,sepa,sofort,venmo",
    // Enable only PayPal payment method
    "enable-funding": "paypal"
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{
          shape: "rect",
          color: "blue",
          layout: "vertical",
          label: "paypal",
          // Hide card option
          fundingicons: false
        }}
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
            // Force PayPal account login
            payment_source: {
              paypal: {
                experience_context: {
                  payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                  user_action: "PAY_NOW",
                  shipping_preference: "NO_SHIPPING"
                }
              }
            }
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
          alert("Payment failed. Please try again.");
        }}
        onCancel={(data) => {
          console.log("Payment cancelled by user");
          alert("Payment was cancelled.");
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalCheckout;