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
    },
    guestAddress: { 
        type: String,
        // required: function() { return this.customerType === "Guest"; } 
    },
    guestCity: { 
        type: String,
        // required: function() { return this.customerType === "Guest"; } 
    },
    guestZipCode: { 
        type: String,
    },
    guestCountry: { 
        type: String,
        // required: function() { return this.customerType === "Guest"; } 
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
            price: Number, 
            converted: { USD: Number }
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
    // Converted USD total 
    totalPriceUSD: { 
        type: Number, 
        required: true 
    }, 
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "checked_in", "checked_out","no_show"],
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
    }],
    charges:[
        {
            type:{
                type: String,
                enum:["room_service","discount","advance"],
                required: true
            },
            amount: Number,
            currency: {
                type: String,
                default: "NPR"
            },
            converted:{
                USD:{
                    type:Number
                }
            },
            roomNumber : {type: String},
            createdAt: { type: Date, default: Date.now },
            items: [ 
                { 
                    item: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" }, 
                    name: String, 
                    quantity: Number, 
                    price: Number,
                     converted:{
                        USD:{
                            type:Number
                        }
                    },
                } 
            ]
        }
    ],
    payments:[
        {
            type:{
                type: String,
                enum: ["cash","card","online"],
                required: true
            },
            amount: Number,
            currency: {
                type: String,
                default: "NPR"
            },
            converted:{
                USD:{
                    type:Number
                }
            },
            roomNumber : {type: String},
            createdAt: { type: Date, default: Date.now },
            items: [ 
                { 
                    item: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" }, 
                    name: String, 
                    quantity: Number, 
                    price: Number,
                    converted:{
                        USD:{
                            type:Number
                        }
                    }, 
                } 
            ]
        }
    ]
},{timestamps:true});

module.exports = mongoose.model("Booking", BookingSchema);
