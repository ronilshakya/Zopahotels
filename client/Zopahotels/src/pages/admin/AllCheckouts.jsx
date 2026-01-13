import React, { useEffect, useState } from "react";
import { checkedOutBookings,deleteBooking,updateBooking } from "../../api/bookingApi";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import preloader from "../../assets/preloader.gif";
import { MdDelete, MdOutlineOpenInNew } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { useHotel } from "../../context/HotelContext";
import Swal from "sweetalert2";
import { FaSuitcase } from "react-icons/fa6";

const AllCheckouts = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const user = JSON.parse(localStorage.getItem("adminUser"));

  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();
  const { hotel } = useHotel();

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const res = await checkedOutBookings(token, search, page);
      setBookings(res.bookings);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Failed to fetch checked-out bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
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
              await deleteBooking({ token, id });
              setBookings(bookings.filter(b => b._id !== id));
              Swal.fire({
                title: "Deleted!",
                text: "The booking has been deleted.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
            } catch (error) {
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
    fetchBookings();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src={preloader} className="w-16" alt="loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-baseline mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Checked-Out Guests</h2>
        </div>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by guest name, phone, booking ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />

          <Button onClick={() => fetchBookings(1)}>
            Search
          </Button>
        </div>


        {bookings.length === 0 ? (
          <p className="text-gray-600">No checked-out bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-sm">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Room</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Room No</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Check-in</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Check-out</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {b.customerType === "Member" ? (
                        <>
                          <p>{b.user?.name}</p>
                        </>
                      ) : (
                        <>
                          <p>{b.guestFirstName} {b.guestLastName}</p>
                        </>
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {b.rooms.map((r, i) => (
                        <li key={i} className="className='w-[200px]'">{r.roomId?.type}</li>
                      ))}
                    </td>

                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {b.rooms.map((r, i) => (
                        <li key={i}>{r.roomNumber}</li>
                      ))}
                    </td>

                    <td className="px-4 py-3 text-gray-600 text-sm">{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{new Date(b.checkOut).toLocaleDateString()}</td>

                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {hotel.currency === "NPR" ? (
                        "Rs " + b.totalPrice
                      ):(
                        "$" +b.totalPriceUSD?.toFixed(2)
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="p-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/check-out-page/${b._id}`)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded-md"
                          title="View Check-out"
                        >
                          <MdOutlineOpenInNew />
                        </button>


                        {user.role === 'admin' && (
                            <button 
                              onClick={() => handleDeleteBooking(b._id)} 
                              className="px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                              title='Delete Booking'>
                                <MdDelete />
                            </button>
                          )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchBookings(i + 1)}
                  className={`px-3 py-1 rounded ${
                    pagination.page === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCheckouts;
