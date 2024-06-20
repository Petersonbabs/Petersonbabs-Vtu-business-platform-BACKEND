import blacklistedTokens from "../models/blacklistTokens.model.js";
import jwt from 'jsonwebtoken';
import users from "../models/user.js";

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

    const blacklistedToken = await blacklistedTokens.findOne({ token });

    if (blacklistedToken) {
        res.status(401).json({
            status: "fail",
            message: "Invalid token. Please login again"
        })
        return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await users.findById(decoded.id)

    if (!user) {
        res.status(404).json({
            status: "fail",
            message: "Can't find user with the specified token"
        })
        return
    }

    req.user = user
    next()

}


export const checkAuthorization =  (currentUserId, ownerId) => {
    if(currentUserId !== ownerId){
        return false
    }
}