const userModel = require('../model/user')
const express = require('express')
const mongoose = require('mongoose')
const serviceModel = require('../model/service')
const kycModel = require('../model/artisanKyc')
const serviceApplyModel = require('../model/serviceApply')
const fs = require('fs');

const ALLOWED_CATEGORIES = [
    'Electrician', 'Plumber', 'Painter', 'HVAC', 'Carpenter',
    'Cleaning', 'Curlinary', 'Security'
]; 

const RATE_TYPES = ['hourly', 'daily', 'weekly', 'monthly', 'perJob', 'fixed'];

const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const trimmed = String(value).trim();
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
        } catch (_) {}
    }
    return trimmed.split(',');
};

const removeTempFiles = (files) => {
    for (const file of files) {
        try {
            if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (err) {
            console.error('Temp file cleanup failed:', err.message);
        }
    }
};

exports.myServices = async (req, res, next) => {
    const photoFiles = req.files?.photos || [];
    const videoFiles = req.files?.video || [];
    const allFiles = [...photoFiles, ...videoFiles];
    const uploaded = []; // for rollback if saving fails

    const uploadFiles = async (files, resourceType) => {
        const urls = [];
        const publicIds = [];
        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'Ridify/myService',
                resource_type: resourceType
            });
            urls.push(result.secure_url);
            publicIds.push(result.public_id);
            uploaded.push({ publicId: result.public_id, resourceType });
        }
        return { urls, publicIds };
    };

    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Unauthorised', statusCode: 401 });
        }

        const service = String(req.body?.service || '').trim();
        const engagement = String(req.body?.engagement || '').trim();
        const description = String(req.body?.description || '').trim();
        const area = String(req.body?.area || '').trim();
        const cityState = String(req.body?.cityState || '').trim();
        const rateTypeInput = String(req.body?.rateType || '').trim().toLowerCase();
        const rate = Number(req.body?.rate);

        const whatsIncluded = parseList(req.body?.whatsIncluded)
            .map((item) => String(item).trim())
            .filter(Boolean);

        if (!service || !engagement || !description || !area || !cityState || !rateTypeInput || !whatsIncluded.length) {
            return next({ message: 'All fields are required', statusCode: 400 });
        }

        if (!Number.isFinite(rate) || rate <= 0) {
            return next({ message: 'Rate must be a number greater than 0', statusCode: 400 });
        }

        const rateType = RATE_TYPES.find((t) => t.toLowerCase() === rateTypeInput);

        if (!rateType) {
            return next({ message: `Rate type must be one of: ${RATE_TYPES.join(', ')}`, statusCode: 400 });
        }

        if (photoFiles.length === 0) {
            return next({ message: 'At least one picture of your work is required', statusCode: 400 });
        }

        const user = await userModel.findById(id).select('categoryForJob').lean();

        if (!user) {
            return next({ message: 'User not found', statusCode: 404 });
        }

        if (!ALLOWED_CATEGORIES.includes(user.categoryForJob)) {
            return next({ message: 'Only artisans can upload a service', statusCode: 403 });
        }

        const kyc = await kycModel.findOne({ artisanId: id, kycVerified: true }).select('_id').lean();

        if (!kyc) {
            return next({
                message: 'KYC not verified. Please complete KYC verification before uploading a service.',
                statusCode: 403
            });
        }

        const photoUpload = await uploadFiles(photoFiles, 'image');
        const videoUpload = await uploadFiles(videoFiles, 'video');

        const created = await serviceModel.create({
            artisanId: id,
            artisanKycId: kyc._id,
            category: user.categoryForJob,
            service,
            engagement,
            description,
            area,
            cityState,
            rate,
            rateType,
            whatsIncluded,
            photos: photoUpload.urls,
            photoPublicIds: photoUpload.publicIds,
            video: videoUpload.urls[0],
            videoPublicId: videoUpload.publicIds[0]
        });

        return res.status(201).json({
            message: 'Service uploaded successfully',
            data: {
                _id: created._id,
                artisanId: created.artisanId,
                category: created.category,
                service: created.service,
                engagement: created.engagement,
                description: created.description,
                area: created.area,
                cityState: created.cityState,
                rate: created.rate,
                rateType: created.rateType,
                whatsIncluded: created.whatsIncluded,
                photos: created.photos,
                video: created.video,
                createdAt: created.createdAt
            }
        });
    } catch (error) {
        await Promise.all(
            uploaded.map((u) =>
                cloudinary.uploader.destroy(u.publicId, { resource_type: u.resourceType }).catch(() => {})
            )
        );
        return next({ message: error.message, statusCode: 500 });
    } finally {
        removeTempFiles(allFiles);
    }
};

