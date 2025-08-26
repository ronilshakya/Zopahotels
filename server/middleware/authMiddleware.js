const jwt = require('jsonwebtoken');

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

// const checkWP = (req,res,next) =>{
//     const key = req.headers['x-wp-key'];
//     if(key && key === process.env.WP_ADMIN_KEY){
//         return next();
//     }
//     return res.status(403).json({message: "Forbidden: Invalid API Key"});
// };

module.exports = {auth,isAdmin};