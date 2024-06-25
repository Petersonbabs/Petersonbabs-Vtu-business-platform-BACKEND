import express from 'express'
import { changePassword, deleteAccount, login, logout, signUp, updateProfile, forgotPassword, checkLink, resetPassword } from '../controllers/auth.controller.js'
import { sendRequestedVerification } from '../services/mail/requestVerification.js'
import { isAuthenticated, verifyToken } from '../middlewares/auth.middleware.js'
import changeEmail from '../services/mail/changeEmail.js'
import { requestVerification, verifyNewEmail, verifyUser } from '../controllers/email.controller.js'
import { sendForgotPasswordEmail } from '../services/mail/forgotPasswordEmail.js'
const router = express.Router()

router.route('/signup').post(signUp) // DONE
router.route('/login').post(login) // login user router
router.route('/forgot-password').post(forgotPassword, sendForgotPasswordEmail)
router.route('/check-link').post(checkLink)
router.route('/reset-password').patch(resetPassword)
router.route('/logout').post(isAuthenticated, logout) // logout user router
router.route('verify-token').post(async (req, res) => {
    const { token } = req.body
    try {
        const verifiedUser = await verifyToken(token);
        if (!verifiedUser) {
            res.status(401).json({
                status: "fail",
                message: "Invalid token. Please login again.",
                action: 'Login'
            })
            return
        }

        res.status(200).json({
            user: verifiedUser
        })
    } catch (error) {
        console.log(error)
    }
})

router.route('/change-password').patch(isAuthenticated, changePassword)

router.route('/delete-account').delete(isAuthenticated, deleteAccount);
router.route('/update-account').patch(isAuthenticated, updateProfile);


// EMAILS AUTH
router.route('/verify/:token').get(isAuthenticated, verifyUser)
router.route('/verify').post(isAuthenticated, requestVerification, sendRequestedVerification)
router.route('/change-email').post(isAuthenticated, changeEmail);
router.route('/verify-email/:token').get(isAuthenticated, verifyNewEmail);




export default router