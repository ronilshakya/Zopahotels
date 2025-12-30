import React, { useEffect, useState } from 'react';
import { getAllRooms, updateRoomCleaningStatus } from '../../api/roomApi';
import { getAvailableRoomNumbersByDate, updateBookingStatus } from '../../api/bookingApi';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import preloader from '../../assets/preloader.gif';
import { FaUser } from "react-icons/fa";
import Swal from 'sweetalert2';
import { FaCalendar } from "react-icons/fa6";

const RoomStatus = () => {
  const [rooms, setRooms] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(dayjs().format('YYYY-MM-DD'));
  const [checkOut, setCheckOut] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  const fetchRooms = async () => {
    setLoading(true);
    try {

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

  useEffect(() => {
    fetchRooms();
  }, [checkIn, checkOut]);


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">

        {/* Date Inputs */}
        <div className="flex gap-2  text-md  mb-6">
          <div className='bg-gray-50 shadow flex items-center p-1 rounded-md gap-2'>
            <FaCalendar />{checkIn}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className=" flex items-center justify-center">
                <img src={preloader} className="w-16" alt="preloader" />
              </div>
        ) : (
          <>
            {/* Rooms */}
            {rooms.map((room) => (
              <div key={room._id} className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">{room.type}</h2>
                <div className="flex flex-wrap gap-2">
                  {room.rooms.map((r) => {
                    const occupied = occupiedRooms.find(o => o.roomNumber === r.roomNumber);
                    let bgColor = 'bg-green-600 hover:bg-green-700';
                    if (r.status === 'available') bgColor = 'bg-green-600 hover:bg-green-700';
                    if (r.status === 'not_available') bgColor = 'bg-red-600 hover:bg-red-700'; 
                    if (r.status === 'maintenance') bgColor = 'bg-yellow-500 hover:bg-yellow-600'; 
                    if (r.status === 'dirty') bgColor = 'bg-gray-500 hover:bg-gray-600'; 
                    if (r.status === 'cleaning_in_progress') bgColor = 'bg-blue-500 hover:bg-blue-600';

                    if (occupied) bgColor = 'bg-red-600 hover:bg-red-800';
                    return (
                    <div 
                      key={r.roomNumber} 
                      className={`flex flex-col items-center cursor-pointer`} 
                      onClick={() => 
                        {
                          Swal.fire({
                          title: `Room ${r.roomNumber} - ${room.type}`,
                          html: `
                            <div class="flex flex-col gap-2 text-left">
                              ${occupied ? `<button id="bookingDetails" class="swal2-confirm swal2-styled">Booking Details</button>` : ''}
                              ${r.status === 'dirty' ? '<button id="startCleaning" class="swal2-confirm swal2-styled">Start Cleaning</button>' : ''}
                              ${r.status === 'cleaning_in_progress' ? '<button id="finishCleaning" class="swal2-confirm swal2-styled">Finish Cleaning</button>' : ''}
                              ${r.status === 'not_available' ? '<button id="checkOut" class="swal2-confirm swal2-styled">Check-out</button>' : ''}
                              ${!occupied ? '<button id="checkIn" class="swal2-confirm swal2-styled">Check-in</button>':''}
                              
                            </div>
                          `,
                          showConfirmButton: false,
                          showCancelButton: true,
                          cancelButtonText: "Close",
                          didOpen: () => {
                            const popup = Swal.getPopup();
                            if (popup) {
                              const startBtn = popup.querySelector("#startCleaning");
                              if (startBtn) {
                                startBtn.addEventListener("click", async () => {
                                  await updateRoomCleaningStatus(r.roomNumber, "start_cleaning", token);
                                  await fetchRooms();
                                  Swal.close();
                                });
                              }
                              const finishBtn = popup.querySelector("#finishCleaning");
                              if (finishBtn) {
                                finishBtn.addEventListener("click", async () => {
                                  await updateRoomCleaningStatus(r.roomNumber, "finish_cleaning", token);
                                  await fetchRooms();
                                  Swal.close();
                                });
                              }
                              const checkoutBtn = popup.querySelector("#checkOut");
                              if (checkoutBtn) {
                                checkoutBtn.addEventListener("click", async () => {
                                  // await updateBookingStatus({token:token, payload:{bookingId:occupied.bookingId, newStatus:"checked_out"} });
                                  // await fetchRooms();
                                  navigate(`/admin/check-out-page/${occupied.bookingId}`);
                                  Swal.close();
                                });
                              }
                              const checkInBtn = popup.querySelector("#checkIn");
                              if (checkInBtn) {
                                checkInBtn.addEventListener("click", () => {
                                  navigate(`/admin/direct-check-in?roomNumber=${r.roomNumber}&roomType=${room.type}&roomId=${room._id}&checkIn=${checkIn}&checkOut=${checkOut}`);
                                  Swal.close();
                                });
                              }
                              const bookingBtn = popup.querySelector("#bookingDetails");
                              if (bookingBtn) {
                                bookingBtn.addEventListener("click", () => {
                                  navigate(`/admin/booking-details/${occupied.bookingId}`);
                                  Swal.close();
                                });
                              }
                            }
                          }
                        });
                        }
                      }
                    >
                          <span className={`px-3 py-1 relative rounded-lg flex flex-col gap-2 items-center text-white ${bgColor} h-28 w-28`}>
                            <span>{r.roomNumber}</span>
                            
                            <span className='border border-white rounded-lg p-1'>
                              {r.status === "available" && "Available"}
                              {r.status === "not_available" && "Occupied"}
                              {r.status === "maintenance" && "Maintenance"}
                              {r.status === "dirty" && "Dirty"}
                              {r.status === "cleaning_in_progress" && "Cleaning"}
                            </span>

                            {occupied && (
                              <span className="text-xs text-white font-semibold mt-1 flex items-center gap-1">
                                <FaUser /> {occupied.bookingName}
                              </span>
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