import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHotel } from '../../context/HotelContext';
import { getBookingById, updateBookingStatus } from '../../api/bookingApi';
import preloader from '../../assets/preloader.gif'
import Button from '../../components/Button';
import { FiEdit } from "react-icons/fi";
import { IoArrowBackSharp } from "react-icons/io5";
import { RiPrinterLine } from "react-icons/ri";
import Swal from 'sweetalert2';

const Checkout = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { hotel } = useHotel();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getBookingById( id, token );
        setBooking(res);
      } catch (error) {
        console.error("Failed to fetch booking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, token]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <img src={preloader} alt="Loading..." className="w-16" />
      </div>
    );
  }

  if (!booking) {
    return <p className="text-center text-red-500">Booking not found.</p>;
  }


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Check-out</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* col1 */}
          <div className='flex flex-col gap-4'>
            <div className="space-y-4">
              {booking.customerType === "Member" ? (
                  <div className="space-y-4 border p-2 rounded-md border-gray-300 text-sm">
                    <h3 className="font-semibold bg-gray-200 text-gray-700 py-1 px-2 rounded-md">Member Info</h3>
                    <p>Name: <b>{booking.user?.name}</b></p>
                    <p>Email: <b>{booking.user?.email}</b></p>
                    <p>Phone: <b>{booking.user?.phone}</b></p>
                  </div>
              ) : (
                  <div className="space-y-4 border p-2 rounded-md border-gray-300 text-sm">
                    <h3 className="font-semibold bg-gray-200 text-gray-700 py-1 px-2 rounded-md">Guest Info</h3>
                    <p>Name: <b>{booking.guestFirstName} {booking.guestLastName}</b></p>
                    <p>Email: <b>{booking.guestEmail ? (booking.guestEmail):('N/A')}</b></p>
                    <p>Phone: <b>{booking.guestPhone ? (booking.guestPhone):('N/A')}</b></p>
                    <p>Address: <b>{booking.guestAddress}, {booking.guestCity}, {booking.guestCountry} {booking.guestZipCode}</b></p>
                  </div>
              )}
            </div>
            <div className="space-y-4 border p-2 rounded-md border-gray-300 text-sm">
              <h3 className="font-semibold bg-gray-200 text-gray-700 py-1 px-2 rounded-md">Booking Info</h3>
                <p>Booking ID: <b>{booking.bookingId}</b></p>
                <p>Status: <b>{booking.status}</b></p>
                <p>Check-In: <b>{new Date(booking.checkIn).toLocaleDateString()}</b></p>
                <p>Check-Out: <b>{new Date(booking.checkOut).toLocaleDateString()}</b></p>
                <p>Booking Source: <b>{booking.bookingSource}</b></p>                
            </div>
          </div>
          {/* col2 */}
          <div className='flex flex-col justify-between'>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-sm">Room Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Room Number</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Adults</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Children</th>
                </tr>
              </thead>
              <tbody>
                {booking.rooms.map((r, i) => (                      
                    <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                      <td className="px-4 py-3 text-gray-600 text-sm">{r.roomId?.type}</td> 
                      <td className="px-4 py-3 text-gray-600 text-sm">{r.roomNumber} </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{r.adults} </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{r.children}</td>
                    </tr>
                ))}
              </tbody>
            </table>
            <div className='flex flex-col justify-end'>
              <p className='my-4 text-right px-4'>Total Price: <b>{hotel?.currency === "USD" ? "$" : "Rs"} {booking.totalPrice}</b></p>
              <Button 
                disabled={booking.status === "checked_out"} 
                onClick={() =>handleCheckOut(id)} 
                className=" text-white">Confirm Checkout</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout