const Hotel = require('../models/Hotel');
const path = require('path');
const fs = require('fs');

exports.createHotel = async (req, res) => {
    try {
        // Check if a hotel already exists
        const hotelCount = await Hotel.countDocuments({});
        if (hotelCount > 0) {
            return res.status(400).json({ message: "Only one hotel can be created" });
        }

        let { name, description, address, phone, email,currency,amenities,bookingSource,arrivalTime,departureTime,enableVat } = req.body;

         // Parse amenities if it's a string
        if (typeof amenities === "string") {
          try {
            amenities = JSON.parse(amenities);
          } catch (err) {
            amenities = []; // fallback to empty array
          }
        }

        // If logo is uploaded via multer
        let logo = null;
        if (req.file) {
            logo = req.file.filename; // multer saves the filename
        }

        // Create the hotel
        const hotel = await Hotel.create({
            name,
            description,
            address,
            phone,
            email,
            logo,
            currency,
            amenities,
            bookingSource,
            arrivalTime,
            departureTime,
            enableVat
        });

        res.status(201).json({ message: "Hotel created successfully", hotel });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({});
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        res.json(hotel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// UPDATE HOTEL
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({});
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const allowedFields = [
      "name",
      "description",
      "address",
      "phone",
      "email",
      "currency",
      "amenities",
      "bookingSource",
      "arrivalTime",
      "departureTime",
      "enableVat"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "amenities" || field === "bookingSource") {
          // parse JSON if it's a string
          if (typeof req.body[field] === "string") {
            try {
              hotel[field] = JSON.parse(req.body[field]);
              // Ensure it’s an array
              if (!Array.isArray(hotel[field])) hotel[field] = [hotel[field]];
            } catch {
              hotel[field] = [req.body[field]];
            }
          } else {
            hotel[field] = req.body[field];
          }
        } else {
          hotel[field] = req.body[field];
        }
      }
    });

    if (req.file) {
      if (hotel.logo) { 
        const oldLogoPath = path.join(__dirname, "..", "uploads", hotel.logo); 
        fs.unlink(oldLogoPath, (err) => { 
          if (err) { 
            console.error("Failed to delete old logo:", err.message); 
          } 
          else { 
            console.log("Old logo deleted:", hotel.logo); 
          } 
        }); 
      }
      hotel.logo = req.file.filename; // multer saves filename
    }

    await hotel.save();
    res.json({ message: "Hotel updated successfully", hotel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// DELETE HOTEL
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({});
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        await hotel.deleteOne();
        res.json({ message: "Hotel deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.addAmenity = async (req, res) => {
  try {
    const hotel = await Hotel.findOne();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Amenity name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Amenity icon is required" });
    }

    const newAmenity = {
      name,
      icon: req.file.filename
    };

    hotel.amenities.push(newAmenity);
    await hotel.save();

    res.json({ message: "Amenity added", amenity: newAmenity });

  } catch (error) {
    console.error("Amenity add error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAmenities = async (req, res) => {
  try {
    const hotel = await Hotel.findOne();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    res.json(hotel.amenities || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAmenity = async (req, res) => {
  try {
    const hotel = await Hotel.findOne();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const { id } = req.params; // current name
    const { newName } = req.body;

    const amenity = hotel.amenities.find(a => a.id === id);
    if (!amenity) return res.status(404).json({ message: "Amenity not found" });

    if (newName) amenity.name = newName;
    if (req.file) amenity.icon = req.file.filename;

    await hotel.save();
    res.json({ message: "Amenity updated", amenity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAmenity = async (req, res) => {
  try {
    const hotel = await Hotel.findOne();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const { id } = req.params;

    hotel.amenities = hotel.amenities.filter(a => a.id !== id);
    await hotel.save();

    res.json({ message: "Amenity deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};