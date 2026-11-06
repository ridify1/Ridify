const crypto = require('crypto');
const propertyViewModel = require('../model/propertyView');
const propertyModel = require('../model/propertyUpload');

const recordView = async (property, req) => {
    const userId = req.user?.id;

    if (userId && String(property.agent) === String(userId)) return;

    const viewer = userId
        ? `u_${userId}`
        : `g_${crypto
            .createHash('sha256')
            .update(`${req.ip}${req.headers['user-agent'] || ''}`)
            .digest('hex')
            .slice(0, 32)}`;

    try {
        const result = await propertyViewModel.updateOne(
            { property: property._id, viewer },
            {
                $setOnInsert: {
                    agent: property.agent,
                    viewerType: userId ? 'user' : 'guest'
                },
                $inc: { viewCount: 1 },
                $set: { lastViewedAt: new Date() }
            },
            { upsert: true }
        );

        const isNewViewer = result.upsertedCount > 0;

        await propertyModel.updateOne(
            { _id: property._id },
            { $inc: { totalViews: 1, ...(isNewViewer && { uniqueViews: 1 }) } }
        );
    } catch (error) {
        if (error.code !== 11000) console.error('View tracking failed:', error.message);
    }
};

module.exports = recordView;