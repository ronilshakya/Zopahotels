const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api/users',require('./routes/userRoute'));

app.listen(process.env.PORT,()=>{console.log(`Server started at port: ${process.env.PORT}`)})