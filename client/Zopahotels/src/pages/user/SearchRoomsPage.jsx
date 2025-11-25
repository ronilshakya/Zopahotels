import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableRoomNumbersByDate, searchAvailableRooms } from "../../api/bookingApi";
import { API_URL } from "../../config";
import { getRoomById } from "../../api/roomApi";
import preloader from '../../assets/preloader.gif';
import RoomModal from "../../components/RoomModal";
import { useHotel } from "../../context/HotelContext";

const SearchRoomsPage = () => {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    checkIn: today,
    checkOut: tomorrow,
    adults: 1,
    children: 0,
  });
  const [numRooms, setNumRooms] = useState({}); // Track number of rooms per roomId
  const [availableRoomCounts, setAvailableRoomCounts] = useState({}); // Track available counts per roomId
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const {hotel} = useHotel();

  // -------------------------------
  // Fetch rooms with images + available room counts
  // -------------------------------
  const loadRooms = async (filters) => {
    setLoading(true);
    try {
      const result = await searchAvailableRooms(filters);

      const roomsWithImages = await Promise.all(
        result.availableRooms.map(async (room) => {
          try {
            const roomDetails = await getRoomById(room.roomId);

            // Fetch available room numbers for this room
            const roomNumbersData = await getAvailableRoomNumbersByDate({
              roomId: room.roomId,
              checkIn: filters.checkIn,
              checkOut: filters.checkOut,
            });

            setAvailableRoomCounts((prev) => ({
              ...prev,
              [room.roomId]: roomNumbersData.availableRoomNumbers.length,
            }));

            return { ...room, image: roomDetails.images?.[0] || null };
          } catch {
            return { ...room, image: null };
          }
        })
      );

      setAvailableRooms(roomsWithImages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(form);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadRooms(form);
  };

  const viewRoomModal = (room) => {
    setSelectedRoom(room);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRoom(null);
    setModalOpen(false);
  };


  const handleBookSelectedRooms = () => {
  const selectedRooms = availableRooms
    .filter(room => numRooms[room.roomId])
    .map(room => ({
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      quantity: numRooms[room.roomId],
      pricePerNight: room.pricePerNight, // ✅ add this
      totalPrice: room.pricePerNight * numRooms[room.roomId] * 
                  Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)),
      type: room.type
    }));

  if (!selectedRooms.length) return;

  // Redirect to checkout page, passing the data via state
  navigate("/checkout", {
    state: {
      selectedRooms,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: form.adults,
      children: form.children
    }
  });
};



  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg md:max-w-5xl w-full bg-white rounded-lg shadow-lg px-6 py-10 my-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Book Your Stay at {hotel ? hotel.name : "Our Hotel"}
        </h2>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col md:flex-row md:items-center justify-center gap-3 py-2"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
            <input
              type="date"
              name="checkIn"
              value={form.checkIn}
              onChange={handleChange}
              required
              min={today}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
            <input
              type="date"
              name="checkOut"
              value={form.checkOut}
              onChange={handleChange}
              required
              min={form.checkIn}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Adults</label>
            <input
              type="number"
              name="adults"
              min="1"
              value={form.adults}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Children</label>
            <input
              type="number"
              name="children"
              min="0"
              value={form.children}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {/* ROOM LIST */}
        {loading ? (
          <div className=" flex items-center justify-center">
                  <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
                </div>
        ) : availableRooms.length === 0 ? (
          <p className="text-gray-500 text-center text-lg mt-6">
            No rooms available for selected dates.
          </p>
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            {availableRooms.map((room, i) => {
              
              return(
              <div
                key={i}
                className="bg-white flex flex-col md:flex-row items-center rounded-lg overflow-hidden duration-200"
                style={{boxShadow: "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px"}}
                
              >
                 {!imgLoaded && (
                  <img
                    src={preloader}
                    className="w-48 h-full object-contain rounded-lg m-4 animate-pulse"
                    alt="loading"
                  />
                )}

                {/* REAL IMAGE */}
                <img
                  src={room.image ? `${API_URL}uploads/${room.image}` : preloader}
                  alt={room.type}
                  className={`w-48 h-full object-cover rounded-lg m-4 ${imgLoaded ? "block" : "hidden"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgLoaded(true)}
                />

                <div className="p-4 flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {room.type}
                  </h3>

                  <p className="text-gray-600">
                    Max: {room.maxAdults} Adults, {room.maxChildren} Children
                  </p>

                  <p className="text-gray-600">{room.nights} night(s)</p>

                  {/* Number of Rooms Dropdown per room */}
                  {availableRoomCounts[room.roomId] > 0 && (
                    <div className="mt-4">
                      <select
                        value={numRooms[room.roomId] || ""}
                        onChange={(e) =>{
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          setNumRooms((prev) => ({ ...prev, [room.roomId]: value }));
                        }}
                        className="border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">
                          Number of Rooms
                        </option>
                        {Array.from({ length: availableRoomCounts[room.roomId] }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}


                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-blue-600">${room.totalPrice  * (numRooms[room.roomId] || 1)}</span>

                    <span
                      className="text-blue-600 font-semibold underline cursor-pointer"
                      onClick={() => viewRoomModal(room)}
                    >
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* Global Book Now Section */}
        {Object.values(numRooms).some(n => typeof n === "number" && n > 0) && (
          <div className="fixed bottom-0 left-0 right-0 bg-blue-100 shadow-lg px-4 py-2 flex justify-between items-center max-w-5xl mx-auto rounded-lg">
            <span className="text-xl font-bold">
              Total: $
              {availableRooms.reduce((acc, room) => {
                const count = numRooms[room.roomId] || 0;
                return acc + room.totalPrice * count;
              }, 0)}
            </span>
            <button
              onClick={handleBookSelectedRooms}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
            >
              Book Now
            </button>
          </div>
        )}

      </div>
      {modalOpen && selectedRoom && (
        <RoomModal
          room={selectedRoom}
          onClose={closeModal}
        />
      )}

    </div>
    
  );
};

export default SearchRoomsPage;
