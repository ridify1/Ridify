const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { landLordKyc, propertyUpload, getLandLordKyc, updatePropertyUpload, getPropertiesByLandLord, getPropertyByLandLord, archiveProperty, changeStatus, deleteProperty, unarchiveProperty, getAchivedPropertiesByLandLord, getPropertiesByStatus} = require('../controller/landLordKyc');
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
 *     summary: Upload a new property
 *     description: Creates a property listing with up to 5 gallery images, which are uploaded to Cloudinary. The authenticated user must have a verified landlord KYC record and an allowed role (landlord, admin, agent, or realtor). All fields are required, and at least one amenity and one gallery image must be provided. The request must be sent as multipart/form-data.
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
 *               - category
 *               - availability
 *               - amenities
 *               - gallery
 *             properties:
 *               title:
 *                 type: string
 *                 example: Spacious 3 Bedroom Apartment in Lekki
 *               propertyType:
 *                 type: string
 *                 example: apartment
 *               category:
 *                 type: string
 *                 example: rent
 *               beds:
 *                 type: integer
 *                 example: 3
 *               baths:
 *                 type: integer
 *                 example: 2
 *                 description: Number of bathrooms
 *               area:
 *                 type: number
 *                 example: 120
 *                 description: Property size (for example in square metres)
 *               description:
 *                 type: string
 *                 example: A bright, well-finished apartment close to the main road with 24/7 power.
 *               state:
 *                 type: string
 *                 example: Lagos
 *               city:
 *                 type: string
 *                 example: Lekki
 *               streetAddress:
 *                 type: string
 *                 example: 12 Admiralty Way
 *               rent:
 *                 type: string
 *                 example: "2000000"
 *                 description: Must be a positive number. Commas are allowed and stripped (for example 2,000,000).
 *               availability:
 *                 type: string
 *                 enum: [available, not available]
 *                 example: available
 *               amenities:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   enum: ['24/7 power', water, pool, gym, parking, cctv, furnished, bq, elevator, serviced, wifi, security, playground, clubhouse, laundry, garden, balcony, fireplace, storage, 'pet friendly']
 *                 example: [wifi, pool, parking]
 *                 description: At least one amenity is required.
 *               gallery:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 5
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
 *                     _id:
 *                       type: string
 *                       example: 665f2a1e8a1b2c3d4e5f6b01
 *                     landLordId:
 *                       type: string
 *                       example: 665f1b9e8a1b2c3d4e5f6a70
 *                     landLordKycId:
 *                       type: string
 *                       example: 665f1c2e8a1b2c3d4e5f6a7b
 *                     title:
 *                       type: string
 *                       example: Spacious 3 Bedroom Apartment in Lekki
 *                     propertyType:
 *                       type: string
 *                       example: apartment
 *                     category:
 *                       type: string
 *                       example: rent
 *                     beds:
 *                       type: integer
 *                       example: 3
 *                     baths:
 *                       type: integer
 *                       example: 2
 *                     area:
 *                       type: number
 *                       example: 120
 *                     description:
 *                       type: string
 *                       example: A bright, well-finished apartment close to the main road with 24/7 power.
 *                     state:
 *                       type: string
 *                       example: Lagos
 *                     city:
 *                       type: string
 *                       example: Lekki
 *                     streetAddress:
 *                       type: string
 *                       example: 12 Admiralty Way
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
 *                       example: [wifi, pool, parking]
 *                     gallery:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [https://res.cloudinary.com/demo/image/upload/v1/Ridify/propertyUpload/img1.jpg]
 *                     galleryPublicId:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [Ridify/propertyUpload/img1]
 *       400:
 *         description: A required field is missing, rent is not a valid positive number, or no gallery image was provided
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Landlord KYC is not verified, or the user's role is not allowed to upload properties
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

/**
 * @swagger
 * /api/v1/landlord/getProperties:
 *   get:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Get my properties
 *     description: Retrieves all properties uploaded by the authenticated landlord, sorted by newest first, with the total count. Archived and deleted properties are not included. If the landlord has no properties, a message is returned without a count or data.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Properties retrieved successfully, or no properties to display
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
 *                         example: 2500000
 *                       city:
 *                         type: string
 *                         example: Ikeja
 *                       state:
 *                         type: string
 *                         example: Lagos
 *                       streetAddress:
 *                         type: string
 *                         example: 45 Allen Avenue
 *                       availability:
 *                         type: string
 *                         example: available
 *                       gallery:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example:
 *                           - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img1.jpg
 *                           - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img2.jpg
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-06-20T10:15:30.000Z
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/getProperties', authenticate, getPropertiesByLandLord)

/**
 * @swagger
 * /api/v1/landlord/getSingleProperty/{propertyId}:
 *   get:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Get a single property
 *     description: Retrieves the full details of one property by its id. Deleted properties are not returned. Landlords can only view their own properties. Admins can view any property.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab2c4d5a675b9e38dc41800
 *         description: The id of the property to retrieve
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab2c4d5a675b9e38dc41800
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
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-06-20T10:15:30.000Z
 *       400:
 *         description: Invalid user ID or missing property ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: You can only access your own property information
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */

router.get('/getSingleProperty/:propertyId', authenticate, getPropertyByLandLord)

/**
 * @swagger
 * /api/v1/landlord/archive/{propertyId}:
 *   patch:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Archive a property
 *     description: Archives a property listing owned by the authenticated landlord. Archived properties are no longer returned in the landlord's property list. The record is kept in the database. Landlords can only archive their own properties.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab2c4d5a675b9e38dc41800
 *         description: The id of the property to archive
 *     responses:
 *       200:
 *         description: Property archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property archived successfully
 *       400:
 *         description: Missing or invalid property ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: Property not found, already deleted, or not owned by the user
 *       500:
 *         description: Internal server error
 */

router.patch('/archive/:propertyId', authenticate, archiveProperty)

/**
 * @swagger
 * /api/v1/landlord/unarchive/{propertyId}:
 *   patch:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Unarchive a property
 *     description: Restores an archived property listing owned by the authenticated landlord, so it appears in the landlord's property list again. Landlords can only unarchive their own properties.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab2c4d5a675b9e38dc41800
 *         description: The id of the property to unarchive
 *     responses:
 *       200:
 *         description: Property unarchived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property unarchived successfully
 *       400:
 *         description: Missing or invalid property ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: Property not found or not owned by the user
 *       500:
 *         description: Internal server error
 */

router.patch('/unarchive/:propertyId', authenticate, unarchiveProperty)

/**
 * @swagger
 * /api/v1/landlord/getArchivedProperties:
 *   get:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Get archived properties
 *     description: Returns all archived properties that belong to the authenticated landlord, newest first. Deleted properties are not included. If the landlord has no archived properties, a message is returned with no data.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived properties retrieved successfully, or no archived properties to display
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Archived Properties retrieved successfully
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
 *                       streetAddress:
 *                         type: string
 *                         example: 45 Allen Avenue
 *                       availability:
 *                         type: string
 *                         example: available
 *                       gallery:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example:
 *                           - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img1.jpg
 *                           - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img2.jpg
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-10-20T09:30:00.000Z
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/getArchivedProperties', authenticate, getAchivedPropertiesByLandLord)

/**
 * @swagger
 * /api/v1/landlord/changeStatus/{propertyId}:
 *   patch:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Change a property's status
 *     description: Updates the status of a property listing owned by the authenticated landlord. Landlords can only change the status of their own properties.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab2c4d5a675b9e38dc41800
 *         description: The id of the property whose status should change
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: available
 *                 description: The new status. Use a value your property schema accepts.
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status updated successfully
 *       400:
 *         description: Missing or invalid property ID, or missing or invalid status
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: Property not found or not owned by the user
 *       500:
 *         description: Internal server error
 */

router.patch('/changeStatus/:propertyId', authenticate, changeStatus)

/**
 * @swagger
 * /api/v1/landlord/getByStatus:
 *   get:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Get properties by status
 *     description: Returns the authenticated landlord's properties that match the given status. Archived and deleted properties are not included. If no property matches, a 404 is returned.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           example: available
 *         description: The status to filter by. Use a value your property schema accepts.
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
 *                       streetAddress:
 *                         type: string
 *                         example: 45 Allen Avenue
 *                       status:
 *                         type: string
 *                         example: available
 *                       gallery:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example:
 *                           - https://res.cloudinary.com/demo/image/upload/Ridify/propertyUpload/img1.jpg
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-10-20T09:30:00.000Z
 *       400:
 *         description: Invalid user ID, or status is missing
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: No property found with that status
 *       500:
 *         description: Internal server error
 */

router.get('/getByStatus', authenticate, getPropertiesByStatus)

/**
 * @swagger
 * /api/v1/landlord/deleteProperty/{propertyId}:
 *   delete:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Delete a property
 *     description: Soft-deletes a property listing owned by the authenticated landlord. The record is kept in the database and marked as deleted, with the deletion time, the user who deleted it and an optional reason. Deleted properties are no longer returned. Landlords can only delete their own properties.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab2c4d5a675b9e38dc41800
 *         description: The id of the property to delete
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Property has been sold
 *                 description: Optional reason for deleting the property
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property deleted successfully
 *       400:
 *         description: Missing or invalid property ID, or reason is not a string
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: Property not found, already deleted, or not owned by the user
 *       500:
 *         description: Internal server error
 */

router.delete('/deleteProperty/:propertyId', authenticate, deleteProperty)

module.exports = router;