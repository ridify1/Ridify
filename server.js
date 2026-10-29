const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const userRouter = require('./routes/userRouter')
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const landLordRouter = require('./routes/landLordKyc')
const adminRouter = require('./routes/admin')
const cookieParser = require('cookie-parser');
const redisClient = require('./config/redis');

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: '*'}));

const swaggerDefinition = {
  openapi: '3.0.0',  
  info: {
    title: 'Ridify Api',
    version: '1.0.0',
    description: 'This is a REST API application made with Express.',
    license: {
      name: 'official URL',
      url: 'http://google.com'
    },
    contact: {
      name: 'JSONPlaceholder',
      url: 'https://jsonplaceholder.typicode.com'
    },
  },
  servers: [
    {
      url: 'https://ridify-p1jl.onrender.com',
      description: 'Production server',
    },
    {
      url: 'http://localhost:5599',
      description: 'Development server',
    },
  ],
  security: [
    {
      bearerAuth: []
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

const path = require('path');

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, './routes/*.js')]
};
const swaggerSpec = swaggerJsdoc(options);

app.get('/swagger.json', (req, res) => {
    res.json(swaggerSpec);
});

app.use('/api/v1/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/user', userRouter);

app.use('/api/v1/landlord', landLordRouter);

app.use('/api/v1/admin', adminRouter);

app.use((req, res, next) => {
    next({
        message: `route ${req.originalUrl} and ${req.method} not found`,
        statusCode: 404
    })
});

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
    res.status(err.statusCode || 500).json({
        message: err.message
    })
});

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to Database');
    await redisClient.connect();
    redisClient.ping().then(console.log).catch(console.error);
    app.listen(PORT, () => {
        console.log(`Server is listening to Port: ${PORT}`);
    });
}).catch((error) => {
    console.log("Unable to connect", error.message)
});