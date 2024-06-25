import users from "../models/user.model.js";
import genVerificationToken from '../utils/randomString.utils.js';



// Verify New signup
export const verifyUser = async (req, res, next) => {
    const { token } = req.params
    
    try {
        const user = await users.findOne({ verificationToken: token, verificationExpiration: { $gt: Date.now() } });


        // check is the provided token hasn't expired yet
        if (!user) {

            res.status(400).json({
                status: 'error',
                message: 'Oops! This link has either expired or has been used.',
                action: 'Request verification'
            })
            return

        }

        await users.findByIdAndUpdate(user._id, { isVerified: true, verificationExpiration: null, verificationToken: null })

        res.status(200).json({
            status: 'success',
            message: 'Verification successful!',
            action: 'Go to dashboard',
            user
        })

    } catch (error) {
        console.log('Error at verifyUser Middleware ' + error)
        next(error)
    }
}

// Request verification
export const requestVerification = async (req, res, next) => {
    const { email } = req.body;
    
    const user = await users.findOne({ email })

    const verificationToken = genVerificationToken(10)
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

// Verify new email
export const verifyNewEmail = async (req, res, next) => {

    const { token } = req.params

    try {
        const user = await users.findOne({ verificationToken: token, verificationExpiration: { $gt: Date.now() } });

        // check is the provided token hasn't expired yet
        if (!user ) {

            res.status(400).json({
                status: 'error',
                message: 'Oops! It looks like your verification link has expired or used. Try again.'
            })

        }

        const updatedEmail = user.newEmail

        await users.findByIdAndUpdate(user._id, { isVerified: true, verificationExpiration: null, verificationToken: null,  email: updatedEmail})
       

        res.status(200).json({
            status: 'success',
            message: 'Email changed successfully',
            user
        });
    } catch (error) {
        next(error);
    }
} 