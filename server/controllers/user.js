
const Auth = require("../models/Auth");
const Liked = require("../models/Liked")
const Save = require("../models/Saved")
const Post = require("../models/Post")
const Request = require("../models/Request")
const Group = require("../models/Group")
const ChatRoom = require("../models/ChatRoom")
const Announcement = require("../models/Announcement")
const Event = require('../models/Events');
const ScheduledMessage = require('../models/ScheduleMessages')
const Reminder = require('../models/Reminders')
const FcmToken = require('../models/Fcm')
const axios = require('axios')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const path = require('path')
const fs = require('fs')
const crypto = require('crypto');

const FormData = require('form-data')
const profile = async (req, res, next) => {
  try {
    const user = req.user;

    const data = await Auth.findOne({ userName: user.userName }).select(
      'name email userName profile_photo phoneNumber createdAt phoneNumberVerified'
    );

    const year = new Date(data.createdAt).getFullYear();

    data.createdAt = year;

    return res.json(data);
  } catch (error) {
    next(error);
  }
};

const GetUserInfoByUsername = async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await Auth.findOne({ userName: username })

    const userId = user._id
    const userPosts = await Post.find({ post_user_id: userId });

    let likeCount = 0;
    for (const post of userPosts) {
      for (const like of post.likes) {
        if (like !== userId) {
          likeCount++;
        }
      }
    }

    const savedCount = await Save.countDocuments({ post_user_id: userId });
    const postCount = userPosts.length;

    const allFilesAndFolders = userPosts.reduce((acc, post) => acc.concat(post.post_files_n_folders), []);

    return res.status(200).json({
      success: true,
      likeCount,
      savedCount,
      postCount,
      info: {
        name: user.name,
        userName: user.userName,
        profile_photo: user.profile_photo
      },
      post_files_n_folders: allFilesAndFolders
    });
  } catch (error) {
    next(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const GetUserInfo = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const userPosts = await Post.find({ post_user_id: userId });

    let likeCount = 0;
    for (const post of userPosts) {
      for (const like of post.likes) {
        if (like !== userId) {
          likeCount++;
        }
      }
    }

    const savedCount = await Save.countDocuments({ post_user_id: userId });
    const postCount = userPosts.length;

    const allFilesAndFolders = userPosts.reduce((acc, post) => acc.concat(post.post_files_n_folders), []);

    return res.status(200).json({
      success: true,
      likeCount,
      savedCount,
      postCount,
      post_files_n_folders: allFilesAndFolders
    });
  } catch (error) {
    next(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const GetUserInfoUsername = async (req, res, next) => {
  const username = req.params.username;
  try {
    const data = await Auth.findOne({ userName: username }).select('private name _id profile_photo');
    const requests = await Request.find({
      $or: [
        { from: req.user.userId, to: data._id },
        { from: data._id, to: req.user.userId }
      ]
    }).select('status');


    let currentStatus = 'start';
    if (requests.length > 0) {
      for (const request of requests) {
        if (request.status === 'pending' || request.status === 'accepted') {
          currentStatus = request.status;
          break;
        }
      }
    }
    if (currentStatus === 'pending' || currentStatus == 'start') {
      return res.status(200).json({
        username,
        name: data.name,
        success: false,
        message: 'Account is private',
        private: data.private,
        requestStatus: currentStatus,
        profile_photo: data.profile_photo,
        id: data._id
      });
    } else {
      const user = await Auth.findOne({ userName: username })
      const userId = user._id
      const userPosts = await Post.find({ post_user_id: userId });

      let likeCount = 0;
      for (const post of userPosts) {
        for (const like of post.likes) {
          if (like !== userId) {
            likeCount++;
          }
        }
      }

      const savedCount = await Save.countDocuments({ post_user_id: userId });
      const postCount = userPosts.length;

      const allFilesAndFolders = userPosts.reduce((acc, post) => acc.concat(post.post_files_n_folders), []);

      return res.status(200).json({
        success: true,
        likeCount,
        savedCount,
        postCount,
        info: {
          name: user.name,
          userName: user.userName,
          profile_photo: user.profile_photo
        },
        post_files_n_folders: allFilesAndFolders
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




const SearchUserByKeyword = async (req, res, next) => {

  const keyword = req.params.keyword;
  try {
    const users = await Auth.find({
      userName: { $regex: keyword, $options: 'i' },
      _id: { $ne: req.user.userId }
    });


    return res.json({ users });
  } catch (error) {
    next(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const SendFriendRequest = async (req, res, next) => {
  const { from, to } = req.body;

  try {
    let ifExist = await Request.findOne({ from, to });
    if (ifExist) {
      if (ifExist.status === "start") {
        ifExist.status = "pending";
        await ifExist.save();
      }
      return res.status(200).json({
        success: false,
        message: "Friend request is already sent",
        requestStatus: ifExist.status,
      });
    }

    let oppositeRequest = await Request.findOne({ from: to, to: from });
    if (oppositeRequest) {
      return res.status(200).json({
        success: false,
        message: "Friend request is already received",
        requestStatus: oppositeRequest.status,
      });
    }

    const newRequest = await Request.create({ from, to, status: "pending" });
    if (newRequest) {
      return res.status(200).json({
        success: true,
        message: "Friend request sent!",
        requestStatus: newRequest.status
      });
    }
    return res.status(400).json({ success: false, message: "Something went wrong" });
  } catch (error) {
    next(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


const GetFriendRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ to: req.user.userId, status: 'pending' })

    if (requests.length > 0) {
      const populatedRequests = await Promise.all(requests.map(async request => {
        const userId = request.from;
        const userDetails = await Auth.findById(userId);

        const userInfo = {
          userId: userDetails._id,
          userName: userDetails.userName,
          profile_photo: userDetails.profile_photo
        };

        return {
          ...request.toObject(),
          from: userInfo
        };
      }));

      return res.status(200).json({
        success: true,
        requests: populatedRequests
      });
    }
  } catch (error) {
    next(error)
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const AcceptFriendRequest = async (req, res, next) => {
  const { ofUser } = req.body;

  try {
    const generateRoomCode = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let roomCode = '';
      for (let i = 0; i < 8; i++) {
        roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return roomCode;
    };

    const room = generateRoomCode();

    const updatedRequest = await Request.findOneAndUpdate(
      { from: ofUser, to: req?.user?.userId, status: "pending" },
      { status: "accepted", roomCode: room },
      { new: true }
    );

    if (updatedRequest) {

      let chatRoom = await ChatRoom.findOne({ roomCode: room });


      if (!chatRoom) {
        chatRoom = await ChatRoom.create({
          roomCode: room,
          participants: [ofUser, req.user.userId],
          messages: []
        });
      }

      return res.status(200).json({ status: true, message: 'Accepted friend request' });
    }

  } catch (error) {
    console.error("Error accepting friend request:", error);
    next(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const GetUsersAccepted = async (req, res, next) => {
  const keyword = req.params.keyword;
  try {
    const requests = await Request.find({
      $and: [
        {
          $or: [
            { from: req.user.userId },
            { to: req.user.userId }
          ]
        },
        { status: 'accepted' }
      ]
    });
    if (requests.length > 0) {
      const populatedRequests = await Promise.all(requests.map(async request => {
        const userId = request.from;
        const userDetails = await Auth.findById(userId);

        const userInfo = {
          userId: userDetails._id,
          userName: userDetails.userName,
        };

        return {
          ...request.toObject(),
          from: userInfo
        };
      }));

      return res.status(200).json({
        success: true,
        requests: populatedRequests
      });


    }
  } catch (error) {
    next(error)
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


const GetMyFriends = async (req, res, next) => {
  try {
    const myFriendsFrom = await Request.find({
      from: req.user.userId,
      status: 'accepted'
    }).select('to roomCode');

    const myFriendsTo = await Request.find({
      to: req.user.userId,
      status: 'accepted'
    }).select('from roomCode');

    const fromUserIds = myFriendsFrom.map(friend => ({ userId: friend.to, roomCode: friend.roomCode }));
    const toUserIds = myFriendsTo.map(friend => ({ userId: friend.from, roomCode: friend.roomCode }));

    const allUserIds = [...fromUserIds, ...toUserIds];

    const uniqueUserIds = Array.from(new Set(allUserIds.map(user => user.userId)));

    const users = await Auth.find({ _id: { $in: uniqueUserIds } }).select('userName profile_photo');

    const friendsWithRoomCode = users.map(user => ({
      _id: user._id,
      userName: user.userName,
      profile_photo: user.profile_photo,
      roomCode: allUserIds.find(u => u.userId.toString() === user._id.toString())?.roomCode
    }));

    return res.status(200).json({ success: true, users: friendsWithRoomCode });
  } catch (error) {
    next(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const CreateGroup = async (req, res, next) => {
  const { name, participants, admin } = req.body

  const generateRoomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomCode = '';
    for (let i = 0; i < 8; i++) {
      roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomCode;
  };

  const room = generateRoomCode();

  try {

    const newGroup = await Group.create({
      name, participants, admin, room: room,
    })
    if (newGroup) {
      return res.status(200).json({
        success: true,
        newGroup: newGroup,
        message: 'Group has been created'
      })
    }
    return res.status(400).json({
      success: false,
      message: "Something went wrong!"
    })
  } catch (error) {
    next(error);
    console.log(error)
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


const GetMygroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ 'participants.userId': req.user.userId });

    const result = [];

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      let latestMessage;

      const sortedMessages = group.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (sortedMessages.length > 0) {
        latestMessage = sortedMessages[0];
      }

      result.push({
        ...group.toObject(),
        latestMessage,
        messages: i === 0 ? group.messages : undefined
      });
    }


    return res.status(200).json({ success: true, groups: result });
  } catch (error) {
    next(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const GetGroupMessages = async (req, res, next) => {
  const groupid = req.params.groupid;
  try {
    const group = await Group.findById(groupid).select('messages');

    let messages = [];
    if (group && group.messages && group.messages.length > 0) {

      messages = group.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    return res.status(200).json({
      success: true,
      messages: messages
    });
  } catch (error) {
    next(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const CreateMessage = async (req, res, next) => {
  const { chat, sender, content, currentRoom, media_url } = req.body;

  try {
    let messageData = { sender, content };


    if (media_url) {
      messageData.media_url = media_url;
    }
    const updatedGroup = await Group.findOneAndUpdate(
      { name: chat },
      {
        $push: {
          messages: { sender, content }
        }
      },
      { new: true }
    );


    if (updatedGroup) {

      const newMessage = updatedGroup.messages[updatedGroup.messages.length - 1];

      return res.status(200).json({
        success: true,
        message: "Message created successfully",
        newMessage
      });
    } else {

      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
  } catch (error) {

    next(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const GetChatRoomMessages = async (req, res, next) => {
  try {
    const roomCode = req.params.roomCode;

    const chatRoom = await ChatRoom.findOne({ roomCode });

    if (!chatRoom) {
      return res.status(404).json({ success: false, message: "Chat room not found" });
    }

    const messages = chatRoom.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const participants = chatRoom.participants;

    return res.status(200).json({ success: true, messages, participants, roomId: chatRoom._id });
  } catch (error) {
    console.error("Error fetching chat room messages:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};





const CreateChatRoomMessage = async (req, res, next) => {
  try {
    const { roomId, room, sender, content, media_url, user_profile } = req.body;

    let messageData = { sender, content, room, roomId, user_profile };

    if (media_url) {
      messageData.media_url = media_url;
    }

    const chatRoom = await ChatRoom.findById(messageData.roomId);
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: "Chat room not found" });
    }

    const newMessage = {
      content: messageData.content,
      media_url: messageData.media_url,
      sender: messageData.sender,
      user_profile: messageData.user_profile,
      createdAt: new Date()
    };

    chatRoom.messages.push(newMessage);

    await chatRoom.save();

    const messageId = chatRoom.messages[chatRoom.messages.length - 1]._id;

    return res.status(200).json({ success: true, message: "Message created successfully", newMessage: { ...newMessage, _id: messageId } });
  } catch (error) {
    console.error("Error creating chat room message:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const GetAnnouncements = async (req, res, next) => {
  try {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const announcements = await Announcement.find({ createdAt: { $gte: fiveDaysAgo } })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error("Error getting announcements:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const GetEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Error getting events:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const DeleteGroupMemeber = async (req, res, next) => {
  try {
    const { groupid, participantid } = req.body;
    const group = await Group.findByIdAndUpdate(
      groupid,
      { $pull: { participants: { userId: participantid } } },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    return res.status(200).json({ success: true, message: "Participant deleted successfully", conversation: group });
  } catch (error) {
    console.error("Error deleting participant:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

const UpdateProfilePhoto = async (req, res, next) => {
  try {
    const { newprofile } = req.body;

    await Auth.findByIdAndUpdate(req.user.userId, { profile_photo: newprofile });

    res.status(200).json({ message: 'Profile photo updated successfully', success: true });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ error: 'Internal server error', success: false });
  }
};


const UpdateUserName = async (req, res, next) => {
  try {
    const { newUsername } = req.body;

    await Auth.findByIdAndUpdate(req.user.userId, { userName: newUsername });
    res.status(200).json({ message: 'Username updated successfully', success: true });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ error: 'Internal server error', success: false });
  }
}


const ScheduleMessage = async (req, res, next) => {
  const { sender, content, scheduledAt, media_url, user_profile, room } = req.body;

  try {
    const newScheduledMessage = new ScheduledMessage({
      sender: sender,
      content,
      scheduledAt: new Date(scheduledAt),
      media_url,
      user_profile,
      roomCode: room,
    });
    await newScheduledMessage.save();
    res.status(200).send({ success: true, message: 'Message scheduled successfully' });
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Error scheduling message');
  }
}
const GetNotSentMessages = async (req, res, next) => {
  try {
    const now = new Date();
    console.log('Current time:', now);

    const unsentMessages = await ScheduledMessage.find({
      scheduledAt: { $gte: now },
      sender: req.user.userId
    }).lean();

    console.log('Query result:', unsentMessages);
    console.log('Number of documents found:', unsentMessages.length);

    if (unsentMessages.length === 0) {
      const allMessages = await ScheduledMessage.find({}).lean();
      console.log('All documents in collection:', allMessages);
    }

    res.status(200).json(unsentMessages);
  } catch (error) {
    console.error('Error fetching unsent messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const GetSentMessages = async (req, res, next) => {
  try {
    const sentMessages = await ScheduledMessage.find({ status: 'sent', sender: req.user.userId }).exec();
    res.json(sentMessages);
  } catch (error) {
    next(error);
  }
};


const GetNumberofAccounts = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const accounts = await Auth.findAccountsByPhoneNumber(phoneNumber);

    const accountCount = accounts.length;

    if (accountCount >= 2) {
      return res.status(200).json({
        canCreate: false,
        message: "You have already created the maximum number of accounts with this phone number.",
        accounts: accounts.map(account => ({
          userName: account.userName,
          profile_photo: account.profile_photo,
          email: account.email
        }))
      });
    }

    return res.status(200).json({
      canCreate: true,
      message: "You can create another account with this phone number.",
      accounts: accounts.map(account => ({
        userName: account.userName,
        profile_photo: account.profile_photo,
        email: account.email
      }))
    });

  } catch (error) {
    console.error("Error checking number of accounts:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const VerifyMobileNumber = async (req, res, next) => {
  try {

    const updatedUser = await Auth.findByIdAndUpdate(
      req.user.userId,
      { phoneNumberVerified: true },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to verify mobile number: ${error.message}`);
  }
};

const CreateEventReminder = async (req, res, next) => {
  try {
    const { title, eventId, reminderTime } = req.body;

    if (!title || !eventId || !reminderTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }


    const existingReminder = await Reminder.findOne({
      userId: req.user.userId,
      eventId
    });

    if (existingReminder) {
      return res.status(409).json({ error: 'Reminder for this event already exists' });
    }


    const reminder = new Reminder({
      title,
      userId: req.user.userId,
      eventId,
      reminderTime: new Date(reminderTime)
    });

    await reminder.save();

    res.status(201).json({ message: 'Reminder created successfully', reminder });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
};

const fetchUserReminders = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }


    const reminders = await Reminder.find({ userId });


    const populatedReminders = [];


    for (let i = 0; i < reminders.length; i++) {
      const reminder = reminders[i];

      const event = await Event.findById(reminder.eventId);

      const populatedReminder = {
        _id: reminder._id,
        userId: reminder.userId,
        eventId: reminder.eventId,
        reminderTime: reminder.reminderTime,
        event: event
      };
      populatedReminders.push(populatedReminder);
    }

    res.status(200).json({ message: 'Reminders fetched successfully', reminders: populatedReminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
};
const saveFcmToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const existingToken = await FcmToken.findOne({ userId: req.user.userId, token });

    if (existingToken) {
      return res.status(200).json({ message: 'Token already exists' });
    }

    const fcmToken = new FcmToken({
      userId: req.user.userId,
      token
    });

    await fcmToken.save();

    res.status(201).json({ message: 'Token saved successfully', fcmToken });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to save token' });
  }
};
const LeaveGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      return res.status(400).json({ message: 'Group ID and User ID are required' });
    }


    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const participantIndex = group.participants.findIndex(participant => participant.userId.toString() === userId);

    if (participantIndex === -1) {
      return res.status(404).json({ message: 'Participant not found in the group' });
    }


    group.participants.splice(participantIndex, 1);


    await group.save();

    return res.status(200).json({ message: 'Participant removed successfully', group });
  } catch (error) {
    next(error);
  }
};



const deleteAdminGroup = async (req, res, next) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const deletedGroup = await Group.findByIdAndDelete(groupId);

    if (!deletedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    return res.status(200).json({ message: 'Group deleted successfully', deletedGroup });
  } catch (error) {
    next(error);
  }
};


const SendVoiceMessage = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { currentChat, currentRoom, roomId } = req.body;

      if (!currentChat || !currentRoom || !roomId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname || 'audio.wav',
        contentType: req.file.mimetype,
      });

      const pythonServerUrl = 'http://0.0.0.0:8000/noise_reducer'
      const response = await axios.post(pythonServerUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': req.headers.authorization,
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer',
      });

      const processedBuffer = Buffer.from(response.data);
      const randomFilename = generateRandomFilename(roomId);
      const filePath = path.join(__dirname, 'uploads', randomFilename);

      if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
        fs.mkdirSync(path.join(__dirname, 'uploads'));
      }

      fs.writeFileSync(filePath, processedBuffer);

      const fileUrl = `http://localhost:4000/api/uploads/${randomFilename}`;

      const chatRoom = await ChatRoom.findById(roomId);
      const audioMessage = {
        room: chatRoom.roomCode,
        content: fileUrl,
        sender: req.user.userId,
      };

      chatRoom.messages.push(audioMessage);
      await chatRoom.save();

      const savedMessage = chatRoom.messages[chatRoom.messages.length - 1];

      res.set({
        'Content-Disposition': `filename="${randomFilename}"`,
        'Content-Type': 'audio/wav',
      });

      let lasObj = { roomCode: currentRoom, content: savedMessage.content, sender: savedMessage.sender, _id: savedMessage._id }
      res.status(201).json({ audioMessage: lasObj, fileUrl });

    } catch (error) {
      console.error('Error processing audio:', error);
      if (error.response) {
        console.error('Python server response:', error.response.data.toString());
      }
      res.status(500).json({ error: 'Failed to process audio' });
    }
  }
];

function generateRandomFilename(roomId) {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${roomId}_${randomBytes}.wav`;
}




module.exports = { profile, GetUserInfo, fetchUserReminders, GetUserInfoByUsername, saveFcmToken, UpdateProfilePhoto, UpdateUserName, DeleteGroupMemeber, CreateMessage, DeleteGroupMemeber, GetGroupMessages, GetEvents, GetAnnouncements, CreateChatRoomMessage, GetMygroups, GetChatRoomMessages, GetMyFriends, GetUsersAccepted, SearchUserByKeyword, GetUserInfoUsername, SendFriendRequest, GetFriendRequests, AcceptFriendRequest, CreateGroup, ScheduleMessage, GetNotSentMessages, GetSentMessages, GetNumberofAccounts, VerifyMobileNumber, CreateEventReminder, SendVoiceMessage, LeaveGroup, deleteAdminGroup };