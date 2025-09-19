import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, updateBooking, searchAvailableRooms } from '../../api/bookingApi';
import Swal from 'sweetalert2';
import preloader from '../../assets/preloader.gif'

const EditBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const [form, setForm] = useState({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    selectedRooms: [],
    status: 'pending',
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
  const fetchBookingAndRooms = async () => {
    if (!token) {
      Swal.fire({
        title:"Authentication token is missing. Please log in.",        
      })
      navigate('/login');
      setFetchLoading(false);
      return;
    }

    try {
      const bookingData = await getBookingById(id, token);

      const newForm = {
        checkIn: bookingData.checkIn ? new Date(bookingData.checkIn).toISOString().split('T')[0] : '',
        checkOut: bookingData.checkOut ? new Date(bookingData.checkOut).toISOString().split('T')[0] : '',
        adults: bookingData.adults || 1,
        children: bookingData.children || 0,
        selectedRooms: bookingData.rooms && bookingData.rooms.length > 0
          ? bookingData.rooms.map(r => ({
              roomId: r.roomId?._id?.toString() || '',
              roomNumber: r.roomNumber || '',
              type: r.roomId?.type || 'Unknown',
            }))
          : [],
        status: bookingData.status || 'pending',
      };
      setForm(newForm);

      if (newForm.checkIn && newForm.checkOut) {
        const roomData = await searchAvailableRooms({
          checkIn: newForm.checkIn,
          checkOut: newForm.checkOut,
          adults: newForm.adults,
          children: newForm.children,
          bookingId: id, // Pass bookingId
        });
        
        const currentRooms = newForm.selectedRooms.map(r => ({
          roomId: r.roomId,
          roomNumber: r.roomNumber,
          type: r.type,
          pricePerNight: bookingData.rooms.find(br => br.roomNumber === r.roomNumber)?.roomId?.price || 0,
          maxAdults: bookingData.rooms.find(br => br.roomNumber === r.roomNumber)?.roomId?.adults || newForm.adults,
          maxChildren: bookingData.rooms.find(br => br.roomNumber === r.roomNumber)?.roomId?.children || newForm.children,
          nights: roomData.nights || 1,
          totalPrice: (bookingData.rooms.find(br => br.roomNumber === r.roomNumber)?.roomId?.price || 0) * (roomData.nights || 1),
          maxOccupancy: (newForm.adults + newForm.children) || 1,
        }));
        
        const mergedRooms = [
          ...currentRooms,
          ...(roomData.availableRooms || []).filter(
            ar => !currentRooms.some(cr => cr.roomId === ar.roomId && cr.roomNumber === ar.roomNumber)
          ),
        ];
        
        setAvailableRooms(mergedRooms);
        if (mergedRooms.length === 0) {
          setMessage('No rooms available for the selected dates and guest counts.');
        }
      } else {
        setMessage('Invalid booking dates. Unable to fetch available rooms.');
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.message === 'Request failed with status code 404' ? 'Booking not found.' :
        error.message === 'Request failed with status code 401' ? 'Unauthorized. Please log in again.' :
        'Failed to load booking or room data.'
      );
    } finally {
      setFetchLoading(false);
    }
  };
  fetchBookingAndRooms();
}, [id, token]);

useEffect(() => {
  const fetchAvailableRooms = async () => {
    if (form.checkIn && form.checkOut && form.adults >= 1) {
      try {
        const roomData = await searchAvailableRooms({
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          adults: form.adults,
          children: form.children,
          bookingId: id, // Pass bookingId
        });
        
        const currentRooms = form.selectedRooms.map(r => ({
          roomId: r.roomId,
          roomNumber: r.roomNumber,
          type: r.type,
          pricePerNight: roomData.availableRooms?.find(ar => ar.roomId === r.roomId && ar.roomNumber === r.roomNumber)?.pricePerNight || 0,
          maxAdults: roomData.availableRooms?.find(ar => ar.roomId === r.roomId && ar.roomNumber === r.roomNumber)?.maxAdults || form.adults,
          maxChildren: roomData.availableRooms?.find(ar => ar.roomId === r.roomId && ar.roomNumber === r.roomNumber)?.maxChildren || form.children,
          nights: roomData.nights || 1,
          totalPrice: (roomData.availableRooms?.find(ar => ar.roomId === r.roomId && ar.roomNumber === r.roomNumber)?.pricePerNight || 0) * (roomData.nights || 1),
          maxOccupancy: (form.adults + form.children) || 1,
        }));
        
        const mergedRooms = [
          ...currentRooms,
          ...(roomData.availableRooms || []).filter(
            ar => !currentRooms.some(cr => cr.roomId === ar.roomId && cr.roomNumber === ar.roomNumber)
          ),
        ];
        
        setAvailableRooms(mergedRooms);
        if (mergedRooms.length === 0) {
          setMessage('No rooms available for the selected dates and guest counts.');
        }
      } catch (error) {
        Swal.fire({
          title: `Failed to fetch available rooms. ${error}`,
          icon: "error"
        })
      }
    }
  };
  fetchAvailableRooms();
}, [form.checkIn, form.checkOut, form.adults, form.children, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRoomChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => {
      const [roomId, roomNumber, type] = option.value.split('|');
      return { roomId, roomNumber, type };
    });
    setForm({ ...form, selectedRooms: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        checkIn: form.checkIn || undefined,
        checkOut: form.checkOut || undefined,
        adults: parseInt(form.adults) || 1,
        children: parseInt(form.children) || 0,
        rooms: form.selectedRooms.length > 0
          ? form.selectedRooms.map(r => ({
              roomId: r.roomId,
              roomNumber: r.roomNumber,
            }))
          : undefined,
        status: form.status || 'pending',
      };


      await updateBooking({ id, payload, token });
      Swal.fire({
        title: "Booking updated successfully!",
        timer: 2000,
        icon: 'success',
        position: "top-end",
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire({
        title: error.response?.data?.message || 'Failed to update booking.',
        icon: 'error',
        position: "top-end",
      })
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Booking</h2>
        {message && (
          <p
            className={`mb-4 text-center text-sm font-medium px-4 py-2 rounded-md ${
              message.includes('success')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date</label>
            <input
              type="date"
              name="checkIn"
              value={form.checkIn || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date</label>
            <input
              type="date"
              name="checkOut"
              value={form.checkOut || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <input
                type="number"
                name="adults"
                value={form.adults || 1}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="e.g., 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <input
                type="number"
                name="children"
                value={form.children || 0}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="e.g., 0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
            <select
              name="rooms"
              multiple
              value={form.selectedRooms.map(r => `${r.roomId}|${r.roomNumber}|${r.type}`)}
              onChange={handleRoomChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableRooms.map(room => (
                <option
                  key={`${room.roomId}-${room.roomNumber}`}
                  value={`${room.roomId}|${room.roomNumber}|${room.type}`}
                >
                  {room.type} - {room.roomNumber} (Max: {room.maxAdults} adults, {room.maxChildren} children)
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple rooms.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={form.status || 'pending'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition duration-200 ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Updating...' : 'Update Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBooking;