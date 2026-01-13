import React, { useState } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createBooking } from "../../api/bookingApi";

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!state || !state.selectedRooms?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No rooms selected. Please go back and choose rooms.</p>
      </div>
    );
  }

  const { selectedRooms, checkIn, checkOut } = state;
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  // Total price for all rooms
  const totalPrice = selectedRooms.reduce(
    (sum, room) => sum + room.pricePerNight * nights,
    0
  ).toFixed(2);


  const handleConfirmBooking = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      Swal.fire({
        title: "Please login to book a room",
        icon: "error",
      }).then(() => navigate("/login"));
      return;
    }

    // Build payload with per-room occupancy
    const payload = {
    customerType: "Member",
    checkIn: new Date(checkIn).toISOString(),
checkOut: new Date(checkOut).toISOString(),
    rooms: selectedRooms.map(room => ({
      roomId: room.roomId,
      adults: room.adults,
      children: room.children
    }))
  };



    try {
      setLoading(true);
      await createBooking({ payload, token });
      Swal.fire({
        title: "Booking confirmed!",
        icon: "success"
      }).then(() => navigate("/my-bookings"));
    } catch (error) {
      console.error(error);
     Swal.fire({
  title: `Booking failed. ${error.response?.data?.message || error.message || "Please try again."}`,
  icon: "error"
});

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Checkout</h2>

        <div className="space-y-4">
          <p><strong>Check-in:</strong> {checkIn}</p>
          <p><strong>Check-out:</strong> {checkOut}</p>
        </div>

        <div className="space-y-4">
          {selectedRooms.map((room, idx) => (
  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
    <div>
      <p className="font-semibold">{room.type}</p>
      <p>{room.adults} Adult(s) | {room.children} Child(ren)</p>
      <p>${room.pricePerNight} × {nights} night(s)</p>
    </div>
    <p className="font-bold text-blue-600">
      ${room.pricePerNight * nights}
    </p>
  </div>
))}


        </div>

        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
          <p className="font-semibold text-lg">Total Price</p>
          <p className="font-bold text-xl text-blue-600">${totalPrice}</p>
        </div>

        <button
          onClick={handleConfirmBooking}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition duration-200"
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
