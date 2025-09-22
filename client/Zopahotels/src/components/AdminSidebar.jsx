import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { adminLogout } from "../api/authApi";
import { useHotel } from "../context/HotelContext";
import { API_URL } from "../config";

const AdminSidebar = () => {
  const {hotel,loading} = useHotel();
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const links = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/admin-rooms", label: "Rooms" },
    { to: "/admin/all-bookings", label: "Bookings" },
    { to: "/admin/all-users", label: "Clients" },
    { to: "/admin/all-admins", label: "Users" },
    { to: "/admin/booking-calender", label: "Calender" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/settings", label: "Settings" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md focus:outline-none"
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`h-screen w-64 bg-gray-800 text-white flex flex-col fixed top-0 left-0 transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-64 z-40`}
      >
        <div className="p-4 border-b border-gray-700">
          {hotel?(
            <img src={`${API_URL}uploads/${hotel.logo}`} className="w-50" alt="logo" />
          ):(
            <h1 className="text-xl font-bold">Admin Dashboard</h1>  
          )}
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `block p-2 rounded-md transition duration-200 ${
                      isActive ? "bg-blue-600 text-white" : "hover:bg-gray-700"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <NavLink
            to="/admin"
            className="block p-2 rounded-md hover:bg-red-600 transition duration-200"
            onClick={() => {
              setIsOpen(false);
              adminLogout();
            }}
          >
            Logout
          </NavLink>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
