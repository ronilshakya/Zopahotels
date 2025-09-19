import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getRoomById } from "../../api/roomApi";
import { createBooking } from "../../api/bookingApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Swal from "sweetalert2";
import preloader from '../../assets/preloader.gif'

const API_URL = "http://api1.hotelnutopia.com";

const SingleRoomPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);

  const checkIn = state?.checkIn;
  const checkOut = state?.checkOut;
  const adults = state?.adults;
  const children = state?.children;
  const roomNumber = state?.roomNumber;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await getRoomById(id);
        setRoom(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRoom();
  }, [id]);

  const handleBookNow = async () => {
    if (!checkIn || !checkOut) {
      Swal.fire({
        title: "Booking dates missing. Please select dates first.",
        icon: "error"
      }).then(()=>navigate("/"));
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      Swal.fire({
        title: "Please login to book a room",
        icon: "error"
      }).then(()=>
        navigate("/login")
      );
      return;
    }

    const payload = {
      rooms: [{ roomId: room._id, roomNumber: roomNumber }],
      checkIn,
      checkOut,
      adults,
      children,
    };

    try {
      await createBooking({ payload, token });
      Swal.fire({
        title: "Booking confirmed!",
        icon: "success"
      }).then(()=>navigate("/my-bookings"));

    } catch (error) {
      Swal.fire({
        title: `Booking failed. ${error}`,
        icon: "error"
      });
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="max-w-6xl w-full bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Column - Image Slider */}
        <div className="w-full h-[400px] md:h-full">
          {room.images && room.images.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="h-full"
            >
              {room.images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={`${API_URL}/uploads/${img}`}
                    alt={`Room ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              No Image Available
            </div>
          )}
        </div>

        {/* Right Column - Room Details */}
        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{room.type}</h1>
          <p className="text-gray-600 text-sm">Room Number: {roomNumber}</p>
          <p className="text-gray-700">{room.description}</p>

          {/* Room Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 text-sm">Price per Night</p>
              <p className="text-xl font-semibold text-blue-600">
                ${room.price}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 text-sm">Guests</p>
              <p className="text-xl font-semibold text-green-600">
                {adults} Adults | {children} Children
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 text-sm">Check-In</p>
              <p className="text-xl font-semibold text-yellow-600">{checkIn}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 text-sm">Check-Out</p>
              <p className="text-xl font-semibold text-red-600">{checkOut}</p>
            </div>
          </div>

          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition duration-200"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleRoomPage;
