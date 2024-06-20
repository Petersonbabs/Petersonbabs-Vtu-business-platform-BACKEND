import mongoose, { Schema, Model, model } from "mongoose";
import bcrypt from 'bcryptjs'


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
    },

    email: {
        type: String,
        unique: [true, 'This email already exists'],
        required: [true, 'Please provide an email'],
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },

    userName: {
        type: String,
        unique: [true, 'This username already exists.'],
        required: true
    }
})



const user = mongoose.model('user', userSchema)

export default user