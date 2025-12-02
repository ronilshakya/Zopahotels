const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: function() { return this.customerType === "Member"; } // required only for members
    },
    guestFirstName: { 
        type: String,
        required: function() { return this.customerType === "Guest"; } // required for guests
    },
    guestLastName: { 
        type: String,
        required: function() { return this.customerType === "Guest"; } // required for guests
    },
    guestEmail: { 
        type: String,
    },
    guestPhone: { 
        type: String,
        required: function() { return this.customerType === "Guest"; } 
    },
    guestAddress: { 
        type: String,
        required: function() { return this.customerType === "Guest"; } 
    },
    guestCity: { 
        type: String,
        required: function() { return this.customerType === "Guest"; } 
    },
    guestZipCode: { 
        type: String,
    },
    guestCountry: { 
        type: String,
        required: function() { return this.customerType === "Guest"; } 
    },

    customerType: { 
        type: String, 
        enum: ["Member", "Guest"], 
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
    adults: {
        type: Number,
        required: true,
        default: 1
    },
    children: {
        type: Number,
        required: true,
        default: 0
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
    numberOfRooms:{
        type: Number,
        required: true,
        default: 1
    },
    bookingId:{
        type: String,
        unique: true,
    },
    bookingSource:[{
        type: String
    }]
},{timestamps:true});

module.exports = mongoose.model("Booking", BookingSchema);
