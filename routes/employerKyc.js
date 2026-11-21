const express = require('express');
const upload = require('../middleware/multer');
const { authenticate } = require('../middleware/auth');
const { employerKyc, getEmployerKyc, postJob, getAllJobs, changeStatus, getJob, deleteJob, applyJob, getJobsByApplicant, getJobsByJobId, getSingleApplication } = require('../controller/employerKyc');
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
 *       - Employer/Hr Kyc
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

/**
 * @swagger
 * /api/v1/hr/postJob:
 *   post:
 *     tags:
 *       - Job
 *     summary: Post a new job
 *     description: Creates a job posting on behalf of the authenticated user. Only users with the hr, employer or jobagent role can post jobs. All fields are required. The poster is taken from the access token, not from the request body.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobTitle
 *               - aboutJob
 *               - description
 *               - qualification
 *               - experience
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 example: Senior Electrician
 *                 description: The title of the job
 *               aboutJob:
 *                 type: string
 *                 example: We are hiring an electrician for residential and commercial projects in Lagos
 *                 description: A short summary of the job
 *               description:
 *                 type: string
 *                 example: Install, maintain and repair electrical systems, read blueprints, and follow safety standards
 *                 description: The full job description and responsibilities
 *               qualification:
 *                 type: string
 *                 example: National Diploma in Electrical Engineering or a trade certificate
 *                 description: The qualifications required for the job
 *               experience:
 *                 type: string
 *                 example: 3 to 5 years
 *                 description: The experience required for the job
 *     responses:
 *       201:
 *         description: Job posted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job posted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab6a8b9a675b9e38dc41c00
 *                     posterId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     jobTitle:
 *                       type: string
 *                       example: Senior Electrician
 *                     aboutJob:
 *                       type: string
 *                       example: We are hiring an electrician for residential and commercial projects in Lagos
 *                     description:
 *                       type: string
 *                       example: Install, maintain and repair electrical systems, read blueprints, and follow safety standards
 *                     qualification:
 *                       type: string
 *                       example: National Diploma in Electrical Engineering or a trade certificate
 *                     experience:
 *                       type: string
 *                       example: 3 to 5 years
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: One or more required fields are missing
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       403:
 *         description: Only hr, employer or jobagent users can post jobs
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/postJob', authenticate, postJob);

/**
 * @swagger
 * /api/v1/hr/allJobs:
 *   get:
 *     tags:
 *       - Job
 *     summary: Get all jobs posted by the logged-in user
 *     description: Returns every job posting created by the authenticated user, newest first. Only jobs where the authenticated user is the poster are returned. If the user has not posted any jobs, an empty list is returned with a 200 status.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully. An empty list is returned when the user has not posted any jobs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jobs retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 2
 *                   description: Number of jobs returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6ab6a8b9a675b9e38dc41c00
 *                       posterId:
 *                         type: string
 *                         example: 6ab0f2ffa675b9e38dc41623
 *                       jobTitle:
 *                         type: string
 *                         example: Senior Electrician
 *                       aboutJob:
 *                         type: string
 *                         example: We are hiring an electrician for residential and commercial projects in Lagos
 *                       description:
 *                         type: string
 *                         example: Install, maintain and repair electrical systems, read blueprints, and follow safety standards
 *                       qualification:
 *                         type: string
 *                         example: National Diploma in Electrical Engineering or a trade certificate
 *                       experience:
 *                         type: string
 *                         example: 3 to 5 years
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-15T09:30:00.000Z
 *       401:
 *         description: Invalid user ID, or token is missing, invalid or expired
 *       500:
 *         description: Internal server error
 */

router.get('/allJobs', authenticate, getAllJobs);

/**
 * @swagger
 * /api/v1/job/oneJob/{jobId}:
 *   get:
 *     tags:
 *       - Job
 *     summary: Get a single job posted by the logged-in user
 *     description: Returns one job posting by its id. Only the user who posted the job can retrieve it. If the job does not exist or was posted by another user, a 404 is returned.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab6a8b9a675b9e38dc41c00
 *         description: The id of the job to retrieve
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab6a8b9a675b9e38dc41c00
 *                     posterId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     jobTitle:
 *                       type: string
 *                       example: Senior Electrician
 *                     aboutJob:
 *                       type: string
 *                       example: We are hiring an electrician for residential and commercial projects in Lagos
 *                     description:
 *                       type: string
 *                       example: Install, maintain and repair electrical systems, read blueprints, and follow safety standards
 *                     qualification:
 *                       type: string
 *                       example: National Diploma in Electrical Engineering or a trade certificate
 *                     experience:
 *                       type: string
 *                       example: 3 to 5 years
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Invalid job ID
 *       401:
 *         description: Invalid user ID, or token is missing, invalid or expired
 *       404:
 *         description: Job not found, or it was posted by another user
 *       500:
 *         description: Internal server error
 */

