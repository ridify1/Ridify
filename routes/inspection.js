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
 * /api/v1/inspection/createInspection/{propertyId}:
 *   post:
 *     tags:
 *       - Inspection
 *     summary: Request a property inspection
 *     description: Creates an inspection request for the property in the URL on behalf of the authenticated user. The property must exist, must not be deleted, must be available, and must not belong to the requester. The preferred date must be in the future. A user cannot have more than one open (pending or accepted) request for the same property. The landlord is taken from the property, not from the request.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab2c4d5a675b9e38dc41800
 *         description: The id of the property to inspect
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preferredDate
 *             properties:
 *               preferredDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-11-20T10:00:00.000Z
 *                 description: Must be a valid date in the future
 *               preferredTime:
 *                 type: string
 *                 maxLength: 50
 *                 example: "10:00 AM"
 *                 description: Optional preferred time of day
 *               message:
 *                 type: string
 *                 maxLength: 500
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
 *         description: Invalid property ID, missing preferred date, date not valid or not in the future, you cannot inspect your own property, or the property is not available
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: User or property not found
 *       409:
 *         description: You already have an open request for this property
 *       500:
 *         description: Internal server error
 */
router.post('/createInspection/:propertyId', authenticate, createInspection);

/**
 * @swagger
 * /api/v1/inspection/getAgentsInspections:
 *   get:
 *     tags:
 *       - Inspection
 *     summary: Get inspection requests for the logged-in landlord
 *     description: Returns all inspection requests addressed to the authenticated landlord, newest first. Each request includes the details of the property and the contact details of the user who requested the inspection. Only requests where the authenticated user is the landlord are returned. If there are no requests, an empty list is returned with a 200 status.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inspections retrieved successfully. An empty list is returned when there are no requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inspections retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 2
 *                   description: Number of inspection requests returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6ab4e6f7a675b9e38dc41a00
 *                       propertyId:
 *                         type: object
 *                         description: Details of the property to be inspected
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6ab2c4d5a675b9e38dc41800
 *                           title:
 *                             type: string
 *                             example: 3 Bedroom Flat in Ikeja
 *                           description:
 *                             type: string
 *                             example: Spacious flat with parking and 24-hour power
 *                           state:
 *                             type: string
 *                             example: Lagos
 *                           city:
 *                             type: string
 *                             example: Ikeja
 *                           streetAddress:
 *                             type: string
 *                             example: 12 Allen Avenue
 *                           rent:
 *                             type: number
 *                             example: 2500000
 *                           status:
 *                             type: string
 *                             example: available
 *                           category:
 *                             type: string
 *                             example: apartment
 *                       landLordId:
 *                         type: string
 *                         example: 6ab0f2ffa675b9e38dc41623
 *                       inspectorId:
 *                         type: object
 *                         description: The user who requested the inspection
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6ab5f7a8a675b9e38dc41b00
 *                           fullName:
 *                             type: string
 *                             example: Jane Doe
 *                           email:
 *                             type: string
 *                             example: jane.doe@example.com
 *                           phoneNumber:
 *                             type: string
 *                             example: "08012345678"
 *                       preferredDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-20T10:00:00.000Z
 *                       preferredTime:
 *                         type: string
 *                         example: "10:00 AM"
 *                       message:
 *                         type: string
 *                         example: I would like to see the apartment on a weekday morning
 *                       status:
 *                         type: string
 *                         example: pending
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-10T09:30:00.000Z
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/getAgentsInspections', authenticate, getAgentInspections);

/**
 * @swagger
 * /api/v1/inspection/getSingleInspection/{inspectionId}:
 *   get:
 *     tags:
 *       - Inspection
 *     summary: Get a single inspection request for the logged-in landlord
 *     description: Returns one inspection request by its id, including the details of the property and the contact details of the user who requested the inspection. Only the landlord the request is addressed to can retrieve it. If the request does not exist or belongs to another landlord, a 404 is returned.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inspectionId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab4e6f7a675b9e38dc41a00
 *         description: The id of the inspection request to retrieve
 *     responses:
 *       200:
 *         description: Inspection retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inspection retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab4e6f7a675b9e38dc41a00
 *                     propertyId:
 *                       type: object
 *                       description: Details of the property to be inspected
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6ab2c4d5a675b9e38dc41800
 *                         title:
 *                           type: string
 *                           example: 3 Bedroom Flat in Ikeja
 *                         description:
 *                           type: string
 *                           example: Spacious flat with parking and 24-hour power
 *                         state:
 *                           type: string
 *                           example: Lagos
 *                         city:
 *                           type: string
 *                           example: Ikeja
 *                         streetAddress:
 *                           type: string
 *                           example: 12 Allen Avenue
 *                         rent:
 *                           type: number
 *                           example: 2500000
 *                         status:
 *                           type: string
 *                           example: available
 *                         category:
 *                           type: string
 *                           example: apartment
 *                     landLordId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     inspectorId:
 *                       type: object
 *                       description: The user who requested the inspection
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6ab5f7a8a675b9e38dc41b00
 *                         fullName:
 *                           type: string
 *                           example: Jane Doe
 *                         email:
 *                           type: string
 *                           example: jane.doe@example.com
 *                         phoneNumber:
 *                           type: string
 *                           example: "08012345678"
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
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid inspection ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: Inspection request not found, or it belongs to another landlord
 *       500:
 *         description: Internal server error
 */

