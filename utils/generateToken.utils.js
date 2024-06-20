import dotEnv from 'dotenv';
dotEnv.config()
import jwt from 'jsonwebtoken';

const generateToken = (email, id) =>{
    const token = jwt.sign({email, id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION});

    return token
}

export default generateToken