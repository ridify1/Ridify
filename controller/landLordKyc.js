const kycModel = require('../model/landLordKyc')
const userModel = require('../model/user')
const express = require('express')
const cloudinary = require('../config/cloudinary')
const propertyModel = require('../model/propertyUpload')
const recordView = require('../utils/propertyHelper')
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
};

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
};

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
    
    const galleryFiles = Array.isArray(req.files) ? req.files : (req.files?.gallery || []);
    const videoFiles = Array.isArray(req.files) ? [] : (req.files?.video || []);
    const allFiles = [...galleryFiles, ...videoFiles];
    const uploaded = []; 

    const uploadFiles = async (files, resourceType = 'image') => {
        const urls = [];
        const publicIds = [];
        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'Ridify/propertyUpload',
                resource_type: resourceType
            });
            urls.push(result.secure_url);
            publicIds.push(result.public_id);
            uploaded.push({ publicId: result.public_id, resourceType });
            fs.unlinkSync(file.path);
        }
        return { urls, publicIds };
    };

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
            state, city, streetAddress, rent, status, category
        } = req.body;

        const amenities = parseList(req.body.amenities);

        if (
            !title || !propertyType || !beds || !baths || !area || !description ||
            !state || !city || !streetAddress || !rent ||!category ||
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

        const galleryUpload = await uploadFiles(galleryFiles, 'image');
        const videoUpload = await uploadFiles(videoFiles, 'video');

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
            category,
            streetAddress,
            rent: rentValue,
            amenities,
            gallery: galleryUpload.urls,
            galleryPublicId: galleryUpload.publicIds,
            video: videoUpload.urls[0],
            videoPublicId: videoUpload.publicIds[0]
        });

        res.status(201).json({
            message: 'Property uploaded successfully',
            data: property
        });
    } catch (error) {
        cleanup(allFiles);
        await Promise.allSettled(
            uploaded.map((u) =>
                cloudinary.uploader.destroy(u.publicId, { resource_type: u.resourceType })
            )
        );
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.updatePropertyUpload = async (req, res, next) => {
    
    const galleryFiles = Array.isArray(req.files) ? req.files : (req.files?.gallery || []);
    const videoFiles = Array.isArray(req.files) ? [] : (req.files?.video || []);
    const allFiles = [...galleryFiles, ...videoFiles];
    const uploaded = [];

    try {
        const { id } = req.user;

        if (!id) {
            cleanup(allFiles);
            return next({ message: 'User not authenticated', statusCode: 401 });
        }

        const { propertyId } = req.params;

        if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
            cleanup(allFiles);
            return next({ message: 'A valid property ID is required', statusCode: 400 });
        }

        const property = await propertyModel.findById(propertyId);
        const admin = await userModel.findById(id);

        if (!property) {
            cleanup(allFiles);
            return next({ message: 'Property not found', statusCode: 404 });
        }

        if (!admin) {
            cleanup(allFiles);
            return next({
                message: "User not found",
                statusCode: 404
            });
        }

        if (admin.role !== 'admin' && property.landLordId.toString() !== id) {
            cleanup(allFiles);
            return next({
                message: 'Unauthorized: You can only update your own property',
                statusCode: 403
            });
        }

        const kyc = await kycModel.findOne({ landLordId: id, kycVerified: true });
        if (!kyc) {
            cleanup(allFiles);
            return next({
                message: 'KYC not verified. Please complete KYC verification before updating property.',
                statusCode: 403
            });
        }

        const {
            title, propertyType, beds, baths, area, description,
            state, city, streetAddress, rent
        } = req.body;

        const propertyData = {};

        const simpleFields = {
            title, propertyType, beds, baths, area, description,
            state, city, streetAddress
        };
        for (const [key, value] of Object.entries(simpleFields)) {
            if (value !== undefined && value !== '') propertyData[key] = value;
        }

        if (rent !== undefined && rent !== '') {
            const rentValue = Number(String(rent).replace(/,/g, ''));
            if (!Number.isFinite(rentValue) || rentValue <= 0) {
                cleanup(allFiles);
                return next({
                    message: 'Rent must be a valid number',
                    statusCode: 400
                });
            }
            propertyData.rent = rentValue;
        }

        if (req.body.amenities !== undefined) {
            const amenities = parseList(req.body.amenities);
            if (amenities.length === 0) {
                cleanup(allFiles);
                return next({ message: 'Amenities cannot be empty', statusCode: 400 });
            }
            propertyData.amenities = amenities;
        }

        let oldGallery = [];
        let oldVideos = [];

        if (galleryFiles.length > 0) {
            const imageUrls = [];
            const imagePublicIds = [];

            oldGallery = property.galleryPublicId || [];

            for (const file of galleryFiles) {
                const resourceType = "image";
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'Ridify/propertyUpload',
                    resource_type: resourceType
                });
                imageUrls.push(result.secure_url);

                imagePublicIds.push(result.public_id);
                uploaded.push({ publicId: result.public_id, resourceType });
                fs.unlinkSync(file.path);
            }
            propertyData.gallery = imageUrls;
            propertyData.galleryPublicId = imagePublicIds;
        }

        if (videoFiles.length > 0) {
        const videoUrls = [];
        const videoPublicIds = [];
        oldVideos = property.videoPublicId || [];

        for (const file of videoFiles) {
            const resourceType = "video";

            const result = await cloudinary.uploader.upload(file.path, {
                folder: "Ridify/propertyUpload",
                resource_type: resourceType
            });

            videoUrls.push(result.secure_url);
            videoPublicIds.push(result.public_id);

            uploaded.push({
                    publicId: result.public_id,
                    resourceType
                });

            fs.unlinkSync(file.path);
        }

        propertyData.video = videoUrls;
        propertyData.videoPublicId = videoPublicIds;
    }

        const updatedProperty = await propertyModel.findByIdAndUpdate(
            propertyId,
            propertyData,
            { new: true, runValidators: true }
        );

        
        for (const id of oldGallery) {
            try { await cloudinary.uploader.destroy(id, { resource_type: "image" }); } catch (error) {}
        }

        for (const id of oldVideos) {
            try { await cloudinary.uploader.destroy(id, { resource_type: "video" }); } catch (error) {}
        }

        res.status(200).json({
            message: 'Property updated successfully',
            data: updatedProperty
        });
    } catch (error) {
        cleanup(allFiles);
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getPropertiesByLandLord = async (req, res, next) => {
    try {
        const { id } = req.user;
        
        if (!id) {
            return next({
                message: 'Invalid User ID',
                statusCode: 400
            })
        }

        const properties = await propertyModel.find({ landLordId: req.user.id, archive: { $ne: true }, isDeleted: { $ne: true } }).select('title rent city state streetAddress availability gallery createdAt').sort({ createdAt: -1 }).lean()

        if (properties.length === 0) {
            return res.status(200).json({
                message: 'No Properties to display'
            })
        }

        res.status(200).json({
            message: 'Properties retrieved successfully',
            count: properties.length,
            data: properties
        })
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getPropertyByLandLord = async (req, res, next) => {
    try {
        const { id } = req.user;
        
        if (!id) {
            return next({
                message: 'Invalid User ID',
                statusCode: 400
            })
        }

        const { propertyId } = req.params;

        if (!mongoose.isValidObjectId(propertyId)) {
            return next({
                message: `Invalid Property ID`,
                statusCode: 400
            })
        }

        const property = await propertyModel.findOne({_id: propertyId, isDeleted: { $ne: true }})

        if (!property) {
        return next({ message: 'Property not found', statusCode: 404 })
        }

        recordView(property, req);

        res.status(200).json({
            message: 'Property retrieved successfully',
            data: property
        })
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.archiveProperty = async (req, res, next) => {
    try {
        const { id }  = req.user;

        if (!id) {
            return next({
                message: 'Unauthorised',
                statusCode: 404
            })
        }

        const { propertyId } = req.params

        if(!propertyId || !mongoose.isValidObjectId(propertyId)) {
            return next({
                message: "Property not found",
                statusCode: 400
            })
        }

        const property = await propertyModel.findOneAndUpdate(
      { _id: propertyId, landLordId: req.user.id },
      { archive: true },
      { new: true, runValidators: true }
    )

    if (!property) {
            return next({
                message: 'Property not found or not owned by you',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'property archived successfully'
        })
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}
exports.unarchiveProperty = async (req, res, next) => {
    try {
        const { id }  = req.user;

        if (!id) {
            return next({
                message: 'Unauthorised',
                statusCode: 404
            })
        }

        const { propertyId } = req.params

        if(!propertyId || !mongoose.isValidObjectId(propertyId)) {
            return next({
                message: "Property not found",
                statusCode: 400
            })
        }

        const property = await propertyModel.findOneAndUpdate(
      { _id: propertyId, landLordId: req.user.id },
      { archive: false },
      { new: true, runValidators: true }
    )

    if (!property) {
            return next({
                message: 'Property not found or not owned by you',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'property unarchived successfully'
        })
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getAchivedPropertiesByLandLord = async (req, res, next) => {
    try {
        const { id } = req.user;
        
        if (!id) {
            return next({
                message: 'Invalid User ID',
                statusCode: 400
            })
        }

        const properties = await propertyModel.find({ landLordId: req.user.id, archive: { $ne: false }, isDeleted: { $ne: true } }).select('title rent city state streetAddress availability gallery createdAt').sort({ createdAt: -1 }).lean()

        if (properties.length === 0) {
            return res.status(200).json({
                message: 'No Properties to display'
            })
        }

        return res.status(200).json({
            message: properties.length
                ? 'Archived properties retrieved successfully'
                : 'No archived properties to display',
            count: properties.length,
            data: properties
        });
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.changeStatus = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: 'Invalid User Id',
                statusCode: 404
            })
        }

        const { status } = req.body;

        const { propertyId } = req.params;
        
        if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
            return next({
                message: 'Invalid Property Id'
            })
        }

         const property = await propertyModel.findOneAndUpdate(
      { _id: propertyId, landLordId: req.user.id },
      { status },
      { new: true, runValidators: true }
    )

    if (!property) {
            return next({
                message: 'Property not found or not owned by you',
                statusCode: 404
            });
        }

        return res.status(200).json({
            message: 'status updated succesfully'
        })
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getPropertiesByStatus = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.isValidObjectId(id)) {
            return next({
                message: "User not found or User Id is not valid",
                statusCode: 400
            })
        }

        const { status } = req.query;

        if (!status) {
            return next({ message: 'Status is required', statusCode: 400 });
        }

        const properties = await propertyModel
            .find({
                landLordId: id,
                status,
                archive: { $ne: true },
                isDeleted: { $ne: true }
            })
            .sort({ createdAt: -1 })
            .lean();

        if (properties.length === 0) {
            return next({
                message: `No property with status "${status}" found`,
                statusCode: 404
            });
        }

        return res.status(200).json({
            message: 'Properties retrieved successfully',
            count: properties.length,
            data: properties
        });
        
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.deleteProperty = async (req, res, next) => {
    try {
        const { id }  = req.user;

        if (!id) {
            return next({
                message: 'User not found',
                statusCode: 404
            })
        }

        const { propertyId } = req.params
        const { reason } = req.body || {}

        if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
            return next({ message: 'A valid property ID is required', statusCode: 400 });
        }

        if (reason !== undefined && typeof reason !== 'string') {
      return next({ message: 'Reason must be a string', statusCode: 400 })
    }

        const property = await propertyModel.findOneAndUpdate(
      { _id: propertyId, landLordId: req.user.id , isDeleted: { $ne: true } },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
        deletionReason: reason
    },
      { new: true, runValidators: true }
    )

    if (!property) {
            return next({
                message: 'Property not found, already deleted, or not owned by you',
                statusCode: 404
            });
        }


        res.status(200).json({
            message: 'property deleted successfully'
        })
    } catch (error) {
        
    }
}

exports.getAllPropertiesByStatus = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.isValidObjectId(id)) {
            return next({
                message: "User not found or User Id is not valid",
                statusCode: 400
            })
        }

        const { status } = req.query;

        if (!status) {
            return next({ message: 'Status is required', statusCode: 400 });
        }

        const properties = await propertyModel
            .find({
                status,
                archive: { $ne: true },
                isDeleted: { $ne: true }
            })
            .sort({ createdAt: -1 })
            .lean();

        if (properties.length === 0) {
            return next({
                message: `No property with status "${status}" found`,
                statusCode: 404
            });
        }

        return res.status(200).json({
            message: 'Properties retrieved successfully',
            count: properties.length,
            data: properties
        });
        
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getPropertyViewStats = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid property ID', statusCode: 400 });
        }

        const { propertyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return next({ message: 'Invalid property ID', statusCode: 400 });
        }

        const property = await propertyModel
            .findOne({ _id: propertyId })
            .select('title totalViews uniqueViews')
            .lean();

        if (!property) {
            return next({ message: 'Property not found', statusCode: 404 });
        }

        if (id != property.landLordId) {
            return next({
                message: 'You can only view for your property',
                statusCode: 400
            })
        }

        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const perDay = await propertyViewModel.aggregate([
            { $match: { property: new mongoose.Types.ObjectId(id), createdAt: { $gte: since } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                newViewers: { $sum: 1 }
            } },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json({ data: { ...property, last30Days: perDay } });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};