exports.createserviceApplication = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated.', statusCode: 401 });
        }

        const { artisanId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(artisanId)) {
            return next({ message: 'Invalid artisan ID', statusCode: 400 });
        }

        const { preferredDate } = req.body;
        const preferredTime = String(req.body.preferredTime || '').trim().slice(0, 50);
        const message = String(req.body.message || '').trim().slice(0, 500);

        if (!preferredDate) {
            return next({ message: 'Preferred date is required.', statusCode: 400 });
        }

        const date = new Date(preferredDate);
        if (Number.isNaN(date.getTime()) || date < new Date()) {
            return next({ message: 'Choose a valid future date', statusCode: 400 });
        }

        const userExists = await userModel.exists({ _id: id });
        if (!userExists) {
            return next({ message: 'User not found.', statusCode: 404 });
        }

        const service = await serviceModel.findOne({ artisanId }).select('artisanId').lean();

        if (!service) {
            return next({ message: 'Service not found.', statusCode: 404 });
        }

        if (String(service.artisanId) === String(id)) {
            return next({ message: 'You cannot request your own service', statusCode: 400 });
        }

        const existing = await serviceApplyModel.findOne({
            artisanId,
            userId: id,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existing) {
            return next({ message: 'You already have an open request for this service', statusCode: 409 });
        }

        const newService = await serviceApplyModel.create({
            artisanId: service.artisanId,
            userId: id,
            preferredDate: date,
            preferredTime,
            message
        });

        return res.status(201).json({
            message: 'Service request sent successfully',
            data: newService
        });
    } catch (error) {
        if (error.code === 11000) {
            return next({ message: 'You already have an open request for this service', statusCode: 409 });
        }
        return next({ message: error.message, statusCode: 500 });
    }
};

const SERVICE_REQUEST_STATUSES = ['pending', 'accepted', 'declined', 'completed', 'cancelled']; // match your schema

exports.getArtisanApplications = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated.', statusCode: 401 });
        }

        const filter = { artisanId: id };

        const statusInput = String(req.query.status || '').trim().toLowerCase();

        if (statusInput) {
            if (!SERVICE_REQUEST_STATUSES.includes(statusInput)) {
                return next({
                    message: `Status must be one of: ${SERVICE_REQUEST_STATUSES.join(', ')}`,
                    statusCode: 400
                });
            }
            filter.status = statusInput;
        }

        const applications = await serviceApplyModel.find(filter)
            .populate('userId', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: applications.length === 0
                ? 'No application requests to display'
                : 'Applications retrieved successfully',
            count: applications.length,
            data: applications
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getArtisanInspection = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated.', statusCode: 401 });
        }

        const { applicationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return next({ message: 'Invalid application ID', statusCode: 400 });
        }

        // artisanId in the filter: an artisan can only fetch requests sent to them
        const application = await serviceApplyModel
            .findOne({ _id: applicationId, artisanId: id })
            .populate('userId', 'fullName email phoneNumber')
            .lean();

        if (!application) {
            return next({ message: 'Application request not found', statusCode: 404 });
        }

        return res.status(200).json({
            message: 'Application retrieved successfully',
            data: application
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

const ALLOWED_STATUSES = ['accepted', 'declined', 'completed', 'cancelled'];

const TRANSITIONS = {
    pending:   ['accepted', 'declined', 'cancelled'],
    accepted:  ['completed', 'cancelled'],
    declined:  [],
    completed: [],
    cancelled: []
};

exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated.', statusCode: 401 });
        }

        const { applicationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return next({ message: 'Invalid application ID', statusCode: 400 });
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
                message: 'Decline reason is required when declining an application.',
                statusCode: 400
            });
        }

        const application = await serviceApplyModel.findById(applicationId);

        if (!application) {
            return next({ message: 'Application not found.', statusCode: 404 });
        }

        if (String(application.artisanId) !== String(id)) {
            return next({
                message: 'You are not authorized to update this application.',
                statusCode: 403
            });
        }

        if (!TRANSITIONS[application.status]?.includes(status)) {
            return next({
                message: `Cannot change an application from "${application.status}" to "${status}".`,
                statusCode: 409
            });
        }

        application.status = status;
        application.declineReason = status === 'declined' ? declineReason : undefined;

        await application.save();

        return res.status(200).json({
            message: 'Application status updated successfully',
            data: application
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

const APPLICATION_STATUSES = ['pending', 'accepted', 'declined', 'completed', 'cancelled'];

exports.getUsersRequests = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({
                message: 'User not authenticated.',
                statusCode: 401
            });
        }

        const filter = { userId: id };

        const statusInput = String(req.query.status || '').trim().toLowerCase();

        if (statusInput) {
            if (!APPLICATION_STATUSES.includes(statusInput)) {
                return next({
                    message: `Status must be one of: ${APPLICATION_STATUSES.join(', ')}`,
                    statusCode: 400
                });
            }
            filter.status = statusInput;
        }

        const applications = await serviceApplyModel.find(filter)
        .populate('artisanId', 'fullName email phoneNumber')
            .populate('userId', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: applications.length === 0
                ? 'No Inspection requests to display'
                : 'Inspection requests retrieved successfully',
            count: applications.length,
            data: applications
        });
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        });
    }
};

exports.getUsersApplication = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next({
                message: 'User not authenticated.',
                statusCode: 401
            });
        }

        const { applicationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return next({
                message: 'Invalid application ID',
                statusCode: 400
            });
        }

        const application = await serviceApplyModel.findOne({ _id: applicationId, userId: id })
            .populate('artisanId', 'fullLegalName PhoneNumber email cityOrLocation primaryTrade yearsOfExperience')
            .populate('userId', 'fullName email phoneNumber')
            .lean();

        if (!application) {
            return next({
                message: 'Application request not found',
                statusCode: 404
            });
        }

        return res.status(200).json({
            message: 'Application request retrieved successfully',
            data: application
        });
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        });
    }
};