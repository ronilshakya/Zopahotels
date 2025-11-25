const express = require('express');
const router = express.Router();
const {
    createBooking, 
    getMyBookings, 
    getAllBookings, 
    getAvailableRooms, 
    updateBooking, 
    deleteBooking, 
    getBookingById, 
    getReport,
    getAvailableRoomNumbers,
    getAvailableRoomNumbersByDate,
    createBookingAdmin,
    searchBookings
} = require("../controllers/BookingController");
const {auth, isAdmin} = require("../middleware/authMiddleware");

router.get('/available-room-numbers-by-date', getAvailableRoomNumbersByDate);
router.get('/available', getAvailableRooms);
router.get('/available-room-numbers', getAvailableRoomNumbers);
router.get("/get-report", getReport);
router.get('/me',auth, getMyBookings);

router.post('/',auth, createBooking);
router.get('/',auth,isAdmin, getAllBookings);
router.get('/search-bookings',auth,isAdmin, searchBookings);
router.post('/create-booking-admin',auth,isAdmin, createBookingAdmin);
router.get('/:id',auth,isAdmin, getBookingById);
router.put('/:id',auth, isAdmin, updateBooking);
router.delete('/:id',auth, isAdmin, deleteBooking);

module.exports = router;