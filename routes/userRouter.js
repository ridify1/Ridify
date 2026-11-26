const { createUser, verifyEmail, resendOtp, forgotPassword, resetPassword, login, changePassword, selectRole, updateUser, getUser, WhatAreYouLOokingFor, refresh, logout, appleLogin, getAuthenticatedUser } = require('../controller/userController');
const { authenticate } = require('../middleware/auth');
require('dotenv').config;
const { REFRESH_TTL_SECONDS } = require('../utils/token');
const { registerValidator, loginValidator } = require('../middleware/validator')
const upload = require('../middleware/multer');
const { dashboard, getPropertiesByCategory, getArtisansByCategory, getPropertiesByLocation, getArtisansByLocation, getPropertiesByLocationAndCategory } = require('../controller/userDashboard');
const express = require('express');
const passport = require('passport');
const router = require('express').Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/v1/user/apple:
 *   post:
 *     tags:
 *       - User
 *     summary: Sign in or sign up with Apple
 *     description: Verifies the identity token that Apple returned to the app, then signs the user in. If no account exists, one is created automatically with the email already marked as verified. If an account with the same verified Apple email exists, the Apple identity is linked to it. Locked accounts cannot sign in. On success, an access token is returned in the body and a refresh token is set in an httpOnly cookie. This route is public and does not need an access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identityToken
 *             properties:
 *               identityToken:
 *                 type: string
 *                 example: eyJraWQiOiJXNldjT0tCIiwiYWxnIjoiUlMyNTYifQ...
 *                 description: The identity token (JWT) returned by Apple after the user signs in
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *                 description: Apple only provides the name on the first sign-in, so send it when you have it. Defaults to Apple User for new accounts.
 *               nonce:
 *                 type: string
 *                 example: 8f3a2c91d7e04b6a
 *                 description: Optional. If the token was requested with a nonce, send the same value so the server can check it
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   description: JWT access token that expires in 15 minutes. The refresh token is set in an httpOnly cookie.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullName:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *                       description: May be empty for a new account until the user chooses what they are looking for
 *                     searchingFor:
 *                       type: string
 *                       example: findAHome
 *                       description: Empty for a new account until the user chooses
 *       400:
 *         description: identityToken is missing
 *       401:
 *         description: Invalid or expired Apple token
 *       403:
 *         description: Account is temporarily locked
 *       500:
 *         description: Internal server error
 */
router.post('/apple', appleLogin);

/**
 * @swagger
 * /api/v1/user/google:
 *   get:
 *     tags:
 *       - User
 *     summary: Start Google sign-in
 *     description: Starts the Google sign-in flow. The route redirects the user's browser to Google's consent screen, asking for access to their profile and email. After the user approves, Google redirects to the callback route. This route is public and is meant to be opened in a browser, not called with fetch or axios.
 *     responses:
 *       302:
 *         description: Redirects to Google's consent screen (accounts.google.com).
 *         headers:
 *           Location:
 *             description: The Google authorization URL, which includes the client id, the callback URL and the requested scopes
 *             schema:
 *               type: string
 *               example: https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=...&scope=profile%20email&client_id=...
 *       500:
 *         description: Internal server error.
 */

router.get('/google', passport.authenticate('google-user', {
    scope: ['profile', 'email'],
    session: false
}));  
    

/**
 * @swagger
 * /api/v1/user/google/callback:
 *   get:
 *     tags:
 *       - User
 *     summary: Google sign-in callback
 *     description: Google redirects the user's browser here after they approve sign-in. This route is not called directly by the client. It finds or creates the user from their verified Google email, sets the refreshToken cookie, and redirects to the mobile app deep link with the access token. New users get a welcome email. If authentication fails, it redirects to the same deep link with an error message.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           example: 4/0AX4XfWh...
 *         description: Authorization code sent by Google. Do not set this manually.
 *       - in: query
 *         name: scope
 *         required: false
 *         schema:
 *           type: string
 *           example: email profile
 *         description: Scopes granted by the user, sent by Google.
 *     responses:
 *       302:
 *         description: Redirects to the mobile app. On success the Location is ridify://google-auth?token=<accessToken>. On failure the Location is ridify://google-auth?error=Google%20authentication%20failed.
 *         headers:
 *           Location:
 *             description: The mobile app deep link, taken from MOBILE_APP_REDIRECT
 *             schema:
 *               type: string
 *               example: ridify://google-auth?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *           Set-Cookie:
 *             description: refreshToken cookie (httpOnly, sameSite strict, secure in production). Only set on success.
 *             schema:
 *               type: string
 *       500:
 *         description: Internal server error.
 */

