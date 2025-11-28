import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { createBookingAdmin, getAvailableRoomNumbersByDate } from "../../api/bookingApi"; // make sure this API exists
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../api/authApi";
import { getAllRooms } from "../../api/roomApi";
import { useHotel } from "../../context/HotelContext";

const AdminAddBooking = () => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableRoomCounts, setAvailableRoomCounts] = useState({});
  const [bookingSource, setBookingSource] = useState("");
  const { hotel } = useHotel();

  const [bookingData, setBookingData] = useState({
    userId: "",
    rooms: [{ roomId: "", numRooms: 1 }],
    checkIn: today,
    checkOut: tomorrow,
    adults: 1,
    children: 0,
  });

  const adminToken = localStorage.getItem("adminToken");

  // Fetch users and rooms
  useEffect(() => {
    const fetchUsersRooms = async () => {
      try {
        const usersRes = await getAllUsers(adminToken);
        setUsers(usersRes);

        const roomsRes = await getAllRooms();
        setRooms(roomsRes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsersRooms();
  }, [adminToken]);

  useEffect(() => {
    if (hotel && hotel.bookingSource) {
      const sourcesArray = Array.isArray(hotel.bookingSource)
        ? hotel.bookingSource
        : JSON.parse(hotel.bookingSource || "[]");
      setBookingSource(sourcesArray[0] || ""); // default to first source
    }
  }, [hotel]);

  // Filter users when typing
  useEffect(() => {
    if (!query) return setFilteredUsers([]);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [query, users]);

  // Fetch available room counts whenever room type or dates change
  useEffect(() => {
    const fetchAvailableRoomCounts = async () => {
      const counts = {};
      for (const r of bookingData.rooms) {
        if (r.roomId) {
          try {
            const res = await getAvailableRoomNumbersByDate({
              roomId: r.roomId,
              checkIn: bookingData.checkIn,
              checkOut: bookingData.checkOut,
            });
            counts[r.roomId] = res.availableRoomNumbers.length;
          } catch {
            counts[r.roomId] = 0;
          }
        }
      }
      setAvailableRoomCounts(counts);
    };
    fetchAvailableRoomCounts();
  }, [bookingData.rooms, bookingData.checkIn, bookingData.checkOut]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (index, e) => {
    const newRooms = [...bookingData.rooms];
    newRooms[index][e.target.name] = e.target.value;
    setBookingData({ ...bookingData, rooms: newRooms });
  };

  const handleNumRoomsChange = (index, e) => {
    const newRooms = [...bookingData.rooms];
    newRooms[index].numRooms = Number(e.target.value);
    setBookingData({ ...bookingData, rooms: newRooms });
  };

  const addRoom = () => {
    setBookingData({
      ...bookingData,
      rooms: [...bookingData.rooms, { roomId: "", numRooms: 1 }],
    });
  };

  const removeRoom = (index) => {
    const newRooms = bookingData.rooms.filter((_, i) => i !== index);
    setBookingData({ ...bookingData, rooms: newRooms });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...bookingData, bookingSource }; // include bookingSource
      const res = await createBookingAdmin({ payload, token: adminToken });
      Swal.fire("Success", res.message, "success");
      navigate("/admin/all-bookings");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setBookingData({ ...bookingData, userId: user._id });
    setQuery(`${user.name} (${user.email})`);
    setShowSuggestions(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8 relative">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Add Booking for User
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 relative">
          {/* User search */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">User</label>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setBookingData({ ...bookingData, userId: "" });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              placeholder="Search user by name or email"
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            {showSuggestions && (query ? filteredUsers : users.slice(0, 5)).length > 0 && (
              <ul className="absolute z-50 w-full bg-white border rounded-lg mt-1 max-h-48 overflow-auto shadow-lg">
                {(query ? filteredUsers : users.slice(0, 5)).map((user) => (
                  <li
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {user.name} ({user.email})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Check-In</label>
              <input
                type="date"
                name="checkIn"
                value={bookingData.checkIn}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Check-Out</label>
              <input
                type="date"
                name="checkOut"
                value={bookingData.checkOut}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              />
            </div>
          </div>

          {/* Rooms */}
          {bookingData.rooms.map((r, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
              {/* Room Type */}
              <div>
                <label className="text-sm font-medium text-gray-700">Room</label>
                <select
                  name="roomId"
                  value={r.roomId}
                  onChange={(e) => handleRoomChange(index, e)}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="">Select Room</option>
                  {rooms
                  .map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.type} (${room.price}/night)
                    </option>
                  ))}
                </select>
              </div>

             {/* Number of Rooms Dropdown */}
{/* Number of Rooms Dropdown */}
{/* {r.roomId && rooms.find(room => room._id === r.roomId)?.status !== "maintenance" && (
  <div>
    <label className="text-sm font-medium text-gray-700">Number of Rooms</label>
    <select
      value={r.numRooms || ""}
      onChange={(e) => handleNumRoomsChange(index, e)}
      disabled={!availableRoomCounts[r.roomId] || loading}
      className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
    >
      <option value="">Select Number</option>
      {Array.from({ length: availableRoomCounts[r.roomId] || 0 }, (_, i) => i + 1).map(
        (n) => (
          <option key={n} value={n}>
            {n}
          </option>
        )
      )}
    </select>
  </div>
)} */}
              <div>
  <label className="text-sm font-medium text-gray-700">Number of Rooms</label>
  <select
    value={r.numRooms || ""}
    onChange={(e) => handleNumRoomsChange(index, e)}
    disabled={!r.roomId || loading || !availableRoomCounts[r.roomId]}
    className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
  >
    <option value="">Select Number</option>
    {r.roomId &&
      (() => {
        const roomType = rooms.find((room) => room._id === r.roomId);
        if (!roomType) return null;

        // count rooms not under maintenance
        const maintenanceCount = roomType.rooms.filter(r => r.status === "maintenance").length;

        // subtract maintenance rooms from availableRoomCounts
        const maxSelectable = Math.max(availableRoomCounts[r.roomId] - maintenanceCount, 0);

        return Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ));
      })()}
  </select>
</div>



              {bookingData.rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRoom(index)}
                  className="text-white bg-red-500 mt-6 p-2 rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addRoom}
            className="bg-blue-600 text-white py-2 px-4 rounded mt-2"
          >
            Add Room
          </button>

          {/* Booking Source */}
          {hotel?.bookingSource && (
            <div>
              <label className="text-sm font-medium text-gray-700">Booking Source</label>
              <select
                value={bookingSource}
                onChange={(e) => setBookingSource(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                {Array.isArray(hotel.bookingSource)
                  ? hotel.bookingSource.map((source, i) => (
                      <option key={i} value={source}>
                        {source}
                      </option>
                    ))
                  : JSON.parse(hotel.bookingSource || "[]").map((source, i) => (
                      <option key={i} value={source}>
                        {source}
                      </option>
                    ))}
              </select>
            </div>
          )}


          {/* Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Adults</label>
              <input
                type="number"
                name="adults"
                min="1"
                value={bookingData.adults}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Children</label>
              <input
                type="number"
                name="children"
                min="0"
                value={bookingData.children}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddBooking;
