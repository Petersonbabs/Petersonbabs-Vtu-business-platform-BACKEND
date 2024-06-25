import users from "../models/user.model.js"
import generateToken from "../utils/generateToken.utils.js"
import genVerificationToken from '../utils/randomString.utils.js'
import { sendVerificationEmail } from "../services/mail/sendVerificationEmail.js"
import bcrypt from 'bcryptjs';
import blacklistedTokens from "../models/blacklistTokens.model.js";


// Register user
export const signUp = async (req, res, next) => {
    const { userName, email, password, confirmPassword } = req.body
    try {

        if (!userName || !email || !password || !confirmPassword) {
            res.status(400).json({
                status: 'error',
                message: 'Please complete the form'
            })
        }

        if (password !== confirmPassword) {
            res.status(404).json({
                status: 'error',
                message: 'Passwords do not match'
            })
            return
        }


        // TODO: generate random profile picture
        const profilePic = `https://ui-avatars.com/api/?background=4ade80&color=fff&name=${userName}`
        const verificationToken = genVerificationToken(32)
        const verificationExpiration = Date.now() + 360000 * 10

        const user = await users.create({ profilePic, verificationToken, verificationExpiration, ...req.body })



        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'Unable to create user.'
            })
        }


        // TODO: Send verification email.
        sendVerificationEmail(userName, email, verificationToken)

        const token = generateToken(email, user._id)

        res.status(201).json({
            status: 'success',
            message: 'Signup successful. Check your email to verify your account.',
            user,
            token
        })


    } catch (error) {
        console.log(error)
        next(error)
    }

}



// Login user
export const login = async (req, res, next) => {
    const { userName, email, password } = req.body;

    try {

        // Check for empty fields
        if (!userName && !email || !password) {
            res.status(401).json({
                status: 'error',
                message: 'Please complete the form.'
            })
            return
        }

        const user = await users.findOne({ email }).select('+password')



        if (!user) {
            console.log('not available');
            res.status(403).json({
                status: 'error',
                message: 'Oops! You supplied incorrect details.'
            })
            return
        }


        // verify password & user account
        const correctPassword = await bcrypt.compare(password, user.password)
        if (!correctPassword || !user) {
            res.status(401).json({
                status: 'error',
                message: 'Oops! You supplied incorrect details.'
            })
            return
        }



        // Generate token
        const token = generateToken(email, user._id);

        res.status(200).json({
            status: 'success',
            message: 'Login successful. Redirecting...',
            user,
            token
        })

    } catch (error) {
        console.log('Error occurred at login controller: ' + error);
        next(error)
    }
}


// Update Profile
export const updateProfile = async (req, res, next) => {

    try {
        const updatedProfile = await users.findByIdAndUpdate(req.user.id, req.body)
        if (!updatedProfile) {
            res.status(400).json({
                status: 'fail',
                message: 'Unable to update your profile.'
            })
            return
        }

        res.status(200).json({
            status: 'success',
            message: 'Profile successfully update',
            user: updatedProfile
        })

    } catch (error) {
        console.log('error occured at UPDATE PROFILE CONTROLLER: ' + error);
        next(error)
    }
}

// Delete user
export const deleteAccount = async (req, res, next) => {


    try {
        await users.findByIdAndDelete(req.user.id)
        const user = await users.findById(id)
        if (user) {
            res.status(400).json({
                status: 'error',
                message: 'Oops! Your account was not deleted.'
            })
        }

        res.status(200).json({
            status: 'success',
            message: 'Account was successfully deleted.'
        })

    } catch (error) {
        console.log('error occured at deleteUser controller: ' + error);
        next(error)
    }

}

// Logout user
export const logout = async (req, res, next) => {
    const { token } = req.body;
    console.log(token);
    try {
        if (!token) {
            return res.status(400).json({
                status: "fail",
                message: "Please supply token in request body",
            });
        }

        const blacklistedToken = await blacklistedTokens.create({ token });

        if (!blacklistedToken) {
            const error = new Error("Failed to blacklist token");
            error.statusCode = 500;
            return next(error);
        }

        res.status(200).json({
            status: "success",
            message: "Logout successful",
        });

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// VERIFY USER
export const verifyUser = async (req, res, next) => {
    const { token } = req.params
    try {
        const user = await users.findOne({ verificationToken: token, verificationExpiration: { $gt: Date.now() } });


        // check is the provided token hasn't expired yet
        if (!user) {
            res.status(400).json({
                status: 'invalid link',
                title: 'Invalid',
                message: 'This link is invalid or expired. Try requesting a new one.',
                action: 'signin'
            })
            return
        }

        await users.findByIdAndUpdate(user._id, { isVerified: true, verificationExpiration: null, verificationToken: null })

        res.status(200).json({
            status: 200,
            title: "Success",
            action: 'Go to Dashboard',
            message: 'Verification successful. Redirecting...',
            user
        })

    } catch (error) {
        console.log('Error at verifyUser Middleware ' + error)
        next(error)
    }
}


// FOROT PASSWORD
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body
    try {
        const user = await users.findOne({ email });

        if (!user) {
            console.log('not available');
            res.status(403).json({
                status: 'error',
                message: 'No user with the email was found.'
            })
            return
        }

        const passwordToken = genVerificationToken(10)
        const passwordTokenExp = Date.now() + 3600 * 1000

        await users.findByIdAndUpdate(user._id, { passwordToken, passwordTokenExp })

        req.user = user

        next(passwordToken)

    } catch (error) {
        console.log(`Error occured at forgot password: ${error}`);
        next(error)
    }
}

// 
export const checkLink = async (req, res, next) => {
    const { passwordToken } = req.body
    try {

        const user = await users.findOne({ passwordToken, passwordTokenExp: { $gt: Date.now() } });

        if (!user) {

            res.status(400).json({
                status: 'invalid link',
                message: 'This link is invalid or expired. Try requesting a new one.'
            })
            return
        }


        res.status(200).json({
            status: 'success',
            message: 'Link invalidated'
        })

    } catch (error) {
        next(error)
        console.log(error);
    }
}

export const resetPassword = async (req, res, next) => {
    const { newPassword, confirmPassword, passwordToken } = req.body
    if (!newPassword || !confirmPassword) {
        res.status(400).json({
            message: 'Complete the form please.'
        })
        return
    }

    if (newPassword !== confirmPassword) {
        res.status(400).json({
            message: 'Passwords do not match.'
        })
        return
    }

    try {
        const user = await users.findOne({ passwordToken, passwordTokenExp: { $gt: Date.now() } });

        if (!user) {

            res.status(400).json({
                status: 'invalid link',
                message: 'This link is invalid or expired. Try requesting a new one.'
            })
            return
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await users.findByIdAndUpdate(user._id, { password: hashedPassword })
        res.status(200).json({
            status: 'success',
            message: 'Your password has been updated.'
        })

    } catch (error) {
        console.log(error)
        next(error)
    }
}

// CHANGE PASSWORD => forgot password
export const changePassword = async (req, res, next) => {


    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'Both the old and new passwords are required',
            });
        }

        const user = await users.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }


        const passwordMatched = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatched) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect old password',
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

