const mongoose = require('mongoose');
const notificationModel = require('../model/notification')

exports.getNotifications = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated', statusCode: 401 });
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;

        const filter = { recipient: id };

        const [notifications, total] = await Promise.all([
            notificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            notificationModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            message: notifications.length === 0
                ? 'No notifications to display'
                : 'Notifications retrieved successfully',
            count: notifications.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: notifications
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated', statusCode: 401 });
        }

        const { notificationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return next({ message: 'Invalid notification ID', statusCode: 400 });
        }

        const notification = await notificationModel
            .findOneAndUpdate(
                { _id: notificationId, recipient: id },
                { isRead: true },
                { new: true }
            )
            .lean();

        if (!notification) {
            return next({ message: 'Notification not found', statusCode: 404 });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.countNotification = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated', statusCode: 401 });
        }

        const count = await notificationModel.countDocuments({
            recipient: id,
            isRead: false
        });

        return res.status(200).json({
            success: true,
            message: 'Unread notifications count retrieved successfully',
            count
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!mongoose.Types.ObjectId.isValidObjectId(id)) {
            return next({ 
                message: 'User not authenticated', 
                statusCode: 401 });
        }
        await notificationModel.findByIdAndDelete(id);
    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}