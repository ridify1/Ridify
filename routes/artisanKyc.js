const express = require('express');
const upload = require('../middleware/multer');
const { authenticate } = require('../middleware/auth');
const { artisanKyc, getArtisanKyc } = require('../controller/artisanKyc');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Artisan KYC
 *   description: Artisan KYC management and authentication
 */

/**
 * @swagger
 * /api/v1/artisan/artisanKyc:
 *   post:
 *     tags:
 *       - Artisan KYC
 *     summary: Submit artisan KYC
 *     description: Submits KYC details for an artisan with an identification image and a selfie. Only users whose role is one of the artisan trades can submit, and each user can submit once. The submission starts as unverified until it is reviewed.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullLegalName
 *               - phoneNumber
 *               - email
 *               - cityOrLocation
 *               - primaryTrade
 *               - yearsOfExperience
 *               - availability
 *               - aboutYourWork
 *               - identification
 *               - selfie
 *             properties:
 *               fullLegalName:
 *                 type: string
 *                 example: John Okafor
 *               phoneNumber:
 *                 type: string
 *                 example: "8012345678"
 *               email:
 *                 type: string
 *                 example: john.okafor@example.com
 *                 description: Must be a valid email address
 *               cityOrLocation:
 *                 type: string
 *                 example: Ikeja, Lagos
 *               primaryTrade:
 *                 type: string
 *                 example: Plumber
 *                 description: Use a value your schema accepts
 *               yearsOfExperience:
 *                 type: integer
 *                 example: 5
 *               availability:
 *                 type: string
 *                 example: Weekdays
 *                 description: Use a value your schema accepts
 *               aboutYourWork:
 *                 type: string
 *                 example: I install and repair residential plumbing systems
 *               identification:
 *                 type: string
 *                 format: binary
 *                 description: Identification image (e.g. national ID, passport). Only one file is accepted.
 *               selfie:
 *                 type: string
 *                 format: binary
 *                 description: Selfie image. Only one file is accepted.
 *     responses:
 *       201:
 *         description: Artisan KYC submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Artisan KYC submitted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     artisanId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullLegalName:
 *                       type: string
 *                       example: John Okafor
 *                     phoneNumber:
 *                       type: string
 *                       example: "8012345678"
 *                     email:
 *                       type: string
 *                       example: john.okafor@example.com
 *                     cityOrLocation:
 *                       type: string
 *                       example: Ikeja, Lagos
 *                     primaryTrade:
 *                       type: string
 *                       example: Plumber
 *                     yearsOfExperience:
 *                       type: integer
 *                       example: 5
 *                     availability:
 *                       type: string
 *                       example: Weekdays
 *                     aboutYourWork:
 *                       type: string
 *                       example: I install and repair residential plumbing systems
 *                     identification:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/artisanKyc/id.jpg
 *                     identificationPublicId:
 *                       type: string
 *                       example: Ridify/artisanKyc/id
 *                     selfie:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/artisanKyc/selfie.jpg
 *                     selfiePublicId:
 *                       type: string
 *                       example: Ridify/artisanKyc/selfie
 *                     kycVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Missing required fields, invalid email, missing identification or selfie image, or KYC already submitted (pending or verified)
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: Only artisans can submit KYC
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/artisanKyc', authenticate, upload.fields([
      { name: 'identification', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
  ]), artisanKyc)

/**
 * @swagger
 * /api/v1/artisan/getArtisanKyc:
 *   get:
 *     tags:
 *       - Artisan KYC
 *     summary: Get the authenticated user's artisan KYC
 *     description: Returns the artisan KYC record that belongs to the authenticated user, including its verification status. The lookup is by the id in the token, so a user always gets their own KYC.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC found for this user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: KYC found for this user
 *                 data:
 *                   type: object
 *                   properties:
 *                     artisanId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullLegalName:
 *                       type: string
 *                       example: John Okafor
 *                     phoneNumber:
 *                       type: string
 *                       example: "8012345678"
 *                     email:
 *                       type: string
 *                       example: john.okafor@example.com
 *                     cityOrLocation:
 *                       type: string
 *                       example: Ikeja, Lagos
 *                     primaryTrade:
 *                       type: string
 *                       example: Plumber
 *                     yearsOfExperience:
 *                       type: integer
 *                       example: 5
 *                     availability:
 *                       type: string
 *                       example: Weekdays
 *                     aboutYourWork:
 *                       type: string
 *                       example: I install and repair residential plumbing systems
 *                     identification:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/artisanKyc/id.jpg
 *                     identificationPublicId:
 *                       type: string
 *                       example: Ridify/artisanKyc/id
 *                     selfie:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/artisanKyc/selfie.jpg
 *                     selfiePublicId:
 *                       type: string
 *                       example: Ridify/artisanKyc/selfie
 *                     kycVerified:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: Unauthorized to access this KYC information
 *       404:
 *         description: KYC not found for this user
 *       500:
 *         description: Internal server error
 */

router.get('/getArtisanKyc', authenticate, getArtisanKyc)

module.exports = router;