router.get('/getSingleInspection/:inspectionId', authenticate, getAgentInspection);

/**
 * @swagger
 * /api/v1/inspection/updateInspections/{inspectionId}:
 *   patch:
 *     tags:
 *       - Inspection
 *     summary: Update the status of an inspection request
 *     description: Allows the landlord an inspection request is addressed to, to accept, decline, complete or cancel it. Only the landlord who owns the request can update it. Allowed changes are pending to accepted, declined or cancelled, and accepted to completed or cancelled. Declined, completed and cancelled requests cannot be changed again. A decline reason is required when declining.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inspectionId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab4e6f7a675b9e38dc41a00
 *         description: The id of the inspection request to update
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
 *                 enum: [accepted, declined, completed, cancelled]
 *                 example: declined
 *                 description: The new status of the inspection request
 *               declineReason:
 *                 type: string
 *                 maxLength: 500
 *                 example: The property is no longer available on that date
 *                 description: Required when status is declined, ignored otherwise
 *     responses:
 *       200:
 *         description: Inspection status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inspection status updated successfully
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
 *                       example: declined
 *                     declineReason:
 *                       type: string
 *                       example: The property is no longer available on that date
 *       400:
 *         description: Invalid inspection ID, invalid status, or decline reason missing when declining
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: You are not authorized to update this inspection
 *       404:
 *         description: Inspection not found
 *       409:
 *         description: The inspection cannot move from its current status to the requested one
 *       500:
 *         description: Internal server error
 */
router.patch('/updateInspections/:inspectionId', authenticate, updateInspectionStatus);

