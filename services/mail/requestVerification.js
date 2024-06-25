import transporter from "./transporter.nodemailer.js";

export const sendRequestedVerification = async (verificationToken, req, res, next) => {

    console.log(verificationToken)
    const {email, userName} = req.user

    const verificationOptions = {
        from: 'NoByll',
        title: 'Verify Your Email - NoByll',
        subject: 'Verify Your Email - NoByll',
        sender: 'NoByll',
        to: email,
        html: `
        <div class="container" style="font-family: Arial, Helvetica, sans-serif; text-align: center;">
        <div class="header">
            <h1>Verify Your Account</h1>
        </div>
        <div class="content">
            <h3>Hello ${userName},</h3>
            <p style="font-size: 1.1rem; line-height: 1.5;">You requested for a verification link. Please click the button below to verify your email address and complete your registration.</p>
            <button style=" border: none; box-shadow: 1px 0 5px rgba(0, 0, 0, 0.192); border-radius: 7px 0; margin: 20px 0;  font-size: 1rem; color: #fff; background-color: #007bff; text-decoration: none;"><a href=${`${process.env.clientDomain}/verify/${verificationToken}`} style="color: #fff;  text-decoration: none; padding: 10px 20px; display: block; height: 100%;">Verify Account</a></button>
            <p>If you did not create an account, no further action is required.</p>
        </div>
        <div class="footer">
            <p>© 2024 Your Company. All rights reserved.</p>
        </div>
    </div>
        
        `
    }

    await transporter.sendMail(verificationOptions, (err, info) => {
        if (err) {
            console.log(err)
            res.status(404).json({
                status: 'error',
                message: 'unable to send verification email. Try again...'
            })
            return
        }
    })
    console.log('sending...');
    res.status(200).json({
        status: 'success',
        message: `A new verification link has been sent to you. Check your email.`
    })
}