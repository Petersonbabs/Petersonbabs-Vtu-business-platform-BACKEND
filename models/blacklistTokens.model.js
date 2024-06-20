import {Schema, model} from 'mongoose';

const blackListSchema = Schema({
    token: {
        type: String,
        required: true
    }
})

const blackListModel = model('blacklistToken', blackListSchema)

export default blackListModel