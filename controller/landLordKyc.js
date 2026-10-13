const kycModel = require('../model/landLordKyc')
const userModel = require('../model/user')
const express = require('express')
const cloudinary = require('../config/cloudinary')
const propertyModel = require('../model/propertyUpload')
const fs = require('fs')
const mongoose = require('mongoose')

exports.landLordKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: "User not authenticated",
                statusCode: 401
            })
        }

        const existingKyc = await kycModel.findOne({ landLordId: id });
        
      if (existingKyc) {
      return next({
          message: existingKyc.kycVerified
              ? "KYC already verified for this user"
              : "KYC already submitted and pending verification",
          statusCode: 400
      });
  }

        const ALLOWED_ROLES = ['landlord', 'admin', 'agent', 'realtor'];

        const checkRole = await userModel.findById(id);
        if (!checkRole) {
    return next({
        message: "User not found",
        statusCode: 404
    });
}

if (!ALLOWED_ROLES.includes(checkRole.role)) {
    return next({
        message: "Unauthorized: Only landlords, admins, agents, and realtors can submit KYC",
        statusCode: 403
    });
}
        const { fullLegalName, DateOfBirth, HomeAddress, city, propertyAddress, NumberOfProperties, ownershipType } = req.body;

        if (!fullLegalName || !DateOfBirth || !HomeAddress || !city || !propertyAddress || !NumberOfProperties || !ownershipType) {
            return next({
                message: "All fields are required",
                statusCode: 400
            })
        }

        const idFiles = req.files?.identification || [];
const selfieFiles = req.files?.selfie || [];

if (!idFiles.length || !selfieFiles.length) {
    return next({
        message: "Identification and selfie images are required",
        statusCode: 400
    });
}

const uploadGroup = async (files) => {
    const urls = [];
    const publicIds = [];
    for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'Ridify/landLordKyc',
        });
        urls.push(result.secure_url);
        publicIds.push(result.public_id);
        fs.unlinkSync(file.path);
    }
    return { urls, publicIds };
};

const idUpload = await uploadGroup(idFiles);
const selfieUpload = await uploadGroup(selfieFiles);


        const landlordData = {
            landLordId: id,
            fullLegalName,
            DateOfBirth,
            HomeAddress,
            city,
            propertyAddress,
            NumberOfProperties,
            ownershipType,
            identification: idUpload.urls[0],
            identificationPublicId: idUpload.publicIds[0],
            selfie: selfieUpload.urls[0],
            selfiePublicId: selfieUpload.publicIds[0],
        };

        const kyc = await kycModel.create(landlordData);

        res.status(201).json({
            message: "Landlord KYC submitted successfully",
            data: kyc
        })

    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getLandLordKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: "User not authenticated",
                statusCode: 401
            })
        }
        const kyc = await kycModel.findOne({ landLordId: id });
        const admin = await userModel.findById(id);
        if (!kyc) {
            return next({
                message: "KYC not found for this user",
                statusCode: 404
            })
        }

        if(admin.role !== 'admin' && kyc.landLordId.toString() !== id) {
            return next({
                message: "Unauthorized: You can only access your own KYC information",
                statusCode: 403
            })
        }
        res.status(200).json({
            message: "KYC found for this user",
            data: kyc
        })
    }catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

const ALLOWED_ROLES = ['landlord', 'admin', 'agent', 'realtor'];

const cleanup = (files = []) => {
    files.forEach((f) => {
        try { fs.unlinkSync(f.path); } catch (_) {}
    });
};

const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const trimmed = String(value).trim();
    if (trimmed.startsWith('[')) {
        try { return JSON.parse(trimmed); } catch (_) {}
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
};

