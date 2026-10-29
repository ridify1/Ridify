const { createUser, verifyEmail, resendOtp, forgotPassword, resetPassword, login, changePassword, selectRole, updateUser, getUser, WhatAreYouLOokingFor, refresh, logout } = require('../controller/userController');
const { authenticate } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../middleware/validator')
const upload = require('../middleware/multer');
const { dashboard } = require('../controller/userDashboard');

const router = require('express').Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and authentication
 */

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
 *                 example: jane.doe@example.com
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
 *                       example: jane.doe@example.com
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
 *                 example: landlord
 *                 description: Required when the user's searchingFor is findAHome. Use a value your user schema accepts.
 *               roleForJob:
 *                 type: string
 *                 example: artisan
 *                 description: Required when the user's searchingFor is findWork. Use a value your user schema accepts.
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
 *         description: Missing roleForHome, roleForJob or categoryForArtisan, or the user's searchingFor value is missing or not recognised
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
 * /api/v1/user/getUser:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
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

router.get('/getUser', authenticate, getUser)

/**
 * @swagger
 * /api/v1/user/whatAreYouLookingFor:
 *   post:
 *     tags:
 *       - User
 *     summary: Set what the user is searching for
 *     description: Saves the authenticated user's search preference (what they are looking for) on their profile
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
 *                 example: apartment
 *                 description: What the user is looking for. Use a value your user schema accepts.
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
 *                   example: Selected Successfully
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

module.exports = router