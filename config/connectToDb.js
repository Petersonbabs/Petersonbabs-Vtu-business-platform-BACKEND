import mongoose from 'mongoose';
import dotEnv from 'dotenv';
dotEnv.config();

const password = process.env.MONGO_PASSWORD
const tempUrl = process.env.MONGO_URL
const url = tempUrl.replace('<password>', password)

const connectToDataBase = async () => {
    try {
        const connected = await mongoose.connect(url)
        if (connected) {
            return 'connected'
        } 
    } catch (error) {
        console.log(error)
    }
}

export default connectToDataBase;