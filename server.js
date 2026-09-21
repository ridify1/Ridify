const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const userRouter = require('./routes/userRouter')
const app = express();

app.use(express.json());
app.use('/api/v1/user', userRouter)

app.use((err, req, res, next) => {
    if (err.name === 'MulterError') {
        return res.status(400).json({
            message: 'File upload failed'
        })
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Session expired, please login again'
        })
    }
    res.status(500).json({
        message: err.message
    })
})


const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to Database');
    app.listen(PORT, () => {
        console.log(`Server is listening to Port: ${PORT}`);
    });
}).catch((error) => {
    console.log("Unable to connect", error.message)
})