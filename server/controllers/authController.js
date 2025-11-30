const User = require('../models/User');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const validator = require('validator');
const fs = require("fs");
const path = require("path");

exports.registerUser = async (req,res) =>{
    try {
        let {name,email,password,phone,address,city,state,zip,country} = req.body;
        name = name?.trim();
        email = email?.trim();
        password = password?.trim();
        phone = phone?.trim();
        address = address?.trim();
        city = city?.trim();
        state = state?.trim();
        zip = zip?.trim();
        country = country?.trim();

        if (!name || !email || !password || !phone || !address || !city || !state || !zip || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email" });
        if (!validator.isMobilePhone(phone, 'any')) return res.status(400).json({ message: "Invalid phone number" });

        if (!validator.isLength(password, { min: 6 })) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const hasUsers = await User.exists({});
        const role = hasUsers ? "user" : "admin"; // first user = admin


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
            verificationToken,
            role
        });

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: true,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        const verificationUrl = `${process.env.PROD_SERVER_URL}/api/users/verify/${verificationToken}`;

        const mailOptions = {
            from: `"Hotel Booking" <${process.env.MAIL_USER}>`, 
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
    
    // res.send("Email verified successfully! You can now log in.");
    res.redirect(`${process.env.REDIRECTION_AFTER_VALIDATE}`);
}

exports.login = async (req,res) =>{
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if (user.status === "inactive") {
            return res.status(403).json({ message: "Your account is suspended. Contact support." });
        }

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


exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query; // ?role=admin OR ?role=user

    let filter = {};
    if (role) filter.role = role;

    // Find users
    const users = await User.find(filter).select("-password");

    // Get booking counts per user
    const usersWithBookings = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          bookingCount,
        };
      })
    );

    res.json(usersWithBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const allowedFields = ["name","phone","address","city","state","zip","country"]
        allowedFields.forEach((key) => {
            if(req.body[key] !== undefined){
                user[key] = req.body[key];
            }
        });
        await user.save();
        res.json({message: "User Updated"});
    } catch (error) {
        return res.status(500).json({message: error.message});        
    }
}


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete profile image if it exists and is not the default
    if (user.profileImage && user.profileImage !== "default.png") {
      const filePath = path.join(__dirname, "../uploads/profile-pictures", user.profileImage);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete profile image:", err);
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User Deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


exports.registerAdmin = async (req, res) => {
    try {
        let { name, email, password, phone, address, city, state, zip, country } = req.body;

        name = name?.trim();
        email = email?.trim();
        password = password?.trim();
        phone = phone?.trim();
        address = address?.trim();
        city = city?.trim();
        state = state?.trim();
        zip = zip?.trim();
        country = country?.trim();

        if (!name || !email || !password || !phone || !address || !city || !state || !zip || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email" });
        if (!validator.isMobilePhone(phone, 'any')) return res.status(400).json({ message: "Invalid phone number" });

        if (!validator.isLength(password, { min: 6 })) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the admin user directly, skip verification
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
            role: "admin",
            isVerified: true,        // marked as verified immediately
            verificationToken: null  // no token needed
        });

        res.status(201).json({ message: "Admin registered successfully", user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.registerOfflineCustomer = async (req,res) =>{
    try {
        let { name, email, phone, address, city, state, zip, country, password } = req.body;
        name = name?.trim();
        email = email?.trim();
        phone = phone?.trim();
        address = address?.trim();
        city = city?.trim();
        state = state?.trim();
        zip = zip?.trim();
        country = country?.trim();
        password = password?.trim();
        if (!name || !email || !phone || !address || !city || !state || !zip || !country) {
            return res.status(400).json({ message: "All fields except password are required" });
        }
        if (!validator.isEmail(email))
            return res.status(400).json({ message: "Invalid email address" });

        if (!validator.isMobilePhone(phone, "any"))
        return res.status(400).json({ message: "Invalid phone number" });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return res.status(400).json({ message: "A user with this email already exists" });
        }

        // If no password provided → auto-generate
        if (!password) {
        password = Math.random().toString(36).slice(-8); // random 8-char password
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create verified user without verification email
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
        isVerified: true,   // <- Important
        verificationToken: null,
        role: "user",       // offline customers are always normal users
        });

        res.status(201).json({
            message: "Offline customer registered successfully",
            customer: user,
            generatedPassword: password, // show to admin only
        });
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Hotel Booking" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <h3>Hello ${user.name}</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required" });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
     try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {role: { $ne: "admin" }};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .select("name email phone profileImage createdAt"); // select only required fields

    res.status(200).json({
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("User Search Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: req.file.filename },
      { new: true } // return updated document
    );

    res.status(200).json({
      message: "Profile picture updated!",
      profileImage: user.profileImage // send the new filename
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
