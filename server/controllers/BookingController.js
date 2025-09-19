const Booking = require("../models/Booking");
const Room = require("../models/Room");

exports.createBooking = async (req, res) => {
  try {
    const { rooms, checkIn, checkOut, adults, children } = req.body;
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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time to midnight for clean comparison

    if (checkInDate < today) {
      return res.status(400).json({ message: "Check-in date cannot be in the past" });
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

      if ((adults > roomDoc.adults) || (children > roomDoc.children)) {
        return res.status(400).json({ message: `Room ${roomDoc.type} cannot accommodate ${adults} adults and ${children} children` });
      }

      const conflictingBooking = await Booking.findOne({
        "rooms.roomId": r.roomId,
        "rooms.roomNumber": r.roomNumber,
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
        status: "pending"
      });

      if (conflictingBooking) {
        return res.status(400).json({ message: `Room ${r.roomNumber} of type ${roomDoc.type} is already booked for these dates` });
      }

      totalPrice += roomDoc.price * nights; 
    }

    const booking = await Booking.create({
      user: userId,
      rooms,
      checkIn,
      checkOut,
      adults,
      children,
      totalPrice,
      status: "pending" // pending since payment is physical
    });

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
    const { checkIn, checkOut, adults, children } = req.query;

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

    const rooms = await Room.find();
    const availableRooms = [];

    for (const room of rooms) {
      // check max adults and children
      if (room.adults >= parseInt(adults || 0) && room.children >= parseInt(children || 0)) {
        for (const r of room.rooms) {
          // Check if this specific room number is already booked
          const conflictingBooking = await Booking.findOne({
            rooms: {
              $elemMatch: {
                roomId: room._id,
                roomNumber: r.roomNumber
              }
            },
            status: { $in: ["pending", "confirmed"] },
            $or: [
              { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
              { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
              { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } }
            ]
          });

          if (!conflictingBooking) {
            availableRooms.push({
              roomId: room._id,
              type: room.type,
              roomNumber: r.roomNumber,
              pricePerNight: room.price,
              totalPrice: room.price * nights,
              nights,
              maxAdults: room.adults,
              maxChildren: room.children,
              maxOccupancy: room.maxOccupancy,
            });
          }
        }
      }
    }

    res.json({
      checkIn,
      checkOut,
      nights,
      requested: { adults, children },
      availableRooms
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }


    const allowedFields = ["rooms", "checkIn", "checkOut", "status", "adults", "children"];
    const updates = {};

    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    if (updates.checkIn || updates.checkOut || updates.rooms || updates.adults || updates.children) {
      const checkInDate = new Date(updates.checkIn || booking.checkIn);
      const checkOutDate = new Date(updates.checkOut || booking.checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

      if (nights <= 0) {
        return res.status(400).json({ message: "Check-out date must be after check-in date" });
      }

      const roomsToUpdate = updates.rooms || booking.rooms;
      let totalPrice = 0;

      for (const r of roomsToUpdate) {
        const roomDoc = await Room.findById(r.roomId);
        if (!roomDoc) {
          return res.status(404).json({ message: `Room with ID ${r.roomId} not found` });
        }

        const roomNumber = roomDoc.rooms.find(room => room.roomNumber === r.roomNumber);
        if (!roomNumber) {
          return res.status(400).json({ message: `Room number ${r.roomNumber} not found in ${roomDoc.type}` });
        }

        const adults = parseInt(updates.adults || booking.adults);
        const children = parseInt(updates.children || booking.children);
        if (adults > roomDoc.adults || children > roomDoc.children) {
          return res.status(400).json({ message: `Room ${roomDoc.type} cannot accommodate ${adults} adults and ${children} children` });
        }

        const conflictingBooking = await Booking.findOne({
          _id: { $ne: booking._id },
          "rooms.roomId": r.roomId,
          "rooms.roomNumber": r.roomNumber,
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
          status: { $in: ["pending", "confirmed"] }
        });
        if (conflictingBooking) {
          return res.status(400).json({ message: `Room ${r.roomNumber} of type ${roomDoc.type} is already booked for these dates` });
        }

        totalPrice += roomDoc.price * nights;
      }

      updates.totalPrice = totalPrice;
    }

    Object.assign(booking, updates);
    await booking.save();

    res.json({ message: "Booking updated", booking });
  } catch (error) {
    console.error('Error in updateBooking:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('rooms.roomId', 'type price');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error in getBookingById:', error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "From and To dates required" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const bookings = await Booking.find({
      checkIn: { $gte: fromDate },
      checkOut: { $lte: toDate }
    })
      .populate("user", "name email")
      .populate("rooms.roomId", "type price");

    // Summary calculations
    const summary = {
      totalBookings: bookings.length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      pending: bookings.filter(b => b.status === "pending").length,
      cancelled: bookings.filter(b => b.status === "cancelled").length,
      totalGuests: bookings.reduce((sum, b) => sum + b.adults + b.children, 0),
      revenue: bookings
        .filter(b => b.status === "confirmed")
        .reduce((sum, b) => sum + b.totalPrice, 0),
    };

    res.json({ summary, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
