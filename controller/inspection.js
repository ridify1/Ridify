const mongoose = require('mongoose');
const express = require('express');
const inspectionModel = require('../model/inspection');
const userModel = require('../model/user');
const propertyModel = require('../model/propertyUpload');
const { createNotification } = require("../services/notificationService");

exports.createInspection = async (req, res, next) => {
     try {
    //     const { id } = req.user;

    //     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    //         return next({ message: 'User not authenticated.', statusCode: 401 });
    //     }

    //     const { propertyId } = req.params;

    //     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    //         return next({ message: 'Invalid property ID', statusCode: 400 });
    //     }

    //     const { preferredDate } = req.body;
    //     const preferredTime = String(req.body.preferredTime || '').trim().slice(0, 50);
    //     const message = String(req.body.message || '').trim().slice(0, 500);

    //     if (!preferredDate) {
    //         return next({ message: 'Preferred date is required.', statusCode: 400 });
    //     }

    //     const date = new Date(preferredDate);
    //     if (Number.isNaN(date.getTime()) || date < new Date()) {
    //         return next({ message: 'Choose a valid future date', statusCode: 400 });
    //     }

    //     const user = await userModel.findById(id);
    //     if (!user) {
    //         return next({ message: 'User not found.', statusCode: 404 });
    //     }

    //     const property = await propertyModel.findOne({
    //         _id: propertyId,
    //         isDeleted: { $ne: true }
    //     });

    //     if (!property) {
    //         return next({ message: 'Property not found.', statusCode: 404 });
    //     }

    //     if (String(property.landLordId) === String(id)) {
    //         return next({ message: 'You cannot inspect your own property', statusCode: 400 });
    //     }

    //     if (property.status !== 'available') {
    //         return next({ message: 'This property is not available for inspection', statusCode: 400 });
    //     }

    //     const existing = await inspectionModel.findOne({
    //         propertyId,
    //         inspectorId: id,
    //         status: { $in: ['pending', 'accepted'] }
    //     });

    //     if (existing) {
    //         return next({ message: 'You already have an open request for this property', statusCode: 409 });
    //     }

    //     const newInspection = await inspectionModel.create({
    //         propertyId,
    //         landLordId: property.landLordId,
    //         inspectorId: id,
    //         preferredDate: date,
    //         preferredTime,
    //         message
    //     });

    //     const inspector = await userModel.findById(id).select('fullName').lean();

    //     if (!inspector) {
    //         return next({ message: 'User not found', statusCode: 404 });
    //     }

    //     try {
    //         const admins = await userModel
    //             .find({ role: 'admin', isDeleted: { $ne: true } })
    //             .select('_id')
    //             .lean();

    //         const notifications = [
    //             {
    //             recipient: newInspection.landLordId,
    //             sender: id,
    //             title: 'New inspection Request',
    //             message: `${inspector.fullName} applied to inspect your property: ${newInspection.propertyId}`,
    //             type: 'inspection',
    //             idType: 'inspectionId',
    //             id: newInspection._id
    //         },

    //         for (const a of admins) {
    //             const key = String(a._id);
    //             if (!notifications.has(key) && key !== String(id)) {
    //                 notifications.set(key, {
    //                     recipient: a._id,
    //                     sender: id,
    //                     title: 'New Property Application',
    //                     message: `${inspector.fullName} applied for property inspection: ${newInspection.propertyId}`,
    //                     type: 'inspection',
    //                     idType: 'inspectionId',
    //                     id: newInspection._id
    //                 });
    //             }
    //         },

    //         notifications.set(String(id), {
    //             recipient: id,
    //             sender: newInspection.inspectorId,
    //             title: 'Inspection Submitted',
    //             message: `Your application to inspect ${newInspection.propertyId} was submitted successfully.`,
    //             type: 'inspection',
    //             idType: 'inspectionId',
    //             id: newInspection._id
    //         })
    //         ];

    //         await notificationModel.insertMany([...notifications.values()], { ordered: false });
    //     } catch (notifyError) {
    //         console.error('Failed to create application notifications:', notifyError.message);
    //     }

    //     return res.status(201).json({
    //         message: 'Inspection request sent successfully',
    //         data: newInspection
    //     });
    } catch (error) {
        if (error.code === 11000) {
            return next({ message: 'You already have an open request for this property', statusCode: 409 });
        }
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getAgentInspections = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next({
                message: 'User not authenticated.',
                statusCode: 401
            })
        }

        const inspections = await inspectionModel.find({ landLordId: id })
            .populate('propertyId', 'title description state city streetAddress rent status category')
            .populate('inspectorId', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: inspections.length === 0
                ? 'No inspection requests to display'
                : 'Inspections retrieved successfully',
            count: inspections.length,
            data: inspections
        });
    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getAgentInspection = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next({
                message: 'User not authenticated.',
                statusCode: 401
            })
        }

        const { inspectionId } = req.params

        const inspection = await inspectionModel.findById(inspectionId)
            .populate('propertyId', 'title description state city streetAddress rent status category')
            .populate('inspectorId', 'fullName email phoneNumber')
            .lean();

       if (!inspection) {
            return next({
                message: 'Inspection request not found',
                statusCode: 404
            });
        }

        return res.status(200).json({
            message: 'Inspection retrieved successfully',
            data: inspection
        });
    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

