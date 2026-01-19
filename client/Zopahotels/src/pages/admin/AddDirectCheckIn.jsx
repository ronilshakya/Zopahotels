import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import preloader from '../../assets/preloader.gif';
import { useHotel } from '../../context/HotelContext';
import { createDirectCheckIn, getAvailableRoomNumbers, updateBookingStatus } from '../../api/bookingApi';
import { getAllRooms } from '../../api/roomApi';
import { Country, City } from "country-state-city";

const AddDirectCheckIn = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const { hotel } = useHotel();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];

  const {search} = useLocation();
  const params = new URLSearchParams(search);

  const roomNumberParam = params.get("roomNumber");
  const roomTypeParam = params.get("roomType");
  const checkinParam = params.get("checkIn");
  const checkoutParam = params.get("checkOut");
  const roomIdParam = params.get("roomId");

  const prefilledRooms = (roomIdParam && roomNumberParam && roomTypeParam) ? 
    [{ 
      roomId: roomIdParam, 
      roomNumber: roomNumberParam, 
      type: roomTypeParam, 
      adults: 1, 
      children: 0, 
      pricing: [] 
    }] : [];

  const [form, setForm] = useState({
    checkIn: checkinParam ? checkinParam : today,
    checkOut: checkoutParam ? checkoutParam : tomorrow,
    selectedRooms: prefilledRooms,
    status: 'pending',
    guestFirstName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    guestAddress: '',
    guestCity: '',
    guestZipCode: '',
    guestCountry: ''
  });

  const [bookingSource, setBookingSource] = useState('');
  const [availableRoomNumbers, setAvailableRoomNumbers] = useState({});
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const countries = Country.getAllCountries();
  const cities = form.guestCountry
  ? City.getCitiesOfCountry(
      countries.find(c => c.name === form.guestCountry)?.isoCode
    )
  : [];
  

  // Fetch all rooms for selection
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsData = await getAllRooms();
        setAllRooms(roomsData);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      }
    };
    fetchRooms();
  }, []);

  // Set default booking source
  useEffect(() => {
    if (hotel?.bookingSource) {
      const sources = Array.isArray(hotel.bookingSource)
        ? hotel.bookingSource
        : JSON.parse(hotel.bookingSource || '[]');
      setBookingSource(sources[0] || '');
    }
  }, [hotel]);

  // Fetch available room numbers whenever selected rooms or dates change
  useEffect(() => {
    const fetchAvailable = async () => {
      if (form.selectedRooms.length === 0) return;

      const newAvailable = {};
      for (const room of form.selectedRooms) {
        if (room.roomId) {
          try {
            const res = await getAvailableRoomNumbers({
              roomId: room.roomId,
              checkIn: form.checkIn,
              checkOut: form.checkOut,
            }, token);
            newAvailable[room.roomId] = res.availableRoomNumbers || [];
          } catch (err) {
            newAvailable[room.roomId] = [];
          }
        }
      }
      setAvailableRoomNumbers(newAvailable);
    };
    fetchAvailable();
  }, [form.selectedRooms, form.checkIn, form.checkOut, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({...form, [name]: value});
  };

  const handleAddRoom = () => {
    setForm({
      ...form,
      selectedRooms: [
        ...form.selectedRooms,
        { roomId: '', roomNumber: '', type: '', adults: 1, children: 0, pricing: [] }
      ]
    });
  };

  const handleRemoveRoom = (index) => {
    const updated = [...form.selectedRooms];
    updated.splice(index, 1);
    setForm({ ...form, selectedRooms: updated });
  };

  const handleRoomTypeChange = (index, roomId) => {
    const selectedRoom = allRooms.find(r => r._id === roomId);
    const updated = [...form.selectedRooms];
    updated[index] = {
      ...updated[index],
      roomId: selectedRoom?._id || '',
      type: selectedRoom?.type || '',
      pricing: selectedRoom?.pricing || [],
      roomNumber: '',
      adults: 1,
      children: 0
    };
    setForm({ ...form, selectedRooms: updated });
  };

  const handleRoomNumberChange = (index, roomNumber) => {
    const updated = [...form.selectedRooms];
    updated[index].roomNumber = roomNumber;
    setForm({ ...form, selectedRooms: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email
      if (form.guestEmail) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(form.guestEmail)) {
          setLoading(false);
          return Swal.fire({ title: "Invalid email", icon: "error" });
        }
      }

      const allRoomsAssigned = form.selectedRooms.every(r => r.roomNumber && r.roomNumber !== 'Yet to be assigned');
      const computedStatus = allRoomsAssigned ? 'checked_in' : 'pending';

      const payload = {
        // checkIn: form.checkIn,
        checkOut: form.checkOut,
        rooms: form.selectedRooms.map(r => ({
          roomId: r.roomId,
          roomNumber: r.roomNumber,
          adults: r.adults,
          children: r.children,
          totalPrice: r.pricing?.find(p => p.adults === r.adults)?.price || 0
        })),
        bookingSource,
        guestFirstName: form.guestFirstName,
        guestLastName: form.guestLastName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        guestAddress: form.guestAddress,
        guestCity: form.guestCity,
        guestZipCode: form.guestZipCode,
        guestCountry: form.guestCountry,
        customerType: 'Guest'
      };

      const booking = await createDirectCheckIn({ payload, token });
      await updateBookingStatus({token, payload: {bookingId: booking.booking._id, newStatus: computedStatus} });

      Swal.fire({ title: "Booking created!", icon: "success", timer: 2000 });
      navigate('/admin/check-in');
    } catch (err) {
      Swal.fire({ title: err.response?.data?.message || 'Failed to create booking', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!allRooms.length) return <img src={preloader} alt="loading..." className="w-16 mx-auto mt-20" />;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Direct Check-In</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* guest info */}
            <div className='flex flex-col gap-4'>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Guest First Name</label>
                    <input type="text" name="guestFirstName" onChange={handleChange} required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Guest Last Name</label>
                    <input type="text" name="guestLastName" onChange={handleChange} required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Guest Email</label>
                    <input
                      type="email"
                      name="guestEmail"
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Guest Phone</label>
                    <input
                      type="text"
                      name="guestPhone"
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <input
                      list="countries"
                      name="guestCountry"
                      value={form.guestCountry || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      onChange={handleChange}
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
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Zip Code</label>
                    <input
                      type="text"
                      name="guestZipCode"
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
            </div>
            {/* col2 */}
            <div className="flex flex-col gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700">Check-In</label>
                <input type="date" name="checkIn" value={form.checkIn} onChange={handleChange} readOnly disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Check-Out</label>
                <input type="date" name="checkOut" value={form.checkOut} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>

            {/* Rooms Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rooms</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.selectedRooms.map((room, index) => {
                    const options = (availableRoomNumbers[room.roomId] || []).filter(r => r.status === 'available');
                    const selectedNumbers = form.selectedRooms.filter(r => r.roomId === room.roomId && r.roomNumber && r !== room).map(r => r.roomNumber);
                    const filteredOptions = options.filter(num => !selectedNumbers.includes(num.number));

                    return (
                    <div key={index} className="border p-3 rounded-md relative">
                        <button type="button" onClick={() => handleRemoveRoom(index)} className="absolute top-1 right-1 text-red-500">&times;</button>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                        <select value={room.roomId} onChange={e => handleRoomTypeChange(index, e.target.value)} className="w-full px-3 py-2 border rounded-md mb-2">
                        <option value="">Select Room Type</option>
                        {allRooms.map(r => <option key={r._id} value={r._id}>{r.type}</option>)}
                        </select>

                        {room.roomId && (
                        <>
                            <label className="block text-sm font-medium text-gray-700">Room Number</label>
                            <select value={room.roomNumber || 'Yet to be assigned'} onChange={e => handleRoomNumberChange(index, e.target.value)} className="w-full px-3 py-2 border rounded-md mb-2">
                            <option value="Yet to be assigned">Yet to be assigned</option>
                            {filteredOptions.map(num => <option key={num.number} value={num.number}>{num.number}</option>)}
                            </select>

                            <label className="block text-sm font-medium text-gray-700">Adults</label>
                            <input type="number" min="1" value={room.adults} onChange={e => {
                            const updated = [...form.selectedRooms];
                            updated[index].adults = parseInt(e.target.value) || 1;
                            setForm({ ...form, selectedRooms: updated });
                            }} className="w-full px-3 py-2 border rounded-md mb-2" />

                            <label className="block text-sm font-medium text-gray-700">Children</label>
                            <input type="number" min="0" value={room.children} onChange={e => {
                            const updated = [...form.selectedRooms];
                            updated[index].children = parseInt(e.target.value) || 0;
                            setForm({ ...form, selectedRooms: updated });
                            }} className="w-full px-3 py-2 border rounded-md mb-2" />
                        </>
                        )}
                    </div>
                    );
                })}
                </div>
                <button type="button" onClick={handleAddRoom} className="mt-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">+ Add Room</button>
            </div>

            {/* Booking Source */}
            {hotel?.bookingSource && (
                <div>
                <label className="block text-sm font-medium text-gray-700">Booking Source</label>
                <select value={bookingSource} onChange={e => setBookingSource(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {(Array.isArray(hotel.bookingSource) ? hotel.bookingSource : JSON.parse(hotel.bookingSource)).map((source, i) => (
                    <option key={i} value={source}>{source}</option>
                    ))}
                </select>
                </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-4">
                {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDirectCheckIn;
