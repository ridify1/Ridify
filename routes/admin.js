const express = require('express');
const router = express.Router();
const { login, getAllLandLordKyc, getKycById, updateKycStatus, deleteKyc, getVerifiedKyc, getUnverifiedKyc, deleteOneUser, getAllUsers, getAllPropertyUpload, getPropertiesByLandLord, deleteProperty } = require('../controller/admin')
const { authenticate } = require('../middleware/auth')
const { loginValidator } = require('../middleware/validator')

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * /api/v1/admin/adminLogin:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Log in a user
 *     description: Authenticates a user with an email or phone number and password, and returns a JWT token. The account is locked for 30 minutes after 5 failed login attempts.
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
 *                 description: Registered email address or phone number
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
 *                   description: JWT token that expires in 1 hour
 *       400:
 *         description: Missing email/phone number or password, email not verified, or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       403:
 *         description: Account is temporarily locked after too many failed login attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account locked until 2026-10-23T14:30:00.000Z
 *       404:
 *         description: No user found with the provided email or phone number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User with email or phone number jane.doe@example.com not found
 *       500:
 *         description: Internal server error
 */

router.post('/adminLogin', loginValidator , login)

/**
 * @swagger
 * /api/v1/admin/getKyc:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all landlord KYC records
 *     description: Retrieves all landlord KYC records along with the landlord's full name, email, and phone number. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Landlord KYC retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Landlord KYC retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 665f1c2e8a1b2c3d4e5f6a7b
 *                       landLordId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 665f1b9e8a1b2c3d4e5f6a70
 *                           fullName:
 *                             type: string
 *                             example: Jane Doe
 *                           email:
 *                             type: string
 *                             example: jane.doe@example.com
 *                           phoneNumber:
 *                             type: string
 *                             example: "8012345678"
 *                       kycVerified:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: No landlord KYC records found
 *       500:
 *         description: Internal server error
 */

router.get('/getKyc', authenticate, getAllLandLordKyc)

/**
 * @swagger
 * /api/v1/admin/getKyc/{kycId}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get a landlord KYC record by ID
 *     description: Retrieves a single landlord KYC record by its ID, along with the landlord's full name, email, and phone number. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kycId
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1c2e8a1b2c3d4e5f6a7b
 *         description: The ID of the landlord KYC record
 *     responses:
 *       200:
 *         description: Landlord KYC retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Landlord KYC retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 665f1c2e8a1b2c3d4e5f6a7b
 *                     landLordId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 665f1b9e8a1b2c3d4e5f6a70
 *                         fullName:
 *                           type: string
 *                           example: Jane Doe
 *                         email:
 *                           type: string
 *                           example: jane.doe@example.com
 *                         phoneNumber:
 *                           type: string
 *                           example: "8012345678"
 *                     kycVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Invalid user ID or invalid KYC ID
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: Landlord KYC not found
 *       500:
 *         description: Internal server error
 */

router.get('/getKyc/:kycId', authenticate, getKycById)

/**
 * @swagger
 * /api/v1/admin/updateKycStatus/{kycId}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update a landlord KYC verification status
 *     description: Sets the verification status of a landlord KYC record to verified or not verified. Returns the updated record with the landlord's full name, email, and phone number. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kycId
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1c2e8a1b2c3d4e5f6a7b
 *         description: The ID of the landlord KYC record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kycVerified
 *             properties:
 *               kycVerified:
 *                 type: boolean
 *                 example: true
 *                 description: Must be a boolean (true or false), not a string
 *     responses:
 *       200:
 *         description: Landlord KYC updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Landlord KYC updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 665f1c2e8a1b2c3d4e5f6a7b
 *                     landLordId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 665f1b9e8a1b2c3d4e5f6a70
 *                         fullName:
 *                           type: string
 *                           example: Jane Doe
 *                         email:
 *                           type: string
 *                           example: jane.doe@example.com
 *                         phoneNumber:
 *                           type: string
 *                           example: "8012345678"
 *                     kycVerified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid user ID, invalid KYC ID, or kycVerified is not a boolean
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: Landlord KYC not found
 *       500:
 *         description: Internal server error
 */

router.put('/updateKycStatus/:kycId', authenticate, updateKycStatus)

/**
 * @swagger
 * /api/v1/admin/deleteKyc/{kycId}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a landlord KYC record
 *     description: Deletes a landlord KYC record by its ID and sends the landlord an email notifying them that their KYC could not be verified. Returns the deleted record. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kycId
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1c2e8a1b2c3d4e5f6a7b
 *         description: The ID of the landlord KYC record to delete
 *     responses:
 *       200:
 *         description: Landlord KYC deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Landlord KYC deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 665f1c2e8a1b2c3d4e5f6a7b
 *                     landLordId:
 *                       type: string
 *                       example: 665f1b9e8a1b2c3d4e5f6a70
 *                       description: The landlord's user ID (not populated)
 *                     kycVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Invalid user ID or invalid KYC ID
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: Landlord KYC not found
 *       500:
 *         description: Internal server error
 */

router.delete('/deleteKyc/:kycId', authenticate, deleteKyc)

