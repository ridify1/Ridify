 const landLordKycModel = require('../model/landLordKyc');
 const userModel = require('../model/user');
 const propertyModel = require('../model/propertyUpload')
 const bcrypt = require('bcrypt');
 const jwt = require('jsonwebtoken');
 const mongoose = require('mongoose');
 const redisClient = require("../config/redis");
 const { sendBrevoEmail } = require("../utils/brevo");
 const { kycDeniedTemplate, deleteUserTemplate } = require("../utils/emailTemplate");
 const sendMail = require("../utils/nodemailer");
const { propertyUpload } = require('./landLordKyc');


exports.login = async (req, res, next) => {
    try {
        const {emailOrPhoneNumber, password} = req.body;

        const identifier = emailOrPhoneNumber?.trim();

if (!identifier || !password) {
    return next({
        message: "Email or phone number and password are required",
        statusCode: 400
    });
}

const query = identifier.includes('@')
    ? { email: identifier.toLowerCase() }
    : { phoneNumber: identifier };

const user = await userModel.findOne(query);

        if (!user) {
            return res.status(404).json({
                message: `User with email or phone number ${emailOrPhoneNumber} not found`
            })
        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
      return next({
        message: `Account locked until ${user.lockUntil}`,
        statusCode: 403,
      });
    }

    if (user.isVerified !== true) {
      return next({
        message: "Please verify your email before logging in",
        statusCode: 400,
      });
    }

    if(user.role !== 'admin'){
            return next({
                message: `Access denied: Admins only`,
                statusCode: 403
            })
        }

        const checkPasssword = await bcrypt.compare(password, user.password);

        if (!checkPasssword) {
            user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(400).json({
        message: "Invalid credentials",
      });
        }

        await userModel.findByIdAndUpdate(user._id, { loginAttempts: 0, lockUntil: null });

        const token = jwt.sign({id: user._id, email: user.email, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});

        redisClient.del(`user_${user.id}`);

        redisClient.set(`user_${user.id}`, token, { EX: 86400 });

        res.status(200).json({
            message: 'Login successful',
            token
        })
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

 exports.getAllLandLordKyc = async (req, res, next) => {
    try{
        const { id } = req.user;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return next({
                message: `Invalid user ID`,
                statusCode: 400
            })
        }

        if(req.user.role !== 'admin'){
            return next({
                message: `Access denied: Admins only`,
                statusCode: 403
            })
        }

        const landLordKyc = await landLordKycModel.find().populate('landLordId', 'fullName email phoneNumber')
        if(!landLordKyc || landLordKyc.length === 0){
            return next({
                message: `No Landlord KYC found`,
                statusCode: 200
            })
        }

        res.status(200).json({
            message: `Landlord KYC retrieved successfully`,
            data: landLordKyc
        })
    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
 }

 exports.getKycById = async (req, res, next) => {
    try{
        const { id } = req.user;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return next({
                message: `Invalid user ID`,
                statusCode: 400
            })
        }

        if(req.user.role !== 'admin'){
            return next({
                message: `Access denied: Admins only`,
                statusCode: 403
            })
        }

        const { kycId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(kycId)){
            return next({
                message: `Invalid KYC ID`,
                statusCode: 400
            })
        }

        const landlordKyc = await landLordKycModel.findById(kycId).populate('landLordId', 'fullName email phoneNumber')
        if(!landlordKyc){
            return next({
                message: `Landlord KYC not found`,
                statusCode: 404
            })
        }

        res.status(200).json({
            message: `Landlord KYC retrieved successfully`,
            data: landlordKyc
        })

    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
 }

 exports.updateKycStatus = async (req, res, next) => {
    try{
        const { id } = req.user;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return next({
                message: `Invalid user ID`,
                statusCode: 400
            })
        }

        if(req.user.role !== 'admin'){
            return next({
                message: `Access denied: Admins only`,
                statusCode: 403
            })
        }

        const { kycId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(kycId)){
            return next({
                message: `Invalid KYC ID`,
                statusCode: 400
            })
        }

        const { kycVerified } = req.body;

        if(typeof kycVerified !== 'boolean'){
            return next({
                message: `Invalid kycVerified value, must be boolean`,
                statusCode: 400
            })
        }

        const update = kycVerified
      ? { kycVerified, verifiedBy: req.user.id, verifiedAt: new Date() }
      : { kycVerified, verifiedBy: null, verifiedAt: null }

        const updatedKyc = await landLordKycModel.findByIdAndUpdate(kycId, { kycVerified, verifiedBy: req.user.id, verifiedAt: new Date() }, { new: true, runValidators: true }).populate('landLordId', 'fullName email phoneNumber');


        if(!updatedKyc){
            return next({
                message: `Landlord KYC not found`,
                statusCode: 404
            })
        }

        res.status(200).json({
            message: `Landlord KYC updated successfully`,
            data: updatedKyc
        })
    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
 }

 exports.deleteKyc = async (req, res, next) => {
    try{
        const { id } = req.user;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return next({
                message: `Invalid user ID`,
                statusCode: 400
            })
        }

        if(req.user.role !== 'admin'){
            return next({
                message: `Access denied: Admins only`,
                statusCode: 403
            })
        }

        const { kycId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(kycId)){
            return next({
                message: `Invalid KYC ID`,
                statusCode: 400
            })
        }

        const deletedKyc = await landLordKycModel.findByIdAndDelete(kycId)

        if(!deletedKyc){
            return next({
                message: `Landlord KYC not found`,
                statusCode: 404
            })
        }
        try {
      const landlord = await userModel
        .findById(deletedKyc.landLordId)
        .select('fullName email')
        .lean()

      if (landlord) {
        const emailTemplate = kycDeniedTemplate(
          landlord.fullName,
          'The submitted KYC documents could not be verified.'
        )
        await sendBrevoEmail(landlord.email, 'KYC Verification Update', emailTemplate)
      }
    } catch (emailError) {
      console.error('Failed to send KYC denial email:', emailError.message)
    }


        res.status(200).json({
            message: `Landlord KYC deleted successfully`,
            data: deletedKyc
        })
    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
 }

 exports.getVerifiedKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return next({
                message: 'Invalid User ID',
                statusCode: 400
            })
        }

        if(req.user.role !== 'admin'){
            return next({
                message: `Access denied: Admins Only`,
                statusCode: 403
            })
        }

     const verifiedKyc = await landLordKycModel.find({ kycVerified: true }).populate('landLordId', 'fullName email phoneNumber').sort({ createdAt: -1 }).lean()

     if(!verifiedKyc || verifiedKyc.length === 0){
            return next({
                message: `No Verified Landlord KYC found`,
                statusCode: 200
            })
        }

    return res.status(200).json({
        message: 'Verified Kyc',
      success: true,
      count: verifiedKyc.length,
      data: verifiedKyc
    })

    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
 }
 exports.getUnverifiedKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return next({
                message: 'Invalid User ID',
                statusCode: 400
            })
        }

        if(req.user.role !== 'admin'){
            return next({
                message: `Access denied: Admins Only`,
                statusCode: 403
            })
        }

     const unverifiedKyc = await landLordKycModel.find({ kycVerified: false }).populate('landLordId', 'fullName email phoneNumber').sort({ createdAt: -1 }).lean()

     if(!unverifiedKyc || unverifiedKyc.length === 0){
            return next({
                message: `No Unverified Landlord KYC found`,
                statusCode: 200
            })
        }

    return res.status(200).json({
        message: 'Unverified kyc',
      success: true,
      count: unverifiedKyc.length,
      data: unverifiedKyc
    })

    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
 };

 exports.getAllUsers = async (req, res, next) => {
    try{
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next({
                message: `Invalid User Id`,
                statusCode: 400
            })
        }

        
        if (req.user.role !== 'admin') {
            return next({
                message: `Access denied: Admins only`,
                statusCode: 403
            })
        }
        const user = await userModel.find().select('-password -loginAttempts -lockUntil -__v').sort({ createdAt: -1 }).lean()

        if(!user || user.length === 0){
            return next({
                message: `No User found`,
                statusCode: 200
            })
        }

        res.status(200).json({
            message: `Users retrieved successfully`,
            count: user.length,
            data: user
        })
    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
 }

 const DEFAULT_REASON =
  "You've gone against the community guidelines, so your account has been removed."

 exports.deleteOneUser = async (req, res, next) => {
    try{
        const { id } = req.user;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return next({
                message: `Invalid user ID`,
                statusCode: 400
            })
        }

        if(req.user.role !== 'admin'){
            return next({
                message: `Access denied: Admins only`,
                statusCode: 403
            })
        }

        const { userId } = req.params;
        const { reason } = req.body || {}

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next({
                message: `Invalid User ID`,
                statusCode: 400
            })
        }

        if (reason !== undefined && typeof reason !== 'string') {
      return next({ message: 'Reason must be a string', statusCode: 400 })
    }

    const finalReason = reason?.trim() || DEFAULT_REASON

    if (finalReason.length > 500) {
      return next({
        message: 'Reason must not exceed 500 characters',
        statusCode: 400
      })
    }

        if (userId === req.user.id) {
      return next({
        message: 'You cannot delete your own account',
        statusCode: 400
      })
    }

        const user = await userModel.findOneAndUpdate(
      { _id: userId, isDeleted: { $ne: true } },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
        deletionReason: finalReason
      },
      { new: true }
    )

        if (!user) {
      return next({ message: 'User not found', statusCode: 404 })
    }

        try {
      await redisClient.del(`user_${userId}`)
    } catch (redisError) {
      console.error('Failed to clear user session:', redisError.message)
    }

        try {
      await sendMail({
        email: user.email,
        subject: 'Your account has been removed',
        html: deleteUserTemplate(user.fullName, finalReason)
      })
    } catch (emailError) {
      console.error('Failed to send account deletion email:', emailError.message)
    }

        res.status(200).json({
            message: 'User deleted successfully'
        })
    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
 }

 exports.getAllPropertyUpload = async (req, res, next) => {
    try{
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next({
                message: `Invalid User Id`,
                statusCode: 400
            })
        }

        if (req.user.role !== 'admin') {
            return next({
                message: `Access denied: Admins only`,
                statusCode: 403
            })
        }
        
        const property = await propertyModel.find().sort({ createdAt: -1 }).lean()

        if(!property || propertyUpload.length === 0){
            return next({
                message: `No Property found`,
                statusCode: 200
            })
        }

        res.status(200).json({
            message: `Properties retrieved successfully`,
            count: property.length,
            data: property
        })
    }catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
 }

 exports.getPropertiesByLandLord = async (req, res, next) => {
    try {
        const { id } = req.user;
        
        if (!id) {
            return next({
                message: 'Invalid User ID',
                statusCode: 400
            })
        }
        const { landLordId } = req.params;

        if (!mongoose.isValidObjectId(landLordId)) {
    return next({ message: 'Invalid landlord ID', statusCode: 400 });
}

        const admin = await userModel.findById(id);

        if(admin?.role !== 'admin') {
            return next({
                message: "Unauthorized: Admins Only",
                statusCode: 403
            })
        }

        const properties = await propertyModel.find({ landLordId: landLordId, archive: { $ne: true } }).select('title rent city state streetAddress availability gallery createdAt').sort({ createdAt: -1 }).lean()

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

exports.deleteProperty = async (req, res, next) => {
    try {
        const { id, role } = req.user;

        if (!id) {
            return next({
                message: 'Unauthorized',
                statusCode: 401
            });
        }

        if (role !== 'admin') {
            return next({
                message: 'Access denied: Admins only',
                statusCode: 403
            });
        }

        const { propertyId } = req.params;
        const { reason } = req.body || {};

        if (!mongoose.isValidObjectId(propertyId)) {
            return next({
                message: 'Invalid property id',
                statusCode: 400
            });
        }

        if (reason !== undefined && typeof reason !== 'string') {
            return next({
                message: 'Reason must be a string',
                statusCode: 400
            });
        }

        const update = {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: id,
            ...(reason ? { deletionReason: reason.trim() } : {})
        };

        const property = await propertyModel.findOneAndUpdate(
            { _id: propertyId, isDeleted: { $ne: true } },
            update,
            { new: true, runValidators: true }
        );

        if (!property) {
            return next({
                message: 'Property not found or already deleted',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Property deleted successfully'
        });
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        });
    }
};
