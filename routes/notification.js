const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getNotifications, markAsRead, countNotification } = require('../controller/notification');
const router = require('express').Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * /api/v1/notification:
 *   get:
 *     tags:
 *       - Notification
 *     summary: Get the logged-in user's notifications
 *     description: Returns a paginated list of the notifications addressed to the authenticated user, newest first. Only notifications where the authenticated user is the recipient are returned. If the user has no notifications, an empty list is returned with a 200 status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *           example: 20
 *         description: Number of notifications per page (maximum 50)
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully. An empty list is returned when there are none.
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
 *                   example: Notifications retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 20
 *                   description: Number of notifications on this page
 *                 total:
 *                   type: integer
 *                   example: 45
 *                   description: Total number of notifications for this user
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6aba1b2ca675b9e38dc42000
 *                       recipient:
 *                         type: string
 *                         example: 6ab5f7a8a675b9e38dc41b00
 *                       sender:
 *                         type: string
 *                         example: 6ab0f2ffa675b9e38dc41623
 *                       title:
 *                         type: string
 *                         example: New Job Alert
 *                       message:
 *                         type: string
 *                         example: Acme Industries posted a new job, Senior Electrician
 *                       type:
 *                         type: string
 *                         example: job
 *                       idType:
 *                         type: string
 *                         example: jobId
 *                         description: Tells the app which kind of record the id field points to
 *                       id:
 *                         type: string
 *                         example: 6ab6a8b9a675b9e38dc41c00
 *                         description: The id of the job, inspection or other record the notification is about
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-11-15T09:30:00.000Z
 *       401:
 *         description: User not authenticated or token is missing, invalid or expired
 *       500:
 *         description: Internal server error
 */

router.get('/', authenticate, getNotifications)

/**
 * @swagger
 * /api/v1/notification/{notificationId}:
 *   patch:
 *     tags:
 *       - Notification
 *     summary: Mark a notification as read
 *     description: Marks one notification as read. Only the user the notification is addressed to can update it. If the notification does not exist or belongs to another user, a 404 is returned.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6aba1b2ca675b9e38dc42000
 *         description: The id of the notification to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read
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
 *                   example: Notification marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6aba1b2ca675b9e38dc42000
 *                     recipient:
 *                       type: string
 *                       example: 6ab5f7a8a675b9e38dc41b00
 *                     sender:
 *                       type: string
 *                       example: 6ab0f2ffa675b9e38dc41623
 *                     title:
 *                       type: string
 *                       example: New Job Alert
 *                     message:
 *                       type: string
 *                       example: Acme Industries posted a new job, Senior Electrician
 *                     type:
 *                       type: string
 *                       example: job
 *                     idType:
 *                       type: string
 *                       example: jobId
 *                     id:
 *                       type: string
 *                       example: 6ab6a8b9a675b9e38dc41c00
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-11-15T09:30:00.000Z
 *       400:
 *         description: Invalid notification ID
 *       401:
 *         description: User not authenticated or token is missing, invalid or expired
 *       404:
 *         description: Notification not found, or it belongs to another user
 *       500:
 *         description: Internal server error
 */

router.patch('/:notificationId', authenticate, markAsRead)

/**
 * @swagger
 * /api/v1/notification/count:
 *   get:
 *     tags:
 *       - Notification
 *     summary: Get the number of unread notifications
 *     description: Returns how many unread notifications are addressed to the authenticated user. Only notifications where the authenticated user is the recipient are counted. If there are none, the count is 0. This is useful for showing a badge on a notification icon.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notifications count retrieved successfully
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
 *                   example: Unread notifications count retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 5
 *                   description: Number of unread notifications
 *       401:
 *         description: User not authenticated or token is missing, invalid or expired
 *       500:
 *         description: Internal server error
 */

router.get('/count', authenticate, countNotification)

module.exports = router