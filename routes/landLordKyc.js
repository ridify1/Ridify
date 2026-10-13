const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { landLordKyc, propertyUpload, getLandLordKyc, updatePropertyUpload} = require('../controller/landLordKyc');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Landlord KYC and Property Upload
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/v1/landlord/landlord-kyc:
 *   post:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Submit landlord KYC
 *     description: Submits KYC details with an identification image and a selfie for the authenticated user. Only landlords, admins, agents and realtors can submit, and each user can submit once. The submission starts as unverified until it is reviewed.
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
 *               - DateOfBirth
 *               - HomeAddress
 *               - city
 *               - propertyAddress
 *               - NumberOfProperties
 *               - ownershipType
 *               - identification
 *               - selfie
 *             properties:
 *               fullLegalName:
 *                 type: string
 *                 example: Jane Doe
 *               DateOfBirth:
 *                 type: string
 *                 example: "1990-05-21"
 *               HomeAddress:
 *                 type: string
 *                 example: 12 Admiralty Way, Lekki
 *               city:
 *                 type: string
 *                 example: Lagos
 *               propertyAddress:
 *                 type: string
 *                 example: 45 Allen Avenue, Ikeja
 *               NumberOfProperties:
 *                 type: integer
 *                 example: 3
 *               ownershipType:
 *                 type: string
 *                 enum:
 *                   - soleOwner
 *                   - family
 *                 example: soleOwner
 *               identification:
 *                 type: string
 *                 format: binary
 *                 description: Identification image (e.g. national ID, passport). Only the first file is saved.
 *               selfie:
 *                 type: string
 *                 format: binary
 *                 description: Selfie image
 *     responses:
 *       201:
 *         description: Landlord KYC submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Landlord KYC submitted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     landLordId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullLegalName:
 *                       type: string
 *                       example: Jane Doe
 *                     DateOfBirth:
 *                       type: string
 *                       example: "1990-05-21"
 *                     HomeAddress:
 *                       type: string
 *                       example: 12 Admiralty Way, Lekki
 *                     city:
 *                       type: string
 *                       example: Lagos
 *                     propertyAddress:
 *                       type: string
 *                       example: 45 Allen Avenue, Ikeja
 *                     NumberOfProperties:
 *                       type: integer
 *                       example: 3
 *                     ownershipType:
 *                       type: string
 *                       example: soleOwner
 *                     identification:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/landLordKyc/id.jpg
 *                     identificationPublicId:
 *                       type: string
 *                       example: Ridify/landLordKyc/id
 *                     selfie:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/landLordKyc/selfie.jpg
 *                     selfiePublicId:
 *                       type: string
 *                       example: Ridify/landLordKyc/selfie
 *                     kycVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Missing required fields, missing identification or selfie image, or KYC already submitted (pending or verified)
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: Only landlords, admins, agents and realtors can submit KYC
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/landlord-kyc', authenticate, upload.fields([
    { name: 'identification', maxCount: 2 },
    { name: 'selfie', maxCount: 1 }
  ]), landLordKyc);

