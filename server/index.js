const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const app = express();

dotenv.config();

app.use(cors({
    origin: 'http://localhost:5173',
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

app.listen(process.env.PORT,()=>{console.log(`Server started at port: ${process.env.PORT}`)})