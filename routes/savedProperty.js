const express = require('express')
const { authenticate } = require('../middleware/auth')
const {saveProperty, getSavedProperties, unsaveProperty, getSavedProperty} = require('../controller/savedproperties')
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Save Properties
 *   description: Save and manage properties
 */

/**
 * @swagger
 * /api/v1/saved/saveProperty/{propertyId}:
 *   post:
 *     tags:
 *       - Property
 *     summary: Save a property
 *     description: Saves a property to the authenticated user's list of saved properties. A user can save a given property only once.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f1c2a9e4b0a1d2c3e4f567
 *         description: The ID of the property to save
 *     responses:
 *       201:
 *         description: Property saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Property saved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f1c2a9e4b0a1d2c3e4f999
 *                     user:
 *                       type: string
 *                       example: 64f1c2a9e4b0a1d2c3e4f111
 *                     property:
 *                       type: string
 *                       example: 64f1c2a9e4b0a1d2c3e4f567
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid property ID, or the property is already saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property already saved
 *       401:
 *         description: User is not authenticated, or the access token is missing, invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       404:
 *         description: No property found with the provided ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property not found
 *       500:
 *         description: Internal server error
 */

router.post('/saveProperty/:propertyId', authenticate, saveProperty);

/**
 * @swagger
 * /api/v1/saved/getAllSaved:
 *   get:
 *     tags:
 *       - Property
 *     summary: Get all saved properties
 *     description: Returns all properties saved by the authenticated user, newest first. Saved properties that have since been deleted or archived are left out.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved properties retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f1c2a9e4b0a1d2c3e4f999
 *                       user:
 *                         type: string
 *                         example: 64f1c2a9e4b0a1d2c3e4f111
 *                       property:
 *                         type: object
 *                         description: The full property document
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f1c2a9e4b0a1d2c3e4f567
 *                           title:
 *                             type: string
 *                             example: 3 Bedroom Flat in Ikeja
 *                           city:
 *                             type: string
 *                             example: Ikeja
 *                           state:
 *                             type: string
 *                             example: Lagos
 *                           price:
 *                             type: number
 *                             example: 2500000
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-10T09:30:00.000Z
 *       401:
 *         description: User is not authenticated, or the access token is missing, invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       500:
 *         description: Internal server error
 */

router.get('/getAllSaved', authenticate, getSavedProperties);

/**
 * @swagger
 * /api/v1/saved/unSaveProperty/{propertyId}:
 *   delete:
 *     tags:
 *       - Property
 *     summary: Remove a property from saved list
 *     description: Removes a property from the authenticated user's saved properties. Only the user's own saved entry is affected.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f1c2a9e4b0a1d2c3e4f567
 *         description: The ID of the property to remove from the saved list
 *     responses:
 *       200:
 *         description: Property removed from saved list successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Property removed from saved list
 *       400:
 *         description: Invalid property ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid property ID
 *       401:
 *         description: User is not authenticated, or the access token is missing, invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       404:
 *         description: This property is not in the user's saved list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Saved property not found
 *       500:
 *         description: Internal server error
 */

router.delete('/unSaveProperty/:propertyId', authenticate, unsaveProperty);

/**
 * @swagger
 * /api/v1/saved/getOneSaved/{propertyId}:
 *   get:
 *     tags:
 *       - Property
 *     summary: Get one saved property
 *     description: Returns a single property from the authenticated user's saved list, including the full property details. Only the user's own saved entry can be retrieved.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f1c2a9e4b0a1d2c3e4f567
 *         description: The ID of the saved property to retrieve
 *     responses:
 *       200:
 *         description: Saved property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f1c2a9e4b0a1d2c3e4f999
 *                     user:
 *                       type: string
 *                       example: 64f1c2a9e4b0a1d2c3e4f111
 *                     property:
 *                       type: object
 *                       description: The full property document
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 64f1c2a9e4b0a1d2c3e4f567
 *                         title:
 *                           type: string
 *                           example: 3 Bedroom Flat in Ikeja
 *                         city:
 *                           type: string
 *                           example: Ikeja
 *                         state:
 *                           type: string
 *                           example: Lagos
 *                         price:
 *                           type: number
 *                           example: 2500000
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid property ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Input a valid property Id
 *       401:
 *         description: User is not authenticated, or the access token is missing, invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       404:
 *         description: This property is not in the user's saved list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Saved property not found
 *       500:
 *         description: Internal server error
 */
router.get('/getOneSaved/:propertyId', authenticate, getSavedProperty);

module.exports = router