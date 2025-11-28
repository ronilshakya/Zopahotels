const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
  try {
    let { type, description, price, adults, children, rooms, maxOccupancy, amenities } = req.body;

    // Parse JSON strings if needed (FormData sends arrays as strings)
    rooms = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
    amenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;

    // Map uploaded files to images array
    const images = req.files ? req.files.map(file => file.filename) : [];

    // Check for duplicate room numbers
    const roomNumbers = rooms.map(r => r.roomNumber);
    const hasDuplicates = new Set(roomNumbers).size !== roomNumbers.length;
    if (hasDuplicates) {
      return res.status(400).json({ message: "Duplicated room numbers in request" });
    }

    const newRoom = new Room({
      type,
      description,
      price,
      adults,
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

    // Parse selected amenity IDs from frontend
    let selectedAmenityIds = [];
    if (req.body.amenities) {
      try {
        selectedAmenityIds = JSON.parse(req.body.amenities); // array of _id strings
      } catch {
        return res.status(400).json({ message: "Invalid amenities format" });
      }
    }

    // Map selected IDs to full amenity objects from hotel
    const selectedAmenities = hotel.amenities.filter(a =>
      selectedAmenityIds.includes(a._id.toString())
    );

    // Allowed fields to update
    const allowedUpdates = [
      "type",
      "description",
      "price",
      "adults",
      "children",
      "rooms",
      "maxOccupancy"
    ];

    allowedUpdates.forEach(key => {
      if (req.body[key] !== undefined) room[key] = req.body[key];
    });

    // Set amenities
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
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

