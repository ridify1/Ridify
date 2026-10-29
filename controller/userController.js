const userModel = require('../model/user');
const serviceModel = require('../model/service');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
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
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const {
    generateAccessToken,
    generateRefreshToken,
    REFRESH_TTL_SECONDS
} = require('../utils/token');

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

        await sendBrevoEmail(emailOptions);

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
    user.otpExpiresAt = expiresAt;

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

    await sendBrevoEmail(emailOptions);

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

        await sendBrevoEmail(emailOptions);
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

        await sendBrevoEmail(emailOptions);

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
        const {emailOrPhoneNumber, password} = req.body;

        const identifier = emailOrPhoneNumber?.trim();

if (!identifier || !password) {
    return next({
        message: "Email or phone number and password are required",
        statusCode: 400
    });

    console.log("identifier:", identifier)
}

const query = identifier.includes('@')
    ? { email: identifier.toLowerCase() }
    : { phoneNumber: identifier };

const user = await userModel.findOne(query);

const invalid = () =>
            next({ message: 'Invalid credentials', statusCode: 401 });

        if (!user) return invalid();

        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return next({
        message: `Account locked. Try again in ${minutes} minute(s).`,
        statusCode: 403,
      });
    }

        const checkPasssword = await bcrypt.compare(password, user.password);

        if (!checkPasssword) {
            const updated = await userModel.findByIdAndUpdate(
        user._id,
        { $inc: { loginAttempts: 1 } },
        { new: true }
    )
      if (updated.loginAttempts >= 5) {
        await userModel.findByIdAndUpdate(user._id, {
            lockUntil: new Date(Date.now() + 30 * 60 * 1000),
            loginAttempts: 0
        });

      }
      return invalid();
        }

        if (user.isVerified !== true) {
      return next({
        message: "Please verify your email before logging in",
        statusCode: 400,
      });
    }

        if (user.loginAttempts > 0 || user.lockUntil) {
            await userModel.findByIdAndUpdate(user._id, {
                loginAttempts: 0,
                lockUntil: null
            });
        }

        const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

// set() overwrites, so you don't need del() first. Await it.
await redisClient.set(`refresh_${user._id}`, refreshToken, { EX: REFRESH_TTL_SECONDS });

res.cookie('refreshToken', refreshToken, {
    httpOnly: true,                                  // JS can't read it (protects against XSS)
    secure: process.env.NODE_ENV === 'production',   // HTTPS only in production
    sameSite: 'strict',
    maxAge: REFRESH_TTL_SECONDS * 1000
});

const { password: _pw, loginAttempts, lockUntil, ...safeUser } = user.toObject();

return res.status(200).json({
    message: 'Login successful',
    accessToken,
    data: safeUser
});
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.refresh = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({ message: 'No refresh token' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        // The token must match the one stored in Redis
        const stored = await redisClient.get(`refresh_${decoded.id}`);
        if (!stored || stored !== token) {
            return res.status(401).json({ message: 'Refresh token revoked' });
        }

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Rotation: issue a NEW refresh token and replace the old one
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        await redisClient.set(`refresh_${user._id}`, newRefreshToken, { EX: REFRESH_TTL_SECONDS });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TTL_SECONDS * 1000
        });

        return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

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

        await sendBrevoEmail(emailOptions);

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

exports.WhatAreYouLOokingFor = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return res.status(401).json({
                message: Unauthorized
            })
        }

        const checkUser = await userModel.findById(id);

        if (!checkUser) {
            return next({
                message: "User not found",
                statusCode: 404
            })
        }

        const { searchingFor } = req.body;

        const data = {
            searchingFor
        }

        await userModel.findByIdAndUpdate(id, {searchingFor}, { new: true});

        res.status(200).json({
            message: 'Selected Successfully'
        })
    } catch (error) {
       return next({
        message: error.message,
        statusCode: 500
       }) 
    }
}

exports.selectRole = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const checkUser = await userModel.findById(id);

        if (!checkUser) {
            return next({
                statusCode: 404,
                message: "User not found",
            });
        }

        let role;

        if (checkUser.searchingFor === "findAHome") {
            const {roleForHome} = req.body;

            if (!roleForHome) {
                return res.status(400).json({
                    message: "role For Home is required",
                });
            }

            if(roleForHome === ''){
                return next({
                    message: "role For Home should not be empty",
                    statusCode: 400
                })
            }

            await userModel.findByIdAndUpdate(id, { roleForHome: roleForHome , roleForJob: null, categoryForJob: null, role: roleForHome}, { new: true });

        } else if (checkUser.searchingFor === "findWork") {
            const {roleForJob, categoryForJob} = req.body;

            if (!roleForJob) {
                return res.status(400).json({
                    message: "role For Job is required",
                });
            }

            if (!categoryForJob) {
                return next({
                    message: "Category should not be empty",
                    statusCode: 400
                })
            }
            if(roleForJob === ''){
                return next({
                    message: "role For Job should not be empty",
                    statusCode: 400
                })
            }
            await userModel.findByIdAndUpdate(id, { roleForJob: roleForJob , categoryForJob: categoryForJob, roleForHome: null, role: categoryForJob}, { new: true });

        } else {
            return res.status(400).json({
                message: "Invalid searchingFor value",
            });
        }

        const data = await userModel.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        );

        return res.status(200).json({
            message: "Role selected successfully",
            data,
        });

    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500,
        });
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(401).json({ message: 'Unauthorised' });
        }

        const checkUser = await userModel.findById(id);

        if (!checkUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const data = {};

        // Validate the name only if it was sent
        if (req.body.fullName !== undefined) {
            const fullName = req.body.fullName.trim().replace(/\s+/g, ' ');
            const parts = fullName.split(' ');

            if (parts.length < 2) {
                return res.status(400).json({ message: 'Input a valid fullName' });
            }
            data.fullName = fullName;
        }

        console.log("Current directory:", process.cwd());
console.log("File:", req.file);

        if (req.file) {
            console.log("Path:", req.file.path);
    console.log("Exists:", fs.existsSync(req.file.path));
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                data.image = result.secure_url;
                data.imagePublicId = result.public_id;

                // Remove the old image from Cloudinary
                if (checkUser.imagePublicId) {
                    await cloudinary.uploader.destroy(checkUser.imagePublicId);
                }
            } finally {
                // Always clean up the temp file, even if the upload failed
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            }
        }
        console.log(req.file);
console.log(req.file.path);

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'Nothing to update' });
        }

        const updatedUser = await userModel
            .findByIdAndUpdate(id, data, { new: true })
            .select('-password');

        return res.status(200).json({
            message: `${checkUser.role} updated successfully`,
            data: updatedUser
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getUser = async (req, res, next) => {
    try{
        const { id} = req.user;

        if (!id) {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }

        const isAdmin = req.user.role === 'admin'
        const isOwner = req.user._id === req.params.id

        if (!isAdmin && !isOwner) {
        return next({
            message: 'Access denied',
            statusCode: 403
        })
        }

        const checkUser = await userModel.findById(id);

        if (!checkUser) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const info = {"fullname": checkUser.fullName, "email": checkUser.email, "phoneNumber": checkUser.phoneNumber, "role": checkUser.role}
        const img = checkUser?.image;

        res.status(200).json({
            message: "Users profile retrieved successfully",
            info,
            img
        })
    }catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        await redisClient.del(`refresh_${req.user.id}`);

        return res.status(200).json({ message: 'Logged out' });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};
