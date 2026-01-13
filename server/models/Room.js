const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    type:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    pricing: [
        {
            adults: { 
                type: Number, 
                required: true, 
                min: 1 
            },
            price: { 
                type: Number, 
                required: true, 
                min: 0 
            },
            currency:{
                type: String,
                default: "NPR"
            },
            converted: { 
                USD: { 
                    type: Number 
                } 
            }
        }
    ],
    children:{
        type: Number,
        default: 0,
        min:0
    },
    rooms:[
        {
            roomNumber:{
                type:String,
                required:true,
                unique:true
            },
            status: { 
                type: String, 
                enum: ['available', 'not_available','maintenance', 'dirty','cleaning_in_progress'], 
                default: 'available' 
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
    amenities: [
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        icon: String
    }
    ]
},{timestamps:true});
module.exports = mongoose.model("Room",RoomSchema);