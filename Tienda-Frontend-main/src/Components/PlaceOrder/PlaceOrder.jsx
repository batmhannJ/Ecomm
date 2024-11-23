import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";
import "./PlaceOrder.css";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  regions,
  provincesByCode,
  cities,
  barangays,
} from "select-philippines-address";

const generateReferenceNumber = () => {
  return `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const getUserIdFromToken = () => {
  const authToken = localStorage.getItem("auth-token");
  if (authToken) {
    const payload = JSON.parse(atob(authToken.split(".")[1]));
    return payload.user.id;
  }
  return null;
};

const MAIN_OFFICE_COORDINATES = {
  latitude: 14.628488,
  longitude: 121.03342,
};

export const PlaceOrder = () => {
  const { getTotalCartAmount, all_product, cartItems, clearCart } = useContext(ShopContext);
  const token = localStorage.getItem("auth-token");
  const navigate = useNavigate();
  const location = useLocation();
  const { itemDetails } = location.state || {};

  const [transactionId, setTransactionId] = useState(null);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    barangay: "",
    city: "",
    state: "",
    zipcode: "",
    country: "Philippines",
    phone: "",
    provinceCode: "",
    provinces: [],
  });
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("https://ip-tienda-han-backend.onrender.com/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const loggedInUserId = localStorage.getItem("userId");
        const loggedInUser = response.data.find(user => user._id === loggedInUserId);

        if (loggedInUser) {
          const { barangay, municipality, province, region, street, zip, country } = loggedInUser.address;
          const barangayName = await barangays(municipality);
          const cityData = await cities(province);
          const provincesData = await provincesByCode(region);

          setData({
            firstName: loggedInUser.name.split(" ")[0] || "",
            lastName: loggedInUser.name.split(" ")[1] || "",
            email: loggedInUser.email || "",
            street: street || "",
            barangay: barangayName.find(b => b.brgy_code === barangay)?.brgy_name || "",
            city: cityData.find(c => c.city_code === municipality)?.city_name || "",
            state: provincesData.find(p => p.province_code === province)?.province_name || "",
            zipcode: zip || "",
            country: country || "Philippines",
            phone: loggedInUser.phone || "",
          });
        } else {
          toast.error("Error fetching logged-in user's data.");
        }
      } catch (error) {
        toast.error("Error fetching user data.");
      }
    };

    if (token) {
      fetchUserData();
    } else {
      toast.error("Please log in to proceed.");
      navigate("/login");
    }
  }, [token, navigate]);

  const fetchCoordinates = async address => {
    const apiKey = process.env.REACT_APP_POSITION_STACK_API_KEY;
    const url = `https://api.positionstack.com/v1/forward?access_key=${apiKey}&query=${address}`;
    try {
      const response = await axios.get(url);
      return {
        latitude: response.data.data[0].latitude,
        longitude: response.data.data[0].longitude,
      };
    } catch (error) {
      toast.error("Error fetching coordinates.");
      return null;
    }
  };

  const calculateDeliveryFee = async () => {
    const customerAddress = `${data.street}, ${data.city}`;
    const coordinates = await fetchCoordinates(customerAddress);

    if (coordinates) {
      const distanceKm = getDistanceFromLatLonInKm(
        MAIN_OFFICE_COORDINATES.latitude,
        MAIN_OFFICE_COORDINATES.longitude,
        coordinates.latitude,
        coordinates.longitude
      );
      const distanceMiles = distanceKm * 0.621371;

      const isSameRegion = data.state === "Metro Manila" || data.region === "NCR";
      let baseFee = isSameRegion ? 20 : 40;
      let feePerMile = isSameRegion ? 2 : 3;

      let totalFee = baseFee + feePerMile * Math.ceil(distanceMiles);
      totalFee = Math.min(totalFee, isSameRegion ? 100 : 200);

      setDeliveryFee(totalFee);
    }
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degreesToRadians(lat1)) *
        Math.cos(degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const degreesToRadians = degrees => degrees * (Math.PI / 180);

  useEffect(() => {
    if (data.street && data.city) calculateDeliveryFee();
  }, [data.street, data.city]);

  const handleProceedToCheckout = async event => {
    event.preventDefault();
    if (!data.street || !data.city || !data.state || !data.zipcode) {
      toast.error("Please provide your complete address to proceed.");
      return;
    }

    if (token) {
      const requestReferenceNumber = generateReferenceNumber();
      const cartDetails = itemDetails.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price || item.adjustedPrice,
        quantity: item.quantity,
        size: item.size,
      }));

      const mayaApiUrl = "https://pg-sandbox.paymaya.com/checkout/v1/checkouts";
      const secretKey = process.env.REACT_APP_CHECKOUT_PUBLIC_API_KEY;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${secretKey}:`)}`,
      };

      const requestBody = {
        totalAmount: {
          value: getTotalCartAmount() + deliveryFee,
          currency: "PHP",
        },
        buyer: {
          firstName: data.firstName,
          lastName: data.lastName,
          contact: { email: data.email, phone: data.phone },
        },
        items: [
          ...cartDetails.map(item => ({
            name: item.name,
            quantity: item.quantity,
            amount: { value: item.price },
            totalAmount: { value: item.price * item.quantity },
          })),
          { name: "Delivery Fee", amount: { value: deliveryFee }, totalAmount: { value: deliveryFee } },
        ],
        redirectUrl: {
          success: `https://ip-tienda-han.onrender.com/myorders?orderId=${requestReferenceNumber}&status=success`,
          failure: `https://ip-tienda-han.onrender.com/myorders?orderId=${requestReferenceNumber}&status=failed`,
          cancel: `https://ip-tienda-han.onrender.com/myorders?orderId=${requestReferenceNumber}&status=canceled`,
        },
        requestReferenceNumber,
      };

      try {
        const response = await axios.post(mayaApiUrl, requestBody, { headers });
        if (response.data && response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        } else {
          toast.error("Checkout error.");
        }
      } catch (error) {
        toast.error("Error during checkout.");
      }
    } else {
      toast.error("Please log in to proceed.");
      navigate("/login");
    }
  };

  useEffect(() => {
    if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [navigate, getTotalCartAmount]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search); // Get the query parameters from the URL
    const id = searchParams.get("orderId"); // Extract the 'orderId' parameter from the URL
    const status = searchParams.get("status"); // Extract the 'status' parameter from the URL
    if (id && status === "success") {
      console.log("Payment successful. Clearing cart...");
      setTransactionId(id); // Set the extracted id in state
      clearCart(); // Clear the cart after successful payment
      toast.success("Order placed successfully!");
    } else if (status === "failed") {
      toast.error("Payment failed. Please try again.");
    } else if (status === "canceled") {
      toast.info("Payment was canceled.");
    } else {
      console.error("No Transaction ID found in URL");
    }
  }, [location]);

  return (
    <form noValidate onSubmit={handleProceedToCheckout} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First Name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last Name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Email Address"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.barangay}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="province"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="Province"
          />
          <input
            required
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder="Country"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            onChange={onChangeHandler}
            value={data.zipcode}
            type="text"
            placeholder="Zip Code"
          />
          <input
            required
            name="phone"
            onChange={onChangeHandler}
            value={data.phone}
            type="text"
            placeholder="Phone"
          />
        </div>
      </div>
      <div className="place-order-right">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>₱{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Delivery Fee</p>
              <p> ₱{deliveryFee}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>
                ₱
                {getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() + deliveryFee}
              </h3>
            </div>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
