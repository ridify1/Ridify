const express = require('express');
const upload = require('../middleware/multer');
const { authenticate } = require('../middleware/auth');
const { jobAgencyKyc, getJobAgencyKyc } = require('../controller/jobAgencyKyc');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Job Agency KYC
 *   description: Job Agency management and authentication
 */

/**
 * @swagger
 * /api/v1/agency/jobAgencyKyc:
 *   post:
 *     tags:
 *       - Job Agency KYC
 *     summary: Submit job agency KYC
 *     description: Submits KYC details for a job agency with an identification image, a selfie and a business registration document. Only users with the jobAgent role can submit, and each user can submit once. The submission starts as unverified until it is reviewed.
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
 *               - phoneNumber
 *               - companyName
 *               - registrationNumber
 *               - registrationAddress
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
 *                 example: Head of Recruitment
 *               workEmail:
 *                 type: string
 *                 example: jane.doe@acme.com
 *               phoneNumber:
 *                 type: string
 *                 example: "8012345678"
 *               companyName:
 *                 type: string
 *                 example: Acme Staffing Ltd
 *               registrationNumber:
 *                 type: string
 *                 example: RC1234567
 *               registrationAddress:
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
 *                 description: Identification image (e.g. national ID, passport). Only the first file is saved.
 *               selfie:
 *                 type: string
 *                 format: binary
 *                 description: Selfie image
 *               businessDocument:
 *                 type: string
 *                 format: binary
 *                 description: Business registration document. Only the first file is saved.
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
 *                     jobAgencyId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullLegalName:
 *                       type: string
 *                       example: Jane Doe
 *                     jobTitle:
 *                       type: string
 *                       example: Head of Recruitment
 *                     workEmail:
 *                       type: string
 *                       example: jane.doe@acme.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "8012345678"
 *                     companyName:
 *                       type: string
 *                       example: Acme Staffing Ltd
 *                     registrationNumber:
 *                       type: string
 *                       example: RC1234567
 *                     registrationAddress:
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
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/jobAgencyKyc/id.jpg
 *                     identificationPublicId:
 *                       type: string
 *                       example: Ridify/jobAgencyKyc/id
 *                     businessDocument:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/jobAgencyKyc/doc.jpg
 *                     businessDocumentPublicId:
 *                       type: string
 *                       example: Ridify/jobAgencyKyc/doc
 *                     selfie:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/jobAgencyKyc/selfie.jpg
 *                     selfiePublicId:
 *                       type: string
 *                       example: Ridify/jobAgencyKyc/selfie
 *                     kycVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Missing required fields, missing identification, selfie or business document, or KYC already submitted (pending or verified)
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: Only users with the jobAgent role can submit KYC
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

  router.post('/jobAgencyKyc', authenticate, upload.fields([
      { name: 'identification', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
      { name: 'businessDocument', maxCount: 1 }
  ]), jobAgencyKyc);

  /**
 * @swagger
 * /api/v1/agency/getJobAgencyKyc:
 *   get:
 *     tags:
 *       - Job Agency KYC
 *     summary: Get the authenticated user's job agency KYC
 *     description: Returns the job agency KYC record that belongs to the authenticated user, including its verification status. The lookup is by the id in the token, so a user always gets their own KYC.
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
 *                     jobAgencyId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullLegalName:
 *                       type: string
 *                       example: Jane Doe
 *                     jobTitle:
 *                       type: string
 *                       example: Head of Recruitment
 *                     workEmail:
 *                       type: string
 *                       example: jane.doe@acme.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "8012345678"
 *                     companyName:
 *                       type: string
 *                       example: Acme Staffing Ltd
 *                     registrationNumber:
 *                       type: string
 *                       example: RC1234567
 *                     registrationAddress:
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
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/jobAgencyKyc/id.jpg
 *                     identificationPublicId:
 *                       type: string
 *                       example: Ridify/jobAgencyKyc/id
 *                     businessDocument:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/jobAgencyKyc/doc.jpg
 *                     businessDocumentPublicId:
 *                       type: string
 *                       example: Ridify/jobAgencyKyc/doc
 *                     selfie:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/jobAgencyKyc/selfie.jpg
 *                     selfiePublicId:
 *                       type: string
 *                       example: Ridify/jobAgencyKyc/selfie
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

router.get('/getJobAgencyKyc', authenticate, getJobAgencyKyc)

module.exports = router;