router.get('/google/callback',
    passport.authenticate('google-user', {
        session: false,
        failureRedirect: `${process.env.MOBILE_APP_REDIRECT || "ridify://google-auth"}?error=${encodeURIComponent("Google authentication failed")}`
    }),
    (req,res) => {
        const { user, accessToken, refreshToken } = req.user;

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            maxAge: REFRESH_TTL_SECONDS * 1000
        });

        const APP_URL =
            process.env.MOBILE_APP_REDIRECT || "ridify://google-auth";

        return res.redirect(
            `${APP_URL}?token=${encodeURIComponent(accessToken)}`
        );

        // res.status(200).json({ message: 'Login Successful', token: accessToken})
    }
)

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     tags:
 *       - User
 *     summary: Register a new user
 *     description: Creates a new user account and sends an OTP to the provided email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phoneNumber
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *                 description: Must contain at least two words
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "8012345678"
 *               password:
 *                 type: string
 *                 example: P@ssword123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "8012345678"
 *       400:
 *         description: Email already exists, phone number already in use, or invalid full name
 *       500:
 *         description: Internal server error
 */

router.post('/register', registerValidator ,createUser);

/**
 * @swagger
 * /api/v1/user/verifyOtp:
 *   post:
 *     tags:
 *       - User
 *     summary: Verify user email
 *     description: Verifies the user's email using the OTP sent during registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *               otp:
 *                 type: string
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/verifyOtp', verifyEmail);

/**
 * @swagger
 * /api/v1/user/resendOtp:
 *   post:
 *     tags:
 *       - User
 *     summary: Resend OTP
 *     description: Resends the verification OTP to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please check your email to verify your account
 *                 data:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "8012345678"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/resendOtp', resendOtp);

/**
 * @swagger
 * /api/v1/user/forgotPassword:
 *   post:
 *     tags:
 *       - User
 *     summary: Forgot password
 *     description: Sends a password reset OTP to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please check your email to reset your password
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/forgotPassword', forgotPassword);

/**
 * @swagger
 * /api/v1/user/resetPassword:
 *   post:
 *     tags:
 *       - User
 *     summary: Reset password
 *     description: Resets the user's password after verifying the OTP sent to their email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *               otp:
 *                 type: string
 *                 example: "482910"
 *               newPassword:
 *                 type: string
 *                 example: NewP@ssword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/resetPassword', resetPassword);

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     tags:
 *       - User
 *     summary: Log in a user
 *     description: Logs in with an email or phone number and password. Returns an access token and sets a refresh token as an httpOnly cookie. After 5 failed attempts the account is locked for 30 minutes. The email must be verified before login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhoneNumber
 *               - password
 *             properties:
 *               emailOrPhoneNumber:
 *                 type: string
 *                 example: jane.doe@example.com or 8123456789
 *               password:
 *                 type: string
 *                 example: P@ssword123
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: refreshToken cookie (httpOnly, sameSite strict, secure in production)
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullName:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com or 8123456789
 *                     phoneNumber:
 *                       type: string
 *                       example: "8012345678"
 *                     role:
 *                       type: string
 *                       example: landlord
 *       400:
 *         description: Missing fields, or email not verified
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account locked after too many failed attempts
 *       500:
 *         description: Internal server error
 */

router.post('/login', loginValidator, login);

