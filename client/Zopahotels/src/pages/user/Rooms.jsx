import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRooms } from "../../api/roomApi";
import preloader from '../../assets/preloader.gif'
import {API_URL} from '../../config'
import { useHotel } from "../../context/HotelContext";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {hotel} = useHotel();
  const [imgLoaded, setImgLoaded] = useState(false);

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
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">No rooms available.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100">

    <div className="min-h-screen bg-gray-100 p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Our Rooms
      </h1>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {!imgLoaded && (
              <img
                src={preloader}
                className="w-full h-48 object-contain rounded-lg m-4 animate-pulse"
                alt="loading"
              />
            )}
            <img
              onClick={() => navigate(`/room/${room._id}`)}
              src={
                room.images && room.images.length > 0
                  ? `${API_URL}uploads/rooms/${room.images[0]}`
                  : "https://via.placeholder.com/400x250"
              }
              alt={room.type}
              className={`w-full h-48 object-cover ${imgLoaded ? "block" : "hidden"}`}
              onLoad={() => setImgLoaded(true)}
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">{room.type}</h2>
              <p className="text-gray-700 font-medium mb-4">
                {hotel ? hotel.currency === "USD" ? ("$"):("Rs") : ("$")} {room.price ?? room.pricePerNight} / night
                </p>
              <button
                onClick={() => navigate(`/room/${room._id}`)}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Rooms;
