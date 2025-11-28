import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { adminLogout } from "../api/authApi";
import { useHotel } from "../context/HotelContext";
import { API_URL } from "../config";
import { BiLogOut } from "react-icons/bi";
import { RiArrowDropDownLine } from "react-icons/ri";

const AdminSidebar = () => {
  const {hotel} = useHotel();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const links = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/room-status", label: "Rooms Status" },
    { to: "/admin/all-bookings", label: "Bookings" },
    { to: "/admin/all-users", label: "Customers" },
    { to: "/admin/all-admins", label: "Users" },
    { to: "/admin/booking-calender", label: "Calender" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/settings", label: "Settings", 
      submenu: [
        { to: "/admin/amenities", label: "Amenities" },
        { to: "/admin/booking-sources", label: "Booking Sources" },
        { to: "/admin/admin-rooms", label: "Rooms" },
      ] 
    },
  ];

  //  const toggleSubmenu = (linkTo) => {
  //   setOpenSubmenu(openSubmenu === linkTo ? null : linkTo);
  // };

  const handleLinkClick = (link) => {
    if (link.submenu) {
      // Toggle submenu
      setOpenSubmenu(openSubmenu === link.to ? null : link.to);
    } else {
      // Close submenu when clicking other links
      setOpenSubmenu(null);
      setIsOpen(false); // close mobile sidebar
    }
  };
  
  return (
    <>
    <div className="top-0 max-md:h-20 right-0 left-0 bg-white max-md:fixed relative z-20 flex items-center">
      {/* Mobile Toggle Button */}
      {hotel && (
        <img src={`${API_URL}uploads/${hotel.logo}`} className="w-32 md:hidden ml-4" alt="logo" />
      )}
      <button
        className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-gray-800 text-white rounded-md focus:outline-none"
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 z-50"
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
            className="w-6 h-6 z-50"
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
      </div>

      {/* Sidebar */}
      <div
        className={`h-screen w-64 bg-white overflow-y-scroll text-black flex flex-col fixed top-0 left-0 transition-transform duration-300 ease-in-out transform ${
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
        `flex p-2 justify-between items-center rounded-md transition duration-200 ${
          isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"
        }`
      }
      onClick={() => handleLinkClick(link)}
    >
      {link.label}
      {link.submenu && (
      <RiArrowDropDownLine
        size={30}
        className={`transition-transform duration-200 ${
          openSubmenu === link.to ? "-rotate-90" : "rotate-0"
        }`}
      />
)}

    </NavLink>

      {link.submenu && (
        <ul className={`pl-4 mt-2 space-y-1 ${openSubmenu === link.to ? "block" : "hidden"}`}>
          {link.submenu.map((sublink) => (
            <li key={sublink.to}>
              <NavLink
                to={sublink.to}
                className={({ isActive }) =>
                  `block p-2 rounded-md transition duration-200 ${
                    isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {sublink.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  ))}

          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <NavLink
            to="/admin"
            className="flex items-center gap-2 p-2 rounded-md text-white bg-red-500 hover:bg-red-600 transition duration-200"
            onClick={() => {
              setIsOpen(false);
              adminLogout();
            }}
          >
            <BiLogOut size={20}/> Logout
          </NavLink>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 bg-opacity-50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
