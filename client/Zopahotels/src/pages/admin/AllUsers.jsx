import React, { useEffect, useState } from 'react';
import { deleteUser, searchUsers } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import preloader from '../../assets/preloader.gif';
import Button from '../../components/Button';
import { API_URL } from '../../config';

const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const fetchUsers = async (page = 1, search = searchText) => {
    setLoading(true);
    try {
      const res = await searchUsers(token, search, page, pagination.limit);
      setAllUsers(res.users);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
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
          await deleteUser({ id, token });
          setAllUsers(allUsers.filter(user => user._id !== id));
          Swal.fire({ title: "Deleted!", text: "The client has been deleted.", icon: "success", timer: 2000, showConfirmButton: false });
        } catch (error) {
          Swal.fire({ title: "Error!", text: "Failed to delete client.", icon: "error", timer: 2000, showConfirmButton: false });
        }
      }
    });
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  const handleReset = () => {
    setSearchText('');
    fetchUsers(1, '');
  };

  const handleAddClient = () => navigate("/admin/add-client");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <img src={preloader} className="w-16" alt="preloader" />
      </div>
    );
  }
  console.log(allUsers)
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="text-2xl font-bold text-gray-800">All Customers</h2>
          <Button onClick={handleAddClient}>Add Customer</Button>
        </div>

        {/* Search & Reset */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border rounded px-4 py-2 flex-1"
          />
          <Button onClick={() => fetchUsers(1)}>Search</Button>
          <Button onClick={handleReset} className="bg-gray-500 hover:bg-gray-600">Reset</Button>
        </div>

        {allUsers.length === 0 ? (
          <p className="text-lg text-gray-600">No customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-sm">Image</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Bookings</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                    <td className="px-4 py-3 text-gray-600 text-sm"><img src={`${API_URL}uploads/profile-pictures/${user.profileImage}`} className='w-10' alt="prof" /></td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{user.phone}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{user.bookingCount || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/edit-user/${user._id}`)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Edit</button>
                        <button onClick={() => handleDeleteUser(user._id)} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1 rounded ${p === pagination.page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
