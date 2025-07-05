'use strict';

const express = require('express');
const { Course, User } = require('../models');

const router = express.Router();

//GET endpoint - returns all courses for the user

router.get('/', async (req, res) => {
    try {
        const courses = await Course.findAll({
            include: [
                {
                    model: User,
                    as: 'user'
                }
            ]
        });
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
})