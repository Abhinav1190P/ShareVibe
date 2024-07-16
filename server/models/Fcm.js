const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fcmTokenSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d'
  }
});

const FcmToken = mongoose.model('FcmToken', fcmTokenSchema);
module.exports = FcmToken;
