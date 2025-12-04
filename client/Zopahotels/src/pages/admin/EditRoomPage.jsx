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
    pricings: [{ adults: 1, price: "" }],
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
          children: data.children || 0,
          maxOccupancy: data.maxOccupancy || 1,
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          rooms: Array.isArray(data.rooms) && data.rooms.length > 0
          ? data.rooms.map(r => ({
              roomNumber: r.roomNumber || "",
              status: r.status || "available"  // <-- preload status
            }))
          : [{ roomNumber: "", status: "available" }],
          pricings: Array.isArray(data.pricing) && data.pricing.length > 0
          ? data.pricing
          : [{ adults: 1, price: "" }]
        });
        setExistingImages(Array.isArray(data.images) ? data.images : []);
      } catch (error) {
        console.error("Failed to fetch room:", error);
        setMessage("Failed to load room data.");
      }
    };
    fetchRoom();
  }, [id]);

  const handlePricingChange = (index, field, value) => {
  const updated = [...form.pricings];
  updated[index][field] = value;
  setForm({ ...form, pricings: updated });
};

const addPricingRow = () => {
  const lastAdults = form.pricings.length > 0 
    ? form.pricings[form.pricings.length - 1].adults 
    : 0;
  setForm({
    ...form,
    pricings: [...form.pricings, { adults: lastAdults + 1, price: "" }]
  });
};

const removePricingRow = (index) => {
  const updated = form.pricings.filter((_, i) => i !== index);
  setForm({ ...form, pricings: updated });
};


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
      formData.append("children", form.children);
      formData.append("maxOccupancy", form.maxOccupancy);
      formData.append("amenities", JSON.stringify(form.amenities.map(a => a._id)));
      formData.append("rooms", JSON.stringify(form.rooms));
      formData.append("pricing", JSON.stringify(form.pricings));

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

          <div className="mt-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Pricing (per number of adults)
  </label>
  {form.pricings.map((pricing, index) => (
    <div key={index} className="flex gap-2 mb-2">
      <input
  type="number"
  value={pricing.adults}
  min="1"
  onChange={(e) => {
    const val = e.target.value;
    handlePricingChange(index, "adults", val === "" ? 1 : Math.max(1, parseInt(val)));
  }}
  className="w-1/3 px-3 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
  placeholder="Adults"
  required
/>

<input
  type="text"
  value={pricing.price}
  onChange={(e) => {
    const val = e.target.value;
    // convert safely to number
    const num = val === "" ? 0 : Number(val);
    handlePricingChange(index, "price", num);
  }}
  className="w-2/3 px-3 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
  placeholder="Price"
  required
/>


      <button
        type="button"
        onClick={() => removePricingRow(index)}
        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        disabled={form.pricings.length === 1}
      >
        X
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={addPricingRow}
    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
  >
    + Add Pricing
  </button>
</div>


          {/* Price & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <img src={`${API_URL}uploads/rooms/${img}`} alt={`Room ${idx}`} className="w-24 h-24 object-cover rounded-md shadow-sm" />
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
    <div key={index} className="flex gap-2 mb-2 items-center">
      {/* Room Number Input */}
      <input
        type="text"
        value={room.roomNumber}
        onChange={(e) => {
          const updated = [...form.rooms];
          updated[index].roomNumber = e.target.value;
          setForm({ ...form, rooms: updated });
        }}
        className="w-1/2 px-3 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
        placeholder="Room Number"
        required
      />

      {/* Status Dropdown */}
      <select
        value={room.status || 'available'}
        onChange={(e) => {
          const updated = [...form.rooms];
          updated[index].status = e.target.value;
          setForm({ ...form, rooms: updated });
        }}
        className="w-1/3 px-3 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
      >
        <option value="available">Available</option>
        <option value="not_available">Not Available</option>
      </select>

      {/* Remove Room Button */}
      <button
        type="button"
        onClick={() => setForm({ ...form, rooms: form.rooms.filter((_, i) => i !== index) })}
        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        disabled={form.rooms.length === 1}
      >
        X
      </button>
    </div>
  ))}

  {/* Add New Room Button */}
  <button
    type="button"
    onClick={() => setForm({ ...form, rooms: [...form.rooms, { roomNumber: "", status: "available" }] })}
    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
  >
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
