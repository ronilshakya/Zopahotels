import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getRoomById } from "../../api/roomApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Swal from "sweetalert2";
import preloader from '../../assets/preloader.gif';
import { useHotel } from '../../context/HotelContext';
import { API_URL } from "../../config";

const SingleRoomPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const {hotel} = useHotel();


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



  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="max-w-6xl w-full bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1">
        
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
                    src={`${API_URL}uploads/rooms/${img}`}
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
          <p className="text-gray-700">{room.description}</p>

          {/* Room Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 text-sm">Price per Night</p>
              <p className="">
                {room.pricing.map((p)=> (
                  <p>{p.adults} Adults - {hotel ? hotel.currency === "USD" ? ("$"):("Rs") : ("$")}{p.price}/ night</p>
                ))}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 text-sm">Amenities</p>
              <div className="mt-4">
                {room.amenities && room.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {room.amenities.map((amenity) => (
                      <div
                        key={amenity._id}
                        className="flex items-center gap-2 p-2"
                      >
                        <img
                          src={`${API_URL}uploads/amenities/${amenity.icon}`}
                          alt={amenity.name}
                          className="w-6 h-6 object-cover rounded"
                        />
                        <span className="text-gray-700 font-medium">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No amenities listed.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleRoomPage;