const userModel = require('../model/user')
const propertyModel = require('../model/propertyUpload')
const artisanModel = require('../model/service')
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

const PROPERTY_CATEGORIES = ['apartment', 'studio', 'serviced', 'shop']; 

exports.getPropertiesByCategory = async (req, res, next) => {
    try {
        const { id } = req.user;
        
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid User ID', statusCode: 400 });
        }
        
        const category = String(req.query.category || '').trim().toLowerCase();
        
        if (!category) {
            return next({ message: 'Select one category', statusCode: 400 });
        }
        
        if (!PROPERTY_CATEGORIES.includes(category)) {
            return next({
                message: `Category must be one of: ${PROPERTY_CATEGORIES.join(', ')}`,
                statusCode: 400
            });
        }
        
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        
        const filter = {
            category,
            archive: { $ne: true },
            isDeleted: { $ne: true }
        };
        
        const [properties, total] = await Promise.all([
            propertyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            propertyModel.countDocuments(filter)
        ]);
        
        return res.status(200).json({
            message: 'Properties retrieved successfully',
            count: properties.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: properties
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getPropertiesByLocation = async (req, res, next) => {
    try {
        const { id } = req.user;
        
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid User ID', statusCode: 400 });
        }
        
        const cityOrStateOrName = String(req.query.cityOrStateOrName || '').trim().toLowerCase();
        
        if (!cityOrStateOrName) {
            return next({ message: 'Provide a city, state, or name', statusCode: 400 });
        }
        
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        
        const filter = {
            $or: [
                {
                    city: {
                        $regex: `^${cityOrStateOrName}$`,
                        $options: "i"
                    }
                },
                {
                    state: {
                        $regex: `^${cityOrStateOrName}$`,
                        $options: "i"
                    }
                },
                {
                    fullName: {
                        $regex: `^${cityOrStateOrName}$`,
                        $options: "i"
                    }
                }
            ],
            archive: { $ne: true },
            isDeleted: { $ne: true }
        };
        
        const [properties, total] = await Promise.all([
            propertyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            propertyModel.countDocuments(filter)
        ]);
        
        return res.status(200).json({
            message: 'Properties retrieved successfully',
            count: properties.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: properties
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

const ARTISAN_CATEGORIES = ['Electrician', 'Plumber', 'Painter', 'HVAC', 'Carpenter', 'Curlinary', 'Security', 'welder', 'mechanic', 'cleaner', 'tailor/fashionDesigner', 'otherSkilledWork', 'null']; 

exports.getArtisansByCategory = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid User ID', statusCode: 400 });
        }

        const categoryForJob = String(req.query.categoryForJob || '').trim();

        if (!categoryForJob) {
            return next({ message: 'Select one category', statusCode: 400 });
        }

        if (!ARTISAN_CATEGORIES.includes(categoryForJob)) {
            return next({
                message: `Category must be one of: ${ARTISAN_CATEGORIES.join(', ')}`,
                statusCode: 400
            });
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;

        const filter = {
            categoryForJob,
            archive: { $ne: true },
            isDeleted: { $ne: true }
        };

        const [artisans, total] = await Promise.all([
            userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            userModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            message: 'Artisans retrieved successfully',
            count: artisans.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: artisans
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getArtisansByLocation = async (req, res, next) => {
    try {
        const { id } = req.user;
        
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid User ID', statusCode: 400 });
        }
        
        const cityOrState = String(req.query.cityOrState || '').trim().toLowerCase();
        
        if (!cityOrState) {
            return next({ message: 'Provide a city or a state', statusCode: 400 });
        }
        
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        
        const filter = {
            $or: [
                {
                    city: {
                        $regex: cityOrState,
                        $options: "i"
                    }
                },
                {
                    state: {
                        $regex: cityOrState,
                        $options: "i"
                    }
                }
            ]
        };
        
        const [artisans, total] = await Promise.all([
            artisanModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            artisanModel.countDocuments(filter)
        ]);
        
        return res.status(200).json({
            message: 'artisans retrieved successfully',
            count: artisans.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: artisans
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getPropertiesByLocationAndCategory = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({
                message: "Invalid User ID",
                statusCode: 400
            });
        }

        const cityOrStateOrName = String(req.query.cityOrStateOrName || "").trim();
        const category = String(req.query.category || "").trim();

        if (!cityOrStateOrName || !category) {
            return next({
                message: "Provide a city, state or name and a category",
                statusCode: 400
            });
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;

        const filter = {
            category,
            $or: [
                {
                    city: {
                        $regex: cityOrStateOrName,
                        $options: "i"
                    }
                },
                {
                    state: {
                        $regex: cityOrStateOrName,
                        $options: "i"
                    }
                },
                {
                    fullName: {
                        $regex: cityOrStateOrName,
                        $options: "i"
                    }
                }
            ],
            archive: { $ne: true },
            isDeleted: { $ne: true }
        };

        const [properties, total] = await Promise.all([
            propertyModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            propertyModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            message: "Properties retrieved successfully",
            count: properties.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: properties
        });

    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        });
    }
};;
