const express = require('express');
const upload = require('../middleware/multer');
const { authenticate } = require('../middleware/auth');
const { artisanKyc, getArtisanKyc } = require('../controller/artisanKyc');
const { myServices, createserviceApplication, getArtisanApplications, getArtisanInspection, updateApplicationStatus, getUsersRequests, getUsersApplication } = require('../controller/jobservice');
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

/**
 * @swagger
 * /api/v1/artisan/myservices:
 *   post:
 *     tags:
 *       - Artisan Service
 *     summary: Upload a service
 *     description: Creates a service listing for the authenticated artisan. The user must be an artisan with a verified KYC before uploading a service. At least one photo of their work is required, and up to five photos and one optional video can be uploaded to Cloudinary. The artisan is taken from the access token, not from the request body.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - service
 *               - engagement
 *               - description
 *               - area
 *               - cityState
 *               - rate
 *               - rateType
 *               - whatsIncluded
 *               - photos
 *             properties:
 *               service:
 *                 type: string
 *                 example: Residential plumbing
 *                 description: The name of the service offered
 *               engagement:
 *                 type: string
 *                 example: Full time
 *                 description: How the artisan prefers to be engaged
 *               description:
 *                 type: string
 *                 example: I install and repair pipes, taps and water heaters
 *                 description: A description of the service
 *               area:
 *                 type: string
 *                 example: Ikeja
 *                 description: The area the artisan serves
 *               cityState:
 *                 type: string
 *                 example: Ikeja, Lagos
 *                 description: The city and state the artisan serves
 *               rate:
 *                 type: number
 *                 example: 15000
 *                 description: The price for the service, must be greater than 0
 *               rateType:
 *                 type: string
 *                 enum: [hourly, daily, weekly, monthly, perJob, fixed]
 *                 example: daily
 *                 description: How the rate is charged. Not case-sensitive.
 *               whatsIncluded:
 *                 type: string
 *                 example: Materials, Transport, Cleanup
 *                 description: What the rate covers, as a comma-separated list or a JSON array
 *               photos:
 *                 type: array
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Pictures of the artisan's work (at least one, maximum five)
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Optional video of the artisan's work (one file)
 *     responses:
 *       201:
 *         description: Service uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Service uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab8c0d1a675b9e38dc41e00
 *                     artisanId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     category:
 *                       type: string
 *                       example: Plumber
 *                     service:
 *                       type: string
 *                       example: Residential plumbing
 *                     engagement:
 *                       type: string
 *                       example: Full time
 *                     description:
 *                       type: string
 *                       example: I install and repair pipes, taps and water heaters
 *                     area:
 *                       type: string
 *                       example: Ikeja
 *                     cityState:
 *                       type: string
 *                       example: Ikeja, Lagos
 *                     rate:
 *                       type: number
 *                       example: 15000
 *                     rateType:
 *                       type: string
 *                       example: daily
 *                     whatsIncluded:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [Materials, Transport, Cleanup]
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [https://res.cloudinary.com/demo/image/upload/Ridify/myService/work1.jpg]
 *                     video:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/video/upload/Ridify/myService/work.mp4
 *                       description: Only present when a video was uploaded
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: A required field is missing, rate is not a positive number, rate type is not allowed, or no photo was uploaded
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: Only artisans can upload a service, or KYC is not verified
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/myservices', authenticate, myServices)

/**
 * @swagger
 * /api/v1/artisan/createApplication/{artisanId}:
 *   post:
 *     tags:
 *       - Artisan Service
 *     summary: Request an artisan's service
 *     description: Sends a service request to the artisan in the URL on behalf of the authenticated user. The artisan must have an uploaded service, and the requester cannot be the artisan. The preferred date must be in the future. A user cannot have more than one open (pending or accepted) request for the same artisan. The requester is taken from the access token, not from the request body.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: artisanId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab0f2ffa675b9e38dc41623
 *         description: The user id of the artisan whose service is being requested
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
 *                 example: I need a leaking kitchen pipe fixed
 *                 description: Optional note to the artisan
 *     responses:
 *       201:
 *         description: Service request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Service request sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab9d1e2a675b9e38dc41f00
 *                     artisanId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     userId:
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
 *                       example: I need a leaking kitchen pipe fixed
 *                     status:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Invalid artisan ID, missing preferred date, date not valid or not in the future, or you cannot request your own service
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: User or service not found
 *       409:
 *         description: You already have an open request for this service
 *       500:
 *         description: Internal server error
 */

router.post('/createApplication/:artisanId', authenticate, createserviceApplication)

/**
 * @swagger
 * /api/v1/artisan/getArtisanApplications:
 *   get:
 *     tags:
 *       - Artisan Service
 *     summary: Get the service requests sent to the logged-in artisan
 *     description: Returns all service requests addressed to the authenticated artisan, newest first. Each request includes the contact details of the user who made it. Results can optionally be filtered by status. Only requests where the authenticated user is the artisan are returned. If there are none, an empty list is returned with a 200 status.
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
 *         description: Applications retrieved successfully. An empty list is returned when there are none.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Applications retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 2
 *                   description: Number of requests returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6ab9d1e2a675b9e38dc41f00
 *                       artisanId:
 *                         type: string
 *                         example: 6ab0f2ffa675b9e38dc41623
 *                       userId:
 *                         type: object
 *                         description: The user who made the request (populated)
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
 *                             example: "8012345678"
 *                       preferredDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-20T10:00:00.000Z
 *                       preferredTime:
 *                         type: string
 *                         example: "10:00 AM"
 *                       message:
 *                         type: string
 *                         example: I need a leaking kitchen pipe fixed
 *                       status:
 *                         type: string
 *                         example: pending
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Invalid status filter
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/getArtisanApplications', authenticate, getArtisanApplications)

/**
 * @swagger
 * /api/v1/artisan/getArtisanInspection/{applicationId}:
 *   get:
 *     tags:
 *       - Artisan Service
 *     summary: Get a single service request sent to the logged-in artisan
 *     description: Returns one service request by its id, including the contact details of the user who made it. Only the artisan the request is addressed to can retrieve it. If the request does not exist or was sent to another artisan, a 404 is returned.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab9d1e2a675b9e38dc41f00
 *         description: The id of the service request to retrieve
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab9d1e2a675b9e38dc41f00
 *                     artisanId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     userId:
 *                       type: object
 *                       description: The user who made the request (populated)
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
 *                           example: "8012345678"
 *                     preferredDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-20T10:00:00.000Z
 *                     preferredTime:
 *                       type: string
 *                       example: "10:00 AM"
 *                     message:
 *                       type: string
 *                       example: I need a leaking kitchen pipe fixed
 *                     status:
 *                       type: string
 *                       example: pending
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Invalid application ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: Application request not found, or it was sent to another artisan
 *       500:
 *         description: Internal server error
 */