/**
 * @swagger
 * /api/v1/landlord/propertyUpload:
 *   post:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Upload a property
 *     description: Creates a new property listing with gallery images for the authenticated user. Only landlords, admins, agents and realtors with a verified KYC can upload properties, and a user can upload more than one property.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - propertyType
 *               - beds
 *               - baths
 *               - area
 *               - description
 *               - state
 *               - city
 *               - streetAddress
 *               - rent
 *               - availability
 *               - amenities
 *               - gallery
 *             properties:
 *               title:
 *                 type: string
 *                 example: Spacious 3 Bedroom Apartment
 *               propertyType:
 *                 type: string
 *                 example: apartment
 *                 description: Use a value your property schema accepts
 *               beds:
 *                 type: integer
 *                 example: 3
 *               baths:
 *                 type: integer
 *                 example: 2
 *               area:
 *                 type: string
 *                 example: 120 sqm
 *               description:
 *                 type: string
 *                 example: A bright apartment close to schools and shopping centres
 *               state:
 *                 type: string
 *                 example: Lagos
 *               city:
 *                 type: string
 *                 example: Ikeja
 *               streetAddress:
 *                 type: string
 *                 example: 45 Allen Avenue
 *               rent:
 *                 type: number
 *                 example: 2000000
 *                 description: Plain number. Commas are accepted, but words such as "2 million" are rejected.
 *               availability:
 *                 type: string
 *                 example: available
 *                 description: Use a value your property schema accepts
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - cctv
 *                   - security
 *                 description: Send as repeated fields, a comma-separated string, or a JSON array string. Values must match the schema enum.
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Property images. Between 1 and 5 files.
 *     responses:
 *       201:
 *         description: Property uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     landLordId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     landLordKycId:
 *                       type: string
 *                       example: 6ab1a3c4a675b9e38dc41700
 *                     title:
 *                       type: string
 *                       example: Spacious 3 Bedroom Apartment
 *                     propertyType:
 *                       type: string
 *                       example: apartment
 *                     beds:
 *                       type: integer
 *                       example: 3
 *                     baths:
 *                       type: integer
 *                       example: 2
 *                     area:
 *                       type: string
 *                       example: 120 sqm
 *                     description:
 *                       type: string
 *                       example: A bright apartment close to schools and shopping centres
 *                     state:
 *                       type: string
 *                       example: Lagos
 *                     city:
 *                       type: string
 *                       example: Ikeja
 *                     streetAddress:
 *                       type: string
 *                       example: 45 Allen Avenue
 *                     rent:
 *                       type: number
 *                       example: 2000000
 *                     availability:
 *                       type: string
 *                       example: available
 *                     amenities:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - cctv
 *                         - security
 *                     gallery:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img1.jpg
 *                         - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img2.jpg
 *                     galleryPublicId:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - Ridify/propertyUpload/img1
 *                         - Ridify/propertyUpload/img2
 *       400:
 *         description: Missing required fields, invalid rent, or no gallery image provided
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: KYC not verified, or only landlords, admins, agents and realtors can upload properties
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/propertyUpload', authenticate, upload.fields([{ name: 'gallery', maxCount: 5 }]), propertyUpload);

/**
 * @swagger
 * /api/v1/landlord/getLandLordKyc:
 *   get:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Get the authenticated user's KYC
 *     description: Returns the KYC record that belongs to the authenticated user, including its verification status. The lookup is by the id in the token, so a user always gets their own KYC.
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
 *                     landLordId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     fullLegalName:
 *                       type: string
 *                       example: Jane Doe
 *                     DateOfBirth:
 *                       type: string
 *                       example: "1990-05-21"
 *                     HomeAddress:
 *                       type: string
 *                       example: 12 Admiralty Way, Lekki
 *                     city:
 *                       type: string
 *                       example: Lagos
 *                     propertyAddress:
 *                       type: string
 *                       example: 45 Allen Avenue, Ikeja
 *                     NumberOfProperties:
 *                       type: integer
 *                       example: 3
 *                     ownershipType:
 *                       type: string
 *                       example: soleOwner
 *                     identification:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/landLordKyc/id.jpg
 *                     identificationPublicId:
 *                       type: string
 *                       example: Ridify/landLordKyc/id
 *                     selfie:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/landLordKyc/selfie.jpg
 *                     selfiePublicId:
 *                       type: string
 *                       example: Ridify/landLordKyc/selfie
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

router.get('/getLandLordKyc', authenticate, getLandLordKyc)

/**
 * @swagger
 * /api/v1/landlord/updateProperty/{propertyId}:
 *   put:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Update a property
 *     description: Updates a property listing owned by the authenticated user. Only the fields you send are changed. If new gallery images are sent, they replace the existing gallery, and the old images are deleted after the update succeeds. The user must have a verified KYC.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab2c4d5a675b9e38dc41800
 *         description: The id of the property to update
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Spacious 3 Bedroom Apartment
 *               propertyType:
 *                 type: string
 *                 example: apartment
 *                 description: Use a value your property schema accepts
 *               beds:
 *                 type: integer
 *                 example: 3
 *               baths:
 *                 type: integer
 *                 example: 2
 *               area:
 *                 type: string
 *                 example: 120 sqm
 *               description:
 *                 type: string
 *                 example: A bright apartment close to schools and shopping centres
 *               state:
 *                 type: string
 *                 example: Lagos
 *               city:
 *                 type: string
 *                 example: Ikeja
 *               streetAddress:
 *                 type: string
 *                 example: 45 Allen Avenue
 *               rent:
 *                 type: number
 *                 example: 2500000
 *                 description: Plain number. Commas are accepted, but words such as "2 million" are rejected.
 *               availability:
 *                 type: string
 *                 example: available
 *                 description: Use a value your property schema accepts
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - cctv
 *                   - security
 *                 description: Send as repeated fields, a comma-separated string, or a JSON array string. Values must match the schema enum. Cannot be empty if sent.
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New property images (up to 5). If sent, they replace the existing gallery.
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     landLordId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     landLordKycId:
 *                       type: string
 *                       example: 6ab1a3c4a675b9e38dc41700
 *                     title:
 *                       type: string
 *                       example: Spacious 3 Bedroom Apartment
 *                     propertyType:
 *                       type: string
 *                       example: apartment
 *                     beds:
 *                       type: integer
 *                       example: 3
 *                     baths:
 *                       type: integer
 *                       example: 2
 *                     area:
 *                       type: string
 *                       example: 120 sqm
 *                     description:
 *                       type: string
 *                       example: A bright apartment close to schools and shopping centres
 *                     state:
 *                       type: string
 *                       example: Lagos
 *                     city:
 *                       type: string
 *                       example: Ikeja
 *                     streetAddress:
 *                       type: string
 *                       example: 45 Allen Avenue
 *                     rent:
 *                       type: number
 *                       example: 2500000
 *                     availability:
 *                       type: string
 *                       example: available
 *                     amenities:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - cctv
 *                         - security
 *                     gallery:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img1.jpg
 *                         - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img2.jpg
 *                     galleryPublicId:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - Ridify/propertyUpload/img1
 *                         - Ridify/propertyUpload/img2
 *       400:
 *         description: Invalid property ID, invalid rent, or amenities sent empty
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: You can only update your own property, or KYC not verified
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */

router.put('/updateProperty/:propertyId', authenticate,upload.fields([{ name: 'gallery', maxCount: 5 }]), updatePropertyUpload);

module.exports = router;