/**
 * @swagger
 * /api/v1/user/changePassword:
 *   post:
 *     tags:
 *       - User
 *     summary: Change password
 *     description: Changes the authenticated user's password after verifying their current password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 example: P@ssword123
 *               newPassword:
 *                 type: string
 *                 example: NewP@ssword123
 *               confirmPassword:
 *                 type: string
 *                 example: NewP@ssword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password Changed Successfully
 *       400:
 *         description: Invalid credentials or passwords do not match
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/changePassword',authenticate, changePassword);

/**
 * @swagger
 * /api/v1/user/roleSelect:
 *   post:
 *     tags:
 *       - User
 *     summary: Select the user's role
 *     description: Saves the authenticated user's role based on what they are searching for. Users who selected "findAHome" must send roleForHome. Users who selected "findWork" must send roleForJob, and also categoryForArtisan when roleForJob is "artisan". The searchingFor preference must be set first through the whatAreYouLookingFor route.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleForHome:
 *                 type: string
 *                 enum:
 *                   - tenant
 *                   - landlord
 *                   - agent
 *                   - realtor
 *                 example: landlord
 *                 description: Required when the user's searchingFor is findAHome
 *               roleForJob:
 *                 type: string
 *                 enum:
 *                   - jobSeeker
 *                   - hr
 *                   - artisan
 *                   - artisanEmployer
 *                 example: artisan
 *                 description: Required when the user's searchingFor is findWork
 *               categoryForArtisan:
 *                 type: string
 *                 example: plumber
 *                 description: Required only when roleForJob is artisan
 *     responses:
 *       200:
 *         description: Role selected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role selected successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullName:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com
 *                     searchingFor:
 *                       type: string
 *                       example: findAHome
 *                     role:
 *                       type: string
 *                       example: landlord
 *                     roleForHome:
 *                       type: string
 *                       nullable: true
 *                       example: landlord
 *                     roleForJob:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     categoryForArtisan:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: roleForHome or roleForJob is missing or not an allowed value, categoryForArtisan is missing for an artisan, or the user's searchingFor value is missing or not recognised
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/roleSelect', authenticate, selectRole);

/**
 * @swagger
 * /api/v1/user/updateUser:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user profile
 *     description: Updates the authenticated user's full name and/or profile image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *                 description: Must contain at least two words
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: JPG, JPEG or PNG file
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: driver updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       example: Jane Doe
 *                     image:
 *                       type: string
 *                       example: https://res.cloudinary.com/sample/image.jpg
 *       400:
 *         description: Invalid full name
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.put('/updateUser', authenticate, upload.single('image'), updateUser);

/**
 * @swagger
 * /api/v1/user/getUser/{userId}::
 *   get:
 *     tags:
 *       - User
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab6a8b9a675b9e38dc41c00
 *         description: The id of the job whose applicants should be returned
 *     responses:
 *       200:
 *         description: Users profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users profile retrieved successfully
 *                 info:
 *                   type: object
 *                   properties:
 *                     fullname:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "8012345678"
 *                 img:
 *                   type: string
 *                   example: https://res.cloudinary.com/sample/image.jpg
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get('/getUser/:userId', authenticate, getUser)

/**
 * @swagger
 * /api/v1/user/whatAreYouLookingFor:
 *   post:
 *     tags:
 *       - User
 *     summary: Set what the user is searching for
 *     description: Saves the authenticated user's search preference (what they are looking for) on their profile. The value decides which dashboard the user sees and which role options they get next.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - searchingFor
 *             properties:
 *               searchingFor:
 *                 type: string
 *                 enum:
 *                   - findAHome
 *                   - findWork
 *                 example: findAHome
 *                 description: What the user is looking for
 *     responses:
 *       200:
 *         description: Preference saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Selected successfully
 *                 searchingFor:
 *                   type: string
 *                   enum:
 *                     - findAHome
 *                     - findWork
 *                   example: findAHome
 *       400:
 *         description: searchingFor is missing or not one of findAHome or findWork
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/whatAreYouLookingFor', authenticate, WhatAreYouLOokingFor)

/**
 * @swagger
 * /api/v1/user/dashboard:
 *   get:
 *     tags:
 *       - User
 *     summary: Get the user's dashboard
 *     description: Returns dashboard content based on what the authenticated user is searching for. Users who selected "findAHome" receive a list of properties, and users who selected "findWork" receive a list of jobs. The preference is set through the whatAreYouLookingFor route.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully. The shape of data depends on the type field (properties for findAHome, jobs for findWork).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Home dashboard retrieved successfully
 *                 type:
 *                   type: string
 *                   enum:
 *                     - findAHome
 *                     - findWork
 *                   example: findAHome
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6ab2c4d5a675b9e38dc41800
 *                       title:
 *                         type: string
 *                         example: Spacious 3 Bedroom Apartment
 *                       rent:
 *                         type: number
 *                         example: 2000000
 *                       city:
 *                         type: string
 *                         example: Ikeja
 *                       state:
 *                         type: string
 *                         example: Lagos
 *                       gallery:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example:
 *                           - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img1.jpg
 *       400:
 *         description: Invalid user ID, or the user's searchingFor value is missing or not recognised
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get('/dashboard', authenticate, dashboard)

/**
 * @swagger
 * /api/v1/user/refresh:
 *   post:
 *     tags:
 *       - User
 *     summary: Refresh the access token
 *     description: Issues a new access token using the refresh token stored in the httpOnly cookie. The refresh token is rotated, so a new refresh token replaces the old one in the cookie and in Redis, and the old one stops working. No Authorization header is needed.
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: The refresh token set as an httpOnly cookie at login. The browser sends it automatically.
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             description: The new rotated refreshToken cookie (httpOnly, sameSite strict, secure in production)
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYjBmMmZm...
 *       401:
 *         description: No refresh token, invalid or expired refresh token, refresh token revoked, or user not found
 *       500:
 *         description: Internal server error
 */

