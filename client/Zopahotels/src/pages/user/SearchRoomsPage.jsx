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
  const [roomOccupancy, setRoomOccupancy] = useState({}); 

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

      // Filter out room numbers that are under maintenance
      const availableRoomNumbers = roomDetails.rooms
        .filter(r => r.status !== 'not_available')
        .map(r => r.roomNumber);

      const adultsCount = Number(filters.adults);
      const hasPricing = roomDetails.pricing.some(p => p.adults === adultsCount);
      if (!hasPricing) return null;



      // Skip rooms if no available numbers left
      if (availableRoomNumbers.length === 0) return null;

      // Fetch available room numbers for this room (API)
      const roomNumbersData = await getAvailableRoomNumbersByDate({
        roomId: room.roomId,
        checkIn: filters.checkIn,
        checkOut: filters.checkOut,
      });

      // Only count numbers that are available AND not under maintenance
      const finalAvailableRoomNumbers = availableRoomNumbers.filter(num =>
        roomNumbersData.availableRoomNumbers.includes(num)
      );

      setAvailableRoomCounts((prev) => ({
        ...prev,
        [room.roomId]: finalAvailableRoomNumbers.length,
      }));



      return { 
        ...room, 
        image: roomDetails.images?.[0] || null,
        availableRoomNumbers: finalAvailableRoomNumbers,
        pricing: roomDetails.pricing || []   // ✅ ensure pricing is present
      };

    } catch {
      return null;
    }
  })
);

// Remove rooms that were null (all numbers under maintenance)
setAvailableRooms(roomsWithImages.filter(r => r !== null));

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
 const selectedRooms = availableRooms.flatMap(room => {
  const occupancies = Array.isArray(roomOccupancy[room.roomId]) ? roomOccupancy[room.roomId] : [];
  return occupancies.map(occ => {
    const adultsCount = occ?.adults ?? form.adults;
    const childrenCount = occ?.children ?? 0;
    const pricingEntry = room.pricing.find(p => p.adults === adultsCount);

    return {
      roomId: room.roomId,
      adults: adultsCount,
      children: childrenCount,
      pricePerNight: pricingEntry?.price || 0,
      totalPrice: (pricingEntry?.price || 0) * room.nights,
      type: room.type
    };
  });
});



  if (!selectedRooms.length) return;

  // Redirect to checkout page, passing the data via state
  navigate("/checkout", {
    state: {
      selectedRooms,        // already contains per-room adults/children
      checkIn: form.checkIn,
      checkOut: form.checkOut
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
                  src={room.image ? `${API_URL}uploads/rooms/${room.image}` : preloader}
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
                    Max: {room.maxAdults} Adults, Children - {room.children}
                  </p>

                  <p className="text-gray-600">{room.nights} night(s)</p>

                  {/* Number of Rooms Dropdown per room */}
                 {room.availableRoomNumbers.length > 0 && (
                    <div className="mt-4">
                      <select
                        value={numRooms[room.roomId] || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          setNumRooms((prev) => ({ ...prev, [room.roomId]: value }));

                          setRoomOccupancy((prev) => {
                            if (!value) {
                              // Clear occupancy when quantity cleared
                              const { [room.roomId]: _, ...rest } = prev;
                              return rest;
                            }
                            const existing = Array.isArray(prev[room.roomId]) ? prev[room.roomId] : [];
                            const next = Array.from({ length: value }, (_, i) => ({
                              adults: existing[i]?.adults ?? form.adults,
                              children: existing[i]?.children ?? 0,
                            }));
                            return { ...prev, [room.roomId]: next };
                          });
                        }}
                        className="border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">Number of Rooms</option>
                        {room.availableRoomNumbers.map((num, i) => (
                          <option key={i} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>

                    </div>
                  )}

                  {/* Adults per room */}
{Array.from({ length: numRooms[room.roomId] || 0 }).map((_, idx) => (
  <div key={idx} className="mt-2">
       <label className="block text-sm font-medium text-gray-700">
  Adults for Room {idx + 1}
</label>
<select
  value={roomOccupancy[room.roomId]?.[idx]?.adults || ""}
  onChange={(e) => {
    const value = Number(e.target.value);
    setRoomOccupancy(prev => {
      const arr = Array.isArray(prev[room.roomId]) ? [...prev[room.roomId]] : [];
      arr[idx] = { ...(arr[idx] || {}), adults: value };
      return { ...prev, [room.roomId]: arr };
    });
  }}
  className="border border-gray-300 rounded px-3 py-2"
>
  <option value="">Select Adults</option>
  {room.pricing.map(p => (
    <option key={p.adults} value={p.adults}>
      {p.adults} Adult{p.adults > 1 ? "s" : ""} – ${p.price}/night
    </option>
  ))}
</select>



    {room.maxChildren > 0 && (
  <>
    <label className="block text-sm font-medium text-gray-700 mt-2">
      Children for Room {idx + 1}
    </label>
    <select
      value={roomOccupancy[room.roomId]?.[idx]?.children || 0}
      onChange={(e) => {
        const value = Number(e.target.value);
        setRoomOccupancy(prev => {
          const arr = Array.isArray(prev[room.roomId]) ? [...prev[room.roomId]] : [];
          arr[idx] = { ...(arr[idx] || {}), children: value };
          return { ...prev, [room.roomId]: arr };
        });
      }}
      className="border border-gray-300 rounded px-3 py-2"
    >
      <option value="">Select Children</option>
      {[...Array(room.maxChildren + 1).keys()].map(n => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  </>
)}

  </div>
))}




                  <div className="flex justify-between items-center mt-4">
              {(() => {
  const raw = roomOccupancy[room.roomId];
  const occupancies = Array.isArray(raw) ? raw : raw ? [raw] : [];

  const totalPrice = occupancies.reduce((sum, occ) => {
    const adultsCount = occ?.adults ?? form.adults;
    const pricingEntry = Array.isArray(room.pricing)
      ? room.pricing.find(p => p.adults === adultsCount)
      : null;

    return sum + (pricingEntry?.price || 0) * room.nights;
  }, 0);

  return (
    <>
      {occupancies.length > 0 && (
        <span className="text-lg font-bold text-blue-600">${totalPrice}</span>
      )}

      <span
        className="text-blue-600 font-semibold underline cursor-pointer"
        onClick={() => viewRoomModal(room)}
      >
        View Details
      </span>
    </>
  );
})()}



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
  const raw = roomOccupancy[room.roomId];
  const occupancies = Array.isArray(raw) ? raw : raw ? [raw] : [];

  const subtotal = occupancies.reduce((sum, occ) => {
    const adultsCount = occ?.adults ?? form.adults;
    const pricingEntry = Array.isArray(room.pricing)
      ? room.pricing.find(p => p.adults === adultsCount)
      : null;

    return sum + (pricingEntry?.price || 0) * room.nights;
  }, 0);

  return acc + subtotal;
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
