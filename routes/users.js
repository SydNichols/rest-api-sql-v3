'use strict';

const express = require('express');
const { User } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
    try{
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, emailAddress, password } = req.body;

        const user = await User.create({
            firstName,
            lastName,
            emailAddress,
            password
        });

        res.location('/');
        res.status(201).end();
    } catch (error) {

        console.error('Error creating user:', error);

        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => message);
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