router.get('/oneJob/:jobId', authenticate, getJob);

/**
 * @swagger
 * /api/v1/hr/changeStatus/{jobId}:
 *   patch:
 *     tags:
 *       - Job
 *     summary: Change the status of a job
 *     description: Updates the status of a job posting. Only the user who posted the job can change its status. If the job does not exist or was posted by another user, a 404 is returned. The status is not case-sensitive.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab6a8b9a675b9e38dc41c00
 *         description: The id of the job to update
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
 *                 enum: [open, closed, paused]
 *                 example: closed
 *                 description: The new status of the job
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab6a8b9a675b9e38dc41c00
 *                     posterId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     jobTitle:
 *                       type: string
 *                       example: Senior Electrician
 *                     status:
 *                       type: string
 *                       example: closed
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Invalid job ID, or status is missing or not one of the allowed values
 *       401:
 *         description: Invalid user ID, or token is missing, invalid or expired
 *       404:
 *         description: Job not found, or it was posted by another user
 *       500:
 *         description: Internal server error
 */

router.patch('/changeStatus/:jobId', authenticate, changeStatus);

/**
 * @swagger
 * /api/v1/hr/deleteJob/{jobId}:
 *   delete:
 *     tags:
 *       - Job
 *     summary: Delete a job
 *     description: Permanently deletes a job posting. Only the user who posted the job can delete it. If the job does not exist or was posted by another user, a 404 is returned. The deleted job's id, poster id and title are returned.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab6a8b9a675b9e38dc41c00
 *         description: The id of the job to delete
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab6a8b9a675b9e38dc41c00
 *                     posterId:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     jobTitle:
 *                       type: string
 *                       example: Senior Electrician
 *       400:
 *         description: Invalid job ID
 *       401:
 *         description: Invalid user ID, or token is missing, invalid or expired
 *       404:
 *         description: Job not found, or it was posted by another user
 *       500:
 *         description: Internal server error
 */

router.delete('/deleteJob/:jobId', authenticate, deleteJob);

/**
 * @swagger
 * /api/v1/hr/applyJob/{jobId}:
 *   post:
 *     tags:
 *       - Job
 *     summary: Apply for a job
 *     description: Submits a job application for the job in the URL on behalf of the authenticated user. The job must exist and must not belong to the applicant. A CV and a cover letter are both required and are uploaded to Cloudinary. A user cannot apply to the same job more than once. The applicant is taken from the access token, not from the request body.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab6a8b9a675b9e38dc41c00
 *         description: The id of the job to apply for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - cv
 *               - coverLetter
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: Jane Doe
 *                 description: The applicant's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *                 description: A valid email address the employer can reach the applicant on
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: I have five years of experience in residential electrical work
 *                 description: Optional note to the employer
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: The applicant's CV (one file)
 *               coverLetter:
 *                 type: string
 *                 format: binary
 *                 description: The applicant's cover letter (one file)
 *     responses:
 *       201:
 *         description: Job applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job applied successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6ab7b9c0a675b9e38dc41d00
 *                     applicantId:
 *                       type: string
 *                       example: 6ab5f7a8a675b9e38dc41b00
 *                     jobId:
 *                       type: string
 *                       example: 6ab6a8b9a675b9e38dc41c00
 *                     fullname:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com
 *                     description:
 *                       type: string
 *                       example: I have five years of experience in residential electrical work
 *                     cv:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/applyJob/cv.pdf
 *                     coverLetter:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/applyJob/cover-letter.pdf
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Invalid job ID, missing fullname or email, invalid email, missing CV or cover letter, or you cannot apply to your own job
 *       401:
 *         description: Invalid user ID, or token is missing, invalid or expired
 *       404:
 *         description: Job not found
 *       409:
 *         description: You have already applied for this job
 *       500:
 *         description: Internal server error
 */
router.post(
    '/applyJob/:jobId',
    authenticate,
    upload.fields([
        { name: 'cv', maxCount: 1 },
        { name: 'coverLetter', maxCount: 1 }
    ]),
    applyJob
);

