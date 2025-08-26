const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    type:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    price:{
        type: Number,
        required: true,
        min:0
    },
    adults:{
        type: Number,
        default: 0,
        min:0
    },
    children:{
        type: Number,
        default: 0,
        min:0
    },
    rooms:[
        {
            roomNumber:{
                type:String,
                required:true
            }
        }
    ],
    maxOccupancy:{
        type: Number,
        default: 0,
        min:0
    },
    images:[{
        type: String
    }],
    amenities:[{
        type: String
    }]
},{timestamps:true});
module.exports = mongoose.model("Room",RoomSchema);