/**
 * @swagger
 * /api/v1/admin/getVerifiedKyc:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all verified landlord KYC records
 *     description: Retrieves all landlord KYC records where kycVerified is true, sorted by newest first, along with the landlord's full name, email, and phone number. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verified landlord KYC records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                   description: Number of verified KYC records returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 665f1c2e8a1b2c3d4e5f6a7b
 *                       landLordId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 665f1b9e8a1b2c3d4e5f6a70
 *                           fullName:
 *                             type: string
 *                             example: Jane Doe
 *                           email:
 *                             type: string
 *                             example: jane.doe@example.com
 *                           phoneNumber:
 *                             type: string
 *                             example: "8012345678"
 *                       kycVerified:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-10-24T10:30:00.000Z
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: No verified landlord KYC records found
 *       500:
 *         description: Internal server error
 */

router.get('/getVerifiedKyc', authenticate, getVerifiedKyc)

/**
 * @swagger
 * /api/v1/admin/getUnverifiedKyc:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all unverified landlord KYC records
 *     description: Retrieves all landlord KYC records where kycVerified is false, sorted by newest first, along with the landlord's full name, email, and phone number. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unverified landlord KYC records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                   description: Number of unverified KYC records returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 665f1c2e8a1b2c3d4e5f6a7b
 *                       landLordId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 665f1b9e8a1b2c3d4e5f6a70
 *                           fullName:
 *                             type: string
 *                             example: Jane Doe
 *                           email:
 *                             type: string
 *                             example: jane.doe@example.com
 *                           phoneNumber:
 *                             type: string
 *                             example: "8012345678"
 *                       kycVerified:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-10-24T10:30:00.000Z
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: No unverified landlord KYC records found
 *       500:
 *         description: Internal server error
 */

router.get('/getUnverifiedKyc', authenticate, getUnverifiedKyc)

/**
 * @swagger
 * /api/v1/admin/getAllUsers:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users
 *     description: Retrieves all registered users with the password field excluded. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 665f1b9e8a1b2c3d4e5f6a70
 *                       fullName:
 *                         type: string
 *                         example: Jane Doe
 *                       email:
 *                         type: string
 *                         example: jane.doe@example.com
 *                       phoneNumber:
 *                         type: string
 *                         example: "8012345678"
 *                       role:
 *                         type: string
 *                         example: user
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: No users found
 *       500:
 *         description: Internal server error
 */

router.get('/getAllUsers', authenticate, getAllUsers)

/**
 * @swagger
 * /api/v1/admin/deleteUser/{userId}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a user (soft delete)
 *     description: Deactivates a user account by marking it as deleted and recording who deleted it, when, and why. The user's session is cleared and they are emailed the reason. The record is kept for audit purposes. Admins cannot delete their own account. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1b9e8a1b2c3d4e5f6a70
 *         description: The ID of the user to delete
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 example: Repeated violation of the community guidelines
 *                 description: Optional. Stored on the record and included in the email sent to the user. Defaults to a generic community guidelines message if omitted.
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       400:
 *         description: Invalid user ID, reason is not a string, reason exceeds 500 characters, or admin tried to delete their own account
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: User not found or already deleted
 *       500:
 *         description: Internal server error
 */

router.delete('/deleteUser/:userId', authenticate, deleteOneUser)

/**
 * @swagger
 * /api/v1/admin/allProperty:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all property uploads
 *     description: Retrieves every property upload, sorted by newest first, and returns the total count. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
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
 *                         example: 665f1b9e8a1b2c3d4e5f6a70
 *                       landLordId:
 *                         type: string
 *                         example: 665f1b9e8a1b2c3d4e5f6a11
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-06-20T10:15:30.000Z
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: No property found
 *       500:
 *         description: Internal server error
 */

router.get('/allProperty', authenticate, getAllPropertyUpload)

/**
 * @swagger
 * /api/v1/admin/propertiesByLandLord/{landLordId}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get properties by landlord
 *     description: Retrieves all non-archived properties uploaded by a specific landlord, sorted by newest first, with the total count. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: landLordId
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1b9e8a1b2c3d4e5f6a11
 *         description: The ID of the landlord whose properties should be retrieved
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
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 665f1b9e8a1b2c3d4e5f6a70
 *                       title:
 *                         type: string
 *                         example: Spacious 3-bedroom flat
 *                       rent:
 *                         type: number
 *                         example: 1500000
 *                       city:
 *                         type: string
 *                         example: Lagos
 *                       state:
 *                         type: string
 *                         example: Lagos
 *                       streetAddress:
 *                         type: string
 *                         example: 12 Admiralty Way, Lekki
 *                       availability:
 *                         type: string
 *                         example: available
 *                       gallery:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: https://res.cloudinary.com/sample/image.jpg
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-06-20T10:15:30.000Z
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       500:
 *         description: Internal server error
 */

router.get('/propertiesByLandLord/:landLordId', authenticate, getPropertiesByLandLord)

/**
 * @swagger
 * /api/v1/admin/deleteProperty/{propertyId}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a property (soft delete)
 *     description: Marks a property as deleted and records who deleted it, when, and optionally why. The record is kept rather than removed from the database. Properties that are already deleted cannot be deleted again. Only accessible to authenticated admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 665f1b9e8a1b2c3d4e5f6a70
 *         description: The ID of the property to delete
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Listing contains false information
 *                 description: Optional. Stored on the record as the deletion reason.
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
 *         description: Invalid property ID or reason is not a string
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *       403:
 *         description: Access denied, the user is not an admin
 *       404:
 *         description: Property not found or already deleted
 *       500:
 *         description: Internal server error
 */

router.delete('/deleteProperty/:propertyId', authenticate, deleteProperty)

module.exports = router;