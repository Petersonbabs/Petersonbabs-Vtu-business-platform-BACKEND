import blacklistedTokens from "../models/blacklistTokens.model.js";
import jwt from 'jsonwebtoken';
import users from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        res.status(401).json({
            status: "fail",
            message: "You are currently not logged in. Please log in to continue"
        })
        return
    }

    const verifiedUser = await verifyToken(token)
    if (!verifiedUser) {
        res.status(401).json({
            status: "fail",
            message: "Invalid token. Please login again.",
            action: 'Login'
        })
        return
    }


    req.user = verifiedUser
    next()

}

export const verifyToken = async (token) => {

    const blacklistedToken = await blacklistedTokens.findOne({ token });


    if (blacklistedToken) {
        return false
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await users.findById(decoded.id)

    if (!user) {
        return false
    }

    return user
}


export const checkAuthorization = (currentUserId, ownerId) => {
    if (currentUserId !== ownerId) {
        return false
    }
}