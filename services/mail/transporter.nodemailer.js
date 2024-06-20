import { createTransport } from 'nodemailer';
import dotEnv from 'dotenv';
dotEnv.config();

const transporter = createTransport({
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURITY,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

export default transporter