router.post('/refresh', refresh); 

/**
 * @swagger
 * /api/v1/user/logout:
 *   post:
 *     tags:
 *       - User
 *     summary: Log out the current user
 *     description: Logs out the authenticated user by deleting their refresh token from Redis and clearing the refreshToken cookie. After this, the refresh token can no longer be used to get a new access token. The access token itself stays valid until it expires, so the client should discard it.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             description: Clears the refreshToken cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out
 *       401:
 *         description: Token is missing, invalid or expired
 *       500:
 *         description: Internal server error
 */

router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /api/v1/user/getPropertiesByCategory:
 *   get:
 *     tags:
 *       - User
 *     summary: Get properties by category
 *     description: Returns a paginated list of properties in the selected category, newest first. Archived and deleted properties are left out. The category is not case-sensitive.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [apartment, studio, serviced, shop]
 *           example: apartment
 *         description: The property category to filter by
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *           example: 20
 *         description: Number of properties per page (maximum 50)
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Properties retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 20
 *                   description: Number of properties on this page
 *                 total:
 *                   type: integer
 *                   example: 57
 *                   description: Total number of properties in this category
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f1c2a9e4b0a1d2c3e4f567
 *                       title:
 *                         type: string
 *                         example: Modern Studio in Yaba
 *                       category:
 *                         type: string
 *                         example: studio
 *                       city:
 *                         type: string
 *                         example: Yaba
 *                       state:
 *                         type: string
 *                         example: Lagos
 *                       price:
 *                         type: number
 *                         example: 1200000
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid user ID, missing category, or category is not one of the allowed values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category must be one of: apartment, studio, serviced, shop"
 *       401:
 *         description: Access token is missing, invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access token expired or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/getPropertiesByCategory', authenticate, getPropertiesByCategory);

