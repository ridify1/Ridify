const express = require('express');
const { createInspection, getAgentInspections, updateInspectionStatus, getInspectorsRequests, getAgentInspection, getInspectorsInspection } = require('../controller/inspection');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inspection
 *   description: Inspection management and authentication
 */

/**
 * @swagger
 * /api/v1/landlord/createInspection:
 *   post:
 *     tags:
 *       - Landlord KYC and Property Upload
 *     summary: Request a property inspection
 *     description: Creates an inspection request for a property on behalf of the authenticated user. The property must exist, must not be deleted, must be available, and must not belong to the requester. The preferred date must be in the future. A user cannot have more than one open (pending or accepted) request for the same property. The landlord is taken from the property, not from the request.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - preferredDate
 *             properties:
 *               propertyId:
 *                 type: string
 *                 example: 6ab2c4d5a675b9e38dc41800
 *                 description: The id of the property to inspect
 *               preferredDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-11-20T10:00:00.000Z
 *                 description: Must be a valid date in the future
 *               preferredTime:
 *                 type: string
 *                 example: "10:00 AM"
 *                 description: Optional preferred time of day
 *               message:
 *                 type: string
 *                 example: I would like to see the apartment on a weekday morning
 *                 description: Optional note to the landlord
 *     responses:
 *       201:
 *         description: Inspection request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inspection request sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab4e6f7a675b9e38dc41a00
 *                     propertyId:
 *                       type: string
 *                       example: 6ab2c4d5a675b9e38dc41800
 *                     landLordId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     inspectorId:
 *                       type: string
 *                       example: 6ab5f7a8a675b9e38dc41b00
 *                     preferredDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-20T10:00:00.000Z
 *                     preferredTime:
 *                       type: string
 *                       example: "10:00 AM"
 *                     message:
 *                       type: string
 *                       example: I would like to see the apartment on a weekday morning
 *                     status:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Missing required fields, invalid property ID, date not valid or not in the future, you cannot inspect your own property, or the property is not available
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: User or property not found
 *       409:
 *         description: You already have an open request for this property
 *       500:
 *         description: Internal server error
 */

router.post('/createInspection', authenticate, createInspection)

router.get('/getAgentsInspections', authenticate, getAgentInspections)

router.get('/getSingleInspection/:inspectionId', authenticate, getAgentInspection)

router.patch('/updateInspections/:inspectionId', authenticate, updateInspectionStatus)

router.get('/inspectorsRequests', authenticate, getInspectorsRequests)

router.get('/singleInspectorRequest/:inspectionId', authenticate, getInspectorsInspection)


module.exports = router;