/**
 * @swagger
 * /api/v1/inspection/inspectorsRequests:
 *   get:
 *     tags:
 *       - Inspection
 *     summary: Get the inspection requests made by the logged-in user
 *     description: Returns all inspection requests the authenticated user has made, newest first. Each request includes the details of the property and the contact details of the landlord it was sent to. Results can optionally be filtered by status. Only requests made by the authenticated user are returned. If there are none, an empty list is returned with a 200 status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, accepted, declined, completed, cancelled]
 *           example: pending
 *         description: Only return requests with this status
 *     responses:
 *       200:
 *         description: Inspection requests retrieved successfully. An empty list is returned when there are none.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inspection requests retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 2
 *                   description: Number of inspection requests returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6ab4e6f7a675b9e38dc41a00
 *                       propertyId:
 *                         type: object
 *                         description: Details of the property to be inspected
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6ab2c4d5a675b9e38dc41800
 *                           title:
 *                             type: string
 *                             example: 3 Bedroom Flat in Ikeja
 *                           description:
 *                             type: string
 *                             example: Spacious flat with parking and 24-hour power
 *                           state:
 *                             type: string
 *                             example: Lagos
 *                           city:
 *                             type: string
 *                             example: Ikeja
 *                           streetAddress:
 *                             type: string
 *                             example: 12 Allen Avenue
 *                           rent:
 *                             type: number
 *                             example: 2500000
 *                           status:
 *                             type: string
 *                             example: available
 *                           category:
 *                             type: string
 *                             example: apartment
 *                       landLordId:
 *                         type: object
 *                         description: The landlord the request was sent to
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6ab0f2ffa675b9e38dc41623
 *                           fullName:
 *                             type: string
 *                             example: Michael Okafor
 *                           email:
 *                             type: string
 *                             example: michael.okafor@example.com
 *                           phoneNumber:
 *                             type: string
 *                             example: "08098765432"
 *                       inspectorId:
 *                         type: string
 *                         example: 6ab5f7a8a675b9e38dc41b00
 *                       preferredDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-20T10:00:00.000Z
 *                       preferredTime:
 *                         type: string
 *                         example: "10:00 AM"
 *                       message:
 *                         type: string
 *                         example: I would like to see the apartment on a weekday morning
 *                       status:
 *                         type: string
 *                         example: pending
 *                       declineReason:
 *                         type: string
 *                         example: The property is no longer available on that date
 *                         description: Only present when the status is declined
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid status filter
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/inspectorsRequests', authenticate, getInspectorsRequests);

/**
 * @swagger
 * /api/v1/inspection/singleInspectorRequest/{inspectionId}:
 *   get:
 *     tags:
 *       - Inspection
 *     summary: Get a single inspection request made by the logged-in user
 *     description: Returns one inspection request by its id, including the details of the property and the contact details of the landlord it was sent to. Only the user who made the request can retrieve it. If the request does not exist or was made by another user, a 404 is returned.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inspectionId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab4e6f7a675b9e38dc41a00
 *         description: The id of the inspection request to retrieve
 *     responses:
 *       200:
 *         description: Inspection retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inspection retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab4e6f7a675b9e38dc41a00
 *                     propertyId:
 *                       type: object
 *                       description: Details of the property to be inspected
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6ab2c4d5a675b9e38dc41800
 *                         title:
 *                           type: string
 *                           example: 3 Bedroom Flat in Ikeja
 *                         description:
 *                           type: string
 *                           example: Spacious flat with parking and 24-hour power
 *                         state:
 *                           type: string
 *                           example: Lagos
 *                         city:
 *                           type: string
 *                           example: Ikeja
 *                         streetAddress:
 *                           type: string
 *                           example: 12 Allen Avenue
 *                         rent:
 *                           type: number
 *                           example: 2500000
 *                         status:
 *                           type: string
 *                           example: available
 *                         category:
 *                           type: string
 *                           example: apartment
 *                     landLordId:
 *                       type: object
 *                       description: The landlord the request was sent to
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6ab0f2ffa675b9e38dc41623
 *                         fullName:
 *                           type: string
 *                           example: Michael Okafor
 *                         email:
 *                           type: string
 *                           example: michael.okafor@example.com
 *                         phoneNumber:
 *                           type: string
 *                           example: "08098765432"
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
 *                     declineReason:
 *                       type: string
 *                       example: The property is no longer available on that date
 *                       description: Only present when the status is declined
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-10T09:30:00.000Z
 *       400:
 *         description: Invalid inspection ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: Inspection request not found, or it was made by another user
 *       500:
 *         description: Internal server error
 */

router.get('/singleInspectorRequest/:inspectionId', authenticate, getInspectorsInspection);


module.exports = router;