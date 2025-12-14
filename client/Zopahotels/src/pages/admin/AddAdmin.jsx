import React, { useState } from "react";
import Swal from "sweetalert2";
import { registerAdmin } from "../../api/authApi"; // adjust path
import { useNavigate } from "react-router-dom";

const AddAdmin = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    role: "staff"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken"); // assuming admin is logged in
      const res = await registerAdmin(adminData, token);
      Swal.fire("Success", res.message, "success");
      navigate("/admin/all-admins"); // redirect to admin list or dashboard
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
        Add New Admin
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        {/* role */}
        <div>
          <label className="text-sm font-medium text-gray-700">Assign Role</label>
          <select
            name="role"
            value={adminData.role}
            onChange={handleChange}
            placeholder="Enter full name"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            value={adminData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={adminData.email}
            onChange={handleChange}
            placeholder="Enter email"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={adminData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
            required
          />
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={adminData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={adminData.city}
              onChange={handleChange}
              placeholder="Enter city"
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              required
            />
          </div>
        </div>

        {/* Address Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={adminData.address}
              onChange={handleChange}
              placeholder="Enter address"
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              name="state"
              value={adminData.state}
              onChange={handleChange}
              placeholder="Enter state"
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
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
              value={adminData.zip}
              onChange={handleChange}
              placeholder="Enter ZIP code"
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={adminData.country}
              onChange={handleChange}
              placeholder="Enter country"
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {loading ? "Creating..." : "Add Admin"}
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;
