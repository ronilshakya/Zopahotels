const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const app = express();

dotenv.config();

const allowedOrigins = [
  'http://localhost:5173',
  'https://booking.hotelnutopia.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

connectDB();

app.use('/uploads', express.static('uploads'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api/users',require('./routes/userRoute'));
app.use('/api/rooms',require('./routes/roomRoute'));
app.use('/api/booking',require('./routes/bookingRoute'));
app.use('/api/hotel',require('./routes/hotelRoute'));

app.listen(process.env.PORT,()=>{console.log(`Server started at port: ${process.env.PORT}`)})