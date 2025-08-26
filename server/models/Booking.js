const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    rooms: [
        {
            roomId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Room",
                required: true
            },
            roomNumber: {
                type: String,
                required: true
            }
        }
    ],
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
    },
},{timestamps:true});

module.exports = mongoose.model("Booking", BookingSchema);