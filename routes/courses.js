'use strict';

const express = require('express');
const { Course, User } = require('../models');
const authenticateUser = require('../middleware/auth')

const router = express.Router();

//GET endpoint - returns all courses for the user
router.get('/', async (req, res) => {
    try {
        const courses = await Course.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'password'] }
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
});

//GET course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, {
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'password'] }
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

//POST endpoint to create a new course
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { title, description, estimatedTime, materialsNeeded, userId } = req.body;
        const errors = [];

        if (!title) errors.push('Title is required');
        if (!description) errors.push('Description is required');

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        
        const course = await Course.create({
            title,
            description,
            estimatedTime,
            materialsNeeded,
            userId: req.currentUser.id
        });

        res.location(`/api/courses/${course.id}`);
        res.status(201).end();
    } catch (error) {
        console.error('Error creating course:', error);

        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({
                message: 'Validation error',
                errors: errors
            });
        } else {
            res.status(500).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }
});

//PUT route for editing courses
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const { title, description, estimatedTime, materialsNeeded, userId } = req.body;
        const errors = [];

        if (!title) errors.push('Title is required');
        if (!description) errors.push('Description is required');

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        } 

        const course = await Course.findByPk(req.params.id);

        if (course) {

            if (course.userId !== req.currentUser.id){
                return res.status(403).json({
                    message: 'Access denied'
                });
            }

            await course.update({
                title,
                description,
                estimatedTime,
                materialsNeeded
            });
            res.status(204).end();
        } else {
            res.status(404).json({
                message: 'Course not found'
            });
        }
    } catch (error) {
        console.error('Error updating course:', error);

        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({
                message: 'Validation error',
                errors: errors
            });
        } else {
            res.status(500).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }
});

//DELETE enpoint to delete a course
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (course) {

            if (course.userId !== req.currentUser.id) {
                return res.status(403).json({
                    message: 'Access denied'
                });
            }

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