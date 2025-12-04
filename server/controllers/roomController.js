const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const fs = require("fs");
const path = require("path");

exports.createRoom = async (req, res) => {
  try {
    let { type, description, pricing, children, rooms, maxOccupancy, amenities } = req.body;

    // Parse JSON strings if needed (FormData sends arrays as strings)
    rooms = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
    amenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;
    pricing = typeof pricing === "string" ? JSON.parse(pricing) : pricing;

    // Map uploaded files to images array
    const images = req.files ? req.files.map(file => file.filename) : [];

    // Check for duplicate room numbers
    const roomNumbers = rooms.map(r => r.roomNumber);
    const hasDuplicates = new Set(roomNumbers).size !== roomNumbers.length;
    if (hasDuplicates) {
      return res.status(400).json({ message: "Duplicated room numbers in request" });
    }

     // Check if any of the room numbers already exist in other room types
    const conflict = await Room.findOne({ "rooms.roomNumber": { $in: roomNumbers } });
    if (conflict) {
      return res.status(400).json({ message: `Room number(s) already exist in another room type` });
    }

    // Validate pricing array
    if (!Array.isArray(pricing) || pricing.length === 0) {
      return res.status(400).json({ message: "Pricing must be a non-empty array" });
    }
    for (const p of pricing) {
      if (typeof p.adults !== "number" || typeof p.price !== "number") {
        return res.status(400).json({ message: "Each pricing entry must have numeric adults and price" });
      }
    }

    const newRoom = new Room({
      type,
      description,
      pricing,
      children,
      rooms,
      maxOccupancy,
      images,
      amenities
    });

    await newRoom.save();
    res.status(201).json({ message: "Room created successfully", room: newRoom });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getAllRooms = async (req,res) =>{
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    // Normalize rooms and images
    room.rooms = Array.isArray(room.rooms) ? room.rooms : [];
    room.images = Array.isArray(room.images) ? room.images : [];
    res.json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const hotel = await Hotel.findOne();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    // Parse rooms if sent as string
    if (req.body.rooms && typeof req.body.rooms === "string") {
      try {
        req.body.rooms = JSON.parse(req.body.rooms);
      } catch {
        return res.status(400).json({ message: "Invalid rooms format" });
      }
    }

    // Check for duplicates within the same room type
    if (req.body.rooms && req.body.rooms.length > 0) {
      const roomNumbers = req.body.rooms.map(r => r.roomNumber);
      const uniqueRoomNumbers = new Set(roomNumbers);
      if (uniqueRoomNumbers.size !== roomNumbers.length) {
        return res.status(400).json({ message: "Duplicate room numbers within the same room type" });
      }

      // Check for duplicates across all other room types
      const duplicate = await Room.findOne({
        _id: { $ne: room._id }, // exclude current room type
        "rooms.roomNumber": { $in: roomNumbers }
      });
      if (duplicate) {
        return res.status(400).json({ message: "One or more room numbers already exist in another room type" });
      }
    }

    // Parse selected amenity IDs
    let selectedAmenityIds = [];
    if (req.body.amenities) {
      try {
        selectedAmenityIds = JSON.parse(req.body.amenities);
      } catch {
        return res.status(400).json({ message: "Invalid amenities format" });
      }
    }

    const selectedAmenities = hotel.amenities.filter(a =>
      selectedAmenityIds.includes(a._id.toString())
    );

    // Parse pricing if sent as string
    if (req.body.pricing && typeof req.body.pricing === "string") {
      try {
        req.body.pricing = JSON.parse(req.body.pricing);
      } catch {
        return res.status(400).json({ message: "Invalid pricing format" });
      }
    }

    // Validate pricing array if provided
    if (req.body.pricing) {
      if (!Array.isArray(req.body.pricing) || req.body.pricing.length === 0) {
        return res.status(400).json({ message: "Pricing must be a non-empty array" });
      }
      for (const p of req.body.pricing) {
        if (typeof p.adults !== "number" || typeof p.price !== "number") {
          return res.status(400).json({ message: "Each pricing entry must have numeric adults and price" });
        }
      }
    }

    // Allowed fields to update (removed price/adults, added pricing)
    const allowedUpdates = [
      "type",
      "description",
      "pricing",
      "children",
      "rooms",
      "maxOccupancy"
    ];

    allowedUpdates.forEach(key => {
      if (req.body[key] !== undefined) room[key] = req.body[key];
    });

    room.amenities = selectedAmenities;

    // Handle images
    let existingImages = [];
    if (req.body.existingImages) {
      existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
    } else {
      existingImages = room.images;
    }

    const newImages = req.files ? req.files.map(f => f.filename) : [];
    if (req.body.existingImages || req.files) {
      room.images = [...existingImages, ...newImages];
    }

    await room.save();
    res.status(200).json({ message: "Room updated successfully", room });

  } catch (error) {
    console.error("Error in updateRoom:", error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};




exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Delete images from server
    if (room.images && room.images.length > 0) {
      room.images.forEach((img) => {
        const filePath = path.join(__dirname, "../uploads/rooms/", img);
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(filePath, (err) => {
              if (err) console.error("Error deleting image:", img, err);
            });
          }
        });
      });
    }

    res.json({ message: "Room and its images deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
