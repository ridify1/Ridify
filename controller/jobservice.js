const userModel = require('../model/user')
const express = require('express')
const mongoose = require('mongoose')
const serviceModel = require('../model/service')

exports.myServices = async (req, res, next) => {
    try {
        const { id } = req.user;

        if(!id) {
            return next({
                message: "Unauthorised",
                statusCode: 400
            })
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
        }

    }catch(error) { 
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}