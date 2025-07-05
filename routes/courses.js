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

//GET course by ID

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'user'
                }
            ]
        });

        if (course) {
            res.status(200).json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error fetching course:', error)
        res.status(500).json({
            message: 'Internal server error', 
            error: error.message
        });
    }
});

//POST Course - 201 res code
router.post('/', async (req, res) => {
    try {
        const { title, description, estimatedTime, materialsNeeded, userId } = req.body;

        const course = await Course.create({
            title,
            description,
            estimatedTime,
            materialsNeeded,
            userId
        });

        res.location(`/api/courses/${course.id}`);
        res.status(201).end();
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});

//PUT route for courses
router.put('/:id', async (req, res) => {
    try {
        const { title, description, estimatedTime, materialsNeeded, userId } = req.body;

        const course = await Course.findByPk(req.params.id);

        if (course) {
            await course.update({
                title,
                description,
                estimatedTime,
                materialsNeeded,
                userId
            });
            res.status(204).end();
        } else {
            res.status(404).json({
                message: 'Course not found'
            });
        }
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (course) {
            await course.destroy();
            res.status(204).end();
        } else {
            res.status(404).json({
                message: 'Course not found'
            })
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;