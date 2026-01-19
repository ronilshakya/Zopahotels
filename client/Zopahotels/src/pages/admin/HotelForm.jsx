import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHotel, getHotel, updateHotel } from "../../api/hotelApi";
import Swal from "sweetalert2";
import { useHotel } from "../../context/HotelContext";
import { API_URL } from "../../config";
import ToggleSwitch from "../../components/ToggleSwitch";

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
    amenities: [""],
    arrivalTime: "",
    departureTime:"",
  });
  const [preview, setPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit") {
      const fetchHotel = async () => {
        try {
          const hotel = await getHotel();

          // Parse amenities safely
          let amenitiesArray = [""];
          if (hotel.amenities) {
            if (Array.isArray(hotel.amenities)) {
              amenitiesArray = hotel.amenities;
            } else {
              try {
                const parsed = JSON.parse(hotel.amenities);
                amenitiesArray = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                amenitiesArray = [hotel.amenities];
              }
            }
          }

          setHotelData({
            name: hotel.name || "",
            description: hotel.description || "",
            address: hotel.address || "",
            phone: hotel.phone || "",
            email: hotel.email || "",
            currency: hotel.currency || "USD",
            logo: null,
            amenities: amenitiesArray.length ? amenitiesArray : [""],
            arrivalTime: hotel.arrivalTime || "",
            departureTime: hotel.departureTime || "",
            enableVat: hotel.enableVat || false,
          });

          setExistingLogo(hotel.logo ? `${API_URL}uploads/${hotel.logo}` : null);
          setPreview(null);
        } catch (err) {
          Swal.fire("Error", `Failed to fetch hotel details: ${err}`, "error");
        }
      };
      fetchHotel();
    }
  }, [mode]);

  // Handle normal field change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        setHotelData((prev) => ({ ...prev, logo: file }));
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    } else {
      setHotelData((prev) => ({ ...prev, [name]: value }));
    }
  };


  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(hotelData).forEach((key) => {
        if (key === "amenities") {
          formData.append(
            key,
            JSON.stringify(hotelData[key].filter((a) => {
              if (typeof a === "string") return a.trim() !== "";
              if (typeof a === "object" && a.name) return a.name.trim() !== "";
              return false;
            })
            )
          );
        } else if (hotelData[key] !== null) {
          formData.append(key, hotelData[key]);
        }
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

  console.log(hotelData)
  return (
    <>
      <form onSubmit={handleSubmit}>
      <div className='bg-white flex justify-between items-center px-6 py-4 border-b border-gray-300'>
        <div>
          <h1 className='px-2 py-1 text-2xl font-bold'>Hotel Settings</h1>
          <p className='px-2 py-1 text-sm text-gray-500'>Manage hotel</p>
        </div>
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update Hotel" : "Add Hotel"}
        </button>
      </div>
    <div className="min-h-screen bg-gray-100 p-6">
    <div className=" ">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8 p-6 flex flex-col gap-4 bg-white rounded-2xl shadow-lg">
            
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Hotel Name</label>
              <input
                type="text"
                name="name"
                value={hotelData.name}
                onChange={handleChange}
                placeholder="Enter hotel name"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white resize-none"
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={hotelData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
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
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                />
              </div>
            </div>
            {/* Booking times */}
            <div className="grid grid-cols-2">
              <div>
                <label className="block mb-2 font-medium">Arrival Time</label>
                <input 
                  type="time" 
                  placeholder="Arrival Time" 
                  className="border border-gray-300 p-2 rounded-lg" 
                  value={hotelData.arrivalTime}
                  onChange={handleChange}
                  name="arrivalTime"
                  />
              </div>
            
              <div>
                <label className="block mb-2 font-medium">Departure Time</label>
                <input 
                  type="time" 
                  placeholder="Departure Time" 
                  className="border border-gray-300 p-2 rounded-lg" 
                  name="departureTime"
                  value={hotelData.departureTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 p-6 flex flex-col gap-4 bg-white rounded-2xl shadow-lg">
            {/* Logo */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Hotel Logo</label>
              <div className="flex flex-col gap-4">
                {!preview && existingLogo && (
                  <img
                    src={existingLogo}
                    alt="Current Logo"
                    className="w-full h-full object-cover border rounded-lg shadow"
                  />
                )}
                {preview && (
                  <img
                    src={preview}
                    alt="Logo Preview"
                    className="w-32 h-32 object-cover border rounded-lg shadow"
                  />
                )}
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  className="bg-white px-4 py-2 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block mb-2 font-medium">Currency</label>
              <select
                name="currency"
                value={hotelData.currency}
                onChange={handleChange}
                className="swal2-input border border-gray-300 rounded-lg p-2"
                required
              >
                <option value="USD">USD – US Dollar ($)</option>
                <option value="NPR">NPR – Nepalese Rupee (₨)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Enable VAT</label>
              <ToggleSwitch enabled={hotelData.enableVat} onChange={(value) => setHotelData({...hotelData, enableVat: value})} />
            </div>
          </div>
        </div>

        
    </div>
  </div>
      </form>
  </>
  );
};

export default HotelForm;
