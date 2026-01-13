import React, { useEffect, useState } from "react";
import { getMyBookings } from "../../api/bookingApi";
import { useNavigate } from "react-router-dom";
import preloader from '../../assets/preloader.gif'
import { useHotel } from "../../context/HotelContext";
import { FaCircleCheck } from "react-icons/fa6";
import { getAllRooms } from "../../api/roomApi";
import { API_URL } from "../../config";
import { IoCloseCircle } from "react-icons/io5";

const MyBookingsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
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
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

    useEffect(() => {
      const fetchRooms = async () => {
        try {
          // const token = localStorage.getItem("authToken");
          const data = await getAllRooms();
          setRooms(data);
        } catch (error) {
          console.error("Failed to fetch rooms:", error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchRooms();
    }, []);

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

    console.log(booking)
    return (
      <div
        key={booking._id}
        className="bg-white shadow-md rounded-xl px-4 border border-gray-200 mb-4 sm:mb-6"
      >
        <div className="py-4 flex justify-between items-center">
          <div className="">
            <h1
              className={`text-xl rounded-full font-medium`}
            >
              Booking {booking.status}
            </h1>
            <h2 className="text-md text-gray-500">
              Booking id: <b>{booking.bookingId}</b>
            </h2>
          </div>
          {booking.status === "cancelled" ? (
            <IoCloseCircle size={35} className="text-red-500" />
          ):(
            <FaCircleCheck size={25} className={`${
                booking.status === "confirmed"
                  ? " text-green-800"
                  : booking.status === "pending"
                  && " text-yellow-500"
              }`} />
          )}            

        </div>

        <hr className="h-px bg-gray-200 border-0"></hr>

        <div className="grid grid-cols-2 text-gray-700 text-sm py-4">
          <p><strong>Check-in:</strong><br /> {new Date(booking.checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong><br /> {new Date(booking.checkOut).toLocaleDateString()}</p>          
        </div>

        <hr className="h-px bg-gray-200 border-0"></hr>

        <p className="text-gray-700 text-sm py-4"><strong>Nights:</strong> {nights}</p>

        <hr className="h-px bg-gray-200 border-0"></hr>

        <p className="text-gray-700 text-sm py-4"><strong>Total Price:</strong> ${booking.totalPrice}</p>
        
        <hr className="h-px bg-gray-200 border-0"></hr>
        

        <div className="py-4 text-gray-700">
          <strong>Rooms:</strong>
          <ul className=" mt-1">
            {booking.rooms.map((r) => (
              <li key={r._id} className="mt-4">
                <p>{r.roomId?.type} - Room ({r.roomNumber}), Adults: {r.adults}, Children: {r.children}</p>
                {!imgLoaded && (
                  <img
                    src={preloader}
                    className="h-32 w-full object-contain rounded-lg m-4 animate-pulse"
                    alt="loading"
                  />
                )}
                <img
                  src={`${API_URL}uploads/rooms/${rooms.find(room => room?._id === r.roomId?._id)?.images?.[0] || "default.png"}`}
                  alt=""
                  className={`rounded-xl h-32 md:h-44 lg:h-56 w-full object-cover mt-4 ${imgLoaded ? "block" : "hidden"}`}
                  onLoad={() => setImgLoaded(true)}
                />
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
            <div className="grid grid-cols-1  gap-3">
              {upcoming.map(renderBookingCard)}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Past Bookings</h2>
            <div className="grid grid-cols-1 gap-3">
              {past.map(renderBookingCard)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
