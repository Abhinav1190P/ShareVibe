// Routes folder contains the backend routes on which calls are made from the frontend there can be different routes for different things, in this case for tweets, comments, etc...


const { Router } = require("express");
const userController = require("../../controllers/user");
const express = require('express');
const path = require('path');
const router = Router();

// GET: /api/user/profile this is an example (for the user route)

router.use("/profile", userController.profile);

router.use("/get-user-info/:id", userController.GetUserInfo)

router.use("/search-user/:keyword", userController.SearchUserByKeyword)

router.use("/get-user-info-username/:username", userController.GetUserInfoUsername)

/* router.use("/get-user-info-dash/:username", userController.GetUserInfoByUsername)
 */
router.use("/send-friend-request", userController.SendFriendRequest)

router.use("/get-friend-requests", userController.GetFriendRequests)

router.use("/accept-friend-request", userController.AcceptFriendRequest)

router.use("/search-user-accepted/:keyword", userController.GetUsersAccepted)

router.use("/get-my-friends", userController.GetMyFriends)

router.use("/create-group", userController.CreateGroup)

router.use("/get-groups", userController.GetMygroups)

router.use("/get-group-messages/:groupid", userController.GetGroupMessages)

router.use("/create-message", userController.CreateMessage)

router.use("/get-chat-room-messages/:roomCode", userController.GetChatRoomMessages)

router.use("/create-chat-room-message", userController.CreateChatRoomMessage)

router.use("/get-announcements", userController.GetAnnouncements)

router.use("/get-events", userController.GetEvents)

router.use("/delete-group-member", userController.DeleteGroupMemeber)

router.use("/edit-profile-photo", userController.UpdateProfilePhoto)

router.use("/update-info", userController.UpdateUserName)

router.use("/schedule-message", userController.ScheduleMessage)

router.use("/get-schedule-messages", userController.GetNotSentMessages)

router.use("/get-sent-messages", userController.GetSentMessages)

router.use("/get-no-accounts", userController.GetNumberofAccounts)

router.use("/verify-number", userController.VerifyMobileNumber)

router.use("/create-reminder", userController.CreateEventReminder)

router.use('/create-fcm-token', userController.saveFcmToken)

router.use('/get-user-reminders', userController.fetchUserReminders)

router.use('/reduce-voice-message', userController.SendVoiceMessage);

router.use('/leave-group', userController.LeaveGroup)

router.use('/delete-admin-group', userController.deleteAdminGroup)

module.exports = router;