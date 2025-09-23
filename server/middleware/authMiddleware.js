const jwt = require('jsonwebtoken');
const axios = require('axios');

const auth = (req,res,next) =>{
    try{
        const token = req.headers["authorization"]?.split(" ")[1];
        if(!token){
            return res.status(401).json({message:"No token provided"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        return res.status(403).json({message: "Invalid token"});
    }
}

const isAdmin = (req,res,next) =>{
    if(req.user.role !== 'admin'){
        return res.status(403).json({message: "Access Denied"});
    }
    next();
}

const verifyTurnstile = async (req, res, next) => {
  try {
    const token = req.body.turnstileToken; // sent from frontend
    if (!token) {
      return res.status(400).json({ message: "CAPTCHA token is missing" });
    }

    const secretKey = process.env.TURNSTILE_SECRET; // your server-side secret

    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: req.ip,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (response.data.success) {
      next(); // CAPTCHA passed, continue to the route
    } else {
      return res.status(403).json({ message: "CAPTCHA verification failed" });
    }
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return res.status(500).json({ message: "Server error verifying CAPTCHA" });
  }
};

module.exports = {auth,isAdmin,verifyTurnstile};