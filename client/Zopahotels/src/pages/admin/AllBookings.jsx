import React, { useEffect, useState } from 'react';
import { deleteBooking, getAllBookings } from '../../api/bookingApi';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Swal from 'sweetalert2';
import preloader from '../../assets/preloader.gif'

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const handleEditBooking = (id) => {
    navigate(`/admin/edit-booking/${id}`); 
  }
  
  // const handleAddBooking = () => {
  //   navigate(`/admin/add-booking`); 
  // }

  const handleDeleteBooking = async (id) => {
  // Confirmation first
  Swal.fire({
    title: "Are you sure you want to delete this booking?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteBooking({token,id});
        setBookings(bookings.filter(b => b._id !== id)); 

        Swal.fire({
          title: "Deleted!",
          text: "The booking has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Failed to delete booking:", error);

        // ✅ Auto-closing error alert
        Swal.fire({
          title: "Error!",
          text: "Failed to delete booking. Try again.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  });
};

  useEffect(() => {
  const fetchAllBookings = async () => {
    try {
      const data = await getAllBookings(token);

      // Sort by createdAt (newest first)
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setBookings(sorted);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAllBookings();
}, [token]);


  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
    </div>
  );

  if (bookings.length === 0) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-lg text-gray-600">No bookings found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Bookings</h2>
          {/* <Button onClick={handleAddBooking}>Add Booking</Button> */}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-3 text-left font-semibold text-sm">User</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Room(s)</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Check-In</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Check-Out</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Adults</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Children</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Total Price</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {booking.user?.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {booking.rooms.map((r) => `${r.roomId?.type} - ${r.roomNumber}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{booking.adults}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{booking.children}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">${booking.totalPrice}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{booking.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBooking(booking._id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllBookings;
