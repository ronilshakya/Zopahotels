import React, { useEffect, useState } from "react";
import { getMyBookings } from "../../api/bookingApi";
import { useNavigate } from "react-router-dom";
import preloader from '../../assets/preloader.gif'
import { useHotel } from "../../context/HotelContext";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const {hotel} = useHotel();
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
        const sorted = data.sort(
          (a, b) => new Date(a.checkIn) - new Date(b.checkIn)
        );
        setBookings(sorted);
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
        <img src={preloader} className="w-16" alt="preloader" />
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

  const today = new Date();
  const upcoming = bookings.filter(b => new Date(b.checkOut) >= today);
  const past = bookings.filter(b => new Date(b.checkOut) < today);

  const renderBookingCard = (booking) => {
    const nights = Math.ceil(
      (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)
    );

    return (
      <div
        key={booking._id}
        className="bg-white shadow-md rounded-lg p-4 border border-gray-200 mb-4 sm:mb-6"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Booking #{booking._id.slice(-6)}
          </h2>
          <span
            className={`px-2 py-1 text-sm rounded-full font-medium ${
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 text-sm">
          <p><strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}</p>
          <p><strong>Nights:</strong> {nights}</p>
          <p><strong>Adults:</strong> {booking.adults}</p>
          <p><strong>Children:</strong> {booking.children}</p>
          <p><strong>Total Price:</strong> {hotel ? hotel.currency === "USD" ? ("$"):("Rs") : ("$")} {booking.totalPrice}</p>
        </div>

        <div className="mt-2 text-gray-700">
          <strong>Rooms:</strong>
          <ul className="list-disc list-inside mt-1">
            {booking.rooms.map((r) => (
              <li key={r._id}>
                {r.roomId.type} - Room {r.roomNumber}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          My Bookings
        </h1> */}

        {upcoming.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Bookings</h2>
            <div>
              {upcoming.map(renderBookingCard)}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Past Bookings</h2>
            <div>
              {past.map(renderBookingCard)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
