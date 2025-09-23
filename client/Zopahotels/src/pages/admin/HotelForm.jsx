import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHotel, getHotel, updateHotel } from "../../api/hotelApi";
import Swal from "sweetalert2";
import { useHotel } from "../../context/HotelContext";
import {API_URL} from '../../config'

const HotelForm = ({ mode }) => {
  const { setHotel } = useHotel();
  const navigate = useNavigate();
  const [hotelData, setHotelData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    logo: null,
    currency: "USD",
  });
  const [preview, setPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const {hotel} = useHotel();

  useEffect(() => {
    if (mode === "edit") {
      const fetchHotel = async () => {
        try {
          const hotel = await getHotel();
          setHotelData({
            name: hotel.name || "",
            description: hotel.description || "",
            address: hotel.address || "",
            phone: hotel.phone || "",
            email: hotel.email || "",
            logo: null,
            currency: hotel.currency || "USD",
          });
          setExistingLogo(hotel.logo ? `${API_URL}uploads/${hotel.logo}` : null);
          setPreview(null)
        } catch (err) {
          Swal.fire("Error", `Failed to fetch hotel details: ${err}`, "error");
        }
      };
      fetchHotel();
    }
  }, [mode]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
  const file = files[0];
  if (file && file.type.startsWith("image/")) {
    setHotelData((prev) => ({ ...prev, logo: file }));
    setPreview(URL.createObjectURL(file)); // new preview
  } else {
    setPreview(null);
  }
}

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(hotelData).forEach((key) => {
        if (hotelData[key] !== null) formData.append(key, hotelData[key]);
      });

      const token = localStorage.getItem("adminToken");
      let res;
      if (mode === "edit") {
        res = await updateHotel(formData, token);
      } else {
        res = await createHotel(formData, token);
      }

      setHotel(res.hotel);
      Swal.fire("Success", res.message, "success");
      navigate("/admin/settings");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {mode === "edit" ? "Edit Hotel Details" : "Add New Hotel"}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">Hotel Name</label>
          <input
            type="text"
            name="name"
            value={hotelData.name}
            onChange={handleChange}
            placeholder="Enter hotel name"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={hotelData.description}
            onChange={handleChange}
            placeholder="Enter hotel description"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white resize-none"
            rows={4}
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={hotelData.address}
            onChange={handleChange}
            placeholder="Enter address"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
          />
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={hotelData.phone}
              onChange={handleChange}
              placeholder="Enter phone"
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={hotelData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Hotel Logo</label>
          <div className="flex items-center gap-4">
  <input
    type="file"
    name="logo"
    accept="image/*"
    className="bg-white px-4 py-2 border rounded-lg"
    onChange={handleChange}
  />

  {/* Show existing logo only if no new preview */}
  {!preview && existingLogo && (
    <img
      src={existingLogo}
      alt="Current Logo"
      className="w-32 h-32 object-cover border rounded-lg shadow"
    />
  )}

  {/* Show new preview when a file is selected */}
  {preview && (
    <img
      src={preview}
      alt="Logo Preview"
      className="w-32 h-32 object-cover border rounded-lg shadow"
    />
  )}
</div>


        </div>

        <div>
          <label className="block mb-2 font-medium">Currency</label>
          <select
            name="currency"
            value={hotelData.currency}
            onChange={handleChange}
            className="swal2-input"
            required
          >
            <option value="USD">USD – US Dollar ($)</option>
            <option value="NPR">NPR – Nepalese Rupee (₨)</option>
          </select>
        </div>


        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update Hotel" : "Add Hotel"}
        </button>
      </form>
    </div>
  );
};

export default HotelForm;
