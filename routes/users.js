'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const authenticateUser = require('../middleware/auth')

const router = express.Router();

//GET endpoint - return the authenticated user
router.get('/', authenticateUser, async (req, res) => {
    try{
        //return user if authenticates
        const users = await User.findByPk(req.currentUser.id, {
            attributes: { exclude: ['password', 'createdAt', 'updatedAt']}
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

//POST endpoint to create a new user
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, emailAddress, password } = req.body;
        const errors = [];

        if (!firstName) errors.push('First name is required');
        if (!lastName) errors.push('Last name is required');
        if (!emailAddress) errors.push ('Email address is required');
        if (!password) errors.push('Password is required');

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        //password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            emailAddress,
            password: hashedPassword
        });

        res.location('/');
        res.status(201).end();
    } catch (error) {

        console.error('Error creating user:', error);
        //validation checks
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => {
                //unique email validation
                if (err.type === 'unique violation' && err.path === 'emailAddress'){
                    return 'Email address already exists';
                }
                return err.message;
            });
            res.status(400).json({
                message: 'Validation error',
                errors: errors
            });
        } else {
            res.status(500).json({
                message:'Internal server error',
                error: error.message
            });
        }
    }
});

module.exports = router;