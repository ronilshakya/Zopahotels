import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { createBookingAdmin } from "../../api/bookingApi"; // adjust path
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../api/authApi";
import { getAllRooms } from "../../api/roomApi";

const AdminAddBooking = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [bookingData, setBookingData] = useState({
    userId: "",
    rooms: [{ roomId: "" }],
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    numberOfRooms: 1,
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

  // Filter users when typing
  useEffect(() => {
    if (query === "") {
      setFilteredUsers([]);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [query, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (index, e) => {
    const newRooms = [...bookingData.rooms];
    newRooms[index][e.target.name] = e.target.value;
    setBookingData((prev) => ({ ...prev, rooms: newRooms }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createBookingAdmin({ payload: bookingData, token: adminToken });
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
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg mt-8 relative">
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
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // allow click
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

        {/* Rooms */}
        {bookingData.rooms.map((r, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
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
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.type} (${room.price}/night)
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

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

        <div>
          <label className="text-sm font-medium text-gray-700">Number of Rooms</label>
          <input
            type="number"
            name="numberOfRooms"
            min="1"
            value={bookingData.numberOfRooms}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            required
          />
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
  );
};

export default AdminAddBooking;
