import express from 'express'
import { changePassword, deleteAccount, login, logout, signUp, updateProfile, forgotPassword } from '../controllers/auth.controller.js'
import { sendRequestedVerification } from '../services/mail/requestVerification.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'
import changeEmail from '../services/mail/changeEmail.js'
import { requestVerification, verifyNewEmail, verifyUser } from '../controllers/email.controller.js'
import { sendForgotPasswordEmail } from '../services/mail/forgotPasswordEmail.js'
const router = express.Router()

router.route('/signup').post(signUp) // DONE
router.route('/login').post(login) // login user router
router.route('/forgot-password').post(forgotPassword, sendForgotPasswordEmail)
router.route('/logout').post(isAuthenticated, logout) // logout user router
router.route('/change-password').patch(isAuthenticated, changePassword)

router.route('/delete-account').delete(isAuthenticated, deleteAccount);
router.route('/update-account').patch(isAuthenticated, updateProfile);


// EMAILS AUTH
router.route('/verify/:token').get(isAuthenticated, verifyUser)
router.route('/verify').post(isAuthenticated, requestVerification, sendRequestedVerification)
router.route('/change-email').post(isAuthenticated, changeEmail);
router.route('/verify-email/:token').get(isAuthenticated, verifyNewEmail);




export default router