const ALLOWED_STATUSES = ['accepted', 'declined', 'completed', 'cancelled'];

const TRANSITIONS = {
    pending:   ['accepted', 'declined', 'cancelled'],
    accepted:  ['completed', 'cancelled'],
    declined:  [],
    completed: [],
    cancelled: []
};

exports.updateInspectionStatus = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated.', statusCode: 401 });
        }

        const { inspectionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(inspectionId)) {
            return next({ message: 'Invalid inspection ID', statusCode: 400 });
        }

        const status = String(req.body.status || '').trim().toLowerCase();
        const declineReason = String(req.body.declineReason || '').trim().slice(0, 500);

        if (!ALLOWED_STATUSES.includes(status)) {
            return next({
                message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`,
                statusCode: 400
            });
        }

        if (status === 'declined' && !declineReason) {
            return next({
                message: 'Decline reason is required when declining an inspection.',
                statusCode: 400
            });
        }

        const inspection = await inspectionModel.findById(inspectionId);

        if (!inspection) {
            return next({ message: 'Inspection not found.', statusCode: 404 });
        }

        if (String(inspection.landLordId) !== String(id)) {
            return next({
                message: 'You are not authorized to update this inspection.',
                statusCode: 403
            });
        }

        if (!TRANSITIONS[inspection.status]?.includes(status)) {
            return next({
                message: `Cannot change an inspection from "${inspection.status}" to "${status}".`,
                statusCode: 409
            });
        }

        inspection.status = status;
        inspection.declineReason = status === 'declined' ? declineReason : undefined;

        await inspection.save();

        const inspector = await userModel.findById(id).select('fullName').lean();

        if (!inspector) {
            return next({ message: 'User not found', statusCode: 404 });
        }

        try {
            const admins = await userModel
                .find({ role: 'admin', isDeleted: { $ne: true } })
                .select('_id')
                .lean();

            const notifications = new Map();

            notifications.set(String(job.posterId), {
                recipient: inspection.landLordId,
                sender: id,
                title: 'Inspection status changed',
                message: `${inspector.fullName} changed the status for this inspection: ${inspection.propertyId}`,
                type: 'inspection',
                idType: 'inspectionId',
                id: inspection._id
            });

            for (const a of admins) {
                const key = String(a._id);
                if (!notifications.has(key) && key !== String(id)) {
                    notifications.set(key, {
                        recipient: a._id,
                        sender: id,
                        title: 'Inspection status changed',
                        message: `${inspector.fullName} changed inspection status for this property: ${inspection.propertyId}`,
                        type: 'inspection',
                        idType: 'inspectionId',
                        id: inspection._id
                    });
                }
            }

            notifications.set(String(id), {
                recipient: id,
                sender: inspection.landLordId,
                title: 'Inspection status changed',
                message: `Your inspection for ${inspection.propertyId} has changed.`,
                type: 'inspection',
                idType: 'inspectionId',
                id: inspection._id
            });

            await notificationModel.insertMany([...notifications.values()], { ordered: false });
        } catch (notifyError) {
            console.error('Failed to create inspection notifications:', notifyError.message);
        }

        return res.status(200).json({
            message: 'Inspection status updated successfully',
            data: inspection
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

const INSPECTION_STATUSES = ['pending', 'accepted', 'declined', 'completed', 'cancelled'];

exports.getInspectorsRequests = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({
                message: 'User not authenticated.',
                statusCode: 401
            });
        }

        const filter = { inspectorId: id };

        const statusInput = String(req.query.status || '').trim().toLowerCase();

        if (statusInput) {
            if (!INSPECTION_STATUSES.includes(statusInput)) {
                return next({
                    message: `Status must be one of: ${INSPECTION_STATUSES.join(', ')}`,
                    statusCode: 400
                });
            }
            filter.status = statusInput;
        }

        const inspections = await inspectionModel.find(filter)
            .populate('propertyId', 'title description state city streetAddress rent status category')
            .populate('landLordId', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: inspections.length === 0
                ? 'No inspection requests to display'
                : 'Inspection requests retrieved successfully',
            count: inspections.length,
            data: inspections
        });
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        });
    }
};

exports.getInspectorsInspection = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next({
                message: 'User not authenticated.',
                statusCode: 401
            })
        }

        const { inspectionId } = req.params

        const inspections = await inspectionModel.findOne({ _id: inspectionId, inspectorId: id })
            .populate('propertyId', 'title description state city streetAddress rent status category')
            .populate('inspectorId', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .lean();

        if (!inspections) {
            return res.status(404).json({
                message: 'Inspection request not found',
                statusCode: 404
            })
        }

        return res.status(200).json({
            message: 'Inspection request retrieved successfully',
            data: inspections
        });
    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}