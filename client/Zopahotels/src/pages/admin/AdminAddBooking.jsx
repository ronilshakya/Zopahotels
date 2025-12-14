import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { createBookingAdmin, getAvailableRoomNumbersByDate } from "../../api/bookingApi"; // make sure this API exists
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../api/authApi";
import { getAllRooms } from "../../api/roomApi";
import { useHotel } from "../../context/HotelContext";
import { Country, City } from "country-state-city";

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
    customerType: "Member",
    userId: "",
    rooms: [{ roomId: "", numRooms: 1, adults: 1, children: 0 }],
    checkIn: today,
    checkOut: tomorrow
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
    // Prepare payload
    const payload = {
      ...bookingData,
      bookingSource, // include booking source
      rooms: bookingData.rooms.map(r => ({
        roomId: r.roomId,
        quantity: r.numRooms,   // ✅ send as quantity
        adults: r.adults,
        children: r.children
      }))
    };

    // If customer is Guest, remove userId and ensure guest info is included
    if (bookingData.customerType === "Guest") {
      delete payload.userId;
      payload.guestFirstName = bookingData.guestFirstName;
      payload.guestLastName = bookingData.guestLastName;
      payload.guestEmail = bookingData.guestEmail;
      payload.guestPhone = bookingData.guestPhone;
      payload.guestAddress = bookingData.guestAddress;
      payload.guestCity = bookingData.guestCity;
      payload.guestZipCode = bookingData.guestZipCode;
      payload.guestCountry = bookingData.guestCountry;
    }


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

  const countries = Country.getAllCountries();
  const cities = bookingData.guestCountry
  ? City.getCitiesOfCountry(
      countries.find(c => c.name === bookingData.guestCountry)?.isoCode
    )
  : [];
  
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8 relative">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Add Booking for User
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 relative">
          {/* Customer Type */}
<div>
  <label className="text-sm font-medium text-gray-700">Customer Type</label>
  <select
    value={bookingData.customerType}
    onChange={(e) =>
      setBookingData({ ...bookingData, customerType: e.target.value })
    }
    className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
    required
  >
    <option value="Member">Member</option>
    <option value="Guest">Guest</option>
  </select>
</div>

{/* Conditional Fields */}
{bookingData.customerType === "Member" && (
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
      required
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
)}

{bookingData.customerType === "Guest" && (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Guest First Name</label>
        <input
          type="text"
          name="guestFirstName"
          value={bookingData.guestFirstName || ""}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Guest Last Name</label>
        <input
          type="text"
          name="guestLastName"
          value={bookingData.guestLastName || ""}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Guest Email</label>
        <input
          type="email"
          name="guestEmail"
          value={bookingData.guestEmail || ""}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Guest Phone</label>
        <input
          type="text"
          name="guestPhone"
          value={bookingData.guestPhone || ""}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Country</label>
        <input
          list="countries"
          name="guestCountry"
          value={bookingData.guestCountry || ""}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
        <datalist id="countries">
          {countries.map((country) => (
            <option key={country.isoCode} value={country.name} />
          ))}
        </datalist>

      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">City</label>
        <input
          list="cities"
          name="guestCity"
          value={bookingData.guestCity || ""}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          disabled={!bookingData.guestCountry}
        />
        <datalist id="cities">
          {cities.map((city,i) => (
            <option key={i} value={city.name} />
          ))}
        </datalist>
      </div>
    </div>

      
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Guest Address</label>
        <input
          type="text"
          name="guestAddress"
          value={bookingData.guestAddress || ""}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Zip Code</label>
        <input
          type="text"
          name="guestZipCode"
          value={bookingData.guestZipCode || ""}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>
    </div>
  </>
)}


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
  <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end mb-4">
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
        {rooms.map((room) => (
          <option key={room._id} value={room._id}>
            {room.type}
          </option>
        ))}
      </select>
    </div>

    {/* Number of Rooms */}
    <div>
      <label className="text-sm font-medium text-gray-700">Number of Rooms</label>
      <select
        name="numRooms"
        value={r.numRooms}
        onChange={(e) => handleRoomChange(index, e)}
        disabled={!r.roomId || loading || !availableRoomCounts[r.roomId]}
        className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        <option value="">Select Number</option>
        {r.roomId &&
          (() => {
            const roomType = rooms.find((room) => room._id === r.roomId);
            if (!roomType) return null;
            const maintenanceCount = roomType.rooms.filter(r => r.status === "not_available").length;
            const maxSelectable = Math.max(availableRoomCounts[r.roomId] - maintenanceCount, 0);
            return Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ));
          })()}
      </select>
    </div>

    {/* Adults */}
    <div>
      <label className="text-sm font-medium text-gray-700">Adults</label>
      <input
        type="number"
        name="adults"
        min="1"
        value={r.adults}
        onChange={(e) => handleRoomChange(index, e)}
        className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        required
      />
    </div>

    {/* Children */}
    <div>
      <label className="text-sm font-medium text-gray-700">Children</label>
      <input
        type="number"
        name="children"
        min="0"
        value={r.children}
        onChange={(e) => handleRoomChange(index, e)}
        className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        required
      />
    </div>

    {/* Remove Button */}
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
            Add Another Room
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
