const userModel = require('../model/user');
const serviceModel = require('../model/service');
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
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

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
            role = req.body.roleForHome;

            if (!role) {
                return res.status(400).json({
                    message: "role For Home is required",
                });
            }

            await userModel.findByIdAndUpdate(id, { roleForHome: role, roleForJob: null, category: null }, { new: true });

        } else if (checkUser.searchingFor === "findWork") {
            const {roleForJob, category} = req.body;

            if (!roleForJob) {
                return res.status(400).json({
                    message: "role For Job is required",
                });
            }

            if (!category) {
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
            await userModel.findByIdAndUpdate(id, { roleForJob: role , category: role, roleForHome: null, role: category}, { new: true });

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
        const {id} = req.user;

    if (!id) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }

    const checkUser = await userModel.findById(id);

    if (!checkUser) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    const {fullName} = req.body;

    const nameCheck = fullName.split(' ')

        if (nameCheck.length < 2) {
            return res.status(400).json({
                message: 'Input a valid fullName'
            })
        }

    let result;
    if (req.file) {
      result = await cloudinary.uploader.upload(req.file.path);
      fs.unlinkSync(req.file.path);
    }

    const data = {
        fullName: fullName || checkUser.fullName,
        ...(result ? { image: result.secure_url, imagePublicId: result.public_id } : {})
    }

    await userModel.findByIdAndUpdate(id, data, { new: true });

    res.status(200).json({
        message: `${checkUser.role} updated successfully`,
        data
    })
    } catch (error) {
        
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
        const isOwner = req.user._id.toString() === req.params.id

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

        const info = {"fullname": checkUser.fullName, "email": checkUser.email, "phoneNumber": checkUser.phoneNumber}
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


    }catch(error) { 
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}