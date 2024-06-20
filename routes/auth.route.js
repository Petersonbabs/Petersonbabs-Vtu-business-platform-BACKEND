import express from 'express'
import { changePassword, deleteAccount, login, logout, regoster, signUp, updateProfile } from '../controllers/auth.controller.js'
import { sendRequestedVerification } from '../services/mail/requestVerification.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'
import changeEmail from '../services/mail/changeEmail.js'
import { requestVerification, verifyNewEmail, verifyUser } from '../controllers/email.controller.js'
const router = express.Router()

router.route('/signup').post(signUp)
router.route('/register').post(regoster)
router.route('/login').post(login) // login user router
router.route('/logout').post(isAuthenticated, logout) // logout user router
router.route('/change-password').patch(isAuthenticated, changePassword)

router.route('/delete-account').delete(isAuthenticated, deleteAccount);
router.route('/update-account').patch(isAuthenticated, updateProfile);


// EMAILS AUTH
router.route('/verify/:token').get(verifyUser)
router.route('/verify').post(requestVerification, sendRequestedVerification)
router.route('/change-email').post(isAuthenticated, changeEmail);
router.route('/verify-email/:token').get( verifyNewEmail);




export default router