import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminSidebar from './components/AdminSidebar';
import SearchRoomsPage from './pages/user/SearchRoomsPage';
import AvailableRoomsPage from './pages/user/AvailableRooms';
import SingleRoomPage from './pages/user/SingleRoomPage';
import Login from './pages/user/Login';
import MyBookingsPage from './pages/user/MyBookingsPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProtectedRoute from './pages/AdminProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './pages/AdminLayout';
import UserLayout from './pages/UserLayout';
import RoomsPage from './pages/admin/RoomsPage';
import AddRoom from './pages/admin/AddRoom';
import EditRoomPage from './pages/admin/EditRoomPage';
import AllBookings from './pages/admin/AllBookings';
import AllUsers from './pages/admin/AllUsers';
import AdminAddBooking from './pages/admin/AdminAddBooking';
import EditBooking from './pages/admin/EditBooking';
import AllAdmins from './pages/admin/AllAdmins';
import Signup from './pages/user/Signup';
import EditUser from './pages/admin/EditUser'
import BookingCalendar from './pages/admin/BookingCalender';
import ReportsPage from './pages/admin/ReportsPage';
import Rooms from './pages/user/Rooms';
import Profile from './pages/user/Profile';
import EditProfile from './pages/user/EditProfile';

export default function App() {
  return (
      <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route element={<UserLayout />}>
                <Route path="/" element={<SearchRoomsPage />} />
                <Route path="/available-rooms" element={<AvailableRoomsPage />} />
                <Route path="/room/:id" element={<SingleRoomPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
              </Route>

              <Route path="/admin" element={<AdminLogin />} />

              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="admin-rooms" element={<RoomsPage />} />
                  <Route path="add-room" element={<AddRoom />} />
                  <Route path="edit-room/:id" element={<EditRoomPage />} />
                  <Route path="all-bookings" element={<AllBookings />} />
                  <Route path="all-users" element={<AllUsers />} />
                  <Route path="add-booking" element={<AdminAddBooking />} />
                  <Route path="edit-booking/:id" element={<EditBooking />} />
                  <Route path="all-admins" element={<AllAdmins />} />
                  <Route path="edit-user/:id" element={<EditUser />} />
                  <Route path="booking-calender" element={<BookingCalendar />} />
                  <Route path="reports" element={<ReportsPage />} />
              </Route>
            </Routes>
      </Router>
  );
}
