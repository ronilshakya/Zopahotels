import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHotel, updateHotel } from "../../api/hotelApi";
import Swal from "sweetalert2";
import Button from "../../components/Button";

const BookingSource = () => {
  const [hotel, setHotel] = useState(null);
  const [bookingSources, setBookingSources] = useState([""]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchHotel = async () => {
    try {
      const data = await getHotel();
      setHotel(data);

      // Parse bookingSource
      let sourceArray = [""];

      if (data.bookingSource) {
        if (Array.isArray(data.bookingSource)) {
          sourceArray = data.bookingSource;
        } else {
          try {
            const parsed = JSON.parse(data.bookingSource);
            sourceArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            sourceArray = [data.bookingSource];
          }
        }
      }

      setBookingSources(sourceArray.length ? sourceArray : [""]);
    } catch (err) {
      Swal.fire("Error", `Failed to fetch hotel details: ${err}`, "error");
    }
  };

  useEffect(() => {
    fetchHotel();
  }, []);

  const handleSourceChange = (index, value) => {
    const updated = [...bookingSources];
    updated[index] = value;
    setBookingSources(updated);
  };

  const addSource = () => setBookingSources([...bookingSources, ""]);

  const removeSource = (index) => {
    const updated = bookingSources.filter((_, i) => i !== index);
    setBookingSources(updated.length ? updated : [""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append(
        "bookingSource",
        JSON.stringify(bookingSources.filter((s) => s.trim() !== ""))
      );

      const token = localStorage.getItem("adminToken");
      const res = await updateHotel(formData, token);

      Swal.fire("Success", "Booking sources updated", "success");
      navigate("/admin/booking-sources");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Booking Sources</h1>

        {!hotel ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8">
            <p className="text-gray-600 mb-4">No hotel details available.</p>
            <Button onClick={() => navigate("/admin/hotel-form/add")}>Add Hotel</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            {bookingSources.map((source, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={source}
                  onChange={(e) => handleSourceChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter booking source (e.g., Booking.com)"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeSource(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={bookingSources.length === 1}
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSource}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Add Booking Source
            </button>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {loading ? "Saving..." : "Update Booking Sources"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingSource;
