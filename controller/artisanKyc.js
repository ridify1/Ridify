const express = require('express')
const kycModel = require('../model/artisanKyc')
const userModel = require('../model/user')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')
const mongoose = require('mongoose')

exports.artisanKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: "User not authenticated",
                statusCode: 401
            })
        }

        const existingKyc = await kycModel.findOne({ artisanId: id });
        
      if (existingKyc) {
      return next({
          message: existingKyc.kycVerified
              ? "KYC already verified for this user"
              : "KYC already submitted and pending verification",
          statusCode: 400
      });
  }

        const ALLOWED_ROLES = ['Electrician', 'Plumber', 'Painter', 'HVAC', 'Carpenter', 'Cleaning', 'Curlinary', 'Security', 'welder', 'mechanic', 'cleaner', 'tailor/fashionDesigner', 'otherSkilledWork'];

        const checkRole = await userModel.findById(id);
        if (!checkRole) {
    return next({
        message: "User not found",
        statusCode: 404
    });
}

if (!ALLOWED_ROLES.includes(checkRole.role)) {
    return next({
        message: "Unauthorized: Only artisans can submit KYC",
        statusCode: 403
    });
}
        const { fullLegalName, phoneNumber, email, cityOrLocation, primaryTrade, yearsOfExperience, availability, aboutYourWork } = req.body;

        if (!fullLegalName || !phoneNumber || !email || !cityOrLocation || !primaryTrade || !yearsOfExperience || !availability || !aboutYourWork) {
            return next({
                message: "All fields are required",
                statusCode: 400
            })
        }

         if (!email || !email.includes('@') || !email.includes('.')) {
    return next({
        message: 'Input a valid Email Address',
        statusCode: 400
    });
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
            folder: 'Ridify/artisanKyc',
        });
        urls.push(result.secure_url);
        publicIds.push(result.public_id);
        fs.unlinkSync(file.path);
    }
    return { urls, publicIds };
};

const idUpload = await uploadGroup(idFiles);
const selfieUpload = await uploadGroup(selfieFiles);


        const artisanData = {
            artisanId: id,
            fullLegalName,
            phoneNumber,
            email,
            cityOrLocation,
            primaryTrade,
            yearsOfExperience,
            availability,
            aboutYourWork,
            identification: idUpload.urls[0],
            identificationPublicId: idUpload.publicIds[0],
            selfie: selfieUpload.urls[0],
            selfiePublicId: selfieUpload.publicIds[0],
        };

        const kyc = await kycModel.create(artisanData);

        res.status(201).json({
            message: "Artisan KYC submitted successfully",
            data: kyc
        })

    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getArtisanKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: "User not authenticated",
                statusCode: 401
            })
        }
        const kyc = await kycModel.findOne({ artisanId: id });
        
        if (!kyc) {
            return next({
                message: "KYC not found for this user",
                statusCode: 404
            })
        }

        if(kyc.artisanId.toString() !== id) {
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