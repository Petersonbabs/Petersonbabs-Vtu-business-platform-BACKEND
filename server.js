import dotEnv from 'dotenv'
dotEnv.config()
import app from "./app.js";
import connectToDataBase from './config/connectToDb.js';

const PORT = process.env.PORT || 4000

const connected = connectToDataBase()

if(connected){
    console.log('Connected to MongoDB DataBase')
    app.listen(PORT, ()=>{
        console.log(`Server running on port ${PORT}`)
    })
}
