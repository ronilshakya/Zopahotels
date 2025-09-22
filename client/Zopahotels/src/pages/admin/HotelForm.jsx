import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHotel, getHotel, updateHotel } from "../../api/hotelApi";
import Swal from "sweetalert2";
import { useHotel } from "../../context/HotelContext";

const HotelForm = ({ mode }) => {
  const { setHotel } = useHotel();
  const navigate = useNavigate();
  const [hotelData, setHotelData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    logo: null, // file object
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit") {
      // fetch the hotel details
      const fetchHotel = async () => {
        try {
          const hotel = await getHotel();
          setHotelData({
            name: hotel.name || "",
            description: hotel.description || "",
            address: hotel.address || "",
            phone: hotel.phone || "",
            email: hotel.email || "",
            logo: null, // new file will replace existing
          });
          setPreview(hotel.logo ? `/uploads/${hotel.logo}` : null);
        } catch (err) {
          Swal.fire("Error", "Failed to fetch hotel details", "error");
        }
      };
      fetchHotel();
    }
  }, [mode]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      const file = files[0];
      setHotelData((prev) => ({ ...prev, logo: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setHotelData((prev) => ({ ...prev, [name]: value }));
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

      const token = localStorage.getItem("adminToken"); // admin auth token
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6">
        {mode === "edit" ? "Edit Hotel" : "Add Hotel"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Hotel Name"
          value={hotelData.name}
          onChange={handleChange}
          required
          className="swal2-input"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={hotelData.description}
          onChange={handleChange}
          className="swal2-input"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={hotelData.address}
          onChange={handleChange}
          className="swal2-input"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={hotelData.phone}
          onChange={handleChange}
          className="swal2-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={hotelData.email}
          onChange={handleChange}
          className="swal2-input"
        />
        <div>
          <label className="block mb-2">Logo</label>
          <input type="file" name="logo" accept="image/*" onChange={handleChange} />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover border rounded"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update Hotel" : "Add Hotel"}
        </button>
      </form>
    </div>
  );
};

export default HotelForm;
