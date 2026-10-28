const userModel = require('../model/user')
const propertyModel = require('../model/propertyUpload')
const jobModel = require('../model/service')
const express = require('express')
const mongoose = require('mongoose')

const getProperties = async () => {
    return propertyModel.find().sort({ createdAt: -1 }).lean();
};

const getJobs = async () => {
    return jobModel.find().sort({ createdAt: -1 }).lean(); // your job model
};

exports.dashboard = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid User ID', statusCode: 400 });
        }

        const user = await userModel.findById(id).lean();

        if (!user) {
            return next({ 
                message: 'User not found', 
                statusCode: 404 });
        }

        switch (user.searchingFor) {
            case 'findAHome': {
                const properties = await getProperties();
                return res.status(200).json({
                    message: 'Home dashboard retrieved successfully',
                    type: 'findAHome',
                    count: properties.length,
                    data: properties
                });
            }

            case 'findWork': {
                const jobs = await getJobs();
                return res.status(200).json({
                    message: 'Work dashboard retrieved successfully',
                    type: 'findWork',
                    count: jobs.length,
                    data: jobs
                });
            }

            default:
                return next({
                    message: 'Invalid or missing searchingFor value',
                    statusCode: 400
                });
        }
    } catch (error) {
        return next({ 
            message: error.message, 
            statusCode: 500 });
    }
};