/**
 * @swagger
 * /api/v1/hr/allJobsByApplicant:
 *   get:
 *     tags:
 *       - Job
 *     summary: Get all job applications made by the logged-in user
 *     description: Returns every job application the authenticated user has submitted, newest first. Each application includes a summary of the job it was made for. Only applications made by the authenticated user are returned. If the user has not applied for any jobs, an empty list is returned with a 200 status.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully. An empty list is returned when the user has not applied for any jobs.
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
 *                   description: Number of applications returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6ab7b9c0a675b9e38dc41d00
 *                       applicantId:
 *                         type: string
 *                         example: 6ab5f7a8a675b9e38dc41b00
 *                       jobId:
 *                         type: object
 *                         description: Summary of the job that was applied for
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6ab6a8b9a675b9e38dc41c00
 *                           jobTitle:
 *                             type: string
 *                             example: Senior Electrician
 *                           aboutJob:
 *                             type: string
 *                             example: We are hiring an electrician for residential and commercial projects in Lagos
 *                           qualification:
 *                             type: string
 *                             example: National Diploma in Electrical Engineering or a trade certificate
 *                           experience:
 *                             type: string
 *                             example: 3 to 5 years
 *                           status:
 *                             type: string
 *                             example: open
 *                       fullname:
 *                         type: string
 *                         example: Jane Doe
 *                       email:
 *                         type: string
 *                         example: jane.doe@example.com
 *                       description:
 *                         type: string
 *                         example: I have five years of experience in residential electrical work
 *                       cv:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/Ridify/applyJob/cv.pdf
 *                       coverLetter:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/Ridify/applyJob/cover-letter.pdf
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-15T09:30:00.000Z
 *       401:
 *         description: User not authenticated or token is missing, invalid or expired
 *       500:
 *         description: Internal server error
 */

router.get('/allJobsByApplicant', authenticate, getJobsByApplicant);

/**
 * @swagger
 * /api/v1/hr/getByJobId/{jobId}:
 *   get:
 *     tags:
 *       - Job
 *     summary: Get all applicants for a job
 *     description: Returns every application submitted for the job in the URL, newest first, including each applicant's contact details, CV and cover letter links. Only the user who posted the job can retrieve its applicants. If the job does not exist or was posted by another user, a 404 is returned. If nobody has applied, an empty list is returned with a 200 status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab6a8b9a675b9e38dc41c00
 *         description: The id of the job whose applicants should be returned
 *     responses:
 *       200:
 *         description: Applicants retrieved successfully. An empty list is returned when nobody has applied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Applicants retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 3
 *                   description: Number of applications returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6ab7b9c0a675b9e38dc41d00
 *                       applicantId:
 *                         type: string
 *                         example: 6ab5f7a8a675b9e38dc41b00
 *                       jobId:
 *                         type: string
 *                         example: 6ab6a8b9a675b9e38dc41c00
 *                       fullname:
 *                         type: string
 *                         example: Jane Doe
 *                       email:
 *                         type: string
 *                         example: jane.doe@example.com
 *                       description:
 *                         type: string
 *                         example: I have five years of experience in residential electrical work
 *                       cv:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/Ridify/applyJob/cv.pdf
 *                       coverLetter:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/Ridify/applyJob/cover-letter.pdf
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Invalid job ID
 *       401:
 *         description: User not authenticated or token is missing, invalid or expired
 *       404:
 *         description: Job not found, or it was posted by another user
 *       500:
 *         description: Internal server error
 */

router.get('/getByJobId/:jobId', authenticate, getJobsByJobId);

/**
 * @swagger
 * /api/v1/hr/singleApplication/{applicationId}:
 *   get:
 *     tags:
 *       - Job
 *     summary: Get a single job application
 *     description: Returns one job application by its id, including the applicant's contact details and the links to their CV and cover letter. Only the applicant who submitted it and the user who posted the job can retrieve it. If the application does not exist, or the authenticated user is neither the applicant nor the poster, a 404 is returned.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6ab7b9c0a675b9e38dc41d00
 *         description: The id of the application to retrieve
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
 *                       example: 6ab7b9c0a675b9e38dc41d00
 *                     applicantId:
 *                       type: string
 *                       example: 6ab5f7a8a675b9e38dc41b00
 *                     jobId:
 *                       type: string
 *                       example: 6ab6a8b9a675b9e38dc41c00
 *                     jobTitle:
 *                       type: string
 *                       nullable: true
 *                       example: Senior Electrician
 *                       description: Null if the job has since been deleted
 *                     fullname:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com
 *                     description:
 *                       type: string
 *                       example: I have five years of experience in residential electrical work
 *                     cv:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/applyJob/cv.pdf
 *                     coverLetter:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/Ridify/applyJob/cover-letter.pdf
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Invalid application ID
 *       401:
 *         description: User not authenticated or token is missing or invalid
 *       404:
 *         description: Application not found, or you are neither the applicant nor the poster of the job
 *       500:
 *         description: Internal server error
 */

router.get('/singleApplication/:applicationId', authenticate, getSingleApplication);

module.exports = router;