const Hotel = require('../models/Hotel');

exports.createHotel = async (req, res) => {
    try {
        // Check if a hotel already exists
        const hotelCount = await Hotel.countDocuments({});
        if (hotelCount > 0) {
            return res.status(400).json({ message: "Only one hotel can be created" });
        }

        const { name, description, address, phone, email,currency,amenities } = req.body;

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
            amenities
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

        const allowedFields = ['name', 'description', 'address', 'phone', 'email', 'currency', 'amenities'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                // For amenities, parse JSON if it's a string
                if (field === 'amenities') {
                    if (typeof req.body.amenities === 'string') {
                        try {
                            hotel.amenities = JSON.parse(req.body.amenities);
                        } catch {
                            hotel.amenities = [req.body.amenities];
                        }
                    } else {
                        hotel.amenities = req.body.amenities;
                    }
                } else {
                    hotel[field] = req.body[field];
                }
            }
        });

        if (req.file) {
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