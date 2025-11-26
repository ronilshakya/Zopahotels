import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHotel, updateHotel } from "../../api/hotelApi";
import Swal from "sweetalert2";
import Button from "../../components/Button";

const Amenities = () => {
  const [hotel, setHotel] = useState(null);
  const [amenities, setAmenities] = useState([""]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchHotel = async () => {
    try {
      const data = await getHotel();
      setHotel(data);

      // Parse amenities
      let amenitiesArray = [""];

      if (data.amenities) {
        if (Array.isArray(data.amenities)) {
          amenitiesArray = data.amenities;
        } else {
          try {
            const parsed = JSON.parse(data.amenities);
            amenitiesArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            amenitiesArray = [data.amenities];
          }
        }
      }

      setAmenities(amenitiesArray.length ? amenitiesArray : [""]);
    } catch (err) {
      Swal.fire("Error", `Failed to fetch hotel details: ${err}`, "error");
    }
  };

  useEffect(() => {
    fetchHotel();
  }, []);

  const handleAmenityChange = (index, value) => {
    const updated = [...amenities];
    updated[index] = value;
    setAmenities(updated);
  };

  const addAmenity = () => setAmenities([...amenities, ""]);

  const removeAmenity = (index) => {
    const updated = amenities.filter((_, i) => i !== index);
    setAmenities(updated.length ? updated : [""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("amenities", JSON.stringify(amenities.filter((a) => a.trim() !== "")));

      const token = localStorage.getItem("adminToken");
      const res = await updateHotel(formData, token);

      Swal.fire("Success", "Amenity added", "success");
      navigate("/admin/amenities");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Amenities</h1>

        {!hotel ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8">
            <p className="text-gray-600 mb-4">No hotel details available.</p>
            <Button onClick={() => navigate("/admin/hotel-form/add")}>Add Hotel</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={amenity}
                  onChange={(e) => handleAmenityChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter amenity"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={amenities.length === 1}
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAmenity}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Add Amenity
            </button>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {loading ? "Saving..." : "Update Amenities"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Amenities;
