import React, { useEffect, useState } from 'react';
import { deleteBooking, searchBookings, updateBookingStatus } from '../../api/bookingApi';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Swal from 'sweetalert2';
import preloader from '../../assets/preloader.gif';
import { useHotel } from '../../context/HotelContext';
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { MdOutlineOpenInNew } from "react-icons/md";
import { TbCancel } from "react-icons/tb";
import { FaUserAltSlash } from "react-icons/fa";


const AllReservations = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, limit: 10 });
  const [searchText, setSearchText] = useState('');

  
  const { hotel } = useHotel();
  const user = JSON.parse(localStorage.getItem("adminUser"));
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const fetchBookings = async (page = 1, search = searchText, start = startDate, end = endDate, limit = pagination.limit) => {
  setLoading(true);
  try {
    const res = await searchBookings(token, search, start, end, page, pagination.limit);
    setBookings(res.bookings);
    setPagination(res.pagination);
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearch = () => fetchBookings(1);

  const handleReset = () => {
    setSearchText('');
    setStartDate('');
    setEndDate('');
    fetchBookings(1, '', '', '', pagination.limit);
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

  const handlePageChange = (newPage) => {
    fetchBookings(newPage);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <img src={preloader} className="w-16" alt="preloader" />
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-baseline mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Reservations</h2>
          <Button onClick={() => navigate("/admin/add-booking")}>Add Reservation</Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
  <input
    type="text"
    placeholder="Search by user name, email, or booking ID"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    className="border rounded px-4 py-2 flex-1"
  />
  
  {/* Start date */}
  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="border rounded px-4 py-2"
  />

  {/* End date */}
  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    className="border rounded px-4 py-2"
  />

  <Button onClick={() => fetchBookings(1)}>Search</Button>
  <Button onClick={handleReset} className="bg-gray-500 hover:bg-gray-600">Reset</Button>
</div>


        {bookings.length === 0 ? (
          <p className="text-lg text-gray-600">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-sm">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Room(s)</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Room No.</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Check-In</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Check-Out</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Total Price</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {booking.customerType == "Member" ? 
                        (
                          <div className='w-[150px]'>
                            <p>{booking.user?.name}</p>
                            <p className='text-xs my-1 text-gray-500'>{booking.user?.phone}</p>
                            <span className='bg-gray-500 text-xs text-white p-1 my-1 inline-block font-semibold'>Member</span>
                          </div>
                        ):(
                          <div className='w-[150px]'>
                            <p>{booking.guestFirstName} {booking.guestLastName}</p>
                            <p className='text-xs my-1 text-gray-500'>{booking.guestPhone}</p>
                            <span className='bg-gray-500 text-xs text-white p-1 my-1 inline-block font-semibold'>Guest</span>
                          </div>
                          
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm ">
                      <ul className='list-disc'>
                        {booking.rooms.map((r, i) => (
                          <li key={i} className='w-[200px]'>{r.roomId?.type}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm ">
                      <ul className='list-disc'>
                        {booking.rooms.map((r, i) => (
                          <li key={i} className=''>{r.roomNumber === 'Yet to be assigned' ? 'N/A' : r.roomNumber}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{hotel?.currency === "USD" ? "$" : "Rs"} {booking.totalPrice}</td>

                    <td className="px-4 py-3 text-white text-sm">
                      <p className={`p-1 rounded-md
                        ${booking.status === 'pending' && 'bg-amber-400'} 
                        ${(booking.status === 'checked_out' || booking.status === 'checked_in') && 'bg-green-500'} 
                        ${booking.status === 'cancelled' && 'bg-red-500'} 
                        ${booking.status === 'no_show' && 'bg-gray-500'} 
                        `
                      }>
                        {booking.status === 'pending' && 'Pending'} 
                        {booking.status === 'checked_out' && 'Checked Out'} 
                        {booking.status === 'checked_in' && 'Checked In'}
                        {booking.status === 'cancelled' && 'Cancelled'} 
                        {booking.status === 'no_show' && 'No Show'} 
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="p-3 flex gap-2">
                        <button 
                          onClick={() => navigate(`/admin/booking-details/${booking._id}`)} 
                          className="px-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          title='View Details'
                        >
                          <MdOutlineOpenInNew />
                        </button>

                        <button 
                          onClick={() => navigate(`/admin/edit-booking/${booking._id}`)} 
                          className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          title='Edit Booking'
                        >
                            <FiEdit />
                        </button>

                        <button 
                          onClick={() => handleBookingStatusChange(booking._id, "no_show")} 
                          className="px-2 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                          title='No Show'
                        >
                            <FaUserAltSlash />
                        </button>

                        <button 
                          onClick={() => handleBookingStatusChange(booking._id, "cancelled")} 
                          className="px-2 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          title='Cancel Booking'
                        >
                            <TbCancel />
                        </button>

                        {user.role === 'admin' && (
                          <button 
                            onClick={() => handleDeleteBooking(booking._id)} 
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
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1 rounded ${p === pagination.page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReservations;
