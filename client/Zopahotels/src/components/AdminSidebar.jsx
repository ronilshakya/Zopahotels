import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { adminLogout } from "../api/authApi";
import { useHotel } from "../context/HotelContext";
import { API_URL } from "../config";
import { BiLogOut } from "react-icons/bi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdDashboard } from "react-icons/md";
import { FaRegCalendarCheck } from "react-icons/fa";
import { MdBedroomChild } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { MdDateRange } from "react-icons/md";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";
import { LuCalendarCheck2 } from "react-icons/lu";
import { LuCalendarArrowUp } from "react-icons/lu";
import { LuCalendarArrowDown } from "react-icons/lu";
import { FaHotel } from "react-icons/fa";
import { FaBath } from "react-icons/fa";
import { FaPaperPlane } from "react-icons/fa";
import { FaBed } from "react-icons/fa";
import { GrCatalog } from "react-icons/gr";
import { FaCashRegister } from "react-icons/fa";
import { FaFileInvoice } from "react-icons/fa";

const AdminSidebar = () => {
  const {hotel} = useHotel();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const user = JSON.parse(localStorage.getItem("adminUser"));

  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard size={20}/> },
    { to: "/admin/room-status", label: "Rooms Status", icon: <MdBedroomChild size={20}/> },
    { 
      label: "Bookings",
      icon: <FaRegCalendarCheck size={20}/>,
      submenu: [
        { to: "/admin/all-bookings", label: "Reservations" ,icon: <LuCalendarCheck2 size={20}/>},
        { to: "/admin/check-in", label: "Check-In" ,icon: <LuCalendarArrowUp size={20}/>},
        { to: "/admin/check-out", label: "Check-Out", icon: <LuCalendarArrowDown size={20}/>},
      ] 
    },
    { to: "/admin/pos-terminal", label: "POS Terminal", icon: <FaCashRegister size={20}/> },
    { to: "/admin/invoice-list", label: "Invoice List", icon: <FaFileInvoice  size={20}/> },
    { to: "/admin/all-users", label: "Customers", icon: <FaUsers size={20}/> },
    ...(user?.role === "admin" ? [{ to: "/admin/all-admins", label: "Users", icon: <RiAdminFill size={20}/> }] : []),
    { to: "/admin/booking-calender", label: "Calender", icon: <MdDateRange size={20}/> },
    { 
      label: "Reports",
      icon: <HiOutlineDocumentReport size={20}/>,
      submenu: [
        { to: "/admin/booking-reports", label: "Booking Report" ,icon: <HiOutlineDocumentReport size={20}/>},
        { to: "/admin/invoice-reports", label: "Invoice Report" ,icon: <HiOutlineDocumentReport size={20}/>},
      ] 
    },
    ...(user?.role === "admin"
    ? [
        {
          label: "Settings",
          submenu: [
            { to: "/admin/settings", label: "Hotel", icon: <FaHotel size={20}/> },
            { to: "/admin/amenities", label: "Amenities" , icon: <FaBath size={20}/> },
            { to: "/admin/booking-sources", label: "Booking Sources", icon: <FaPaperPlane size={20}/> },
            { to: "/admin/admin-rooms", label: "Rooms", icon: <FaBed size={20}/> },
            { to: "/admin/pos-catalog", label: "POS Catalog", icon: <GrCatalog size={20}/> },
          ],
          icon: <IoMdSettings size={20}/>,
        },
      ]
    : []),
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
        className={`h-screen w-64 bg-white overflow-y-scroll  text-black flex flex-col fixed top-0 left-0 transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-64 z-40`}
      >
        <div className="p-4 border-b border-gray-300">
          {hotel?(
            <img src={`${API_URL}uploads/${hotel.logo}`} className="w-50" alt="logo" />
          ):(
            <h1 className="text-xl font-bold">Admin Dashboard</h1>  
          )}
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">

            {links.map((link) => (
            <li key={link.to || link.label}>
              {link.submenu ? (
                <button
                  className={`flex w-full text-sm p-2 cursor-pointer h-10 font-semibold justify-between items-center rounded-md transition duration-200 appearance-none leading-none ${
                    openSubmenu === link.label ? "text-blue-800 bg-blue-100" : "hover:text-blue-800 hover:bg-blue-100 "
                  }`}
                  onClick={() =>
                    setOpenSubmenu(openSubmenu === link.label ? null : link.label)
                  }
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </div>
                  <RiArrowDropDownLine
                    size={30}
                    className={`transition-transform duration-200 ${
                      openSubmenu === link.label ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </button>
              ) : (
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex p-2 h-10 justify-between text-sm font-semibold items-center rounded-md transition duration-200 ${
                      isActive ? "text-blue-800 bg-blue-100" : "hover:text-blue-800 hover:bg-blue-100 "
                    }`
                  }
                  onClick={() => handleLinkClick(link)}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </div>
                </NavLink>
              )}

              {link.submenu && (
                <ul
                  className={`pl-4 mt-2 space-y-1 ${
                    openSubmenu === link.label ? "block" : "hidden"
                  }`}
                >
                  {link.submenu.map((sublink) => (
                    <li key={sublink.to}>
                      <NavLink
                        to={sublink.to}
                        className={({ isActive }) =>
                          `flex gap-2 items-center p-2 text-sm font-semibold rounded-md transition duration-200 ${
                            isActive ? "text-blue-800 bg-blue-100" : "hover:text-blue-800 hover:bg-blue-100 "
                          }`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        {sublink.icon}
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
        <div className="p-4 border-t border-gray-300">
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
