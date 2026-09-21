const userModel = require('../model/user');
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { sendBrevoEmail } = require("../utils/brevo");
const {
  signUpTemplate,
  resetPasswordTemplate,
  resetPasswordSuccessfulTemplate,
  changePasswordSuccessfulTemplate,
} = require("../utils/emailTemplate");
const sendMail = require("../utils/nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken")
const cloudinary = require("../config/cloudinary");

const generateOtp = () => otpGenerator.generate(6, {
    digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
});

exports.createUser = async (req, res, next) => {
    try {
        const {fullName, email, phoneNumber, password } = req.body;

        const emailExist = await userModel.findOne({email: email.toLowerCase()});

        if (emailExist) {
            return res.status(400).json({
                message: `User with email ${email} already exist`
            })
        }
        
        const checkPhone = await userModel.findOne({phoneNumber});

        if (checkPhone) {
            return res.status(400).json({
                message: `${phoneNumber} already in Use`
            })
        }

        const nameCheck = fullName.split(' ')

        if (nameCheck.length < 2) {
            return res.status(400).json({
                message: 'Input a valid fullName'
            })
        }

        const OTP = generateOtp();

        const expiresAt = new Date(Date.now() + 10 * 60000);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
            fullName,
            email: email.toLowerCase(),
            phoneNumber,
            password: hashedPassword,
            otp: OTP,
            otpExpiresAt: expiresAt,
        }

        const emailOptions = {
            email: user.email,
            subject: "Welcome to Ridify",
            html: signUpTemplate(user.fullName, OTP),
        };

        await sendMail(emailOptions);

        await userModel.create(user);

        const data = {
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber
        };

        res.status(201).json({
            message: 'User created successfully',
            data
        });
    } catch (error) {
       return next({
        message: error.message,
        statusCode: 500
       }) 
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const {email, otp} = req.body;

        const user = await userModel.findOne({email: email.toLowerCase()})

        if (!user) {
            return res.status(404).json({
                message: `User with email ${email} not found`
            })
        }

        if(new Date() > user.otpExpiresAt || user.otp !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP'
            })
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiresAt = null;

        await user.save();

        res.status(200).json({
            message: 'Email verified successfully'
        })
    }catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.resendOtp = async (req, res, next) => {
    try {
        const {email} = req.body;

        const user = await userModel.findOne({ email: email.toLowerCase()})

        if (!user) {
            return res.status(404).json({
                message: `User with email ${email} not found`
            })
        }

        const otp = generateOtp();

        const expiresAt = new Date(Date.now() + 10 * 60000);

    user.otp = otp;
    user.expiresAt = expiresAt;

    await user.save();

    const data = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber
    };

    const emailOptions = {
        email: user.email,
        subject: "Resend OTP",
        html: resetPasswordTemplate(user.fullName, otp),
    }

    await sendMail(emailOptions);

    res.status(200).json({
        message: 'Please check your email to verify your account',
        data
    })

    }catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const {email} = req.body;

        const user = await userModel.findOne({ email: email.toLowerCase()});

        if (!user) {
            return res.status(404).json({
                message: `User with email ${email} not found`
            })
        }

        const otp = generateOtp();

        const expiresAt = new Date(Date.now() + 10 * 60000);

        user.otp = otp;
        user.otpExpiresAt = expiresAt;

        await user.save();

        const emailOptions = {
            email: user.email,
            subject: "Reset Password",
            html: resetPasswordTemplate(user.fullName, otp),
        }

        await sendMail(emailOptions);
        res.status(200).json({
            message: 'Please check your email to reset your password'
        })

    }catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const {email, otp, newPassword} = req.body;

        const user = await userModel.findOne({ email: email.toLowerCase()});

        if (!user) {
            return res.status(404).json({
                message: `User with email ${email} not found`
            })
        }

        if(new Date() > user.otpExpiresAt || user.otp !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiresAt = null;

        await user.save();

        const emailOptions = {
            email: user.email,
            subject: "Password Reset Successful",
            html: resetPasswordSuccessfulTemplate(user.fullName),
        }

        await sendMail(emailOptions);

        res.status(200).json({
            message: 'Password reset successful'
        })
    } catch (error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        const user = await userModel.findOne({ email: email.toLowerCase()});

        if (!user) {
            return res.status(404).json({
                message: `User with email ${email} not found`
            })
        }

        const checkPasssword = await bcrypt.compare(password, user.password);

        if (!checkPasssword) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            })
        }

        const token = jwt.sign({id: user._id, email: user.email, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});

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

exports.changePassword = async (req, res, next) => {
    try {
        const {id} = req.user;

        if (!id) {
            return res.status(401).json({
                message: 'Unauthorized'
            })
        }

        const checkUser = await userModel.findById(id);

        if (!checkUser) {
            return next({
                statusCode: 404,
                message: 'User not found'
            })
        }

        const { password, newPassword, confirmPassword } = req.body;

        const checkPass = await bcrypt.compare(password, checkUser.password);

        if (!checkPass) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: 'Password does not match'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        checkUser.password = hashedPassword;

        await checkUser.save();

        const emailOptions = {
            email: checkUser.email,
            subject: "Password Changed Successfully",
            html: changePasswordSuccessfulTemplate(checkUser.fullName),
        }

        await sendMail(emailOptions);

        res.status(200).json({
            message: 'Password Changed Successfully'
        })
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.selectRole = async (req, res, next) => {
    try {
        const {id} = req.user;

        if (!id) {
            return res.status(401).json({
                message: 'Unauthorized'
            })
        }
        
        const checkUser = await userModel.findById(id);
        
        if (!checkUser) {
            return next({
        statusCode: 404,
        message: "User not found",
      });
        }

        const {role} = req.body;

        const data = {
            role
        }

        await userModel.findByIdAndUpdate(id, { role }, { new: true });

        res.status(201).json({
            message: "Role selected successfully",
            data
        })
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.updateUser = async (req, res, next) => {
    const {id} = req.user;

    if (!id) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }

    const checkUser = await userModel.findById(id);

    if (condition) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    const {
        fullName,
        password
    } = req.body;

    if (req.file) {
      result = await cloudinary.uploader.upload(req.file.path);
      fs.unlinkSync(req.file.path);
    }

}

exports.getUser = async (req, res, next) => {
    try{
        const { id} = req.user;

        if (!id) {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }

        const checkUser = await userModel.findOne({id});

        if (!checkUser) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const info = {"fullname": checkUser.fullName, "email": checkUser.email, "phoneNumber": checkUser.phoneNumber}

        res.status(200).json({
            message: "Users profile retrieved successfully",
            info
        })
    }catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}