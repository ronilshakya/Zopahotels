import React, { useEffect, useState } from 'react';
import { getAllRooms } from '../../api/roomApi';
import { getAvailableRoomNumbersByDate } from '../../api/bookingApi';
import dayjs from 'dayjs';

const RoomStatus = () => {
  const [rooms, setRooms] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(dayjs().format('YYYY-MM-DD'));
  const [checkOut, setCheckOut] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const allRooms = await getAllRooms();
        setRooms(allRooms);

        let occupied = [];

        for (const room of allRooms) {
          const availableData = await getAvailableRoomNumbersByDate({
            roomId: room._id,
            checkIn,
            checkOut
          });

          const roomNumbers = room.rooms.map(r => r.roomNumber);

          // Handle string/number mismatch
          const availableRoomNumbers = availableData.availableRoomNumbers.map(String);
          const occupiedForThisRoom = roomNumbers
            .map(String)
            .filter(num => !availableRoomNumbers.includes(num));

          occupied = [...occupied, ...occupiedForThisRoom];
        }

        setOccupiedRooms(occupied);
      } catch (err) {
        console.error('Booking API Error:', err.response?.data || err.message);
      }
    };

    fetchRooms();
  }, [checkIn, checkOut]); // refetch when dates change

  const isOccupied = (roomNumber) => occupiedRooms.includes(String(roomNumber));

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

        {/* Rooms */}
        {rooms.map((room) => (
          <div key={room._id} className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{room.type}</h2>
            <div className="flex flex-wrap gap-2">
              {room.rooms.map((r) => {
                let bgColor = 'bg-green-600'; // default available

                if (r.status === 'not_available') bgColor = 'bg-yellow-500';
                else if (isOccupied(r.roomNumber)) bgColor = 'bg-red-600';

                return (
                  <span
                    key={r.roomNumber}
                    className={`px-3 py-1 rounded-md text-white ${bgColor}`}
                  >
                    {r.roomNumber}
                  </span>
                );
              })}

            </div>
          </div>
        ))}

        {/* Legend */}
        <p className='flex items-center gap-2'><span className=' inline-block w-10 h-5 rounded-md bg-red-600'></span> - Booked</p>
        <p className='flex items-center gap-2'><span className=' inline-block w-10 h-5 rounded-md bg-green-600'></span> - Not Booked</p>
        <p className='flex items-center gap-2'><span className=' inline-block w-10 h-5 rounded-md bg-yellow-500 '></span> - Under Maintenance</p>
      </div>
    </div>
  );
};

export default RoomStatus;
