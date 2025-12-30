import React, { useEffect, useState } from "react";
import { checkedInBookings,updateBooking,deleteBooking,updateBookingStatus } from "../../api/bookingApi";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import preloader from "../../assets/preloader.gif";
import { MdDelete, MdOutlineOpenInNew } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { useHotel } from "../../context/HotelContext";
import Swal from "sweetalert2";
import { FaSuitcase } from "react-icons/fa6";
import { TbCancel } from "react-icons/tb";

const AllCheckins = () => {
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
      const res = await checkedInBookings(token, search, page);
      setBookings(res.bookings);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Failed to fetch checked-in bookings", error);
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

   const handleBookingStatusChange = async(bookingId, action) =>{
          Swal.fire({
            title: `Are you sure you want to ${action === 'cancelled' ? 'cancel':'no-show'} this booking?`,
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes",
          }).then(async (result) => {
          if (result.isConfirmed) {
            try {
             await updateBookingStatus({token,payload:{bookingId: bookingId, newStatus: action}});
             await fetchBookings(pagination.page);
             Swal.fire({
              title: "Success",
              text: `The booking has been ${action === 'cancelled' ? 'cancelled':'no-showed'}.`,
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            } catch (error) {
              Swal.fire({
              title: "Error!",
              text: `Failed to ${action === 'cancelled' ? 'cancel':'no-show'} booking. Try again.`,
              icon: "error",
              timer: 2000,
              showConfirmButton: false,
            });
            }
          }
        })
    }

  const handleCheckOut = (bookingId) => {
    Swal.fire({
      title: 'Are you sure you want to check-out this guest?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, check-out!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try{
          const res =  await updateBookingStatus({
            token, 
            payload:{ bookingId: bookingId, newStatus: 'checked_out' }, 
          });
          fetchBookings(pagination.page);
        }catch(error){
          Swal.fire('Error', 'Failed to check-out guest.', 'error');
        }
        Swal.fire(
          'Checked Out!',
          'The guest has been checked out successfully.',
          'success'
        );
      }
    });
  }

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
          <h2 className="text-2xl font-bold text-gray-800">Checked-In Guests</h2>
          <Button onClick={() => navigate('/admin/direct-check-in')}>Add Direct Check-in</Button>
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
          <p className="text-gray-600">No checked-in bookings found.</p>
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
                  <th className="px-4 py-3 text-left font-semibold text-sm">Status</th>
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
                      {hotel?.currency === "USD" ? "$" : "Rs"} {b.totalPrice}
                    </td>

                    <td className="px-4 py-3">
                      <div className="p-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/edit-booking/${b._id}`)}
                          className="bg-blue-600 text-white px-2 py-2 rounded-md"
                          title="Edit Booking"
                        >
                          <FiEdit />
                        </button>

                        <button
                          onClick={() => navigate(`/admin/check-out-page/${b._id}`)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-2 rounded-md"
                          title="Check-out"
                        >
                          <FaSuitcase />
                        </button>

                        <button 
                          onClick={() => handleBookingStatusChange(b._id, "cancelled")} 
                          className="px-2 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          title='Cancel Booking'
                        >
                            <TbCancel />
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

export default AllCheckins;
