const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.registerUser = async (req,res) =>{
    try {
        const {name,email,password,phone,address,city,state,zip,country} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            city,
            state,
            zip,
            country,
            isVerified: false,
            verificationToken
        });

        const transporter = nodemailer.createTransport({
            host:"mail.hotelnutopia.com",
            port:465,
            secure: true,
            auth:{
                user:"no-reply@hotelnutopia.com",
                pass:"0X9V&{Y{Rm!4N~@F"
            }
        })

        const verificationUrl = `http://localhost:${process.env.PORT}/api/users/verify/${verificationToken}`;

        const mailOptions = {
            from: '"Hotel Booking" <no-reply@hotelnutopia.com>', 
            to: user.email,                                     
            subject: "Verify Your Email",
            html: `
                <h3>Hello ${user.name},</h3>
                <p>Thank you for registering! Please verify your email by clicking the link below:</p>
                <a href="${verificationUrl}" style="display:inline-block;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;">Verify Email</a>
                <p>If you did not register, please ignore this email.</p>
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(201).json({message:"User registered. Please check email to verify your account"});
        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

exports.verifyUser = async (req, res) => {
    const token = req.params.token;
    // 1. Find the user with this token
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) return res.status(400).send("Invalid or expired token");
    
    // 2. Mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined; // remove the token
    await user.save();
    
    res.send("Email verified successfully! You can now log in.");
}

exports.login = async (req,res) =>{
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        if(!user.isVerified){
            return res.status(403).json({message: "Please verify email first"});
        }
        const matchPassword = await bcrypt.compare(password,user.password);
        if(!matchPassword){
            return res.status(400).json({message: "Invalid password"});
        }
        const token = jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET, {expiresIn:'7d'});
        res.json({token,user:{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }})
        
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

exports.getAllUsers = async (req,res) =>{
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

exports.getUserById = async (req,res) =>{
    try {
        const user = await User.findById(req.params.id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        res.json(user)
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

exports.updateUser = async (req,res) =>{
    try {
        const {name,phone,address,city,state,zip,country} = req.body;
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        if(name) user.name = name;
        if(phone) user.phone = phone;
        if(address) user.address = address;
        if(city) user.city = city;
        if(state) user.state = state;
        if(zip) user.zip = zip;
        if(country) user.country = country;
        await user.save();
        res.json({message: "User Updated",user});
    } catch (error) {
        return res.status(500).json({message: error.message});        
    }
}

exports.deleteUser = async (req,res) =>{
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.json({message: "User Deleted Successfully"});
    } catch (error) {
        return res.status(500).json({message: error.message});        
    }
}