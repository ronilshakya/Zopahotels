import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchAvailableRooms } from "../../api/bookingApi"; // if you want to fetch room details
import { getRoomById } from "../../api/roomApi"; // if you want to fetch room details
import preloader from '../../assets/preloader.gif'
import { API_URL } from "../../config";

const AvailableRoomsPage = () => {
  const [searchParams] = useSearchParams();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const params = {
        checkIn: searchParams.get("checkIn"),
        checkOut: searchParams.get("checkOut"),
        adults: searchParams.get("adults"),
        children: searchParams.get("children"),
      };
      try {
        const result = await searchAvailableRooms(params);
        // Optionally fetch image for each room
        const roomsWithImages = await Promise.all(
          result.availableRooms.map(async (room) => {
            try {
              const roomDetails = await getRoomById(room.roomId);
              return { ...room, image: roomDetails.images?.[0] || null };
            } catch {
              return { ...room, image: null };
            }
          })
        );
        setAvailableRooms(roomsWithImages);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch available rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Available Rooms
        </h2>

        {availableRooms.length === 0 ? (
          <p className="text-gray-500 text-center text-lg">
            No rooms available for selected dates.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRooms.map((room, i) => (
              <div
                key={i}
                onClick={() =>
                  navigate(`/room/${room.roomId}`, {
                    state: {
                      checkIn: searchParams.get("checkIn"),
                      checkOut: searchParams.get("checkOut"),
                      adults: searchParams.get("adults"),
                      children: searchParams.get("children"),
                      roomNumber: room.roomNumber,
                    },
                  })
                }
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
              >
                {/* Room Image */}
                <img
                  src={
                    room.image
                      ? `${API_URL}uploads/${room.image}`
                      : "/images/room-placeholder.jpg" // placeholder
                  }
                  alt={room.type}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {room.type} - Room {room.roomNumber}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Max: {room.maxAdults} Adults, {room.maxChildren} Children
                  </p>
                  <p className="text-gray-600 mb-2">{room.nights} night(s) stay</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-blue-600">
                      ${room.totalPrice}
                    </span>
                    <span className="text-md text-white font-semibold p-3 rounded-lg bg-blue-600 ">Click to book</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableRoomsPage;
