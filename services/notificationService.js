const notificationModel = require("../model/notification");
const { getIO } = require("../socket/socket");

const createNotification = async (data) => {
    try {
        let notifications;

        if (Array.isArray(data)) {
            notifications = await notificationModel.insertMany(data);
        } else {
            notifications = await notificationModel.create(data);
        }


        const io = getIO();


        const notificationList = Array.isArray(notifications)
            ? notifications
            : [notifications];


        notificationList.forEach((notification) => {
            io.to(notification.recipient.toString())
                .emit("notification", notification);
        });


        return notifications;

    } catch (error) {
        console.error("Notification creation failed:", error.message);
        throw error;
    }
};


module.exports = {
    createNotification
};