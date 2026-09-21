const { createUser, verifyEmail, resendOtp, forgotPassword, resetPassword, login, changePassword, selectRole} = require('../controller/userController')
const { registerValidator } = require('../middleware/validator')

const router = require('express').Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/v1/User/register:
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
 * /api/v1/User/verifyOtp:
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
 * /api/v1/User/resendOtp:
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
 * /api/v1/User/forgotPassword:
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
 * /api/v1/User/resetPassword:
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
 * /api/v1/User/login:
 *   post:
 *     tags:
 *       - User
 *     summary: User login
 *     description: Authenticates a user using email and password and returns a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *               password:
 *                 type: string
 *                 example: P@ssword123
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
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/login', login);

/**
 * @swagger
 * /api/v1/User/changePassword:
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

router.post('/changePassword', changePassword);

/**
 * @swagger
 * /api/v1/User/roleSelect:
 *   post:
 *     tags:
 *       - User
 *     summary: Select user role
 *     description: Sets the role for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 example: driver
 *                 description: The role to assign to the user
 *     responses:
 *       201:
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
 *                     role:
 *                       type: string
 *                       example: driver
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/roleSelect', selectRole);

module.exports = router