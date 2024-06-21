import users from "../models/user.model.js"
import generateToken from "../utils/generateToken.utils.js"
import genVerificationToken from '../utils/randomString.utils.js'
import { sendVerificationEmail } from "../services/mail/sendVerificationEmail.js"
import bcrypt from 'bcryptjs';
import blacklistedTokens from "../models/blacklistTokens.model.js";


// Register user
export const signUp = async (req, res, next) => {
    const {  userName, email, password, confirmPassword} = req.body
    try {

        if (!userName || !email || !password || !confirmPassword ) {
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
        const verificationExpiration = Date.now() + 360000

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

        const user = await users.findOne({ email }).select('+password') || await users.findOne({ userName }).select('+password')


        if (!user) {
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
            status: 'succes',
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
                status: 'error',
                message: 'Oops! It looks like your verification link has expired or used. Request for another one.'
            })

        }

        await users.findByIdAndUpdate(user._id, { isVerified: true, verificationExpiration: null, verificationToken: null })

        res.status(200).json({
            status: 200,
            message: 'Verification successful. Redirecting...',
            user
        })

    } catch (error) {
        console.log('Error at verifyUser Middleware ' + error)
        next(error)
    }
}

// REQUEST VERIFICATION
export const requestVerification = async (req, res, next) => {
    const { email } = req.body;
    const user = await users.findOne({ email })

    const verificationToken = genVerificationToken()
    const verificationExpiration = Date.now() + 3600 * 1000



    if (!user) {
        res.status(403).json({
            status: 'error',
            message: 'Oops! Something is off with your email. Try again.'
        })
        return
    } else if (user.isVerified) {
        res.status(400).json({
            status: 'warning',
            message: 'This account has already been verified.'
        })
        return
    }
    req.user = user
    await users.findByIdAndUpdate(user._id, { verificationToken, verificationExpiration })
    next(verificationToken)

}


export const verifyNewEmail = async (req, res, next) => {

    const { token } = req.params

    try {
        const user = await users.findOne({ verificationToken: token, verificationExpiration: { $gt: Date.now() } });

        // check is the provided token hasn't expired yet
        if (!user) {

            res.status(400).json({
                status: 'error',
                message: 'Oops! It looks like your verification link has expired or used. Try again.'
            })

        }

        const updatedEmail = user.newEmail

        await users.findByIdAndUpdate(user._id, { newEmailVerified: true, verificationExpiration: null, verificationToken: null,  email: updatedEmail})
       

        res.status(200).json({
            status: 'success',
            message: 'Email changed successfully',
            user
        });
    } catch (error) {
        next(error);
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

