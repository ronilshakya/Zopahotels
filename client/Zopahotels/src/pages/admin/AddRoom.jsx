import React, { useState, useEffect } from "react";
import { createRoom } from "../../api/roomApi";
import Swal from 'sweetalert2';
import { useHotel } from "../../context/HotelContext";
import { API_URL } from "../../config";

const AddRoom = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { hotel } = useHotel();
  const [form, setForm] = useState({
    type: "",
    description: "",
    price: "",
    adults: 1,
    children: 0,
    maxOccupancy: 1,
    amenities: [],
    rooms: [{ roomNumber: "" }],
    images: [],
  });

  const [hotelAmenities, setHotelAmenities] = useState([]);

  // Load hotel amenities from context
  useEffect(() => {
    if (hotel?.amenities?.length) {
      setHotelAmenities(hotel.amenities);
      setForm(prev => ({ ...prev, amenities: [] })); // start with none selected
    }
  }, [hotel]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm({ ...form, images: files });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAmenityChange = (amenity) => {
    if (form.amenities.includes(amenity)) {
      setForm({ ...form, amenities: form.amenities.filter(a => a !== amenity) });
    } else {
      setForm({ ...form, amenities: [...form.amenities, amenity] });
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
      formData.append("amenities", JSON.stringify(form.amenities));
      formData.append("rooms", JSON.stringify(form.rooms));

      Array.from(form.images).forEach(file => formData.append("images", file));

      await createRoom(formData, token);

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
        amenities: [],
        rooms: [{ roomNumber: "" }],
        images: [],
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to add room";
    setMessage(errorMessage);
       Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        position: 'center'
      });
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {hotelAmenities.map((amenity) => (
                        <label key={amenity._id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={amenity._id}
                            checked={form.amenities.some(a => a._id === amenity._id)}
                            onChange={() => {
                              if (form.amenities.some(a => a._id === amenity._id)) {
                                setForm({
                                  ...form,
                                  amenities: form.amenities.filter(a => a._id !== amenity._id)
                                });
                              } else {
                                setForm({
                                  ...form,
                                  amenities: [...form.amenities, amenity]
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <img src={`${API_URL}uploads/amenities/${amenity.icon}`} alt={amenity.name} className="w-5 h-5 object-cover rounded" />
                          {amenity.name}
                        </label>
                      ))}
                    </div>
                  </div>

          {/* Room Numbers */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Numbers</label>
            {form.rooms.map((room, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={room.roomNumber}
                  onChange={(e) => {
                    const updated = [...form.rooms];
                    updated[index].roomNumber = e.target.value;
                    setForm({ ...form, rooms: updated });
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
                  placeholder="Room Number"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = form.rooms.filter((_, i) => i !== index);
                    setForm({ ...form, rooms: updated });
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={form.rooms.length === 1}
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm({ ...form, rooms: [...form.rooms, { roomNumber: "" }] })}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Add Room
            </button>
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
