const Auth = require("../models/Auth");
const Announcement = require("../models/Announcement")
const Event = require('../models/Events')
const profile = async (req, res, next) => {
  try {
    const user = req.user;

    const data = await Auth.findOne({ userName: user.userName }).select(
      "name email profile_photo userName"
    );

    return res.json(data);
  } catch (error) {
    next(error);
  }
};

const CreateAnnouncements = async (req, res, next) => {
  try {
    const { announcementText } = req.body;

    const newAnnouncement = await Announcement.create({ text: announcementText });

    return res.status(200).json({ success: true, message: "Announcement created successfully" });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const CreateEvents = async (req, res, next) => {
  try {
    const { eventTitle, eventDescription, eventDate } = req.body;


    const newEvent = await Event.create({ title: eventTitle, description: eventDescription, date: eventDate });

    return res.status(200).json({ success: true, message: "Event created successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error creating event:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { profile, CreateAnnouncements, CreateEvents };