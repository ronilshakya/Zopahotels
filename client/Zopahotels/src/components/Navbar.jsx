import React, { useEffect, useState } from 'react';
import { logout } from '../api/authApi';
import { useNavigate, useLocation } from 'react-router-dom';
import {useHotel} from '../context/HotelContext'
import {API_URL} from '../config'

const Navbar = () => {
  const {hotel,loading} = useHotel();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!token && !!user);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    navigate('/');
  };

  const links = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/my-bookings', label: 'My Bookings' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            {hotel?(
              <img src={`${API_URL}uploads/${hotel.logo}`} className='w-32' alt="" />
            ):(
            <a href="/" className="text-2xl font-extrabold text-blue-600">
              Hotel<span className="text-indigo-500">Booking</span>
            </a>
            )}
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className={`relative px-3 py-2 font-medium text-gray-700 transition duration-200 ${
                  location.pathname === link.to
                    ? 'text-blue-600 after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-blue-600'
                    : 'hover:text-blue-600'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Login/Logout Button Desktop */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md focus:outline-none hover:bg-gray-100 transition duration-200"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg mx-2 my-1 p-3">
          <div className="space-y-2">
            {links.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className={`block px-4 py-2 rounded-md text-gray-700 font-medium transition duration-200 ${
                  location.pathname === link.to ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