/**
 * @swagger
 * /api/v1/user/getByLocation:
 *   get:
 *     tags:
 *       - User
 *     summary: Search properties by city, state or name
 *     description: Returns a paginated list of properties whose city, state or name matches the search text, newest first. The match is partial and not case-sensitive. Archived and deleted properties are left out.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cityOrStateOrName
 *         required: true
 *         schema:
 *           type: string
 *           example: ikeja
 *         description: City, state or property name to search for
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *           example: 20
 *         description: Number of properties per page (maximum 50)
 *     responses:
 *       200:
 *         description: Properties retrieved successfully. An empty list is returned when nothing matches.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Properties retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 20
 *                   description: Number of properties on this page
 *                 total:
 *                   type: integer
 *                   example: 34
 *                   description: Total number of matching properties
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f1c2a9e4b0a1d2c3e4f567
 *                       title:
 *                         type: string
 *                         example: 3 Bedroom Flat in Ikeja
 *                       category:
 *                         type: string
 *                         example: apartment
 *                       city:
 *                         type: string
 *                         example: Ikeja
 *                       state:
 *                         type: string
 *                         example: Lagos
 *                       price:
 *                         type: number
 *                         example: 2500000
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid user ID, or no search text was provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Provide a city, state, or name
 *       401:
 *         description: Access token is missing, invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access token expired or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/getByLocation', authenticate, getPropertiesByLocation);

/**
 * @swagger
 * /api/v1/user/getArtisansByCategory:
 *   get:
 *     tags:
 *       - User
 *     summary: Get artisans by category
 *     description: Returns a paginated list of verified artisans in the selected job category, newest first. Only public profile fields are returned. The category is not case-sensitive. Archived and deleted accounts are left out.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryForArtisan
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - Electrician
 *             - Plumber
 *             - Painter
 *             - HVAC
 *             - Carpenter
 *             - Curlinary
 *             - Security
 *             - welder
 *             - mechanic
 *             - cleaner
 *             - tailor/fashionDesigner
 *             - otherSkilledWork
 *           example: Plumber
 *         description: The artisan category to filter by
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *           example: 20
 *         description: Number of artisans per page (maximum 50)
 *     responses:
 *       200:
 *         description: Artisans retrieved successfully. An empty list is returned when no artisan matches.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Artisans retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 20
 *                   description: Number of artisans on this page
 *                 total:
 *                   type: integer
 *                   example: 45
 *                   description: Total number of artisans in this category
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f1c2a9e4b0a1d2c3e4f111
 *                       fullName:
 *                         type: string
 *                         example: John Adebayo
 *                       image:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/john.jpg
 *                       categoryForJob:
 *                         type: string
 *                         example: Plumber
 *                       city:
 *                         type: string
 *                         example: Ikeja
 *                       state:
 *                         type: string
 *                         example: Lagos
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid user ID, missing category, or category is not one of the allowed values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category must be one of: Electrician, Plumber, Painter, HVAC"
 *       401:
 *         description: Access token is missing, invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access token expired or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/getArtisansByCategory', authenticate, getArtisansByCategory);

/**
 * @swagger
 * /api/v1/user/getArtisanByLocation:
 *   get:
 *     tags:
 *       - User
 *     summary: Search users by city or state
 *     description: Returns a paginated list of verified users whose city or state matches the search text, newest first. The match is partial and not case-sensitive. Only public profile fields are returned. Archived and deleted accounts are left out.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cityState
 *         required: true
 *         schema:
 *           type: string
 *           example: ikeja
 *         description: City or State to search for
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *           example: 20
 *         description: Number of artisans per page (maximum 50)
 *     responses:
 *       200:
 *         description: Artisans retrieved successfully. An empty list is returned when nothing matches.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Artisans retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 20
 *                   description: Number of artisans on this page
 *                 total:
 *                   type: integer
 *                   example: 38
 *                   description: Total number of matching artisans
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f1c2a9e4b0a1d2c3e4f111
 *                       fullName:
 *                         type: string
 *                         example: John Adebayo
 *                       image:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/john.jpg
 *                       categoryForJob:
 *                         type: string
 *                         example: Plumber
 *                       city:
 *                         type: string
 *                         example: Ikeja
 *                       state:
 *                         type: string
 *                         example: Lagos
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid user ID, or no city or state was provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Provide a city or a state
 *       401:
 *         description: Access token is missing, invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access token expired or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/getArtisanByLocation', authenticate, getArtisansByLocation);

/**
 * @swagger
 * /api/v1/user/getByCategoryAndLocation:
 *   get:
 *     tags:
 *       - User
 *     summary: Search properties by location and category
 *     description: Returns a paginated list of properties in the selected category whose city, state or name matches the search text, newest first. Both the search text and the category are required. The location match is partial and the category match is not case-sensitive. Archived and deleted properties are left out.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cityOrStateOrName
 *         required: true
 *         schema:
 *           type: string
 *           example: ikeja
 *         description: City, state or property name to search for
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [apartment, studio, serviced, shop]
 *           example: apartment
 *         description: The property category to filter by
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *           example: 20
 *         description: Number of properties per page (maximum 50)
 *     responses:
 *       200:
 *         description: Properties retrieved successfully. An empty list is returned when nothing matches.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Properties retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 20
 *                   description: Number of properties on this page
 *                 total:
 *                   type: integer
 *                   example: 34
 *                   description: Total number of matching properties
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f1c2a9e4b0a1d2c3e4f567
 *                       title:
 *                         type: string
 *                         example: 3 Bedroom Flat in Ikeja
 *                       category:
 *                         type: string
 *                         example: apartment
 *                       city:
 *                         type: string
 *                         example: Ikeja
 *                       state:
 *                         type: string
 *                         example: Lagos
 *                       price:
 *                         type: number
 *                         example: 2500000
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid user ID, missing search text or category, or category is not one of the allowed values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category must be one of: apartment, studio, serviced, shop"
 *       401:
 *         description: Access token is missing, invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access token expired or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/getByCategoryAndLocation', authenticate, getPropertiesByLocationAndCategory);

/**
 * @swagger
 * /api/v1/user/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get the authenticated user
 *     description: Returns the profile of the user identified by the access token. The password is never included.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullName:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "8012345678"
 *                     role:
 *                       type: string
 *                       example: landlord
 *                     searchingFor:
 *                       type: string
 *                       example: findAHome
 *                     roleForHome:
 *                       type: string
 *                       nullable: true
 *                       example: landlord
 *                     roleForJob:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     categoryForArtisan:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-10-20T09:30:00.000Z
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get("/me",  authenticate, getAuthenticatedUser);

module.exports = router