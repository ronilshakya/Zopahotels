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
    getAvailableRoomNumbers
} = require("../controllers/BookingController");
const {auth, isAdmin} = require("../middleware/authMiddleware");

router.get('/available', getAvailableRooms);
router.get('/available-room-numbers', getAvailableRoomNumbers);
router.get("/get-report", getReport);

router.post('/',auth, createBooking);
router.get('/me',auth, getMyBookings);
router.get('/:id',auth,isAdmin, getBookingById);
router.get('/',auth,isAdmin, getAllBookings);
router.put('/:id',auth, isAdmin, updateBooking);
router.delete('/:id',auth, isAdmin, deleteBooking);

module.exports = router;