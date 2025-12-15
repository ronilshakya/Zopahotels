const  mongoose  = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

exports.createBooking = async (req, res) => {
  try {
    const { 
      customerType, 
      guestFirstName, 
      guestLastName, 
      guestEmail,
      guestCity,
      guestZipCode,
      guestCountry, 
      guestPhone, 
      guestAddress, 
      rooms, 
      checkIn, 
      checkOut,
      children
    } = req.body;

    let userId = null;

    if (!customerType || !["Member", "Guest"].includes(customerType)) {
      return res.status(400).json({ message: "Invalid customer type" });
    }

    if (customerType === "Member") {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User authentication required for member bookings" });
      }
      userId = req.user.id;
    }

    if (customerType === "Guest") {
      if (!guestFirstName || !guestLastName || !guestCity || !guestCountry || !guestAddress) {
        return res.status(400).json({ message: "Guest name, city, country, and address are required" });
      }
      if (guestEmail && !/^\S+@\S+\.\S+$/.test(guestEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
    }

    if (!rooms || rooms.length === 0) {
      return res.status(400).json({ message: "At least one room type must be selected" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

    if (timeDiff <= 0) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return res.status(400).json({ message: "Check-in date cannot be in the past" });
    }

    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    let totalPrice = 0;
    const bookingRooms = [];

    for (const r of rooms) {
      const roomDoc = await Room.findById(r.roomId);
      if (!roomDoc) return res.status(404).json({ message: "Room type not found" });

      const quantity = Number(r.quantity || 1);

      // Capacity check
      // if ((r.adults + children) > roomDoc.maxOccupancy * quantity) {
      //   return res.status(400).json({
      //     message: `Room ${roomDoc.type} cannot accommodate ${r.adults} adults and ${children} children`
      //   });
      // }

      if (r.adults > roomDoc.adults || r.children > roomDoc.children) {
        return res.status(400).json({
          message: `Room ${roomDoc.type} cannot accommodate ${r.adults} adults and ${r.children} children`
        });
      }


      // Pricing lookup
      const pricingEntry = roomDoc.pricing.find(p => p.adults === r.adults);
      if (!pricingEntry) {
        return res.status(400).json({
          message: `No pricing defined for ${r.adults} adults in room type ${roomDoc.type}`
        });
      }

      totalPrice += pricingEntry.price * nights * quantity;

      for (let i = 0; i < quantity; i++) {
        bookingRooms.push({
          roomId: r.roomId,
          roomNumber: "Yet to be assigned",
        });
      }
    }

    const bookingData = {
      customerType,
      rooms: bookingRooms,
      checkIn,
      checkOut,
      totalPrice,
      status: "pending",
      numberOfRooms: rooms.reduce((sum, r) => sum + (Number(r.quantity) || 1), 0),
      bookingId: uuidv4().slice(0, 8)
    };

    if (customerType === "Member") bookingData.user = userId;
    if (customerType === "Guest") {
      Object.assign(bookingData, {
        guestFirstName,
        guestLastName,
        guestEmail,
        guestCity,
        guestZipCode,
        guestCountry,
        guestPhone,
        guestAddress
      });
    }

    const booking = await Booking.create(bookingData);

    res.status(201).json({ message: "Booking created", booking });

  } catch (error) {
    console.error("createBooking error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.createBookingAdmin = async (req, res) => {
  try {
    const { 
      customerType, 
      userId, 
      guestFirstName, 
      guestLastName, 
      guestEmail, 
      guestPhone, 
      guestAddress, 
      guestCity, 
      guestZipCode, 
      guestCountry, 
      rooms,   // now each room should include adults/children
      checkIn, 
      checkOut, 
      bookingSource 
    } = req.body;

    // Validate customer type
    if (!customerType || !["Member", "Guest"].includes(customerType)) {
      return res.status(400).json({ message: "Customer type must be Member or Guest" });
    }

    // Validate user/guest info
    if (customerType === "Member" && !userId) {
      return res.status(400).json({ message: "User ID is required for members" });
    }
    if (customerType === "Guest") {
      if (!guestFirstName || !guestLastName) {
        return res.status(400).json({ message: "Guest first name and last name required" });
      }
      if (guestEmail && !/^\S+@\S+\.\S+$/.test(guestEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      let existingMember = null;
      if (guestEmail || guestPhone) {
        const conditions = [];
        if (guestEmail) conditions.push({ email: guestEmail });
        if (guestPhone) conditions.push({ phone: guestPhone });
        existingMember = await User.findOne({ $or: conditions });
      }
      if (existingMember) {
        return res.status(400).json({ message: "Guest email or phone matches an existing member account" });
      }
    }

    if (!rooms || rooms.length === 0) {
      return res.status(400).json({ message: "At least one room type must be selected" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

    if (timeDiff <= 0) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // if (checkInDate < today) {
    //   return res.status(400).json({ message: "Check-in date cannot be in the past" });
    // }

    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    let totalPrice = 0;
    const bookingRooms = [];

    for (const r of rooms) {
  const roomDoc = await Room.findById(r.roomId);
  if (!roomDoc) return res.status(404).json({ message: "Room type not found" });

  const quantity = Number(r.quantity || 1);
  const adults = Number(r.adults || 1);
  const children = Number(r.children || 0);

  // Capacity check per room
  // if (adults + children > roomDoc.maxOccupancy) {
  //   return res.status(400).json({ message: `Room ${roomDoc.type} cannot accommodate ${adults} adults and ${children} children` });
  // }

  if (r.adults > roomDoc.adults || r.children > roomDoc.children) {
    return res.status(400).json({
      message: `Room ${roomDoc.type} cannot accommodate ${r.adults} adults and ${r.children} children`
    });
  }

  // Pricing lookup per room
  const pricingEntry = roomDoc.pricing.find(p => p.adults === adults);
  if (!pricingEntry) {
    return res.status(400).json({ message: `No pricing defined for ${adults} adults in room type ${roomDoc.type}` });
  }

  totalPrice += pricingEntry.price * nights * quantity;

  // Check for duplicate room numbers in the booking payload
// const assignedNumbers = new Set();
// for (const r of bookingRooms) {
//   const key = `${r.roomId}_${r.roomNumber}`;
//   if (assignedNumbers.has(key)) {
//     return res.status(400).json({
//       message: `Room number ${r.roomNumber} of type ${r.roomId} is already assigned in this booking`
//     });
//   }
//   assignedNumbers.add(key);
// }


  // Expand into multiple bookingRooms entries
  for (let i = 0; i < quantity; i++) {
    bookingRooms.push({
      roomId: r.roomId,
      roomNumber: "Yet to be assigned",
      adults,
      children
    });
  }
}


    const bookingPayload = {
      customerType,
      rooms: bookingRooms,
      checkIn,
      checkOut,
      totalPrice,
      status: "pending",
      numberOfRooms: rooms.length,
      bookingId: uuidv4().slice(0, 8),
      bookingSource
    };

    if (customerType === "Member") {
      bookingPayload.user = userId;
    } else {
      Object.assign(bookingPayload, {
        guestFirstName,
        guestLastName,
        guestEmail,
        guestCity,
        guestZipCode,
        guestCountry,
        guestPhone,
        guestAddress
      });
    }

    const booking = await Booking.create(bookingPayload);
    res.status(201).json({ message: "Booking created by admin", booking });

  } catch (error) {
    console.error("Admin createBooking error:", error.message);
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
    const timeDiff = checkOutDate - checkInDate;

    if (timeDiff <= 0) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const rooms = await Room.find();
    const availableRooms = [];

    for (const room of rooms) {
      const freeRoomNumbers = [];

      for (const r of room.rooms) {
        const conflictingBooking = await Booking.findOne({
          "rooms.roomId": room._id,
          "rooms.roomNumber": r.roomNumber,
          status: { $in: ["pending", "confirmed"] },
          $or: [
            { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
            { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
            { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } }
          ]
        }).lean();

        if (!conflictingBooking) {
          // ✅ Use per-room adults/children instead of global
          const adultsCount = parseInt(adults, 10) || 1;
          const childrenCount = parseInt(children, 10) || 0;

          // if (adultsCount + childrenCount <= room.maxOccupancy) {
          if (childrenCount <= room.children) {
            const pricingEntry = room.pricing.find(p => p.adults >= adultsCount);
            if (pricingEntry) {
              freeRoomNumbers.push({
                roomNumber: r.roomNumber,
                adults: adultsCount,
                children: childrenCount,
                pricePerNight: pricingEntry.price,
                totalPrice: pricingEntry.price * nights
              });
            }
          }
        }
      }

      if (freeRoomNumbers.length > 0) {
        availableRooms.push({
          roomId: room._id,
          type: room.type,
          nights,
          maxOccupancy: room.maxOccupancy,
          children: room.children,
          availableRoomNumbers: freeRoomNumbers
        });
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
    console.error("Error in getAvailableRooms:", error.message);
    res.status(500).json({ message: error.message });
  }
};




exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    let allowedFields = ["rooms", "checkIn", "checkOut", "status", "bookingSource"];
    if (booking.customerType === "Guest") {
      allowedFields = allowedFields.concat([
        "guestFirstName",
        "guestLastName",
        "guestEmail",
        "guestPhone",
        "guestAddress",
        "guestCity",
        "guestZipCode",
        "guestCountry"
      ]);
    }

    const updates = {};
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    // Guest validation
    if (booking.customerType === "Guest") {
      if (updates.guestEmail || updates.guestPhone) {
        const conflictMember = await User.findOne({
          $or: [
            updates.guestEmail ? { email: updates.guestEmail } : null,
            updates.guestPhone ? { phone: updates.guestPhone } : null
          ].filter(Boolean)
        });
        if (conflictMember) {
          return res.status(400).json({
            message: "Guest email or phone cannot match an existing member account"
          });
        }
      }
    }

    // If dates/rooms changed, recalc totalPrice
    if (updates.checkIn || updates.checkOut || updates.rooms) {
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
        if (!roomDoc) return res.status(404).json({ message: `Room with ID ${r.roomId} not found` });

        const adultsCount = Number(r.adults || 1);
        const childrenCount = Number(r.children || 0);
        const quantity = Number(r.quantity || 1);

        // Availability check if room number assigned
        if (r.roomNumber && r.roomNumber !== "Yet to be assigned") {
          const roomNumberExists = roomDoc.rooms.find(room => room.roomNumber === r.roomNumber);
          if (!roomNumberExists) {
            return res.status(400).json({ message: `Room number ${r.roomNumber} not found in ${roomDoc.type}` });
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
        }

        // Capacity check per room
        if (adultsCount + childrenCount > roomDoc.maxOccupancy) {
          return res.status(400).json({
            message: `Room ${roomDoc.type} cannot accommodate ${adultsCount} adults and ${childrenCount} children`
          });
        }

        // Pricing lookup per room
        const pricingEntry = roomDoc.pricing.find(p => p.adults === adultsCount);
        if (!pricingEntry) {
          return res.status(400).json({
            message: `No pricing defined for ${adultsCount} adults in room type ${roomDoc.type}`
          });
        }

        totalPrice += pricingEntry.price * nights * quantity;
      }

      updates.totalPrice = totalPrice;
      updates.numberOfRooms = roomsToUpdate.reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);
    }

    Object.assign(booking, updates);
    await booking.save();

    res.json({ message: "Booking updated", booking });
  } catch (error) {
    console.error("Error in updateBooking:", error.message);
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
      .populate('user', 'name email phone')
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

exports.getAvailableRoomNumbers = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, bookingId } = req.query;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ message: "roomId, checkIn, and checkOut are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const roomDoc = await Room.findById(roomId);
    if (!roomDoc) return res.status(404).json({ message: "Room not found" });

    // Prepare rooms with actual DB statuses (NOT booked)
    const allRooms = roomDoc.rooms.map(r => ({
      number: r.roomNumber,
      status: r.status || "available"
    }));

    // Find overlapping booked rooms
    const overlappingBookedNumbers = await Booking.find({
      _id: { $ne: bookingId || null },
      "rooms.roomId": roomId,
      "rooms.roomNumber": { $in: allRooms.map(r => r.number) },
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } } // THIS is correct overlap logic
      ]
    }).distinct("rooms.roomNumber");

    // Remove entries that:
    // 1) are room.status = "not_available"
    // 2) are in overlapping bookings
    const availableRooms = allRooms.filter(r =>
      r.status !== "not_available" &&
      !overlappingBookedNumbers.includes(r.number)
    );

    return res.json({ availableRoomNumbers: availableRooms });

  } catch (error) {
    console.error("getAvailableRoomNumbers error:", error);
    return res.status(500).json({ message: error.message });
  }
};



exports.getAvailableRoomNumbersByDate = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ message: "roomId, checkIn, and checkOut are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    // 1️⃣ Fetch the room document
    const roomDoc = await Room.findById(roomId);
    if (!roomDoc) return res.status(404).json({ message: "Room type not found" });

    // 2️⃣ Get all room numbers for this room type
    const allRoomNumbers = roomDoc.rooms.map(r => r.roomNumber);

    // 3️⃣ Find booked room numbers in the given date range
    const bookedNumbers = await Booking.find({
      "rooms.roomId": roomId,
      "rooms.roomNumber": { $in: allRoomNumbers },
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
      ],
    }).distinct("rooms.roomNumber");

    // 4️⃣ Compute available room numbers
    const availableRoomNumbers = allRoomNumbers.filter(num => !bookedNumbers.includes(num));

    res.json({ availableRoomNumbers });
  } catch (error) {
    console.error("Error in getAvailableRoomNumbers:", error.message);
    res.status(500).json({ message: error.message });
  }
};




exports.searchBookings = async (req, res) => {
  try {
    const { search = "", startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    let query = {};

    // Text search
    if (search) {
      // Member search
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ]
      }).select("_id");

      const memberOrGuestQuery = [];

      // Member bookings
      const memberQuery = { customerType: "Member" };
      const memberSearchConditions = [];

      memberSearchConditions.push({ bookingId: { $regex: search, $options: "i" } });

      if (users.length > 0) {
        memberSearchConditions.push({ user: { $in: users.map(u => u._id) } });
      }

      memberQuery.$or = memberSearchConditions;
      memberOrGuestQuery.push(memberQuery);

      // Guest bookings
      const guestQuery = {
        customerType: "Guest",
        $or: [
          { bookingId: { $regex: search, $options: "i" } },
          { guestFirstName: { $regex: search, $options: "i" } },
          { guestLastName: { $regex: search, $options: "i" } },
          { guestPhone: { $regex: search, $options: "i" } },
          { guestEmail: { $regex: search, $options: "i" } },
        ]
      };
      memberOrGuestQuery.push(guestQuery);

      query.$or = memberOrGuestQuery;
    }

    // Date filtering
    if (startDate) {
      const start = new Date(startDate);
      let end;
      if (endDate) {
        end = new Date(endDate);
      } else {
        end = new Date(start);
        end.setDate(end.getDate() + 1);
      }

      query.$and = query.$and || [];
      query.$and.push({
        checkIn: { $lt: end },
        checkOut: { $gt: start }
      });
    }

    // If search is empty, just show all bookings
    if (!search && !startDate) {
      query = {};
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("user", "name phone")
      .populate("rooms.roomId", "type price")
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    res.status(200).json({
      bookings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Booking Fetch Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

