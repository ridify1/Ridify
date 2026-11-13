const mongoose = require('mongoose');
const express = require('express');
const savedModel = require('../model/savedProperty')
const userModel = require('../model/user');
const propertyModel = require('../model/propertyUpload');

exports.saveProperty = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: 'User not authenticated',
                statusCode: 401
            })
        }

        const { propertyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next({ message: 'Invalid property ID', statusCode: 400 });
}

        const property = await propertyModel.findById(propertyId);

        if (!property) {
            return next({
                statusCode: 404,
                message: "Property not found",
            });
        }

        const alreadySaved = await savedPropertyModel.findOne({
            user: id,
            property: propertyId,
        });

        if (alreadySaved.property === propertyId) {
            return next({
                statusCode: 400,
                message: "Property already saved",
            });
        }

        const saved = await savedPropertyModel.create({
            user: id,
            property: propertyId,
        });

        res.status(201).json({
            success: true,
            message: "Property saved successfully",
            data: saved,
        });

    } catch (error) {
        next(error);
    }
};

exports.getSavedProperties = async (req, res, next) => {
    try {

        const { id } = req.user;

        if (!id) {
            return next({
                message: 'User not authenticated',
                statusCode: 401
            })
        }

        const savedProperties = await savedModel
            .find({ user: id })
            .populate({
                path: 'property',
                match: { archive: { $ne: true }, isDeleted: { $ne: true } }
            })
            .sort({ createdAt: -1 });

        const data = savedProperties.filter((item) => item.property);

        res.status(200).json({
            message: "Saved properties retrieved successfully",
             count: data.length,
             data
        })

    } catch (error) {
        next(error);
    }
};

exports.unsaveProperty = async (req, res, next) => {

    try {

        const { id } = req.user;

        if (!id) {
            return next({
                message: 'User not authenticated',
                statusCode: 401
            })
        }

        const { propertyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next({ message: 'Invalid property ID', statusCode: 400 });
} 

        const saved = await savedPropertyModel.findOneAndDelete({
            user: id,
            property: propertyId,
        });

        if (!saved) {
            return next({
                statusCode: 404,
                message: "Saved property not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Property removed from saved list",
        });

    } catch (error) {
        next(error);
    }
};

exports.getSavedProperty = async (req, res, next) => {
    try {

        const { id } = req.user;

        if (!id) {
            return next({
                message: 'User not authenticated',
                statusCode: 401
            })
        }

        const { propertyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return next({ message: 'Input a valid property Id', statusCode: 400 });
        }

        const savedProperties = await savedPropertyModel
            .find({ property: propertyId })
            .populate("property")
            .sort({ createdAt: -1 });

        if (!saved || !saved.property) {
            return next({ message: 'Saved property not found', statusCode: 404 });
        }

        res.json({
            success: true,
            data: savedProperties,
        });

    } catch (error) {
        next(error);
    }
};
