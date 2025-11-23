import React, { useState } from "react";
import Swal from "sweetalert2";
import { registerOfflineCustomer } from "../../api/authApi"; 
import { useNavigate } from "react-router-dom";

const AddClient = () => {
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");

      const res = await registerOfflineCustomer(customerData, token);

      Swal.fire({
        title: "Success",
        html: res.message + (res.generatedPassword ? `<br/><strong>Password:</strong> ${res.generatedPassword}` : ""),
        icon: "success",
    });

      navigate("/admin/all-users"); 
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || err.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Register Offline Customer
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">Full Customer Name</label>
          <input
            type="text"
            name="name"
            value={customerData.name}
            onChange={handleChange}
            placeholder="Enter full customer name"
            className="mt-1 block w-full px-4 py-2 border rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            shadow-sm bg-white"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700">Customer Email</label>
          <input
            type="email"
            name="email"
            value={customerData.email}
            onChange={handleChange}
            placeholder="Enter customer email"
            className="mt-1 block w-full px-4 py-2 border rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            shadow-sm bg-white"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={customerData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="mt-1 block w-full px-4 py-2 border rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            shadow-sm bg-white"
            
          />
        </div>

        {/* Phone & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={customerData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="mt-1 block w-full px-4 py-2 border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              shadow-sm bg-white"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={customerData.city}
              onChange={handleChange}
              placeholder="Enter city"
              className="mt-1 block w-full px-4 py-2 border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              shadow-sm bg-white"
              required
            />
          </div>
        </div>

        {/* Address & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={customerData.address}
              onChange={handleChange}
              placeholder="Enter address"
              className="mt-1 block w-full px-4 py-2 border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              shadow-sm bg-white"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              name="state"
              value={customerData.state}
              onChange={handleChange}
              placeholder="Enter state"
              className="mt-1 block w-full px-4 py-2 border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              shadow-sm bg-white"
              required
            />
          </div>
        </div>

        {/* ZIP & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">ZIP</label>
            <input
              type="text"
              name="zip"
              value={customerData.zip}
              onChange={handleChange}
              placeholder="Enter ZIP code"
              className="mt-1 block w-full px-4 py-2 border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              shadow-sm bg-white"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={customerData.country}
              onChange={handleChange}
              placeholder="Enter country"
              className="mt-1 block w-full px-4 py-2 border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              shadow-sm bg-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg 
          text-lg font-semibold hover:bg-blue-700 transition 
          disabled:bg-gray-400"
        >
          {loading ? "Registering..." : "Register Customer"}
        </button>
      </form>
    </div>
  );
};

export default AddClient;