router.get('/getArtisanInspection/:applicationId', authenticate, getArtisanInspection)

/**
 * @swagger
 * /api/v1/artisan/updateApplication/{applicationId}:
 *   patch:
 *     tags:
 *       - Artisan Service
 *     summary: Update the status of a service request
 *     description: Allows the artisan a service request is addressed to, to accept, decline, complete or cancel it. Only the artisan who owns the request can update it. Allowed changes are pending to accepted, declined or cancelled, and accepted to completed or cancelled. Declined, completed and cancelled requests cannot be changed again. A decline reason is required when declining.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab9d1e2a675b9e38dc41f00
 *         description: The id of the service request to update
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
 *                 description: The new status of the service request
 *               declineReason:
 *                 type: string
 *                 maxLength: 500
 *                 example: I am fully booked on that date
 *                 description: Required when status is declined, ignored otherwise
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab9d1e2a675b9e38dc41f00
 *                     artisanId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     userId:
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
 *                       example: I need a leaking kitchen pipe fixed
 *                     status:
 *                       type: string
 *                       example: declined
 *                     declineReason:
 *                       type: string
 *                       example: I am fully booked on that date
 *       400:
 *         description: Invalid application ID, invalid status, or decline reason missing when declining
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: You are not authorized to update this application
 *       404:
 *         description: Application not found
 *       409:
 *         description: The application cannot move from its current status to the requested one
 *       500:
 *         description: Internal server error
 */

router.patch('/updateApplication/:applicationId', authenticate, updateApplicationStatus)

/**
 * @swagger
 * /api/v1/artisan/getUsersRequests:
 *   get:
 *     tags:
 *       - Artisan Service
 *     summary: Get my service requests
 *     description: Retrieves all service requests made by the authenticated user, sorted by newest first, with the total count. Results can optionally be filtered by status. If the user has no matching requests, an empty list is returned with a count of 0.
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
 *         description: Optional. Returns only requests with this status. The value is not case-sensitive.
 *     responses:
 *       200:
 *         description: Requests retrieved successfully, or no requests to display
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
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6ab9d1e2a675b9e38dc41f00
 *                       artisanId:
 *                         type: string
 *                         example: 6ab0f2ffa675b9e38dc41623
 *                       userId:
 *                         type: object
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
 *                             example: "8012345678"
 *                       preferredDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-20T10:00:00.000Z
 *                       preferredTime:
 *                         type: string
 *                         example: "10:00 AM"
 *                       message:
 *                         type: string
 *                         example: I need a leaking kitchen pipe fixed
 *                       status:
 *                         type: string
 *                         example: pending
 *                       declineReason:
 *                         type: string
 *                         example: I am fully booked on that date
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Status is not one of pending, accepted, declined, completed or cancelled
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/getUsersRequests', authenticate, getUsersRequests)

/**
 * @swagger
 * /api/v1/artisan/getUserApplication/{applicationId}:
 *   get:
 *     tags:
 *       - Artisan Service
 *     summary: Get one of my service requests
 *     description: Retrieves the full details of a single service request made by the authenticated user, including the artisan it was sent to and the requesting user's contact details. Users can only view their own requests.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab9d1e2a675b9e38dc41f00
 *         description: The id of the service request to retrieve
 *     responses:
 *       200:
 *         description: Application request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application request retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab9d1e2a675b9e38dc41f00
 *                     artisanId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6ab0f2ffa675b9e38dc41623
 *                         fullLegalName:
 *                           type: string
 *                           example: John Okafor
 *                         PhoneNumber:
 *                           type: string
 *                           example: "8023456789"
 *                         email:
 *                           type: string
 *                           example: john.okafor@example.com
 *                         cityOrLocation:
 *                           type: string
 *                           example: Ikeja
 *                         primaryTrade:
 *                           type: string
 *                           example: plumber
 *                         yearsOfExperience:
 *                           type: integer
 *                           example: 6
 *                     userId:
 *                       type: object
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
 *                           example: "8012345678"
 *                     preferredDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-20T10:00:00.000Z
 *                     preferredTime:
 *                       type: string
 *                       example: "10:00 AM"
 *                     message:
 *                       type: string
 *                       example: I need a leaking kitchen pipe fixed
 *                     status:
 *                       type: string
 *                       example: pending
 *                     declineReason:
 *                       type: string
 *                       example: I am fully booked on that date
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Invalid application ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: Application request not found
 *       500:
 *         description: Internal server error
 */

router.get('/getUserApplication/:applicationId', authenticate, getUsersApplication)

module.exports = router;