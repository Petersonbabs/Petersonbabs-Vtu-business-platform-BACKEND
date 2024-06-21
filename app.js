import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
const app = express();

// ROUTERS
import authRoutes from './routes/auth.route.js'
import errorHandler from './middlewares/errorHandler.middleware.js';


// MIDDLEWARE
app.use(express.json());
// const corsOptions = {
//     origin: ['http://localhost:5173', 'nobyll.vercel.app'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// };
app.use(cors());
app.use(morgan('dev'));
 

// ENDPOINTS
app.get('/', (req, res)=> {
    res.send('Welcome to Nobyll Vtu Platform')
})
app.get('/api/v1/', (req, res)=> {
    res.send('Welcome to Nobyll Api version 1')
})
app.use('/api/v1/auth', authRoutes)


app.all('*', (req, res) => {
    res.json(`${req.method} ${req.originalUrl} is not an endpoint on this server`)
})


app.use("*", errorHandler)

export default app