import React, { useEffect, useState } from "react";
import { getAllRooms, deleteRoom } from "../../api/roomApi";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import preloader from '../../assets/preloader.gif'

const API_URL = "http://api1.hotelnutopia.com";

const RoomsPage = () => {
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const handleAddRoom = () => navigate("/admin/add-room");
  const handleEditRoom = (id) => navigate(`/admin/edit-room/${id}`);



const handleDeleteRoom = async (id) => {
  // Confirmation with SweetAlert2
  Swal.fire({
    title: "Delete this room?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteRoom(id, token);
        setAllRooms(allRooms.filter((room) => room._id !== id));

        // Success alert
        Swal.fire({
          title: "Deleted!",
          text: "The room has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {

        Swal.fire({
          title: `Error!: ${error}`,
          text: "Failed to delete room. Try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  });
};


  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const rooms = await getAllRooms(token);
        setAllRooms(rooms);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [token]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">All Rooms</h2>
        <Button onClick={handleAddRoom} className="bg-green-600 hover:bg-green-700">
          Add Room
        </Button>
      </div>

      {allRooms.length === 0 ? (
        <p className="text-gray-500 text-center">No rooms available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allRooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <img
                src={`${API_URL}/uploads/${room?.images[0]}`}
                alt="Room"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{room.type}</h3>
                <p className="text-gray-600 mb-2">{room.description}</p>
                <p className="text-gray-800 font-bold mb-2">${room.price} / night</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.rooms.map((r) => (
                    <span
                      key={r.roomNumber}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {r.roomNumber}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRoom(room._id)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
