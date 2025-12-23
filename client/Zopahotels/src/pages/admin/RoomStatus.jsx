import React, { useEffect, useState } from 'react';
import { getAllRooms } from '../../api/roomApi';
import { getAvailableRoomNumbersByDate } from '../../api/bookingApi';
import dayjs from 'dayjs';
import { getHotel } from '../../api/hotelApi';
import { useNavigate } from 'react-router-dom';

const RoomStatus = () => {
  const [rooms, setRooms] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(dayjs().format('YYYY-MM-DD'));
  const [checkOut, setCheckOut] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [hotel, setHotel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const hotelData = await getHotel();
        setHotel(hotelData);

        const allRooms = await getAllRooms();
        setRooms(allRooms);

        // Fetch availability in parallel
        const results = await Promise.all(
          allRooms.map(room =>
            getAvailableRoomNumbersByDate({ roomId: room._id, checkIn, checkOut })
          )
        );

        // Flatten occupied rooms with booking names
        let occupied = [];
        allRooms.forEach((room, idx) => {
          const { occupiedRoomNumbers } = results[idx];
          if (occupiedRoomNumbers && occupiedRoomNumbers.length > 0) {
            occupied = [
              ...occupied,
              ...occupiedRoomNumbers.map(r => ({
                roomNumber: r.roomNumber,
                bookingName: r.bookingName || '',
                bookingId: r.bookingId || ''
              }))
            ];
          }
        });

        setOccupiedRooms(occupied);

      } catch (err) {
        console.error('Booking API Error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [checkIn, checkOut]);

  // Get booking name if the room is occupied
  const getBookingName = (roomNumber) => {
    const booking = occupiedRooms.find(r => r.roomNumber === roomNumber);
    return booking ? booking.bookingName : '';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">

        {/* Date Inputs */}
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block mb-1 font-semibold">Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setCheckIn(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD')}
              onChange={(e) => setCheckOut(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-gray-600">Loading room status...</p>
        ) : (
          <>
            {/* Rooms */}
            {rooms.map((room) => (
              <div key={room._id} className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">{room.type}</h2>
                <div className="flex flex-wrap gap-2">
                  {room.rooms.map((r) => {
                    const occupied = occupiedRooms.find(o => o.roomNumber === r.roomNumber);
                    let bgColor = 'bg-green-600';
                    if (r.status === 'not_available') bgColor = 'bg-yellow-500';
                    else if (occupied) bgColor = 'bg-red-600';
                    return (
                      <div key={r.roomNumber} className="flex flex-col items-center" onClick={() => occupied && navigate(`/admin/edit-booking/${occupied.bookingId}`)}>
                          <span className={`px-3 py-1 rounded-md flex flex-col items-center text-white ${bgColor} h-16 w-16`}>
                            {r.roomNumber}
                            {occupied && (
                              <span className="text-xs text-white font-semibold mt-1">{occupied.bookingName}</span>
                            )}
                          </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <p className='flex items-center gap-2'>
              <span className='inline-block w-10 h-5 rounded-md bg-red-600'></span> - Booked
            </p>
            <p className='flex items-center gap-2'>
              <span className='inline-block w-10 h-5 rounded-md bg-green-600'></span> - Not Booked
            </p>
            <p className='flex items-center gap-2'>
              <span className='inline-block w-10 h-5 rounded-md bg-yellow-500'></span> - Under Maintenance
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomStatus;
