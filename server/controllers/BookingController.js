const  mongoose  = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const Hotel = require("../models/Hotel");
const { v4: uuidv4 } = require("uuid");

const buildDateTime = (dateStr, timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
};


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

    const hotel = await Hotel.findOne();
    if (!hotel || !hotel.arrivalTime || !hotel.departureTime) {
      return res.status(400).json({
        message: "Hotel arrival and departure time not configured"
      });
    }


    if (!rooms || rooms.length === 0) {
      return res.status(400).json({ message: "At least one room type must be selected" });
    }

    const checkInDate = buildDateTime(checkIn, hotel.arrivalTime);
    const checkOutDate = buildDateTime(checkOut, hotel.departureTime);

    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

    if (timeDiff <= 0) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({ message: "Check-in date cannot be in the past" });
    }

    const nights = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    let totalPrice = 0;
    const bookingRooms = [];

    for (const r of rooms) {
      const roomDoc = await Room.findById(r.roomId);
      if (!roomDoc) return res.status(404).json({ message: "Room type not found" });

      const quantity = Number(r.quantity || 1);

      // Capacity check
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
      checkIn: checkInDate,
      checkOut: checkOutDate,
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

    const hotel = await Hotel.findOne();
    if (!hotel || !hotel.arrivalTime || !hotel.departureTime) {
      return res.status(400).json({
        message: "Hotel arrival and departure time not configured"
      });
    }


    if (!rooms || rooms.length === 0) {
      return res.status(400).json({ message: "At least one room type must be selected" });
    }

    const checkInDate = buildDateTime(checkIn, hotel.arrivalTime);
    const checkOutDate = buildDateTime(checkOut, hotel.departureTime);

    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

    if (timeDiff <= 0) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // if (checkInDate < today) {
    //   return res.status(400).json({ message: "Check-in date cannot be in the past" });
    // }

    // const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const nights = Math.round(
      (new Date(checkOut) - new Date(checkIn)) / MS_PER_DAY
    );

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
      checkIn: checkInDate,
      checkOut: checkOutDate,
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
    const hotel = await Hotel.findOne();
    if (!hotel || !hotel.arrivalTime || !hotel.departureTime) {
      return res.status(400).json({
        message: "Hotel arrival and departure time not configured"
      });
    }


    const checkInDate = buildDateTime(checkIn, hotel.arrivalTime);
  const checkOutDate = buildDateTime(checkOut, hotel.departureTime);

    const timeDiff = checkOutDate - checkInDate;

    if (timeDiff <= 0) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    // const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const nights = Math.round(
      (new Date(checkOut) - new Date(checkIn)) / MS_PER_DAY
    );

    const rooms = await Room.find();
    const availableRooms = [];

    for (const room of rooms) {
      const freeRoomNumbers = [];

      for (const r of room.rooms) {
        const conflictingBooking = await Booking.findOne({
          "rooms.roomId": room._id,
          "rooms.roomNumber": r.roomNumber,
          status: { $in: ["pending", "confirmed", "checked_in"] },
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }

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
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const allowedFields = ["checkIn", "checkOut", "status", "bookingSource"];
    if (booking.customerType === "Guest") {
      allowedFields.push(
        "guestFirstName", "guestLastName", "guestEmail", "guestPhone",
        "guestAddress", "guestCity", "guestZipCode", "guestCountry"
      );
    }

    // Filter updates
    const updates = {};
    allowedFields.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    // Guest email/phone conflict check
    if (booking.customerType === "Guest" && (updates.guestEmail || updates.guestPhone)) {
      const conflict = await User.findOne({
        $or: [
          updates.guestEmail ? { email: updates.guestEmail } : null,
          updates.guestPhone ? { phone: updates.guestPhone } : null
        ].filter(Boolean)
      });
      if (conflict) {
        return res.status(400).json({ message: "Guest email or phone cannot match an existing member account" });
      }
    }

    // Check-in/check-out validation
    const hotel = await Hotel.findOne();
      if (!hotel) {
        return res.status(400).json({ message: "Hotel settings missing" });
      }

     const checkInDate = updates.checkIn
  ? buildDateTime(updates.checkIn, hotel.arrivalTime)
  : booking.checkIn;

const checkOutDate = updates.checkOut
  ? buildDateTime(updates.checkOut, hotel.departureTime)
  : booking.checkOut;




    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const nights = Math.round(
      (checkOutDate - checkInDate) / MS_PER_DAY
    );

    if (nights <= 0) return res.status(400).json({ message: "Check-out must be after check-in" });

    // Rooms handling
    if (req.body.rooms) {
      const updatedRooms = [];

      for (const r of req.body.rooms) {
        const roomDoc = await Room.findById(r.roomId);
        if (!roomDoc) return res.status(404).json({ message: `Room ${r.roomId} not found` });

        const adults = Number(r.adults || 1);
        const children = Number(r.children || 0);
        const roomNumber = r.roomNumber || "Yet to be assigned";

        // Check room capacity
        if (adults > roomDoc.adults || children > roomDoc.children) {
          return res.status(400).json({
            message: `Room ${roomDoc.type} cannot accommodate ${adults} adults and ${children} children`
          });
        }

        // Check roomNumber conflicts
       if (roomNumber !== "Yet to be assigned") {
          const conflict = await Booking.findOne({
            _id: { $ne: booking._id },
            "rooms.roomId": r.roomId,
            "rooms.roomNumber": roomNumber,
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate },
            status: { $in: ["pending", "confirmed", "checked_in"] }
          });
          if (conflict) 
            return res.status(400).json({ message: `Room ${roomNumber} is already booked for these dates` });
        }


        updatedRooms.push({ roomId: r.roomId, roomNumber, adults, children });
      }

      booking.rooms = updatedRooms;
      booking.numberOfRooms = updatedRooms.length;

      // ✅ Calculate totalPrice
      let totalPrice = 0;
      for (const r of updatedRooms) {
        const roomDoc = await Room.findById(r.roomId);
        const pricingEntry = roomDoc.pricing.find(p => p.adults === r.adults);
        if (!pricingEntry) return res.status(400).json({ message: `No pricing for ${r.adults} adults in room ${roomDoc.type}` });
        totalPrice += pricingEntry.price * nights;
      }
      booking.totalPrice = totalPrice;
    }

    // Apply checkIn/checkOut separately
    if (updates.checkIn) booking.checkIn = checkInDate;
    if (updates.checkOut) booking.checkOut = checkOutDate;

    // Apply other updates
    const otherFields = { ...updates };
    delete otherFields.checkIn;
    delete otherFields.checkOut;
    Object.assign(booking, otherFields);


    await booking.save();
    res.json({ message: "Booking updated successfully", booking });

  } catch (error) {
    console.error("Error in updateBooking:", error);
    res.status(500).json({ message: error.message });
  }
};





exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.rooms && booking.rooms.length > 0) { 
      await Room.updateMany( 
        { "rooms.roomNumber": { $in: booking.rooms.map(r => r.roomNumber) } }, 
        { $set: { "rooms.$[elem].status": "available" } }, 
        { arrayFilters: [{ "elem.roomNumber": { $in: booking.rooms.map(r => r.roomNumber) } }] } 
      ); 
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

    const hotel = await Hotel.findOne();
    if (!hotel || !hotel.arrivalTime || !hotel.departureTime) {
      return res.status(400).json({
        message: "Hotel arrival and departure time not configured"
      });
    }

    const checkInDate = buildDateTime(checkIn, hotel.arrivalTime);
    const checkOutDate = buildDateTime(checkOut, hotel.departureTime);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const roomDoc = await Room.findById(roomId);
    if (!roomDoc) return res.status(404).json({ message: "Room not found" });

    const allRooms = roomDoc.rooms.map(r => ({
      number: r.roomNumber,
      status: r.status || "available"
    }));

    // ✅ Correct overlap logic: room is blocked until departure time
    const overlappingBookedNumbers = await Booking.find({
      _id: { $ne: bookingId || null },
      "rooms.roomId": roomId,
      "rooms.roomNumber": { $in: allRooms.map(r => r.number) },
      status: { $in: ["pending", "confirmed", "checked_in"] },
      checkIn: { $lt: checkOutDate }, 
      checkOut: { $gt: checkInDate } 
    }).distinct("rooms.roomNumber");

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

    const hotel = await Hotel.findOne();
    if (!hotel || !hotel.arrivalTime || !hotel.departureTime) {
      return res.status(400).json({
        message: "Hotel arrival and departure time not configured"
      });
    }

    const checkInDate = buildDateTime(checkIn, hotel.arrivalTime);
    const checkOutDate = buildDateTime(checkOut, hotel.departureTime);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const roomDoc = await Room.findById(roomId);
    if (!roomDoc) return res.status(404).json({ message: "Room type not found" });

    const allRoomNumbers = roomDoc.rooms.map(r => r.roomNumber);

    // Find bookings that overlap with the requested dates
    const bookings = await Booking.find({
  "rooms.roomId": roomId,
  "rooms.roomNumber": { $in: allRoomNumbers },
  status: { $in: ["pending", "confirmed", "checked_in"] },
  checkIn: { $lt: checkOutDate },
  checkOut: { $gt: checkInDate }
})
.select("rooms guestFirstName customerType user bookingId") // include bookingId
.populate("user", "name");

let occupiedRoomNumbers = [];
for (const booking of bookings) {
  for (const r of booking.rooms) {
    if (allRoomNumbers.includes(r.roomNumber)) {
      const name = booking.customerType === "Guest"
        ? `${booking.guestFirstName || ''}`.trim()
        : (booking.user?.name || '').split(' ')[0]; // first name only

      occupiedRoomNumbers.push({
        roomNumber: r.roomNumber,
        bookingName: name,
        bookingId: booking._id.toString()
      });
    }
  }
}



    // Available rooms are all minus the occupied numbers
    const occupiedNumbersOnly = occupiedRoomNumbers.map(o => o.roomNumber);
    const availableRoomNumbers = allRoomNumbers.filter(num => !occupiedNumbersOnly.includes(num));

    res.json({ availableRoomNumbers, occupiedRoomNumbers });
  } catch (error) {
    console.error("Error in getAvailableRoomNumbersByDate:", error.message);
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
          {
            $and: [ 
              { guestFirstName: { $regex: search.split(" ")[0], $options: "i" } }, 
              { guestLastName: { $regex: search.split(" ")[1] || "", $options: "i" } } 
            ]
          }
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

exports.getCheckedInBookings = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: "checked_in" };

    // 🔍 Search logic
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      const searchConditions = [];

      // Member search
      searchConditions.push({
        customerType: "Member",
        $or: [
          { bookingId: { $regex: search, $options: "i" } },
          ...(users.length
            ? [{ user: { $in: users.map(u => u._id) } }]
            : [])
        ]
      });

      // Guest search
      searchConditions.push({
        customerType: "Guest",
        $or: [
          { bookingId: { $regex: search, $options: "i" } },
          { guestFirstName: { $regex: search, $options: "i" } },
          { guestLastName: { $regex: search, $options: "i" } },
          { guestPhone: { $regex: search, $options: "i" } },
          {
            $and: [ 
              { guestFirstName: { $regex: search.split(" ")[0], $options: "i" } }, 
              { guestLastName: { $regex: search.split(" ")[1] || "", $options: "i" } } 
            ]
          }
        ]
      });

      query.$and = [{ $or: searchConditions }];
    }

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate("user", "name phone")
      .populate("rooms.roomId", "type price")
      .sort({ checkIn: -1 })
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
    console.error("Checked-in fetch error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getCheckedOutBookings = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: "checked_out" };

    // 🔍 Search logic
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      const searchConditions = [];

      // Member search
      searchConditions.push({
        customerType: "Member",
        $or: [
          { bookingId: { $regex: search, $options: "i" } },
          ...(users.length
            ? [{ user: { $in: users.map(u => u._id) } }]
            : [])
        ]
      });

      // Guest search
      searchConditions.push({
        customerType: "Guest",
        $or: [
          { bookingId: { $regex: search, $options: "i" } },
          { guestFirstName: { $regex: search, $options: "i" } },
          { guestLastName: { $regex: search, $options: "i" } },
          { guestPhone: { $regex: search, $options: "i" } },
          {
            $and: [ 
              { guestFirstName: { $regex: search.split(" ")[0], $options: "i" } }, 
              { guestLastName: { $regex: search.split(" ")[1] || "", $options: "i" } } 
            ]
          }
        ]
      });

      query.$and = [{ $or: searchConditions }];
    }

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate("user", "name phone")
      .populate("rooms.roomId", "type price")
      .sort({ checkIn: -1 })
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
    console.error("Checked-in fetch error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.createDirectCheckIn = async (req, res) => {
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
      rooms,        // Each room: { roomId, adults, children, roomNumber }
      checkIn,
      checkOut,
      bookingSource
    } = req.body;

    // ✅ Validate customer type
    if (!customerType || !["Member", "Guest"].includes(customerType)) {
      return res.status(400).json({ message: "Customer type must be Member or Guest" });
    }

    if (customerType === "Guest") {
      if (!guestFirstName || !guestLastName) return res.status(400).json({ message: "Guest first and last name required" });

      if (guestEmail && !/^\S+@\S+\.\S+$/.test(guestEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const query = [
        guestEmail ? { email: guestEmail } : null,
        guestPhone ? { phone: guestPhone } : null
      ].filter(Boolean);

      let conflictMember = null;
      if (query.length > 0) {
        conflictMember = await User.findOne({ $or: query });
      }

      if (conflictMember) {
        return res.status(400).json({ message: "Guest email or phone conflicts with existing member" });
      }

    }

    const hotel = await Hotel.findOne();
    if (!hotel || !hotel.arrivalTime || !hotel.departureTime) {
      return res.status(400).json({ message: "Hotel settings missing" });
    }

    if (!rooms || rooms.length === 0) return res.status(400).json({ message: "At least one room must be selected" });

    const checkInDate = buildDateTime(checkIn, hotel.arrivalTime);
    const checkOutDate = buildDateTime(checkOut, hotel.departureTime);

    if (checkOutDate <= checkInDate) return res.status(400).json({ message: "Check-out must be after check-in" });

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const nights = Math.round((checkOutDate - checkInDate) / MS_PER_DAY);

    let totalPrice = 0;
    const bookingRooms = [];

    // ✅ Process each room
    for (const r of rooms) {
      const roomDoc = await Room.findById(r.roomId);
      if (!roomDoc) return res.status(404).json({ message: "Room type not found" });

      const adults = Number(r.adults || 1);
      const children = Number(r.children || 0);
      const roomNumber = r.roomNumber || "Yet to be assigned";

      // Capacity check
      if (adults > roomDoc.adults || children > roomDoc.children) {
        return res.status(400).json({
          message: `Room ${roomDoc.type} cannot accommodate ${adults} adults and ${children} children`
        });
      }

      // Room number conflict check
      if (roomNumber !== "Yet to be assigned") {
        const conflict = await Booking.findOne({
          "rooms.roomId": r.roomId,
          "rooms.roomNumber": roomNumber,
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
          status: { $in: ["pending", "confirmed", "checked_in"] }
        });
        if (conflict) return res.status(400).json({ message: `Room number ${roomNumber} is already booked for these dates` });
      }

      // Price calculation
      const pricingEntry = roomDoc.pricing.find(p => p.adults === adults);
      if (!pricingEntry) return res.status(400).json({ message: `No pricing for ${adults} adults in room ${roomDoc.type}` });
      totalPrice += pricingEntry.price * nights;

      bookingRooms.push({
        roomId: r.roomId,
        roomNumber,
        adults,
        children
      });
    }

    // ✅ Create booking
    const bookingPayload = {
      customerType,
      rooms: bookingRooms,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      status: "checked_in",
      numberOfRooms: bookingRooms.length,
      bookingId: uuidv4().slice(0, 8),
      bookingSource
    };

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

    const booking = await Booking.create(bookingPayload);

    res.status(201).json({ message: "Direct check-in created", booking });

  } catch (error) {
    console.error("createDirectCheckIn error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, newStatus } = req.body;
    const booking = await Booking.findById(bookingId).populate("rooms");

    if (!booking) { return res.status(404).json({ error: "Booking not found" }); }

    booking.status = newStatus; 
    await booking.save(); // Apply room status transitions 
    
   if (newStatus === "checked_in") {
      await Room.updateMany(
        { "rooms.roomNumber": { $in: booking.rooms.map(r => r.roomNumber) } },
        { $set: { "rooms.$[elem].status": "not_available" } },
        { arrayFilters: [{ "elem.roomNumber": { $in: booking.rooms.map(r => r.roomNumber) } }] }
      );
    }

    if (newStatus === "checked_out") {
      await Room.updateMany(
        { "rooms.roomNumber": { $in: booking.rooms.map(r => r.roomNumber) } },
        { $set: { "rooms.$[elem].status": "dirty" } },
        { arrayFilters: [{ "elem.roomNumber": { $in: booking.rooms.map(r => r.roomNumber) } }] }
      );
    }

    if (newStatus === "no_show" || newStatus === "cancelled") {
      await Room.updateMany(
        { "rooms.roomNumber": { $in: booking.rooms.map(r => r.roomNumber) } },
        { $set: { "rooms.$[elem].status": "available" } },
        { arrayFilters: [{ "elem.roomNumber": { $in: booking.rooms.map(r => r.roomNumber) } }] }
      );
    }

    return res.json(booking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
}