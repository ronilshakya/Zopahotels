import React, { useEffect, useState } from 'react';
import { deleteUser, getAllAdmins } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import preloader from '../../assets/preloader.gif'
import Button from '../../components/Button'
import { API_URL } from '../../config';
const AllAdmins = () => {
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false)

  const handleEditUser = (id) => {
    navigate(`/admin/edit-user/${id}`);
  };

  const handleAddAdmin= () => navigate("/admin/add-admin");

    const handleDeleteUser = async (id) => {
      // Confirmation first
      Swal.fire({
        title: "Are you sure you want to delete this admin?",
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
            setAllAdmins(allAdmins.filter(user => user._id !== id));
    
            Swal.fire({
              title: "Deleted!",
              text: "The admin has been deleted.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          } catch (error) {
            console.error("Failed to delete admin:", error);
    
            // ✅ Auto-closing error alert
            Swal.fire({
              title: "Error!",
              text: "Failed to delete admin. Try again.",
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
        const data = await getAllAdmins(token);
        setAllAdmins(data);
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


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-baseline">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Admins</h2>
          <Button onClick={handleAddAdmin}>Add Admin</Button>
        </div>
        {allAdmins.length === 0 ? (
          <p className="text-lg text-gray-600">No admins found.</p>
        ) : (

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-3 text-left font-semibold text-sm">Image</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allAdmins.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    <a
                      href={`${API_URL}uploads/profile-pictures/${user.profileImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {!imgLoaded && (
                        <img 
                          src={preloader} 
                          className='w-10 h-10 object-cover rounded-full'
                           alt="prof" 
                        />
                      )}
                      <img 
                        src={`${API_URL}uploads/profile-pictures/${user.profileImage}`} 
                        className={ `w-10 h-10 object-cover rounded-full ${imgLoaded ? 'block' : 'hidden'}`}
                         alt="prof" 
                         onLoad={()=>setImgLoaded(true)}
                      />
                      </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{user.role}</td>
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
        )}
      </div>
    </div>
  );
};

export default AllAdmins;