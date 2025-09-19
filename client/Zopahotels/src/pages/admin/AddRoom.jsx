import React, { useState } from "react";
import { createRoom } from "../../api/roomApi";
import Swal from 'sweetalert2'

const AddRoom = () => {
  const [form, setForm] = useState({
    type: "",
    description: "",
    price: "",
    adults: 1,
    children: 0,
    maxOccupancy: 1,
    amenities: "",
    rooms: "",
    images: [], // will store File objects
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm({ ...form, images: files });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("No admin token found");

      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("adults", form.adults);
      formData.append("children", form.children);
      formData.append("maxOccupancy", form.maxOccupancy);

      // amenities and rooms as JSON strings
      formData.append("amenities", JSON.stringify(form.amenities.split(",").map(a => a.trim())));
      formData.append("rooms", JSON.stringify(form?.rooms.split(",").map(r => ({ roomNumber: r.trim() }))));

      // append all image files
      Array.from(form.images).forEach(file => {
        formData.append("images", file);
      });

      await createRoom(formData, token);
      // setMessage("Room added successfully!");
      Swal.fire({
        title: 'Room added successfully!',
        icon: "success",
        confirmButtonText: "OK",
        position: "top-end"
      });
      setForm({
        type: "",
        description: "",
        price: "",
        adults: 1,
        children: 0,
        maxOccupancy: 1,
        amenities: "",
        rooms: "",
        images: [],
      });
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || error.message || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Room</h2>
        {message && (
          <p className={`mb-4 text-center text-sm font-medium px-4 py-2 rounded-md ${
            message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Guests & Occupancy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <input
                type="number"
                name="adults"
                value={form.adults}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <input
                type="number"
                name="children"
                value={form.children}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy</label>
              <input
                type="number"
                name="maxOccupancy"
                value={form.maxOccupancy}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma-separated)</label>
            <input
              type="text"
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="WiFi, TV, Air Conditioning"
            />
          </div>

          {/* Room Numbers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Numbers (comma-separated)</label>
            <input
              type="text"
              name="rooms"
              value={form.rooms}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="101, 102, 103"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <input
              type="file"
              name="images"
              onChange={handleChange}
              multiple
              accept="image/*"
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition duration-200 ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Adding..." : "Add Room"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRoom;
