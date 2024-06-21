import mongoose, { Schema, Model, model } from "mongoose";
import bcrypt from 'bcryptjs'


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        // required: [true, 'Please provide your full name'],
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
        required: [true, 'Please provide your username']
    },

    phoneNumber: {
        type: Number,
    },

    password: {
        type: String,
        required: [true, 'Please provide a password'],
        select: false
    },

    profilePic: {
        type: String
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationToken: {
        type: String,
    },

    verificationExpiration: {
        type: Date
    }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});


const user = mongoose.model('user', userSchema)

export default user