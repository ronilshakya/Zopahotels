import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingById } from "../../api/bookingApi";
import preloader from "../../assets/preloader.gif";
import Button from "../../components/Button";
import { useHotel } from "../../context/HotelContext";
import { FiEdit } from "react-icons/fi";
import { IoArrowBackSharp } from "react-icons/io5";
import { RiPrinterLine } from "react-icons/ri";

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { hotel } = useHotel();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-100 p-6 printable">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
            <div className="no-print flex gap-1">
                <Button onClick={() => navigate(`/admin/edit-booking/${booking._id}`)}><FiEdit/></Button>
                <Button onClick={() => navigate("/admin/all-bookings")} className=""><IoArrowBackSharp /></Button>
                <Button onClick={() => window.print()} className=" text-white"><RiPrinterLine /></Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
                <p><strong>Booking ID:</strong> {booking.bookingId}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Check-In:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-Out:</strong> {new Date(booking.checkOut).toLocaleDateString()}</p>
                <p><strong>Booking Source:</strong> {booking.bookingSource}</p>
                <div>
                    <h3 className="font-bold">Rooms</h3>
                    <ul className="list-disc ml-6">
                    {booking.rooms.map((r, i) => (
                        <li key={i}>{r.roomId?.type} {'(' + r.roomNumber + ')'}, Adults: {r.adults}, Children: {r.children}</li>
                    ))}
                    </ul>
                </div>
                <p><strong>Total Price:</strong> {hotel?.currency === "USD" ? "$" : "Rs"} {booking.totalPrice}</p>
            </div>
            <div className="space-y-4">

            {booking.customerType === "Member" ? (
                <div className="space-y-4">
                <h3 className="font-semibold">Member Info</h3>
                <p>Name: {booking.user?.name}</p>
                <p>Email: {booking.user?.email}</p>
                <p>Phone: {booking.user?.phone}</p>
                </div>
            ) : (
                <div className="space-y-4">
                <h3 className="font-semibold">Guest Info</h3>
                <p><b>Name:</b> {booking.guestFirstName} {booking.guestLastName}</p>
                <p><b>Email:</b> {booking.guestEmail ? (booking.guestEmail):('N/A')}</p>
                <p><b>Phone:</b> {booking.guestPhone ? (booking.guestPhone):('N/A')}</p>
                <p><b>Address:</b> {booking.guestAddress}, {booking.guestCity}, {booking.guestCountry} {booking.guestZipCode}</p>
                </div>
            )}

            </div>
        </div>


        
      </div>
    </div>
  );
};

export default BookingDetails;
