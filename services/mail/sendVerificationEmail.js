import transporter from "./transporter.nodemailer.js";

export const sendVerificationEmail = async (userName, email, verificationToken) => {
    console.log('sending email..');
    const verificationOptions = {
        from: 'NoByll',
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
            <p style="font-size: 1.1rem; line-height: 1.5;">Thank you for registering with us. Please click the button below to verify your email address and complete your registration.</p>
            <button style=" border: none; box-shadow: 1px 0 5px rgba(0, 0, 0, 0.192); border-radius: 7px 0; margin: 20px 0;  font-size: 1rem; color: #fff; background-color: #4ade80; text-decoration: none;"><a href=${`${process.env.clientDomain}/verify/${verificationToken}`} style="color: #fff;  text-decoration: none; padding: 10px 20px; display: block; ">Verify Account</a></button>
            <p>If you did not create an account, no further action is required.</p>
        </div>
        <div class="footer">
            <p>© 2024 NoByll.com. All rights reserved.</p>
        </div>
    </div>
        
        `
    }

    await transporter.sendMail(verificationOptions)
}

