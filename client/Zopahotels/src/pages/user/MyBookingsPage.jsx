import React, { useEffect, useState } from "react";
import { getMyBookings } from "../../api/bookingApi";
import { useNavigate } from "react-router-dom";
import preloader from '../../assets/preloader.gif'

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const data = await getMyBookings(token);
        setBookings(data);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch your bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">You have no bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100"> 

    <div className="max-w-7xl mx-auto min-h-screen  p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        My Bookings
      </h1>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Booking #{booking._id.slice(-6)}
              </h2>
              <span
                className={`px-3 py-1 text-sm rounded-full font-medium ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {booking.status}
              </span>
            </div>

            <p className="text-gray-600 mb-1">
              <strong>Check-in:</strong>{" "}
              {new Date(booking.checkIn).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-1">
              <strong>Check-out:</strong>{" "}
              {new Date(booking.checkOut).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-3">
              <strong>Total Price:</strong> ${booking.totalPrice}
            </p>

            <div className="text-gray-700">
              <strong>Rooms:</strong>
              <ul className="list-disc list-inside mt-1">
                {booking.rooms.map((r) => (
                  <li key={r.roomNumber}>
                    {r.roomId.type || r.roomId} - Room {r.roomNumber}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default MyBookingsPage;
