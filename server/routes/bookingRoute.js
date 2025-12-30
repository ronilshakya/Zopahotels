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
    searchBookings,
    getCheckedInBookings,
    getCheckedOutBookings,
    createDirectCheckIn,
    updateBookingStatus
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
router.get('/checked-in',auth,isAdmin, getCheckedInBookings);
router.get('/checked-out',auth,isAdmin, getCheckedOutBookings);
router.put('/update-booking-status',auth,isAdmin, updateBookingStatus);
router.post('/create-booking-admin',auth,isAdmin, createBookingAdmin);
router.post('/direct-check-in',auth, isAdmin, createDirectCheckIn);
router.get('/:id',auth,isAdmin, getBookingById);
router.put('/:id',auth, isAdmin, updateBooking);
router.delete('/:id',auth, isAdmin, deleteBooking);

module.exports = router;