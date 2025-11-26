import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, updateBooking, getAvailableRoomNumbers } from '../../api/bookingApi';
import Swal from 'sweetalert2';
import preloader from '../../assets/preloader.gif';
import { useHotel } from '../../context/HotelContext';

const EditBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const { hotel } = useHotel();

  const [form, setForm] = useState({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    selectedRooms: [],
    status: 'pending',
  });
  const [bookingSource, setBookingSource] = useState('');
  const [availableRoomNumbers, setAvailableRoomNumbers] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      if (!token) {
        Swal.fire({ title:"Authentication token is missing. Please log in." });
        navigate('/login');
        setFetchLoading(false);
        return;
      }

      try {
        const bookingData = await getBookingById(id, token);

        setForm({
          checkIn: bookingData.checkIn ? new Date(bookingData.checkIn).toISOString().split('T')[0] : '',
          checkOut: bookingData.checkOut ? new Date(bookingData.checkOut).toISOString().split('T')[0] : '',
          adults: bookingData.adults || 1,
          children: bookingData.children || 0,
          selectedRooms: bookingData.rooms?.map(r => ({
            roomId: r.roomId?._id || '',
            roomNumber: r.roomNumber || '',
            type: r.roomId?.type || 'Unknown',
          })) || [],
          status: bookingData.status || 'pending',
        });

        // ✅ Set bookingSource correctly from bookingData
        if (bookingData.bookingSource?.length > 0) {
          setBookingSource(bookingData.bookingSource[0]);
        } else if (hotel?.bookingSource?.length > 0) {
          setBookingSource(Array.isArray(hotel.bookingSource) ? hotel.bookingSource[0] : JSON.parse(hotel.bookingSource)[0]);
        } else {
          setBookingSource('');
        }

      } catch (error) {
        setMessage(
          error.response?.data?.message ||
          (error.message.includes('404') ? 'Booking not found.' :
          error.message.includes('401') ? 'Unauthorized. Please log in again.' :
          'Failed to load booking.')
        );
      } finally {
        setFetchLoading(false);
      }
    };

    fetchBooking();
  }, [id, token, navigate, hotel]);

  // Fetch available room numbers
  useEffect(() => {
    const fetchAvailableNumbers = async () => {
      if (!form.checkIn || !form.checkOut || form.selectedRooms.length === 0) return;

      try {
        const newAvailable = {};
        for (const room of form.selectedRooms) {
          if (room.roomId) {
            const res = await getAvailableRoomNumbers({
              roomId: room.roomId,
              checkIn: form.checkIn,
              checkOut: form.checkOut,
              bookingId: id,
            }, token);
            newAvailable[room.roomId] = res.availableRoomNumbers || [];
          }
        }
        setAvailableRoomNumbers(newAvailable);
      } catch (error) {
        Swal.fire({ title: `Failed to fetch room numbers. ${error}`, icon: "error" });
      }
    };

    fetchAvailableNumbers();
  }, [form.checkIn, form.checkOut, form.selectedRooms, token, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRoomNumberChange = (roomId, index, roomNumber) => {
    const updatedRooms = form.selectedRooms.map((r, i) =>
      r.roomId === roomId && i === index ? { ...r, roomNumber } : r
    );
    setForm({ ...form, selectedRooms: updatedRooms });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: parseInt(form.adults),
        children: parseInt(form.children),
        rooms: form.selectedRooms.map(r => ({ roomId: r.roomId, roomNumber: r.roomNumber })),
        status: form.status,
        bookingSource
      };

      await updateBooking({ id, payload, token });
      Swal.fire({
        title: "Booking updated successfully!",
        timer: 2000,
        icon: 'success',
        position: "top-end",
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: error.response?.data?.message || 'Failed to update booking.',
        icon: 'error',
        position: "top-end",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <img src={preloader} className="w-16" alt="preloader" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Booking</h2>
        {message && (
          <p className={`mb-4 text-center text-sm font-medium px-4 py-2 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Check-In / Check-Out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date</label>
            <input type="date" name="checkIn" value={form.checkIn} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date</label>
            <input type="date" name="checkOut" value={form.checkOut} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          {/* Adults / Children */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <input type="number" name="adults" value={form.adults} onChange={handleChange} min="1" required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <input type="number" name="children" value={form.children} onChange={handleChange} min="0" required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
            {form.selectedRooms.map((room, index) => {
              const options = availableRoomNumbers?.[room.roomId] || [];
              const selectedNumbers = form.selectedRooms.filter(r => r.roomId === room.roomId && r.roomNumber && r !== room).map(r => r.roomNumber);
              const filteredOptions = options.filter(num => !selectedNumbers.includes(num));

              return (
                <div key={room.roomId + "-" + index} className="mb-3">
                  <p className="text-sm mb-1 font-semibold">{room.type}</p>
                  <select
                    value={room.roomNumber || ""}
                    onChange={(e) => handleRoomNumberChange(room.roomId, index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select room number</option>
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map(num => <option key={num} value={num}>{num}</option>)
                    ) : (
                      <option disabled>No rooms available</option>
                    )}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Booking Source */}
          {hotel?.bookingSource && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Source</label>
              <select
                value={bookingSource}
                onChange={(e) => setBookingSource(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Array.isArray(hotel.bookingSource)
                  ? hotel.bookingSource.map((source, i) => <option key={i} value={source}>{source}</option>)
                  : JSON.parse(hotel.bookingSource || '[]').map((source, i) => <option key={i} value={source}>{source}</option>)
                }
              </select>
            </div>
          )}

          <button type="submit" disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition duration-200 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Updating...' : 'Update Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBooking;
