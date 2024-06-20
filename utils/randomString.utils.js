import crypto from 'crypto'

const randomString =  (number)=>{

    const randomString = crypto.randomBytes(number).toString('hex');

    return randomString
    
}

export default randomString