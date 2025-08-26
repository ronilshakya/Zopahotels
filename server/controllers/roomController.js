const Room = require('../models/Room');

exports.createRoom = async (req,res) =>{
    try {
        const {
            type,
            description,
            price,
            adults,
            children,
            rooms,
            maxOccupancy,
            images,
            amenities
        } = req.body;

        const roomNumbers = rooms.map(r => r.roomNumber);
        const hasDuplicates = new Set(roomNumbers).size !== roomNumbers.length;
        if(hasDuplicates){
            res.status(400).json({message: "Duplicated room numbers in request"});
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
        res.status(201).json({message: "Room created successfully"});
    } catch (error) {
        res.status(400).json({message: error.message});        
    }
}
exports.getAllRooms = async (req,res) =>{
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
exports.getRoomById = async (req,res) =>{
    try {
        const room = await Room.findById(req.params.id);
        if(!room){
            return res.status(404).json({message: "Room not found"});
        }
        res.json(room);
    } catch (error) {
        return res.status(500).json({message: error.message});        
    }
}

exports.updateRoom = async (req,res) =>{
    try {
        const room = await Room.findById(req.params.id);
        if(!room){
            return res.status(403).json({message: "Room not found"});
        }
        const allowedUpdates = [
            "type",
            "description",
            "price",
            "adults",
            "children",
            "rooms",
            "maxOccupancy",
            "images",
            "amenities"
        ];

        allowedUpdates.forEach(key => {
            if (req.body[key] !== undefined) {
                room[key] = req.body[key];
            }
        });
        await room.save();
        res.status(200).json("Room updated successfully");
    } catch (error) {
        return res.status(500).json({message: error.message});                
    }
}

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