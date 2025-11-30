const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true    
    },
    password:{
        type: String,
        required: true    
    },
    phone:{
        type: String,
        required: true    
    },
    address:{
        type: String,
        required: true    
    },
    city:{
        type: String,
        required: true    
    },
    state:{
        type: String,
        required: true    
    },
    zip:{
        type: String,
        required: true    
    },
    country:{
        type: String,
        required: true    
    },
    role:{
        type: String, 
        enum: ["user", "admin"], 
        default: "user"
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    profileImage: {
        type: String,
        default: "default.png"
    },
    verificationToken: String,
    resetToken: String,
    resetTokenExpiry: Date
    
},{timestamps:true});
module.exports = mongoose.model("User",userSchema);