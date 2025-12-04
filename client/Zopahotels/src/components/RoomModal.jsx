import React, { useEffect, useState } from "react";
import { API_URL } from "../config";
import { getRoomById } from "../api/roomApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import preloader from '../assets/preloader.gif';
import { IoClose } from "react-icons/io5";
import { useHotel } from "../context/HotelContext";

const RoomModal = ({ room, onClose }) => {
  const [roomDetails, setRoomDetails] = useState(null);
  const {hotel} = useHotel();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const data = await getRoomById(room.roomId);
        setRoomDetails(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRoomDetails();
  }, [room.roomId]);

  if (!room) return null;

  if (!roomDetails) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    </div>
  );
}


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full relative shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* <div className="flex justify-end mb-2"> */}

        <button
          onClick={onClose}
          className=" absolute z-50 right-2 top-2 text-white font-bold rounded text-2xl cursor-pointer bg-red-500  hover:bg-red-700"
          > 
        <IoClose />

        </button>
          {/* </div> */}

        {/* Room Images */}
        <div className="w-full h-[250px] md:h-full">
          {roomDetails?.images?.length > 0 ? (
            <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="h-full"
            >
                {roomDetails.images.map((img, idx) => (
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
        <div className="px-6 py-4 overflow-y-scroll max-h-[300px]">
          <h1 className="text-xl mb-2 font-semibold text-gray-800">{room.type}</h1>
          <p className="text-gray-700 mb-2 text-sm">
            Max Adults: {room.maxAdults}, Max Children: {room.maxChildren}
          </p>
          <p className="text-gray-700 mb-2 font-semibold">
            {roomDetails.pricing.map((p)=> (
                  <p>{p.adults} Adults - {hotel ? hotel.currency === "USD" ? ("$"):("Rs") : ("$")}{p.price}/ night</p>
                  
                ))}
          </p>
          <p className=" text-sm text-gray-700">{roomDetails?.description || room.description}</p>

          {/* Amenities */}
          <div className="mt-2">
            <h2 className="font-semibold mb-1">Amenities:</h2>
            <div className="mt-2 flex flex-wrap gap-3">
          {roomDetails.amenities && roomDetails.amenities.length > 0 ? (
            roomDetails.amenities.map((amenity) => (
              <div
                key={amenity._id}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full shadow-sm"
              >
                <img
                  src={`${API_URL}uploads/amenities/${amenity.icon}`}
                  alt={amenity.name}
                  className="w-5 h-5 object-cover rounded"
                />
                <span className="text-gray-700 text-sm">{amenity.name}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No amenities listed.</p>
          )}
        </div>

        </div>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
