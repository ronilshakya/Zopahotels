const Booking = require("../models/Booking");
const Room = require("../models/Room");

exports.createBooking = async (req, res) => {
  try {
    const { rooms, checkIn, checkOut } = req.body;
    const userId = req.user.id;

    if (!rooms || rooms.length === 0) {
      return res.status(400).json({ message: "At least one room must be selected" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

    if (timeDiff <= 0) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let totalPrice = 0;

    for (const r of rooms) {
      const roomDoc = await Room.findById(r.roomId);
      if (!roomDoc) return res.status(404).json({ message: "Room type not found" });

      const roomNumber = roomDoc.rooms.find(room => room.roomNumber === r.roomNumber);
      if (!roomNumber) {
        return res.status(400).json({ message: `Room number ${r.roomNumber} not found in ${roomDoc.type}` });
      }

      const conflictingBooking = await Booking.findOne({
        "rooms.roomId": r.roomId,
        "rooms.roomNumber": r.roomNumber,
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
        status: "confirmed"
      });

      if (conflictingBooking) {
        return res.status(400).json({ message: `Room ${r.roomNumber} of type ${roomDoc.type} is already booked for these dates` });
      }

      // if (!roomNumber.available) {
      //   return res.status(400).json({ message: `Room ${r.roomNumber} of type ${roomDoc.type} is not available` });
      // }

      totalPrice += roomDoc.price * nights; 
    }

    const booking = await Booking.create({
      user: userId,
      rooms,
      checkIn,
      checkOut,
      totalPrice,
      status: "confirmed"
    });

    // for (const r of rooms) {
    //   await Room.updateOne(
    //     { _id: r.roomId, "rooms.roomNumber": r.roomNumber },
    //     { $set: { "rooms.$.available": false } }
    //   );
    // }

    res.status(201).json({ message: "Booking created", booking });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('rooms.roomId', 'type price');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('user', 'name email').populate('rooms.roomId', 'type price');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "Check-in and check-out dates are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

    if (timeDiff <= 0) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Get all rooms
    const rooms = await Room.find();

    const availableRooms = [];

    for (const room of rooms) {
      for (const r of room.rooms) {
        // Check if this room number is booked during the given period
        const conflictingBooking = await Booking.findOne({
          "rooms.roomId": room._id,
          "rooms.roomNumber": r.roomNumber,
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
          status: "confirmed"
        });

        if (!conflictingBooking) {
          availableRooms.push({
            roomId: room._id,
            type: room.type,
            roomNumber: r.roomNumber,
            pricePerNight: room.price,
            totalPrice: room.price * nights,
            nights
          });
        }
      }
    }

    res.json({ checkIn, checkOut, nights, availableRooms });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};