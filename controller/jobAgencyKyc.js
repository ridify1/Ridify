const express = require('express')
const kycModel = require('../model/jobAgencyKyc')
const userModel = require('../model/user')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')
const mongoose = require('mongoose')

exports.jobAgencyKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: "User not authenticated",
                statusCode: 401
            })
        }

        const existingKyc = await kycModel.findOne({ jobAgencyId: id });
        
      if (existingKyc) {
      return next({
          message: existingKyc.kycVerified
              ? "KYC already verified for this user"
              : "KYC already submitted and pending verification",
          statusCode: 400
      });
  }

        const ALLOWED_ROLES = ['jobAgent'];

        const checkRole = await userModel.findById(id);
        if (!checkRole) {
    return next({
        message: "User not found",
        statusCode: 404
    });
}

if (!ALLOWED_ROLES.includes(checkRole.role)) {
    return next({
        message: "Unauthorized: Only job Agent can submit KYC",
        statusCode: 403
    });
}
        const { fullLegalName, jobTitle, workEmail, phoneNumber, companyName, registrationNumber, registeredAddress, companyWebsite, organizationSize } = req.body;

        if (!fullLegalName || !jobTitle || !workEmail  || !phoneNumber || !companyName || !registrationNumber || !registeredAddress || !organizationSize) {
            return next({
                message: "All fields are required",
                statusCode: 400
            })
        }
        if(!workEmail.include('@')){
            return next({
                message: 'Input a valid Email Address',
                statusCode: 400
            })
        }

        const idFiles = req.files?.identification || [];
const selfieFiles = req.files?.selfie || [];
const businessDocumentFiles = req.files?.businessDocument || [];

if (!idFiles.length || !selfieFiles.length || !businessDocumentFiles.length) {
    return next({
        message: "Identification, business registration document and selfie images are required",
        statusCode: 400
    });
}

const uploadGroup = async (files) => {
    const urls = [];
    const publicIds = [];
    for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'Ridify/jobAgencyKyc',
        });
        urls.push(result.secure_url);
        publicIds.push(result.public_id);
        fs.unlinkSync(file.path);
    }
    return { urls, publicIds };
};

const idUpload = await uploadGroup(idFiles);
const selfieUpload = await uploadGroup(selfieFiles);
const businessDocumentUpload = await uploadGroup(businessDocumentFiles);


        const jobAgencyData = {
            jobAgencyId: id,
            fullLegalName,
            jobTitle,
            workEmail,
            phoneNumber,
            companyName,
            registrationNumber,
            registeredAddress,
            companyWebsite,
            organizationSize,
            identification: idUpload.urls[0],
            identificationPublicId: idUpload.publicIds[0],
            businessDocument: businessDocumentUpload.urls[0],
            businessDocumentPublicId: businessDocumentUpload.publicIds[0],
            selfie: selfieUpload.urls[0],
            selfiePublicId: selfieUpload.publicIds[0],
        };

        const kyc = await kycModel.create(jobAgencyData);

        res.status(201).json({
            message: "Job Agency KYC submitted successfully",
            data: kyc
        })

    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getJobAgencyKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: "User not authenticated",
                statusCode: 401
            })
        }
        const kyc = await kycModel.findOne({ jobAgencyId: id });
        const admin = await userModel.findById(id);
        
        if (!kyc) {
            return next({
                message: "KYC not found for this user",
                statusCode: 404
            })
        }

        if(kyc.jobAgencyId.toString() !== id) {
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