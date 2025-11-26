const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description: { 
        type: String 
    },
    address: { 
        type: String 
    },
    phone: { 
        type: String 
    },
    email: { 
        type: String 
    },
    logo: { 
        type: String 
    },
    currency: {
        type: String,
        default: "USD", // or "NPR", depending on your market
        enum: ["USD", "NPR"] // restrict to supported currencies
    },
    amenities: [String],
    bookingSource: [String],
},{timestamps:true});

module.exports = mongoose.model("Hotel", hotelSchema);