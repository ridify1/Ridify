const userModel = require('../model/user')
const express = require('express')
const mongoose = require('mongoose')
const serviceModel = require('../model/service')
const kycModel = require('../model/artisanKyc')

const ALLOWED_ROLES = ['Electrician', 'Plumber', 'Painter', 'HVAC', 'Carpenter', 'Cleaning', 'Curlinary', 'Security', 'admin'];

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

exports.myServices = async (req, res, next) => {
    const galleryFiles = Array.isArray(req.files) ? req.files : (req.files?.gallery || []);
    try {
        const { id } = req.user;

        if(!id) {
            return next({
                message: "Unauthorised",
                statusCode: 400
            })
        }

        const kyc = await kycModel.findOne({ ArtisanId: id, kycVerified: true });
                if (!kyc) {
                    cleanup(photoFiles);
                    return next({
                        message: 'KYC not verified. Please complete KYC verification before uploading property.',
                        statusCode: 403
                    });
                }

        const userExist = await userModel.findById({ id })

        if(!userExist) {
            return next({
                message: "User not found",
                statusCode: 400
            })
        }
        const category = userExist.category;

        const {service, engagement, description, area, cityState, rate, rateType, whatsIncluded} = req.body;

        if(!service || !engagement || !description || !area || !cityState || !rate || !rateType || !whatsIncluded) {
            return next({
                message: "All fields are required",
                statusCode: 400
            })
        }

        const photoFiles = req.files?.photos || [];

        if (photoFiles.length === 0) {
            return next({
                message: 'One picture of your work is required',
                statusCode: 400
            })
        }

        const uploadGroup = async (files) => {
            const urls = [];
            const publicIds = [];
            for (const file of files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'Ridify/seviceUpload',
                });
                urls.push(result.secure_url);
                publicIds.push(result.public_id);
                fs.unlinkSync(file.path);
            }
            return { urls, publicIds }; 
        };

        const photoUpload = await uploadGroup(photoFiles);

        const services = await serviceModel.create({
            artisanId: id,
            artisanKycId: kyc.id
        })

    }catch(error) { 
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}