exports.propertyUpload = async (req, res, next) => {
    // works with both upload.array('gallery') and upload.fields([{ name: 'gallery' }])
    const galleryFiles = Array.isArray(req.files) ? req.files : (req.files?.gallery || []);

    try {
        const { id } = req.user;

        if (!id) {
            cleanup(galleryFiles);
            return next({ message: 'User not authenticated', statusCode: 401 });
        }

        const kyc = await kycModel.findOne({ landLordId: id, kycVerified: true });
        if (!kyc) {
            cleanup(galleryFiles);
            return next({
                message: 'KYC not verified. Please complete KYC verification before uploading property.',
                statusCode: 403
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            cleanup(galleryFiles);
            return next({ message: 'User not found', statusCode: 404 });
        }

        if (!ALLOWED_ROLES.includes(user.role)) {
            cleanup(galleryFiles);
            return next({
                message: 'Unauthorized: Only landlords, admins, agents, and realtors can upload properties',
                statusCode: 403
            });
        }

        const {
            title, propertyType, beds, baths, area, description,
            state, city, streetAddress, rent, availability
        } = req.body;

        const amenities = parseList(req.body.amenities);

        if (
            !title || !propertyType || !beds || !baths || !area || !description ||
            !state || !city || !streetAddress || !rent || !availability ||
            amenities.length === 0
        ) {
            cleanup(galleryFiles);
            return next({ message: 'All fields are required', statusCode: 400 });
        }

        const rentValue = Number(String(rent).replace(/,/g, ''));
        if (!Number.isFinite(rentValue) || rentValue <= 0) {
            cleanup(galleryFiles);
            return next({
                message: 'Rent must be a valid number, e.g. 2000000',
                statusCode: 400
            });
        }

        if (galleryFiles.length === 0) {
            return next({
                message: 'At least one gallery image is required',
                statusCode: 400
            });
        }

        const uploadGroup = async (files) => {
            const urls = [];
            const publicIds = [];
            for (const file of files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'Ridify/propertyUpload',
                });
                urls.push(result.secure_url);
                publicIds.push(result.public_id);
                fs.unlinkSync(file.path);
            }
            return { urls, publicIds };
        };

        const galleryUpload = await uploadGroup(galleryFiles);

        const property = await propertyModel.create({
            landLordId: id,
            landLordKycId: kyc._id,
            title,
            propertyType,
            beds,
            baths,
            area,
            description,
            state,
            city,
            streetAddress,
            rent: rentValue,
            availability,
            amenities,
            gallery: galleryUpload.urls,
            galleryPublicId: galleryUpload.publicIds
        });

        res.status(201).json({
            message: 'Property uploaded successfully',
            data: property
        });
    } catch (error) {
        cleanup(galleryFiles);
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getPropertyByLandLord = async (req, res, next) => {
    try {

    }catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.updatePropertyUpload = async (req, res, next) => {
    const newFiles = Array.isArray(req.files) ? req.files : (req.files?.gallery || []);

    try {
        const { id } = req.user;

        if (!id) {
            cleanup(newFiles);
            return next({ message: 'User not authenticated', statusCode: 401 });
        }

        const { propertyId } = req.params;

        if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
            cleanup(newFiles);
            return next({ message: 'A valid property ID is required', statusCode: 400 });
        }

        const property = await propertyModel.findById(propertyId);
        if (!property) {
            cleanup(newFiles);
            return next({ message: 'Property not found', statusCode: 404 });
        }

        // ownership check (this was the line that crashed)
        if (property.landLordId.toString() !== id) {
            cleanup(newFiles);
            return next({
                message: 'Unauthorized: You can only update your own property',
                statusCode: 403
            });
        }

        const kyc = await kycModel.findOne({ landLordId: id, kycVerified: true });
        if (!kyc) {
            cleanup(newFiles);
            return next({
                message: 'KYC not verified. Please complete KYC verification before updating property.',
                statusCode: 403
            });
        }

        const {
            title, propertyType, beds, baths, area, description,
            state, city, streetAddress, rent, availability
        } = req.body;

        const propertyData = {};

        const simpleFields = {
            title, propertyType, beds, baths, area, description,
            state, city, streetAddress, availability
        };
        for (const [key, value] of Object.entries(simpleFields)) {
            if (value !== undefined && value !== '') propertyData[key] = value;
        }

        if (rent !== undefined && rent !== '') {
            const rentValue = Number(String(rent).replace(/,/g, ''));
            if (!Number.isFinite(rentValue) || rentValue <= 0) {
                cleanup(newFiles);
                return next({
                    message: 'Rent must be a valid number, e.g. 2000000',
                    statusCode: 400
                });
            }
            propertyData.rent = rentValue;
        }

        if (req.body.amenities !== undefined) {
            const amenities = parseList(req.body.amenities);
            if (amenities.length === 0) {
                cleanup(newFiles);
                return next({ message: 'Amenities cannot be empty', statusCode: 400 });
            }
            propertyData.amenities = amenities;
        }

        // Only replace the gallery if new images were actually sent
        let oldPublicIds = [];
        if (newFiles.length > 0) {
            const urls = [];
            const publicIds = [];
            for (const file of newFiles) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'Ridify/propertyUpload',
                });
                urls.push(result.secure_url);
                publicIds.push(result.public_id);
                fs.unlinkSync(file.path);
            }
            propertyData.gallery = urls;
            propertyData.galleryPublicId = publicIds;
            oldPublicIds = property.galleryPublicId || [];
        }

        const updatedProperty = await propertyModel.findByIdAndUpdate(
            propertyId,
            propertyData,
            { new: true, runValidators: true }
        );

        // Delete old Cloudinary images only after the DB update succeeded
        for (const pid of oldPublicIds) {
            try { await cloudinary.uploader.destroy(pid); } catch (_) {}
        }

        res.status(200).json({
            message: 'Property updated successfully',
            data: updatedProperty
        });
    } catch (error) {
        cleanup(newFiles);
        return next({ message: error.message, statusCode: 500 });
    }
};