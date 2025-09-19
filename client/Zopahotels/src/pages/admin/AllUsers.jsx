import React, { useEffect, useState } from 'react';
import { deleteUser, getAllUsers } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import preloader from '../../assets/preloader.gif'

const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const handleEditUser = (id) => {
    navigate(`/admin/edit-user/${id}`);
  };

const handleDeleteUser = async (id) => {
  // Confirmation first
  Swal.fire({
    title: "Are you sure you want to delete this client?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteUser({id, token});
        setAllUsers(allUsers.filter(user => user._id !== id));

        Swal.fire({
          title: "Deleted!",
          text: "The client has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Failed to delete client:", error);

        // ✅ Auto-closing error alert
        Swal.fire({
          title: "Error!",
          text: "Failed to delete client. Try again.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  });
};
    

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers(token);
        setAllUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    );
  }

  if (allUsers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">No clients found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Clients</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-3 text-left font-semibold text-sm">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Bookings</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-4 py-3 text-gray-600 text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{user.phone}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{user.bookingCount}</td>
                  <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;