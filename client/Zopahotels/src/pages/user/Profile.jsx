import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById } from "../../api/authApi";
import preloader from '../../assets/preloader.gif'
import { API_URL } from "../../config";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!token || !userData) {
        navigate("/login");
        return;
      }

      try {
        const data = await getUserById(userData.id, token);
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">No user data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          My Profile
        </h2>

        <div className="space-y-4">
          <div>
            <img 
              src={`${API_URL}uploads/profile-pictures/${user.profileImage}`} 
              alt="prof" 
              className="w-32"
            />
          </div>
          <div>
            <p className="text-gray-600 font-medium">Name</p>
            <p className="text-gray-800">{user.name}</p>
          </div>

          <div>
            <p className="text-gray-600 font-medium">Email</p>
            <p className="text-gray-800">{user.email}</p>
          </div>

          {user.phone && (
            <div>
              <p className="text-gray-600 font-medium">Phone</p>
              <p className="text-gray-800">{user.phone}</p>
            </div>
          )}

          {user.address && (
            <div>
              <p className="text-gray-600 font-medium">Address</p>
              <p className="text-gray-800">{user.address}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.city && (
              <div>
                <p className="text-gray-600 font-medium">City</p>
                <p className="text-gray-800">{user.city}</p>
              </div>
            )}
            {user.state && (
              <div>
                <p className="text-gray-600 font-medium">State</p>
                <p className="text-gray-800">{user.state}</p>
              </div>
            )}
            {user.country && (
              <div>
                <p className="text-gray-600 font-medium">Country</p>
                <p className="text-gray-800">{user.country}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/edit-profile")}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
