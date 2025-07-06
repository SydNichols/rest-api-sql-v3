'use strict';

const bcrypt = require('bcryptjs');
const { User } = require('../models');

const authUser = async (req, res, next) => {
    let message;

    try {
        const credentials = req.get('Authorization');

        if (credentials) {
            const encodedCredentials = credentials.split(' ')[1];
            const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString();
            const [emailAddress, password] = decodedCredentials.split(':');

            const user = await User.findOne({
                where: { emailAddress: emailAddress }
            });

            if (user) {
                const authenticated = await bcrypt.compare(password, user.password); 

                if (authenticated) {
                    req.currentUser = user;
                } else {
                    message = `Authentication failure for email: ${emailAddress}`;
                }
            } else {
                message = `User not found for email: ${emailAddress}`;
            }
        } else {
            message: 'Authorization header not found';
        } 
    } catch (error) {
            message = 'Error occured during authentication';
            console.error('Authentication error:', error);
        }

        if (message) {
            console.warn(message);
            res.status(401).json({message: 'Access Denied'});
        } else {
            next();
    }
};

module.exports = authUser;