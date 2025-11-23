import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRoomById, updateRoom } from "../../api/roomApi";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { API_URL } from "../../config";
import { useHotel } from "../../context/HotelContext";

const EditRoomPage = () => {
  const { id } = useParams();
  const token = localStorage.getItem("adminToken");
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
  });
  const [existingImages, setExistingImages] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hotelAmenities, setHotelAmenities] = useState([]);

  useEffect(() => {
    if (hotel?.amenities?.length) {
      setHotelAmenities(hotel.amenities);
    }
  }, [hotel]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await getRoomById(id);
        setForm({
          type: data.type || "",
          description: data.description || "",
          price: data.price || "",
          adults: data.adults || 1,
          children: data.children || 0,
          maxOccupancy: data.maxOccupancy || 1,
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          rooms: Array.isArray(data.rooms) && data.rooms.length > 0
            ? data.rooms.map(r => ({ roomNumber: r.roomNumber || "" }))
            : [{ roomNumber: "" }],
        });
        setExistingImages(Array.isArray(data.images) ? data.images : []);
      } catch (error) {
        console.error("Failed to fetch room:", error);
        setMessage("Failed to load room data.");
      }
    };
    fetchRoom();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImages([...e.target.files]);
  const removeExistingImage = (idx) => setExistingImages(existingImages.filter((_, i) => i !== idx));
  const removeNewImage = (idx) => setImages(images.filter((_, i) => i !== idx));

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
      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("adults", form.adults);
      formData.append("children", form.children);
      formData.append("maxOccupancy", form.maxOccupancy);
      formData.append("amenities", JSON.stringify(form.amenities));
      formData.append("rooms", JSON.stringify(form.rooms));

      existingImages.forEach(img => formData.append("existingImages", img));
      images.forEach(img => formData.append("images", img));

      await updateRoom(id, formData, token, true);

      Swal.fire({
        title: "Room updated successfully!",
        timer: 2000,
        icon: "success",
        position: "top-end",
        showConfirmButton: false
      });

    } catch (error) {
      Swal.fire({
        title: error.response?.data?.message || "Failed to update room.",
        timer: 2000,
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Edit Room</h2>

        {message && (
          <p
            className={`mb-6 text-center px-4 py-2 rounded-md ${
              message.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Info */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Room Type</label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Price & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <input type="number" name="adults" value={form.adults} onChange={handleChange} min="1"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <input type="number" name="children" value={form.children} onChange={handleChange} min="0"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy</label>
            <input type="number" name="maxOccupancy" value={form.maxOccupancy} onChange={handleChange} min="1"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <input type="file" multiple onChange={handleFileChange}
              className="mb-2 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={`${API_URL}uploads/${img}`} alt={`Room ${idx}`} className="w-24 h-24 object-cover rounded-md shadow-sm" />
                  <button type="button" onClick={() => removeExistingImage(idx)}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700">
                    <FiX />
                  </button>
                </div>
              ))}
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={URL.createObjectURL(img)} alt={`New ${idx}`} className="w-24 h-24 object-cover rounded-md shadow-sm" />
                  <button type="button" onClick={() => removeNewImage(idx)}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities as checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {hotelAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={amenity}
                    checked={form.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          {/* Room Numbers */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Numbers</label>
            {form.rooms.map((room, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input type="text" value={room.roomNumber}
                  onChange={(e) => {
                    const updated = [...form.rooms];
                    updated[index].roomNumber = e.target.value;
                    setForm({ ...form, rooms: updated });
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
                  placeholder="Room Number" required />
                <button type="button"
                  onClick={() => setForm({ ...form, rooms: form.rooms.filter((_, i) => i !== index) })}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={form.rooms.length === 1}>X</button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, rooms: [...form.rooms, { roomNumber: "" }] })}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              + Add Room Number
            </button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition duration-200 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
            {loading ? "Updating..." : "Update Room"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditRoomPage;
