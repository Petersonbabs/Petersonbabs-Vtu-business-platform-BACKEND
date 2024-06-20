import transporter from "./transporter.nodemailer.js";
import randomString from "../../utils/randomString.utils.js";

const changeEmail = async (req, res) => {
    const { userName, email } = req.user
    const { newEmail } = req.body
    req.user.newEmail = newEmail
    if (!newEmail) {
        return res.status(400).json({ error: 'Please provide a new email.' });
    }
    if(newEmail === email){
        return res.status(400).json({ error: 'This is your former email.' });
    }


    const verificationToken = randomString(10)
    const verificationExpiration = Date.now() + 360000

    req.user.verificationExpiration = verificationExpiration
    req.user.verificationToken = verificationToken

    await req.user.save()



    const mailOptions = {
        title: "Confirm Email Change",
        sender: "Nobyll",
        to: newEmail,
        from: process.env.EMAIL_USER,
        html: `

        <div class="container" style="font-family: Arial, Helvetica, sans-serif; text-align: center;">
        <div class="header">
            <h1>Confirm Email Change</h1>
        </div>
        <div class="content">
            <h3>Hello ${userName},</h3>
            <p style="font-size: 1.1rem; line-height: 1.5;">We noticed you're trying to change your email. Please click the button below to confirm this action.</p>
            <button style=" border: none; box-shadow: 1px 0 5px rgba(0, 0, 0, 0.192); border-radius: 7px 0; margin: 20px 0;  font-size: 1rem; color: #fff; background-color: #007bff; text-decoration: none;"><a href=${`http://localhost:4000/api/v1/auth/verify-email/${verificationToken}`} style="color: #fff;  text-decoration: none; padding: 10px 20px; display: block; height: 100%;">Verify Account</a></button>
            <p>If you did not request to change your email, kindly ignore this or report to us..</p>
        </div>
        <div class="footer">
            <p>© 2024 | NoByll.com All rights reserved.</p>
        </div>
    </div>

        `
    }


    await transporter.sendMail(mailOptions)
    res.status(200).json({
        status: 'Success',
        message: "Check your email to confirm email change.",
        user: req.user
    })
}

export default changeEmail
