const express = require('express');
const upload = require('../middleware/multer');
const { authenticate } = require('../middleware/auth');
const { employerKyc, getEmployerKyc } = require('../controller/employerKyc');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employer/Hr Kyc
 *   description: Employer/Hr Kyc management and authentication
 */

/**
 * @swagger
 * /api/v1/hr/employerKyc:
 *   post:
 *     tags:
 *       - Employer/Hr Kyc
 *     summary: Submit employer KYC
 *     description: Submits KYC details for an employer with an identification image, a selfie and a business registration document. Only users with the employer or hr role can submit, and each user can submit once. The submission starts as unverified until it is reviewed.
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
 *               - jobTitle
 *               - workEmail
 *               - companyName
 *               - registrationNumber
 *               - registeredAddress
 *               - organizationSize
 *               - identification
 *               - selfie
 *               - businessDocument
 *             properties:
 *               fullLegalName:
 *                 type: string
 *                 example: Jane Doe
 *               jobTitle:
 *                 type: string
 *                 example: Head of Human Resources
 *               workEmail:
 *                 type: string
 *                 example: jane.doe@acme.com
 *                 description: Must be a valid email address
 *               companyName:
 *                 type: string
 *                 example: Acme Industries Ltd
 *               registrationNumber:
 *                 type: string
 *                 example: RC1234567
 *               registeredAddress:
 *                 type: string
 *                 example: 12 Admiralty Way, Lekki, Lagos
 *               companyWebsite:
 *                 type: string
 *                 example: https://www.acme.com
 *                 description: Optional
 *               organizationSize:
 *                 type: string
 *                 example: 11-50
 *                 description: Use a value your schema accepts
 *               identification:
 *                 type: string
 *                 format: binary
 *                 description: Identification image (e.g. national ID, passport). Only one file is accepted.
 *               selfie:
 *                 type: string
 *                 format: binary
 *                 description: Selfie image. Only one file is accepted.
 *               businessDocument:
 *                 type: string
 *                 format: binary
 *                 description: Business registration document. Only one file is accepted.
 *     responses:
 *       201:
 *         description: Employer KYC submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employer KYC submitted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     employerId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullLegalName:
 *                       type: string
 *                       example: Jane Doe
 *                     jobTitle:
 *                       type: string
 *                       example: Head of Human Resources
 *                     workEmail:
 *                       type: string
 *                       example: jane.doe@acme.com
 *                     companyName:
 *                       type: string
 *                       example: Acme Industries Ltd
 *                     registrationNumber:
 *                       type: string
 *                       example: RC1234567
 *                     registeredAddress:
 *                       type: string
 *                       example: 12 Admiralty Way, Lekki, Lagos
 *                     companyWebsite:
 *                       type: string
 *                       example: https://www.acme.com
 *                     organizationSize:
 *                       type: string
 *                       example: 11-50
 *                     identification:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/employerKyc/id.jpg
 *                     identificationPublicId:
 *                       type: string
 *                       example: Ridify/employerKyc/id
 *                     businessDocument:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/employerKyc/doc.jpg
 *                     businessDocumentPublicId:
 *                       type: string
 *                       example: Ridify/employerKyc/doc
 *                     selfie:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/employerKyc/selfie.jpg
 *                     selfiePublicId:
 *                       type: string
 *                       example: Ridify/employerKyc/selfie
 *                     kycVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Missing required fields, invalid work email, missing identification, selfie or business document, or KYC already submitted (pending or verified)
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: Only users with the employer or hr role can submit KYC
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/employerKyc', authenticate, upload.fields([
      { name: 'identification', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
      { name: 'businessDocument', maxCount: 1 }
  ]), employerKyc)

  /**
 * @swagger
 * /api/v1/hr/getEmployerKyc:
 *   get:
 *     tags:
 *       - Employer KYC
 *     summary: Get the authenticated user's employer KYC
 *     description: Returns the employer KYC record that belongs to the authenticated user, including its verification status. The lookup is by the id in the token, so a user always gets their own KYC.
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
 *                     employerId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullLegalName:
 *                       type: string
 *                       example: Jane Doe
 *                     jobTitle:
 *                       type: string
 *                       example: Head of Human Resources
 *                     workEmail:
 *                       type: string
 *                       example: jane.doe@acme.com
 *                     companyName:
 *                       type: string
 *                       example: Acme Industries Ltd
 *                     registrationNumber:
 *                       type: string
 *                       example: RC1234567
 *                     registeredAddress:
 *                       type: string
 *                       example: 12 Admiralty Way, Lekki, Lagos
 *                     companyWebsite:
 *                       type: string
 *                       example: https://www.acme.com
 *                     organizationSize:
 *                       type: string
 *                       example: 11-50
 *                     identification:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/employerKyc/id.jpg
 *                     identificationPublicId:
 *                       type: string
 *                       example: Ridify/employerKyc/id
 *                     businessDocument:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/employerKyc/doc.jpg
 *                     businessDocumentPublicId:
 *                       type: string
 *                       example: Ridify/employerKyc/doc
 *                     selfie:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/employerKyc/selfie.jpg
 *                     selfiePublicId:
 *                       type: string
 *                       example: Ridify/employerKyc/selfie
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

router.get('/getEmployerKyc', authenticate, getEmployerKyc)

module.exports = router;