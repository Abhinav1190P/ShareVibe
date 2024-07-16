const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const routes = require("../routes");
const { globalError, notFoundError } = require("./error");
const middlewares = require("./middleware");
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const admin = require('firebase-admin')
const cron = require('node-cron');
const ChatRoom = require('../models/ChatRoom');
const ScheduledMessage = require('../models/ScheduleMessages');
const Reminder = require('../models/Reminders')
dotenv.config();
const Fcm = require('../models/Fcm')
const app = express();

const serviceAccount = require('../sharevib-otp-firebase-adminsdk-2pd2m-fed2424698.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
const messaging = admin.messaging();


const nocache = (_, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

const generateRTCToken = (req, resp) => {
  resp.header('Access-Control-Allow-Origin', '*');
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ 'error': 'channel is required' });
  }
  let uid = req.params.uid;
  if (!uid || uid === '') {
    return resp.status(500).json({ 'error': 'uid is required' });
  }

  let role;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === 'audience') {
    role = RtcRole.SUBSCRIBER
  } else {
    return resp.status(500).json({ 'error': 'role is incorrect' });
  }
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  let token;
  if (req.params.tokentype === 'userAccount') {
    token = RtcTokenBuilder.buildTokenWithAccount(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  } else if (req.params.tokentype === 'uid') {
    token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  } else {
    return resp.status(500).json({ 'error': 'token type is invalid' });
  }
  return resp.json({ 'rtcToken': token });


};


app.use(middlewares);


app.use(express.static(path.join(__dirname, "..", "public")));


app.get("/", (_req, res) => {
  res.json({ message: "api running..." });
});

app.get('/rtc/:channel/:role/:tokentype/:uid', nocache, generateRTCToken)



app.use(routes);

app.use(notFoundError);
app.use(globalError);





async function processScheduledMessages() {
  const now = new Date();

  try {
    const scheduledMessages = await ScheduledMessage.find({
      scheduledAt: { $lte: now },
      status: 'pending'
    });

    for (const scheduledMessage of scheduledMessages) {
      try {
        const chatRoom = await ChatRoom.findOne({ roomCode: scheduledMessage.roomCode });
        if (chatRoom) {
          chatRoom.messages.push({
            sender: scheduledMessage.sender,
            content: scheduledMessage.content,
            media_url: scheduledMessage.media_url,
            user_profile: scheduledMessage.user_profile,
            createdAt: scheduledMessage.scheduledAt
          });
          await chatRoom.save();
          console.log(`Message from ${scheduledMessage.sender} saved to chat room ${scheduledMessage.roomCode}`);
        } else {
          console.log(`Chat room with code ${scheduledMessage.roomCode} not found`);
        }
        scheduledMessage.status = 'sent';
        await scheduledMessage.save();
        console.log(`Scheduled message ${scheduledMessage._id} status updated to 'sent'`);
      } catch (error) {
        console.log(`Error processing message ${scheduledMessage._id}:`, error);
      }
    }
  } catch (error) {
    console.log('Error fetching scheduled messages:', error);
  }
}


cron.schedule('*/5 * * * * *', processScheduledMessages);


cron.schedule('*/5 * * * * *', async () => {
  try {
    const currentDateTime = new Date();
    const reminders = await Reminder.find({ reminderTime: { $lte: currentDateTime } });

    for (const reminder of reminders) {
      const fcmRecord = await Fcm.findOne({ userId: reminder.userId });

      if (fcmRecord && fcmRecord.token) {
        const message = {
          token: fcmRecord.token,
          notification: {
            title: 'Reminder',
            body: `Reminder for event: ${reminder.title}`,
          },
        };

        try {
          const response = await messaging.send(message);
          console.log('Notification sent:', response);
          await Reminder.deleteOne({ _id: reminder._id });
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      } else {
        console.error(`FCM token not found for userId: ${reminder.userId}`);
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

module.exports = app;