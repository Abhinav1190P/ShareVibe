const cron = require('node-cron');
const ChatRoom = require('./models/chatRoom');
const ScheduledMessage = require('../models/ScheduleMessages');


async function processScheduledMessages() {
    const now = new Date();
    const scheduledMessages = await ScheduledMessage.find({
        scheduledAt: { $lte: now }
    });

    console.log("HEY")
    for (const scheduledMessage of scheduledMessages) {
        const chatRoom = await ChatRoom.findById(scheduledMessage.roomId);
        if (chatRoom) {
            chatRoom.messages.push({
                sender: scheduledMessage.sender,
                content: scheduledMessage.content,
                media_url: scheduledMessage.media_url,
                user_profile: scheduledMessage.user_profile,
                createdAt: now
            });
            await chatRoom.save();
        }
        await scheduledMessage.remove();
    }
}


cron.schedule('*/5 * * * * *', processScheduledMessages);
